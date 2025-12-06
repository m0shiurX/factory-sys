<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Product;
use App\Models\Production;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Production>
 */
final class ProductionFactory extends Factory
{
    protected $model = Production::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'pieces_produced' => fake()->numberBetween(10, 500),
            'production_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'note' => fake()->optional()->sentence(),
            'created_by' => User::factory(),
        ];
    }

    public function today(): static
    {
        return $this->state(fn (array $attributes): array => [
            'production_date' => now()->toDateString(),
        ]);
    }
}
