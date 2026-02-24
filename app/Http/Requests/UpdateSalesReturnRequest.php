<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateSalesReturnRequest extends FormRequest
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
        $isScrap = $this->boolean('is_scrap_purchase');

        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'sale_id' => ['nullable', 'integer', 'exists:sales,id'],
            'return_date' => ['required', 'date'],
            'is_scrap_purchase' => ['required', 'boolean'],
            'total_weight' => ['required', 'numeric', 'min:0'],
            'sub_total' => ['required', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'grand_total' => ['required', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => [$isScrap ? 'nullable' : 'required', 'integer', 'exists:products,id'],
            'items.*.description' => [$isScrap ? 'required' : 'nullable', 'string', 'max:255'],
            'items.*.bundles' => [$isScrap ? 'nullable' : 'required', 'integer', 'min:0'],
            'items.*.extra_pieces' => [$isScrap ? 'nullable' : 'required', 'integer', 'min:0'],
            'items.*.total_pieces' => [$isScrap ? 'nullable' : 'required', 'integer', 'min:0'],
            'items.*.weight_kg' => ['required', 'numeric', 'min:0.01'],
            'items.*.rate_per_kg' => ['required', 'numeric', 'min:0'],
            'items.*.sub_total' => ['required', 'numeric', 'min:0'],
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
