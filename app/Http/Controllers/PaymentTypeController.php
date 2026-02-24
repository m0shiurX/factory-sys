<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\PaymentType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class PaymentTypeController
{
    public function index(): Response
    {
        $paymentTypes = PaymentType::query()
            ->withCount(['sales', 'payments'])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/settings/payment-types', [
            'paymentTypes' => $paymentTypes,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:payment_types,name'],
        ]);

        PaymentType::query()->create([
            'name' => $validated['name'],
            'is_active' => true,
        ]);

        return back()->with('success', 'Payment type created successfully.');
    }

    public function update(Request $request, PaymentType $paymentType): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:payment_types,name,'.$paymentType->id],
            'is_active' => ['boolean'],
        ]);

        $paymentType->update($validated);

        return back()->with('success', 'Payment type updated successfully.');
    }

    public function destroy(PaymentType $paymentType): RedirectResponse
    {
        if ($paymentType->sales()->exists() || $paymentType->payments()->exists()) {
            return back()->with('error', 'Cannot delete payment type that is in use.');
        }

        $paymentType->delete();

        return back()->with('success', 'Payment type deleted successfully.');
    }
}
