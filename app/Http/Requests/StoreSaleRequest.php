<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class StoreSaleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'bill_no' => ['required', 'string', 'max:50', 'unique:sales,bill_no'],
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'sale_date' => ['required', 'date'],
            'total_pieces' => ['required', 'integer', 'min:0'],
            'total_weight_kg' => ['required', 'numeric', 'min:0'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'net_amount' => ['required', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'due_amount' => ['required', 'numeric', 'min:0'],
            'payment_type_id' => ['nullable', 'integer', 'exists:payment_types,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.bundles' => ['required', 'integer', 'min:0'],
            'items.*.extra_pieces' => ['required', 'integer', 'min:0'],
            'items.*.total_pieces' => ['required', 'integer', 'min:1'],
            'items.*.weight_kg' => ['required', 'numeric', 'min:0.01'],
            'items.*.rate_per_kg' => ['required', 'numeric', 'min:0'],
            'items.*.amount' => ['required', 'numeric', 'min:0'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.required' => 'At least one product item is required.',
            'items.min' => 'At least one product item is required.',
            'items.*.weight_kg.min' => 'Weight must be at least 0.01 kg.',
        ];
    }
}
