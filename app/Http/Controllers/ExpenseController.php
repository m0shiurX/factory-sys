<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ExpenseController
{
    public function index(Request $request): Response
    {
        $query = Expense::query()
            ->with(['category:id,name', 'createdBy:id,name']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search): void {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($q) use ($search): void {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Category filter
        if ($request->filled('category_id')) {
            $query->where('expense_category_id', $request->input('category_id'));
        }

        // Date range filter
        if ($request->filled('from_date')) {
            $query->whereDate('expense_date', '>=', $request->input('from_date'));
        }
        if ($request->filled('to_date')) {
            $query->whereDate('expense_date', '<=', $request->input('to_date'));
        }

        $expenses = $query
            ->latest('expense_date')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        // Stats
        $stats = [
            'total_expenses' => Expense::query()->count(),
            'today_expenses' => Expense::query()->whereDate('expense_date', today())->count(),
            'total_amount' => (float) Expense::query()->sum('amount'),
            'today_amount' => (float) Expense::query()->whereDate('expense_date', today())->sum('amount'),
            'this_month_amount' => (float) Expense::query()->whereMonth('expense_date', now()->month)
                ->whereYear('expense_date', now()->year)
                ->sum('amount'),
        ];

        $categories = ExpenseCategory::query()->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/expenses/index', [
            'expenses' => $expenses,
            'stats' => $stats,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'from_date', 'to_date']),
        ]);
    }

    public function create(): Response
    {
        $categories = ExpenseCategory::query()->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/expenses/create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Expense::query()->create([
            'expense_category_id' => $validated['expense_category_id'],
            'amount' => $validated['amount'],
            'expense_date' => $validated['expense_date'],
            'description' => $validated['description'] ?? null,
            'created_by' => auth()->id(),
        ]);

        return to_route('expenses.index')
            ->with('success', 'Expense recorded successfully.');
    }

    public function show(Expense $expense): Response
    {
        $expense->load(['category:id,name', 'createdBy:id,name']);

        return Inertia::render('admin/expenses/show', [
            'expense' => $expense,
        ]);
    }

    public function edit(Expense $expense): Response
    {
        $expense->load('category:id,name');

        $categories = ExpenseCategory::query()->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/expenses/edit', [
            'expense' => $expense,
            'categories' => $categories,
        ]);
    }

    public function update(UpdateExpenseRequest $request, Expense $expense): RedirectResponse
    {
        $validated = $request->validated();

        $expense->update([
            'expense_category_id' => $validated['expense_category_id'],
            'amount' => $validated['amount'],
            'expense_date' => $validated['expense_date'],
            'description' => $validated['description'] ?? null,
        ]);

        return to_route('expenses.show', $expense)
            ->with('success', 'Expense updated successfully.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $expense->delete();

        return to_route('expenses.index')
            ->with('success', 'Expense deleted successfully.');
    }
}
