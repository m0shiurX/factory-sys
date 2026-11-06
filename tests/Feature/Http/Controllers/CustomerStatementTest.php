<?php

declare(strict_types=1);

use App\Models\Customer;
use App\Models\Sale;
use App\Models\SalesReturn;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->customer = Customer::factory()->create(['total_due' => 0, 'opening_balance' => 0, 'opening_date' => null]);

    $this->createSale = function (float $net, float $paid = 0, ?string $date = null): Sale {
        $this->customer->increment('total_due', $net - $paid);

        return Sale::query()->create([
            'bill_no' => 'T-'.uniqid(),
            'customer_id' => $this->customer->id,
            'sale_date' => $date ?? now()->toDateString(),
            'total_amount' => $net,
            'net_amount' => $net,
            'paid_amount' => $paid,
            'due_amount' => max(0, $net - $paid),
            'created_by' => $this->user->id,
        ]);
    };

    $this->postPayment = fn (float $amount, ?Sale $sale = null, ?string $date = null) => actingAs($this->user)
        ->post(route('payments.store'), [
            'customer_id' => $this->customer->id,
            'sale_id' => $sale?->id,
            'amount' => $amount,
            'payment_date' => $date ?? now()->toDateString(),
        ]);

    $this->statement = fn (array $query = []): array => actingAs($this->user)
        ->get(route('customers.statement', [$this->customer, ...$query]))
        ->assertOk()
        ->viewData('page')['props']['statement'];
});

it('shows the full memo amount even after a payment is posted against it', function (): void {
    $sale = ($this->createSale)(1000);
    ($this->postPayment)(400, $sale);

    $statement = ($this->statement)();
    $saleRow = collect($statement['transactions'])->firstWhere('type', 'sale');

    expect((float) $saleRow['debit'])->toEqual(1000.0)
        ->and((float) $saleRow['credit'])->toEqual(0.0)
        ->and((float) $statement['total_sale'])->toEqual(1000.0)
        ->and((float) $statement['total_collection'])->toEqual(400.0)
        ->and((float) $statement['closing_balance'])->toEqual(600.0)
        ->and((float) $this->customer->refresh()->total_due)->toEqual(600.0);
});

it('does not drop the memo of a fully paid sale made before payments left the sale form', function (): void {
    ($this->createSale)(1000, 1000);
    ($this->createSale)(500, 200);

    $statement = ($this->statement)();
    $rows = collect($statement['transactions']);

    expect($rows->pluck('debit')->map(fn ($v) => (float) $v)->all())->toEqual([1000.0, 500.0])
        ->and($rows->pluck('credit')->map(fn ($v) => (float) $v)->all())->toEqual([1000.0, 200.0])
        ->and((float) $statement['total_sale'])->toEqual(1500.0)
        ->and((float) $statement['total_collection'])->toEqual(1200.0)
        ->and((float) $statement['closing_balance'])->toEqual(300.0)
        ->and((float) $this->customer->refresh()->total_due)->toEqual(300.0);
});

it('counts cash at sale and later payments separately on a part paid existing sale', function (): void {
    $sale = ($this->createSale)(1000, 200);
    ($this->postPayment)(300, $sale);

    $saleRow = collect(($this->statement)()['transactions'])->firstWhere('type', 'sale');

    expect((float) $saleRow['debit'])->toEqual(1000.0)
        ->and((float) $saleRow['credit'])->toEqual(200.0)
        ->and((float) ($this->statement)()['closing_balance'])->toEqual(500.0);
});

it('carries sales, payments and returns from earlier periods into the opening balance', function (): void {
    $earlier = now()->subMonths(2)->toDateString();
    $sale = ($this->createSale)(1000, 100, $earlier);
    ($this->postPayment)(400, $sale, $earlier);
    ($this->createSale)(700, 700, $earlier);

    SalesReturn::factory()->forCustomer($this->customer)->createdBy($this->user)->create([
        'return_date' => $earlier,
        'grand_total' => 50,
    ]);
    $this->customer->decrement('total_due', 50);

    ($this->createSale)(250);

    $statement = ($this->statement)();

    expect((float) $statement['opening_balance'])->toEqual(450.0)
        ->and((float) $statement['total_sale'])->toEqual(250.0)
        ->and((float) $statement['closing_balance'])->toEqual(700.0)
        ->and((float) $this->customer->refresh()->total_due)->toEqual(700.0);
});

it('keeps returns apart from collection and the running balance correct', function (): void {
    ($this->createSale)(1000);
    ($this->postPayment)(300);

    SalesReturn::factory()->forCustomer($this->customer)->createdBy($this->user)->create([
        'return_date' => now()->toDateString(),
        'grand_total' => 100,
    ]);
    $this->customer->decrement('total_due', 100);

    $statement = ($this->statement)();

    expect((float) $statement['total_sale'])->toEqual(1000.0)
        ->and((float) $statement['total_collection'])->toEqual(300.0)
        ->and((float) $statement['total_return'])->toEqual(100.0)
        ->and((float) $statement['total_credit'])->toEqual(400.0)
        ->and((float) $statement['closing_balance'])->toEqual(600.0);
});

it('shows an advance as a negative balance that the next sale uses up', function (): void {
    ($this->postPayment)(500);
    expect((float) ($this->statement)()['closing_balance'])->toEqual(-500.0);

    ($this->createSale)(800);
    $statement = ($this->statement)();

    expect((float) $statement['total_sale'])->toEqual(800.0)
        ->and((float) $statement['total_collection'])->toEqual(500.0)
        ->and((float) $statement['closing_balance'])->toEqual(300.0)
        ->and((float) $this->customer->refresh()->total_due)->toEqual(300.0);
});

it('displays total sale and total collection on screen and in print', function (): void {
    foreach (['js/pages/admin/customers/statement.tsx', 'js/components/common/print-statement.tsx'] as $file) {
        expect(file_get_contents(resource_path($file)))
            ->toContain('Total Sale')
            ->toContain('Total Collection');
    }
});
