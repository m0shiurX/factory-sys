<?php

declare(strict_types=1);

use App\Models\Customer;
use App\Models\Payment;
use App\Models\PaymentType;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->customer = Customer::factory()->create(['total_due' => 0, 'opening_balance' => 0, 'opening_date' => null]);
    $this->product = Product::factory()->create(['pieces_per_bundle' => 10, 'stock_pieces' => 100]);

    $this->salePayload = fn (float $net, array $overrides = [], array $item = []): array => [
        'customer_id' => $this->customer->id,
        'sale_date' => now()->toDateString(),
        'total_pieces' => 10,
        'total_weight_kg' => 10,
        'total_amount' => $net,
        'discount' => 0,
        'net_amount' => $net,
        'items' => [[
            'product_id' => $this->product->id,
            'bundles' => 1,
            'extra_pieces' => 0,
            'total_pieces' => 10,
            'weight_kg' => 10,
            'rate_per_kg' => $net / 10,
            'amount' => $net,
            ...$item,
        ]],
        ...$overrides,
    ];

    // An existing record, as saved before payment fields left the sale form.
    $this->createExistingSale = function (float $net, float $paid = 0, array $attributes = []): Sale {
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
            ...$attributes,
        ]);
    };

    $this->postLinkedPayment = fn (Sale $sale, float $amount) => actingAs($this->user)
        ->post(route('payments.store'), [
            'customer_id' => $sale->customer_id,
            'sale_id' => $sale->id,
            'amount' => $amount,
            'payment_date' => now()->toDateString(),
        ]);
});

it('does not offer payment options on the sale forms', function (): void {
    $sale = ($this->createExistingSale)(1000);

    actingAs($this->user)->get(route('sales.create'))
        ->assertInertia(fn ($page) => $page->component('admin/sales/create')->missing('payment_types'));
    actingAs($this->user)->get(route('sales.edit', $sale))
        ->assertInertia(fn ($page) => $page->component('admin/sales/edit')->missing('payment_types'));

    foreach (['create', 'edit'] as $form) {
        expect(file_get_contents(resource_path("js/pages/admin/sales/{$form}.tsx")))
            ->not->toContain("'paid_amount'")
            ->not->toContain('Payment Method')
            ->not->toContain('Payment Reference');
    }
});

it('saves a new sale fully due and ignores any posted payment fields', function (): void {
    $type = PaymentType::query()->create(['name' => 'Cash', 'is_active' => true]);

    actingAs($this->user)
        ->post(route('sales.store'), ($this->salePayload)(1000, [
            'bill_no' => 'T-NEW',
            'paid_amount' => 400,
            'due_amount' => 600,
            'payment_type_id' => $type->id,
            'payment_ref' => 'REF',
        ]))
        ->assertSessionHasNoErrors();

    $sale = Sale::query()->sole();

    expect((float) $sale->paid_amount)->toEqual(0.0)
        ->and((float) $sale->due_amount)->toEqual(1000.0)
        ->and($sale->payment_type_id)->toBeNull()
        ->and($sale->payment_ref)->toBeNull()
        ->and((float) $this->customer->refresh()->total_due)->toEqual(1000.0);
});

it('keeps an existing cash sale intact when it is edited', function (): void {
    $type = PaymentType::query()->create(['name' => 'Cash', 'is_active' => true]);
    $sale = ($this->createExistingSale)(1000, 1000, ['payment_type_id' => $type->id, 'payment_ref' => 'CASH-1']);

    actingAs($this->user)->get(route('sales.show', $sale))
        ->assertInertia(fn ($page) => $page
            ->where('sale.paid_amount', '1000.00')
            ->where('sale.due_amount', '0.00')
            ->where('sale.payment_type.name', 'Cash')
            ->where('sale.payment_ref', 'CASH-1'));

    actingAs($this->user)
        ->put(route('sales.update', $sale), ($this->salePayload)(1200))
        ->assertSessionHasNoErrors();

    expect((float) $sale->refresh()->paid_amount)->toEqual(1000.0)
        ->and((float) $sale->due_amount)->toEqual(200.0)
        ->and($sale->payment_type_id)->toBe($type->id)
        ->and($sale->payment_ref)->toBe('CASH-1')
        ->and((float) $this->customer->refresh()->total_due)->toEqual(200.0);
});

