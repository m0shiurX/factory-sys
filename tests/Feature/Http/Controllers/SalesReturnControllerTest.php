<?php

declare(strict_types=1);

use App\Models\Customer;
use App\Models\Product;
use App\Models\SalesReturn;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function (): void {
    $this->user = User::factory()->create();
});

it('displays the sales returns index page', function (): void {
    $customer = Customer::factory()->create();
    SalesReturn::factory()->count(3)->forCustomer($customer)->createdBy($this->user)->create();

    actingAs($this->user)
        ->get(route('sales-returns.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/sales-returns/index')
            ->has('returns.data', 3)
            ->has('stats')
            ->has('filters'));
});

it('displays the create sales return page', function (): void {
    Customer::factory()->count(3)->create(['is_active' => true]);
    Product::factory()->count(5)->create(['is_active' => true]);

    actingAs($this->user)
        ->get(route('sales-returns.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/sales-returns/create')
            ->has('return_no')
            ->has('customers', 3)
            ->has('products', 5));
});

it('stores a new sales return', function (): void {
    $customer = Customer::factory()->create(['total_due' => 10000]);
    $product = Product::factory()->create(['stock_pieces' => 100, 'is_active' => true]);
    $returnNo = SalesReturn::generateReturnNo();

    actingAs($this->user)
        ->post(route('sales-returns.store'), [
            'return_no' => $returnNo,
            'customer_id' => $customer->id,
            'return_date' => now()->toDateString(),
            'total_weight' => 50.5,
            'sub_total' => 5000,
            'discount' => 100,
            'grand_total' => 4900,
            'note' => 'Test return',
            'items' => [
                [
                    'product_id' => $product->id,
                    'bundles' => 2,
                    'extra_pieces' => 5,
                    'total_pieces' => 25,
                    'weight_kg' => 50.5,
                    'rate_per_kg' => 100,
                    'sub_total' => 5050,
                ],
            ],
        ])
        ->assertRedirect(route('sales-returns.index'))
        ->assertSessionHas('success', 'Sales return recorded successfully.');

    assertDatabaseHas('sales_returns', [
        'return_no' => $returnNo,
        'customer_id' => $customer->id,
        'grand_total' => 4900,
        'created_by' => $this->user->id,
    ]);

    // Check stock was restored (increased)
    expect($product->refresh()->stock_pieces)->toBe(125);

    // Check customer due was reduced
    expect((float) $customer->refresh()->total_due)->toBe(5100.0);
});

it('validates required fields when storing', function (): void {
    actingAs($this->user)
        ->post(route('sales-returns.store'), [])
        ->assertSessionHasErrors(['return_no', 'customer_id', 'return_date', 'items']);
});

it('validates customer exists', function (): void {
    $product = Product::factory()->create();

    actingAs($this->user)
        ->post(route('sales-returns.store'), [
            'return_no' => SalesReturn::generateReturnNo(),
            'customer_id' => 9999,
            'return_date' => now()->toDateString(),
            'total_weight' => 10,
            'sub_total' => 1000,
            'grand_total' => 1000,
            'items' => [
                [
                    'product_id' => $product->id,
                    'bundles' => 1,
                    'extra_pieces' => 0,
                    'total_pieces' => 10,
                    'weight_kg' => 10,
                    'rate_per_kg' => 100,
                    'sub_total' => 1000,
                ],
            ],
        ])
        ->assertSessionHasErrors(['customer_id']);
});

it('validates return_no is unique', function (): void {
    $existingReturn = SalesReturn::factory()->create();
    $customer = Customer::factory()->create();
    $product = Product::factory()->create();

    actingAs($this->user)
        ->post(route('sales-returns.store'), [
            'return_no' => $existingReturn->return_no,
            'customer_id' => $customer->id,
            'return_date' => now()->toDateString(),
            'total_weight' => 10,
            'sub_total' => 1000,
            'grand_total' => 1000,
            'items' => [
                [
                    'product_id' => $product->id,
                    'bundles' => 1,
                    'extra_pieces' => 0,
                    'total_pieces' => 10,
                    'weight_kg' => 10,
                    'rate_per_kg' => 100,
                    'sub_total' => 1000,
                ],
            ],
        ])
        ->assertSessionHasErrors(['return_no']);
});

it('validates items array has at least one item', function (): void {
    $customer = Customer::factory()->create();

    actingAs($this->user)
        ->post(route('sales-returns.store'), [
            'return_no' => SalesReturn::generateReturnNo(),
            'customer_id' => $customer->id,
            'return_date' => now()->toDateString(),
            'total_weight' => 0,
            'sub_total' => 0,
            'grand_total' => 0,
            'items' => [],
        ])
        ->assertSessionHasErrors(['items']);
});

it('displays sales return show page', function (): void {
    $salesReturn = SalesReturn::factory()->create();

    actingAs($this->user)
        ->get(route('sales-returns.show', $salesReturn))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/sales-returns/show')
            ->has('salesReturn'));
});

it('displays sales return edit page', function (): void {
    $salesReturn = SalesReturn::factory()->create();

    actingAs($this->user)
        ->get(route('sales-returns.edit', $salesReturn))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/sales-returns/edit')
            ->has('salesReturn')
            ->has('customers')
            ->has('products'));
});

