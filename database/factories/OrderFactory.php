<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
final class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $plans = [
            ['slug' => 'yearly', 'name' => 'Yearly Plan', 'duration' => '1 year', 'amount' => 10000],
            ['slug' => 'mega-savings', 'name' => 'Mega Savings Plan', 'duration' => '3 years', 'amount' => 25000],
        ];
        $plan = fake()->randomElement($plans);

        return [
            'customer_id' => \App\Models\Customer::factory(),
            'order_number' => Order::generateOrderNumber(),
            'plan_slug' => $plan['slug'],
            'plan_name' => $plan['name'],
            'plan_duration' => $plan['duration'],
            'amount' => $plan['amount'],
            'business_name' => fake()->optional(0.6)->company(),
            'status' => 'pending',
        ];
    }

    /**
     * Indicate that the order is verified.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'verified',
        ]);
    }

    /**
     * Indicate that the order is processing.
     */
    public function processing(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'processing',
        ]);
    }

    /**
     * Indicate that the order is completed with active subscription.
     */
    public function completed(): static
    {
        return $this->state(function (array $attributes): array {
            $startsAt = now();
            $duration = $attributes['plan_slug'] === 'mega-savings' ? 3 : 1;

            return [
                'status' => 'completed',
                'subscription_starts_at' => $startsAt,
                'subscription_ends_at' => $startsAt->copy()->addYears($duration),
            ];
        });
    }

    /**
     * Indicate that the order is for yearly plan.
     */
    public function yearly(): static
    {
        return $this->state(fn (array $attributes): array => [
            'plan_slug' => 'yearly',
            'plan_name' => 'Yearly Plan',
            'plan_duration' => '1 year',
            'amount' => 10000,
        ]);
    }

    /**
     * Indicate that the order is for mega-savings plan.
     */
    public function megaSavings(): static
    {
        return $this->state(fn (array $attributes): array => [
            'plan_slug' => 'mega-savings',
            'plan_name' => 'Mega Savings Plan',
            'plan_duration' => '3 years',
            'amount' => 25000,
        ]);
    }
}
