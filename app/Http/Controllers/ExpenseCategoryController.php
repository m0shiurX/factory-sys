<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\ExpenseCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ExpenseCategoryController
{
    public function index(): Response
    {
        $categories = ExpenseCategory::query()
            ->withCount('expenses')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/expenses/categories/index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:expense_categories,name'],
        ]);

        ExpenseCategory::query()->create([
            'name' => $validated['name'],
            'is_active' => true,
        ]);

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, ExpenseCategory $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:expense_categories,name,'.$category->id],
            'is_active' => ['boolean'],
        ]);

        $category->update($validated);

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(ExpenseCategory $category): RedirectResponse
    {
        if ($category->expenses()->exists()) {
            return back()->with('error', 'Cannot delete category with existing expenses.');
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }
}
