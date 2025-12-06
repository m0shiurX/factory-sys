<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CustomerSource;
use App\Enums\CustomerStatus;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
final class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'phone' => '01'.fake()->numerify('#########'),
            'email' => fake()->optional(0.7)->safeEmail(),
            'address' => fake()->optional(0.5)->address(),
            'status' => fake()->randomElement(CustomerStatus::cases()),
            'source' => fake()->randomElement(CustomerSource::cases()),
            'admin_notes' => fake()->optional(0.2)->sentence(),
        ];
    }

    /**
     * Lead status.
     */
    public function lead(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => CustomerStatus::Lead,
        ]);
    }

    /**
     * Pending status.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => CustomerStatus::Pending,
        ]);
    }

    /**
     * Active status.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => CustomerStatus::Active,
        ]);
    }

    /**
     * Expired status.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => CustomerStatus::Expired,
        ]);
    }

    /**
     * From checkout source.
     */
    public function fromCheckout(): static
    {
        return $this->state(fn (array $attributes): array => [
            'source' => CustomerSource::Checkout,
        ]);
    }

    /**
     * Manual entry source.
     */
    public function manual(): static
    {
        return $this->state(fn (array $attributes): array => [
            'source' => CustomerSource::Manual,
        ]);
    }
}