it('keeps payments posted against a sale when it is edited', function (): void {
    $sale = ($this->createExistingSale)(1000);
    ($this->postLinkedPayment)($sale, 400);

    actingAs($this->user)
        ->put(route('sales.update', $sale), ($this->salePayload)(900))
        ->assertSessionHasNoErrors();

    expect((float) $sale->refresh()->paid_amount)->toEqual(400.0)
        ->and((float) $sale->due_amount)->toEqual(500.0)
        ->and((float) $this->customer->refresh()->total_due)->toEqual(500.0);
});

it('turns the excess into advance when a paid sale is edited below what was paid', function (): void {
    $sale = ($this->createExistingSale)(1000);
    ($this->postLinkedPayment)($sale, 1000);

    actingAs($this->user)
        ->put(route('sales.update', $sale), ($this->salePayload)(800))
        ->assertSessionHasNoErrors();

    expect((float) $sale->refresh()->due_amount)->toEqual(0.0)
        ->and((float) $this->customer->refresh()->total_due)->toEqual(-200.0);
});

it('leaves linked payments as advance when a sale is deleted', function (): void {
    $sale = ($this->createExistingSale)(1000);
    ($this->postLinkedPayment)($sale, 400);

    actingAs($this->user)->delete(route('sales.destroy', $sale))->assertSessionHasNoErrors();

    expect(Payment::query()->sole()->sale_id)->toBeNull()
        ->and((float) $this->customer->refresh()->total_due)->toEqual(-400.0);
});

it('removes an unpaid sale and an existing cash sale from the customer balance on delete', function (): void {
    $unpaid = ($this->createExistingSale)(1000);
    $cash = ($this->createExistingSale)(500, 500);

    actingAs($this->user)->delete(route('sales.destroy', $cash));
    expect((float) $this->customer->refresh()->total_due)->toEqual(1000.0);

    actingAs($this->user)->delete(route('sales.destroy', $unpaid));
    expect((float) $this->customer->refresh()->total_due)->toEqual(0.0);
});

it('counts loose pieces without a bundle, even when stock is under one bundle', function (): void {
    $this->product->update(['stock_pieces' => 3]);

    actingAs($this->user)
        ->post(route('sales.store'), ($this->salePayload)(100, ['bill_no' => 'T-LOOSE', 'total_pieces' => 3], [
            'bundles' => 0,
            'extra_pieces' => 3,
            'total_pieces' => 3,
        ]))
        ->assertSessionHasNoErrors();

    expect($this->product->refresh()->stock_pieces)->toBe(0);

    actingAs($this->user)->get(route('sales.show', Sale::query()->sole()))
        ->assertInertia(fn ($page) => $page
            ->where('sale.items.0.bundles', 0)
            ->where('sale.items.0.extra_pieces', 3)
            ->where('sale.items.0.total_pieces', 3));
});

it('always offers loose pieces on the sale forms and does not block stock under one bundle', function (): void {
    foreach (['create', 'edit'] as $form) {
        $source = file_get_contents(resource_path("js/pages/admin/sales/{$form}.tsx"));

        expect($source)
            ->not->toContain('showExtraPieces')
            ->not->toContain('at least one bundle fits')
            ->toContain("'extra_pieces'");
    }
});

it('prints the bundle and loose pieces on the sales memo', function (): void {
    expect(file_get_contents(resource_path('js/components/common/print-invoice.tsx')))
        ->toContain('item.bundle')
        ->toContain('Bundle');

    expect(file_get_contents(resource_path('js/pages/admin/sales/show.tsx')))
        ->toContain('bundle: formatBundleQty(item.bundles, item.extra_pieces)');
});
