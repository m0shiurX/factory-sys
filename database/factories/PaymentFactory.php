<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
final class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $method = fake()->randomElement(['bkash', 'nagad', 'upay', 'bank']);

        return [
            'order_id' => Order::factory(),
            'method' => $method,
            'gateway_number' => $this->generateGatewayNumber($method),
            'transaction_id' => mb_strtoupper(fake()->bothify('??#####??##')),
            'amount' => fake()->randomElement([10000, 25000]),
            'status' => 'pending',
        ];
    }

    /**
     * Indicate that the payment is verified.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'verified',
            'verified_at' => now(),
            'verified_by' => User::factory(),
        ]);
    }

    /**
     * Indicate that the payment failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'failed',
            'admin_notes' => 'Transaction ID not found / Invalid amount',
        ]);
    }

    /**
     * Set payment method to bKash.
     */
    public function bkash(): static
    {
        return $this->state(fn (array $attributes): array => [
            'method' => 'bkash',
            'gateway_number' => '01'.fake()->randomElement(['7', '8', '9']).fake()->numerify('########'),
        ]);
    }

    /**
     * Set payment method to Nagad.
     */
    public function nagad(): static
    {
        return $this->state(fn (array $attributes): array => [
            'method' => 'nagad',
            'gateway_number' => '01'.fake()->randomElement(['3', '4', '5', '6', '7', '8', '9']).fake()->numerify('########'),
        ]);
    }

    /**
     * Set payment method to Upay.
     */
    public function upay(): static
    {
        return $this->state(fn (array $attributes): array => [
            'method' => 'upay',
            'gateway_number' => '01'.fake()->randomElement(['3', '4', '5', '6', '7', '8', '9']).fake()->numerify('########'),
        ]);
    }

    /**
     * Set payment method to Bank Transfer.
     */
    public function bank(): static
    {
        return $this->state(fn (array $attributes): array => [
            'method' => 'bank',
            'gateway_number' => fake()->numerify('##########'),
        ]);
    }

    /**
     * Generate a realistic gateway number based on method.
     */
    private function generateGatewayNumber(string $method): string
    {
        if ($method === 'bank') {
            return fake()->numerify('##########'); // Bank account number
        }

        // Mobile wallet number
        return '01'.fake()->randomElement(['3', '4', '5', '6', '7', '8', '9']).fake()->numerify('########');
    }
}
