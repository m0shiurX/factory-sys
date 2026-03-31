<?php

declare(strict_types=1);

use App\Models\Customer;
use App\Models\User;

beforeEach(function (): void {
    $this->user = User::factory()->create();
});

it('renders customers index page', function (): void {
    $response = $this->actingAs($this->user)
        ->get(route('customers.index'));

    $response->assertOk()
        ->assertInertia(fn($page) => $page->component('admin/customers/index'));
});

it('paginates customers and preserves query string', function (): void {
    Customer::factory()->count(20)->create();

    $response = $this->actingAs($this->user)
        ->get(route('customers.index', ['page' => 2]));

    $response->assertOk()
        ->assertInertia(
            fn($page) => $page
                ->component('admin/customers/index')
                ->has('customers.data', 5)
        );
});

it('filters customers by search', function (): void {
    Customer::factory()->create(['name' => 'John Doe']);
    Customer::factory()->create(['name' => 'Jane Smith']);

    $response = $this->actingAs($this->user)
        ->get(route('customers.index', ['search' => 'John']));

    $response->assertOk()
        ->assertInertia(
            fn($page) => $page
                ->has('customers.data', 1)
                ->where('customers.data.0.name', 'John Doe')
        );
});

it('filters customers with has_due true', function (): void {
    Customer::factory()->withDue(500)->create();
    Customer::factory()->zeroDue()->create();

    $response = $this->actingAs($this->user)
        ->get(route('customers.index', ['has_due' => 'true']));

    $response->assertOk()
        ->assertInertia(
            fn($page) => $page
                ->has('customers.data', 1)
        );
});

it('filters customers with has_due false', function (): void {
    Customer::factory()->withDue(500)->create();
    Customer::factory()->zeroDue()->create();

    $response = $this->actingAs($this->user)
        ->get(route('customers.index', ['has_due' => 'false']));

    $response->assertOk()
        ->assertInertia(
            fn($page) => $page
                ->has('customers.data', 1)
                ->where('customers.data.0.total_due', 0)
        );
});

it('renders customers print page with all customers', function (): void {
    Customer::factory()->count(20)->create();

    $response = $this->actingAs($this->user)
        ->get(route('customers.print'));

    $response->assertOk()
        ->assertInertia(
            fn($page) => $page
                ->component('admin/customers/print')
                ->has('customers', 20)
                ->has('totals')
        );
});

it('renders customers print page with has_due filter', function (): void {
    Customer::factory()->withDue(1000)->count(3)->create();
    Customer::factory()->zeroDue()->count(2)->create();

    $response = $this->actingAs($this->user)
        ->get(route('customers.print', ['has_due' => 'true']));

    $response->assertOk()
        ->assertInertia(
            fn($page) => $page
                ->component('admin/customers/print')
                ->has('customers', 3)
        );
});

it('renders customers print page with no due filter', function (): void {
    Customer::factory()->withDue(1000)->count(3)->create();
    Customer::factory()->zeroDue()->count(2)->create();

    $response = $this->actingAs($this->user)
        ->get(route('customers.print', ['has_due' => 'false']));

    $response->assertOk()
        ->assertInertia(
            fn($page) => $page
                ->component('admin/customers/print')
                ->has('customers', 2)
        );
});
