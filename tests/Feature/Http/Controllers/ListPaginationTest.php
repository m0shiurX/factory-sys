<?php

declare(strict_types=1);

use App\Models\Customer;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function (): void {
    $this->user = User::factory()->create();
});

it('serves page 2 of sales and keeps search and date filters in the page links', function (): void {
    $customer = Customer::factory()->create();

    foreach (range(1, 20) as $i) {
        Sale::query()->create([
            'bill_no' => sprintf('FIND-%04d', $i),
            'customer_id' => $customer->id,
            'sale_date' => now()->toDateString(),
        ]);
    }

    actingAs($this->user)
        ->get(route('sales.index', ['page' => 2, 'search' => 'FIND', 'from_date' => '2000-01-01']))
        ->assertInertia(fn ($page) => $page
            ->has('sales.data', 5)
            ->where('sales.current_page', 2)
            ->where('sales.links.1.url', fn (string $url): bool => str_contains($url, 'search=FIND')
                && str_contains($url, 'from_date=2000-01-01')
                && str_contains($url, 'page=1')));
});

it('serves page 2 of products and keeps search in the page links', function (): void {
    Product::factory()->count(20)->create(['name' => 'Findable rod']);

    actingAs($this->user)
        ->get(route('products.index', ['page' => 2, 'search' => 'Findable', 'active' => '1']))
        ->assertInertia(fn ($page) => $page
            ->has('products.data', 5)
            ->where('products.current_page', 2)
            ->where('products.links.1.url', fn (string $url): bool => str_contains($url, 'search=Findable')
                && str_contains($url, 'active=1')));
});

it('serves page 2 of payments and keeps filters in the page links', function (): void {
    $customer = Customer::factory()->create();

    foreach (range(1, 20) as $i) {
        Payment::query()->create([
            'customer_id' => $customer->id,
            'amount' => 10,
            'payment_ref' => sprintf('FIND-%04d', $i),
            'payment_date' => now()->toDateString(),
        ]);
    }

    actingAs($this->user)
        ->get(route('payments.index', ['page' => 2, 'search' => 'FIND', 'customer_id' => $customer->id]))
        ->assertInertia(fn ($page) => $page
            ->has('payments.data', 5)
            ->where('payments.current_page', 2)
            ->where('payments.links.1.url', fn (string $url): bool => str_contains($url, 'search=FIND')
                && str_contains($url, "customer_id={$customer->id}")));
});

/*
 * The defect was in the browser: each list's debounced search effect also ran when the page
 * mounted, re-requesting the list without "page" and filters, so page 2 fell back to page 1.
 * There is no JS test runner in this repo, so guard the source of every list that has that effect.
 */
it('does not re-request the list when the search box has not been touched', function (string $page, array $filters): void {
    $source = file_get_contents(resource_path("js/pages/admin/{$page}/index.tsx"));

    expect($source)->toMatch('/useEffect\(\(\) => \{\s+(\/\/[^\n]*\s+)?if \(isFirstRender\.current\) \{\s+isFirstRender\.current = false;\s+return;\s+\}\s+const timeout = setTimeout/');

    foreach ($filters as $filter) {
        expect($source)->toContain("...(filters.{$filter} && {");
    }
})->with([
    'sales' => ['sales', ['from_date', 'to_date']],
    'products' => ['products', ['active']],
    'payments' => ['payments', ['from_date', 'to_date', 'customer_id']],
    'sales returns' => ['sales-returns', ['from_date', 'to_date']],
    'productions' => ['productions', ['product_id', 'from_date', 'to_date']],
    'expenses' => ['expenses', ['category_id', 'from_date', 'to_date']],
    'stock' => ['stock', ['filter']],
    'customers' => ['customers', ['active', 'has_due']],
]);
