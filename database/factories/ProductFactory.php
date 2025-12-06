<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
final class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'size' => fake()->randomElement(['Small', 'Medium', 'Large', null]),
            'pieces_per_bundle' => fake()->numberBetween(10, 50),
            'rate_per_kg' => fake()->randomFloat(2, 100, 500),
            'stock_pieces' => fake()->numberBetween(0, 1000),
            'min_stock_alert' => fake()->numberBetween(10, 100),
            'is_active' => true,
        ];
    }

    public function lowStock(): static
    {
        return $this->state(fn (array $attributes): array => [
            'stock_pieces' => $attributes['min_stock_alert'] - 1,
        ]);
    }

    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes): array => [
            'stock_pieces' => 0,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }
}