it('updates a sales return', function (): void {
    $oldCustomer = Customer::factory()->create(['total_due' => 5000]);
    $newCustomer = Customer::factory()->create(['total_due' => 8000]);
    $oldProduct = Product::factory()->create(['stock_pieces' => 100]);
    $newProduct = Product::factory()->create(['stock_pieces' => 200]);

    $salesReturn = SalesReturn::factory()
        ->forCustomer($oldCustomer)
        ->create(['grand_total' => 2000]);

    $salesReturn->items()->create([
        'product_id' => $oldProduct->id,
        'bundles' => 2,
        'extra_pieces' => 0,
        'total_pieces' => 20,
        'weight_kg' => 20,
        'rate_per_kg' => 100,
        'sub_total' => 2000,
    ]);

    actingAs($this->user)
        ->put(route('sales-returns.update', $salesReturn), [
            'return_no' => $salesReturn->return_no,
            'customer_id' => $newCustomer->id,
            'return_date' => now()->toDateString(),
            'total_weight' => 30,
            'sub_total' => 3000,
            'discount' => 0,
            'grand_total' => 3000,
            'note' => 'Updated return',
            'items' => [
                [
                    'product_id' => $newProduct->id,
                    'bundles' => 3,
                    'extra_pieces' => 0,
                    'total_pieces' => 30,
                    'weight_kg' => 30,
                    'rate_per_kg' => 100,
                    'sub_total' => 3000,
                ],
            ],
        ])
        ->assertRedirect(route('sales-returns.show', $salesReturn))
        ->assertSessionHas('success', 'Sales return updated successfully.');

    $salesReturn->refresh();
    expect($salesReturn->customer_id)->toBe($newCustomer->id);
    expect((float) $salesReturn->grand_total)->toBe(3000.0);
    expect($salesReturn->note)->toBe('Updated return');

    // Old product stock should be decremented (reverse old restore)
    expect($oldProduct->refresh()->stock_pieces)->toBe(80);

    // New product stock should be incremented (new restore)
    expect($newProduct->refresh()->stock_pieces)->toBe(230);

    // Old customer due should be restored
    expect((float) $oldCustomer->refresh()->total_due)->toBe(7000.0);

    // New customer due should be reduced
    expect((float) $newCustomer->refresh()->total_due)->toBe(5000.0);
});

it('deletes a sales return and reverses stock and due', function (): void {
    $customer = Customer::factory()->create(['total_due' => 5000]);
    $product = Product::factory()->create(['stock_pieces' => 100]);

    $salesReturn = SalesReturn::factory()
        ->forCustomer($customer)
        ->create(['grand_total' => 2000]);

    $salesReturn->items()->create([
        'product_id' => $product->id,
        'bundles' => 2,
        'extra_pieces' => 0,
        'total_pieces' => 20,
        'weight_kg' => 20,
        'rate_per_kg' => 100,
        'sub_total' => 2000,
    ]);

    actingAs($this->user)
        ->delete(route('sales-returns.destroy', $salesReturn))
        ->assertRedirect(route('sales-returns.index'))
        ->assertSessionHas('success', 'Sales return deleted successfully.');

    assertDatabaseMissing('sales_returns', ['id' => $salesReturn->id]);

    // Stock should be decremented (reverse restore)
    expect($product->refresh()->stock_pieces)->toBe(80);

    // Customer due should be restored (increased)
    expect((float) $customer->refresh()->total_due)->toBe(7000.0);
});

it('searches sales returns by return number', function (): void {
    $return1 = SalesReturn::factory()->create(['return_no' => 'SR-2025-0001']);
    $return2 = SalesReturn::factory()->create(['return_no' => 'SR-2025-0002']);

    actingAs($this->user)
        ->get(route('sales-returns.index', ['search' => 'SR-2025-0001']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('returns.data', 1));
});

it('searches sales returns by customer name', function (): void {
    $customer1 = Customer::factory()->create(['name' => 'John Doe']);
    $customer2 = Customer::factory()->create(['name' => 'Jane Smith']);

    SalesReturn::factory()->forCustomer($customer1)->create();
    SalesReturn::factory()->forCustomer($customer2)->create();

    actingAs($this->user)
        ->get(route('sales-returns.index', ['search' => 'John']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('returns.data', 1));
});

it('filters sales returns by date range', function (): void {
    SalesReturn::factory()->create(['return_date' => now()->subDays(10)]);
    SalesReturn::factory()->create(['return_date' => now()->subDays(5)]);
    SalesReturn::factory()->create(['return_date' => now()]);

    actingAs($this->user)
        ->get(route('sales-returns.index', [
            'from_date' => now()->subDays(6)->toDateString(),
            'to_date' => now()->toDateString(),
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('returns.data', 2));
});

it('shows today stats correctly', function (): void {
    SalesReturn::factory()->create([
        'return_date' => today(),
        'grand_total' => 5000,
    ]);
    SalesReturn::factory()->create([
        'return_date' => now()->subDays(5),
        'grand_total' => 3000,
    ]);

    actingAs($this->user)
        ->get(route('sales-returns.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('stats.today_returns', 1)
            ->where('stats.total_returns', 2)
            ->where('stats.total_amount', fn ($value): bool => (float) $value === 8000.0));
});

it('requires authentication to access sales returns', function (): void {
    $this->get(route('sales-returns.index'))
        ->assertRedirect(route('login'));
});
