<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Customer;
use App\Models\SalesReturn;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SalesReturn>
 */
final class SalesReturnFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subTotal = fake()->randomFloat(2, 1000, 50000);
        $discount = fake()->randomFloat(2, 0, $subTotal * 0.1);
        $grandTotal = $subTotal - $discount;

        return [
            'return_no' => 'SR-'.date('Y').'-'.mb_str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'customer_id' => Customer::factory(),
            'sale_id' => null,
            'return_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'total_weight' => fake()->randomFloat(2, 10, 500),
            'sub_total' => $subTotal,
            'discount' => $discount,
            'grand_total' => $grandTotal,
            'note' => fake()->optional(0.3)->sentence(),
            'created_by' => User::factory(),
        ];
    }

    /**
     * Create a sales return with a specific customer.
     */
    public function forCustomer(Customer $customer): static
    {
        return $this->state(fn (array $attributes): array => [
            'customer_id' => $customer->id,
        ]);
    }

    /**
     * Create a sales return created by a specific user.
     */
    public function createdBy(User $user): static
    {
        return $this->state(fn (array $attributes): array => [
            'created_by' => $user->id,
        ]);
    }
}
