<?php

declare(strict_types=1);

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function (): void {
    $this->user = User::factory()->create();
});

it('displays the expenses index page', function (): void {
    $category = ExpenseCategory::factory()->create();
    Expense::factory()->count(3)->forCategory($category)->byUser($this->user)->create();

    actingAs($this->user)
        ->get(route('expenses.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/expenses/index')
            ->has('expenses.data', 3)
            ->has('stats')
            ->has('categories'));
});

it('displays the create expense page', function (): void {
    ExpenseCategory::factory()->count(5)->create();

    actingAs($this->user)
        ->get(route('expenses.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/expenses/create')
            ->has('categories', 5));
});

it('stores a new expense', function (): void {
    $category = ExpenseCategory::factory()->create();

    actingAs($this->user)
        ->post(route('expenses.store'), [
            'expense_category_id' => $category->id,
            'amount' => 5000.50,
            'expense_date' => now()->toDateString(),
            'description' => 'Test expense',
        ])
        ->assertRedirect(route('expenses.index'))
        ->assertSessionHas('success', 'Expense recorded successfully.');

    assertDatabaseHas('expenses', [
        'expense_category_id' => $category->id,
        'amount' => 5000.50,
        'description' => 'Test expense',
        'created_by' => $this->user->id,
    ]);
});

it('validates required fields when storing', function (): void {
    actingAs($this->user)
        ->post(route('expenses.store'), [])
        ->assertSessionHasErrors(['expense_category_id', 'amount', 'expense_date']);
});

it('validates expense_category_id exists', function (): void {
    actingAs($this->user)
        ->post(route('expenses.store'), [
            'expense_category_id' => 9999,
            'amount' => 1000,
            'expense_date' => now()->toDateString(),
        ])
        ->assertSessionHasErrors(['expense_category_id']);
});

it('validates amount is positive', function (): void {
    $category = ExpenseCategory::factory()->create();

    actingAs($this->user)
        ->post(route('expenses.store'), [
            'expense_category_id' => $category->id,
            'amount' => 0,
            'expense_date' => now()->toDateString(),
        ])
        ->assertSessionHasErrors(['amount']);
});

it('displays expense show page', function (): void {
    $expense = Expense::factory()->create();

    actingAs($this->user)
        ->get(route('expenses.show', $expense))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/expenses/show')
            ->has('expense'));
});

it('displays expense edit page', function (): void {
    $expense = Expense::factory()->create();

    actingAs($this->user)
        ->get(route('expenses.edit', $expense))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/expenses/edit')
            ->has('expense')
            ->has('categories'));
});

it('updates an expense', function (): void {
    $category = ExpenseCategory::factory()->create();
    $expense = Expense::factory()->forCategory($category)->create([
        'amount' => 1000,
        'description' => 'Old description',
    ]);

    $newCategory = ExpenseCategory::factory()->create();

    actingAs($this->user)
        ->put(route('expenses.update', $expense), [
            'expense_category_id' => $newCategory->id,
            'amount' => 2500,
            'expense_date' => now()->toDateString(),
            'description' => 'Updated description',
        ])
        ->assertRedirect(route('expenses.show', $expense))
        ->assertSessionHas('success', 'Expense updated successfully.');

    $expense->refresh();
    expect($expense->expense_category_id)->toBe($newCategory->id);
    expect((float) $expense->amount)->toBe(2500.0);
    expect($expense->description)->toBe('Updated description');
});

it('deletes an expense', function (): void {
    $expense = Expense::factory()->create();

    actingAs($this->user)
        ->delete(route('expenses.destroy', $expense))
        ->assertRedirect(route('expenses.index'))
        ->assertSessionHas('success', 'Expense deleted successfully.');

    assertDatabaseMissing('expenses', ['id' => $expense->id]);
});

it('searches expenses by category name', function (): void {
    $category1 = ExpenseCategory::factory()->create(['name' => 'Utilities']);
    $category2 = ExpenseCategory::factory()->create(['name' => 'Transport']);

    Expense::factory()->forCategory($category1)->create();
    Expense::factory()->forCategory($category2)->create();

    actingAs($this->user)
        ->get(route('expenses.index', ['search' => 'Utilities']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('expenses.data', 1));
});

it('filters expenses by category', function (): void {
    $category1 = ExpenseCategory::factory()->create();
    $category2 = ExpenseCategory::factory()->create();

    Expense::factory()->count(2)->forCategory($category1)->create();
    Expense::factory()->forCategory($category2)->create();

    actingAs($this->user)
        ->get(route('expenses.index', ['category_id' => $category1->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('expenses.data', 2));
});

it('shows today stats correctly', function (): void {
    $category = ExpenseCategory::factory()->create();
    Expense::factory()->today()->forCategory($category)->create([
        'amount' => 1000,
    ]);
    Expense::factory()->forCategory($category)->create([
        'amount' => 500,
        'expense_date' => now()->subDays(5),
    ]);

    actingAs($this->user)
        ->get(route('expenses.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('stats.today_expenses', 1)
            ->where('stats.today_amount', fn ($value): bool => (float) $value === 1000.0));
});
