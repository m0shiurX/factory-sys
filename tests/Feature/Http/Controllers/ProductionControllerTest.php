<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\Production;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function (): void {
    $this->user = User::factory()->create();
});

it('displays the productions index page', function (): void {
    $product = Product::factory()->create();
    Production::factory()->count(3)->create(['product_id' => $product->id]);

    actingAs($this->user)
        ->get(route('productions.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/productions/index')
            ->has('productions.data', 3)
            ->has('stats'));
});

it('displays the create production page', function (): void {
    Product::factory()->count(5)->create();

    actingAs($this->user)
        ->get(route('productions.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/productions/create')
            ->has('products', 5));
});

it('stores a new production entry and increases stock', function (): void {
    $product = Product::factory()->create(['stock_pieces' => 100]);

    actingAs($this->user)
        ->post(route('productions.store'), [
            'product_id' => $product->id,
            'pieces_produced' => 50,
            'production_date' => now()->toDateString(),
            'note' => 'Test production',
        ])
        ->assertRedirect(route('productions.index'))
        ->assertSessionHas('success', 'Production recorded successfully.');

    assertDatabaseHas('productions', [
        'product_id' => $product->id,
        'pieces_produced' => 50,
        'note' => 'Test production',
    ]);

    // Verify stock increased
    expect($product->fresh()->stock_pieces)->toBe(150);
});

it('validates required fields when storing', function (): void {
    actingAs($this->user)
        ->post(route('productions.store'), [])
        ->assertSessionHasErrors(['product_id', 'pieces_produced', 'production_date']);
});

it('validates product_id exists', function (): void {
    actingAs($this->user)
        ->post(route('productions.store'), [
            'product_id' => 9999,
            'pieces_produced' => 50,
            'production_date' => now()->toDateString(),
        ])
        ->assertSessionHasErrors(['product_id']);
});

it('validates pieces_produced is at least 1', function (): void {
    $product = Product::factory()->create();

    actingAs($this->user)
        ->post(route('productions.store'), [
            'product_id' => $product->id,
            'pieces_produced' => 0,
            'production_date' => now()->toDateString(),
        ])
        ->assertSessionHasErrors(['pieces_produced']);
});

it('displays production show page', function (): void {
    $production = Production::factory()->create();

    actingAs($this->user)
        ->get(route('productions.show', $production))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/productions/show')
            ->has('production'));
});

it('displays production edit page', function (): void {
    $production = Production::factory()->create();

    actingAs($this->user)
        ->get(route('productions.edit', $production))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/productions/edit')
            ->has('production'));
});

it('updates a production entry and adjusts stock', function (): void {
    $product = Product::factory()->create(['stock_pieces' => 150]);
    $production = Production::factory()->create([
        'product_id' => $product->id,
        'pieces_produced' => 50,
    ]);

    actingAs($this->user)
        ->put(route('productions.update', $production), [
            'pieces_produced' => 80, // Increase by 30
            'production_date' => now()->toDateString(),
        ])
        ->assertRedirect(route('productions.show', $production))
        ->assertSessionHas('success', 'Production updated successfully.');

    expect($production->fresh()->pieces_produced)->toBe(80);
    // Stock should be: 150 + (80 - 50) = 180
    expect($product->fresh()->stock_pieces)->toBe(180);
});

it('deletes a production entry and decreases stock', function (): void {
    $product = Product::factory()->create(['stock_pieces' => 150]);
    $production = Production::factory()->create([
        'product_id' => $product->id,
        'pieces_produced' => 50,
    ]);

    actingAs($this->user)
        ->delete(route('productions.destroy', $production))
        ->assertRedirect(route('productions.index'))
        ->assertSessionHas('success', 'Production deleted successfully.');

    assertDatabaseMissing('productions', ['id' => $production->id]);
    // Stock should decrease: 150 - 50 = 100
    expect($product->fresh()->stock_pieces)->toBe(100);
});

it('searches productions by product name', function (): void {
    $product1 = Product::factory()->create(['name' => 'Iron Pan']);
    $product2 = Product::factory()->create(['name' => 'Steel Bowl']);

    Production::factory()->create(['product_id' => $product1->id]);
    Production::factory()->create(['product_id' => $product2->id]);

    actingAs($this->user)
        ->get(route('productions.index', ['search' => 'Iron']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('productions.data', 1));
});

it('shows today stats correctly', function (): void {
    $product = Product::factory()->create();
    Production::factory()->today()->create([
        'product_id' => $product->id,
        'pieces_produced' => 100,
    ]);
    Production::factory()->create([
        'product_id' => $product->id,
        'pieces_produced' => 50,
        'production_date' => now()->subDays(5),
    ]);

    actingAs($this->user)
        ->get(route('productions.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('stats.today_productions', 1)
            ->where('stats.today_pieces', 100));
});
