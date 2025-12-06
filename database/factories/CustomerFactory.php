<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
final class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->optional(0.7)->address(),
            'opening_balance' => 0,
            'opening_date' => fake()->optional(0.3)->dateTimeBetween('-1 year', 'now'),
            'total_due' => fake()->randomFloat(2, 0, 10000),
            'credit_limit' => fake()->randomFloat(2, 10000, 100000),
            'is_active' => true,
        ];
    }

    /**
     * Mark customer as inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }

    /**
     * Customer with zero due.
     */
    public function zeroDue(): static
    {
        return $this->state(fn (array $attributes): array => [
            'total_due' => 0,
        ]);
    }

    /**
     * Customer with specific due amount.
     */
    public function withDue(float $amount): static
    {
        return $this->state(fn (array $attributes): array => [
            'total_due' => $amount,
        ]);
    }
}
