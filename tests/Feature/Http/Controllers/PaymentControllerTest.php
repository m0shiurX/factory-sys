<?php

declare(strict_types=1);

use App\Models\Customer;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->customer = Customer::factory()->create(['total_due' => 0, 'opening_balance' => 0, 'opening_date' => null]);

    $this->createSale = function (float $net, float $paid = 0): Sale {
        $this->customer->increment('total_due', $net - $paid);

        return Sale::query()->create([
            'bill_no' => 'T-'.uniqid(),
            'customer_id' => $this->customer->id,
            'sale_date' => now()->toDateString(),
            'total_amount' => $net,
            'net_amount' => $net,
            'paid_amount' => $paid,
            'due_amount' => max(0, $net - $paid),
            'created_by' => $this->user->id,
        ]);
    };

    $this->paymentPayload = fn (float $amount, ?int $saleId = null): array => [
        'customer_id' => $this->customer->id,
        'sale_id' => $saleId,
        'amount' => $amount,
        'payment_date' => now()->toDateString(),
    ];
});

it('offers customers without any due on the payment form so an advance can be posted', function (): void {
    actingAs($this->user)
        ->get(route('payments.create', ['customer_id' => $this->customer->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/payments/create')
            ->has('customers', 1)
            ->where('customers.0.id', $this->customer->id)
            ->where('selected_customer_id', $this->customer->id));
});

it('saves a payment with no invoice as an advance', function (): void {
    actingAs($this->user)
        ->post(route('payments.store'), ($this->paymentPayload)(500))
        ->assertRedirect(route('payments.index'))
        ->assertSessionHasNoErrors();

    expect(Payment::query()->sole()->sale_id)->toBeNull()
        ->and((float) $this->customer->refresh()->total_due)->toEqual(-500.0);
});

it('settles the invoice and keeps the excess as advance when paying more than the due', function (): void {
    $sale = ($this->createSale)(1000);

    actingAs($this->user)
        ->post(route('payments.store'), ($this->paymentPayload)(1500, $sale->id))
        ->assertSessionHasNoErrors();

    expect((float) $sale->refresh()->due_amount)->toEqual(0.0)
        ->and((float) $this->customer->refresh()->total_due)->toEqual(-500.0);
});

it('restores the invoice due exactly when an overpayment is deleted', function (): void {
    $sale = ($this->createSale)(1000);

    actingAs($this->user)->post(route('payments.store'), ($this->paymentPayload)(1500, $sale->id));
    actingAs($this->user)->delete(route('payments.destroy', Payment::query()->sole()));

    expect((float) $sale->refresh()->due_amount)->toEqual(1000.0)
        ->and((float) $sale->paid_amount)->toEqual(0.0)
        ->and((float) $this->customer->refresh()->total_due)->toEqual(1000.0);
});

it('recalculates the invoice when an overpayment is edited down', function (): void {
    $sale = ($this->createSale)(1000);

    actingAs($this->user)->post(route('payments.store'), ($this->paymentPayload)(1500, $sale->id));
    actingAs($this->user)
        ->put(route('payments.update', Payment::query()->sole()), ($this->paymentPayload)(400, $sale->id))
        ->assertSessionHasNoErrors();

    expect((float) $sale->refresh()->due_amount)->toEqual(600.0)
        ->and((float) $sale->paid_amount)->toEqual(400.0)
        ->and((float) $this->customer->refresh()->total_due)->toEqual(600.0);
});

it('moves a payment between invoices and to an advance without losing money', function (): void {
    $first = ($this->createSale)(1000);
    $second = ($this->createSale)(300);

    actingAs($this->user)->post(route('payments.store'), ($this->paymentPayload)(500, $first->id));
    $payment = Payment::query()->sole();

    actingAs($this->user)->put(route('payments.update', $payment), ($this->paymentPayload)(500, $second->id));

    expect((float) $first->refresh()->due_amount)->toEqual(1000.0)
        ->and((float) $second->refresh()->due_amount)->toEqual(0.0)
        ->and((float) $this->customer->refresh()->total_due)->toEqual(800.0);

    actingAs($this->user)->put(route('payments.update', $payment), ($this->paymentPayload)(500));

    expect((float) $second->refresh()->due_amount)->toEqual(300.0)
        ->and($payment->refresh()->sale_id)->toBeNull()
        ->and((float) $this->customer->refresh()->total_due)->toEqual(800.0);
});

it('removes the advance when the advance payment is deleted', function (): void {
    actingAs($this->user)->post(route('payments.store'), ($this->paymentPayload)(500));
    actingAs($this->user)->delete(route('payments.destroy', Payment::query()->sole()));

    expect((float) $this->customer->refresh()->total_due)->toEqual(0.0)
        ->and(Payment::query()->count())->toBe(0);
});
