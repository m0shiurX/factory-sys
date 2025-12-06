<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Expense>
 */
final class ExpenseFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'expense_category_id' => ExpenseCategory::factory(),
            'amount' => fake()->randomFloat(2, 100, 50000),
            'expense_date' => fake()->dateTimeBetween('-30 days', 'today'),
            'description' => fake()->optional(0.7)->sentence(),
            'created_by' => User::factory(),
        ];
    }

    public function today(): static
    {
        return $this->state(fn (): array => [
            'expense_date' => today(),
        ]);
    }

    public function forCategory(ExpenseCategory $category): static
    {
        return $this->state(fn (): array => [
            'expense_category_id' => $category->id,
        ]);
    }

    public function byUser(User $user): static
    {
        return $this->state(fn (): array => [
            'created_by' => $user->id,
        ]);
    }
}
