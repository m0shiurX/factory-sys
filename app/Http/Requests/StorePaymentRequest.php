<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class StorePaymentRequest extends FormRequest
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
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'sale_id' => ['nullable', 'integer', 'exists:sales,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_type_id' => ['nullable', 'integer', 'exists:payment_types,id'],
            'payment_ref' => ['nullable', 'string', 'max:100'],
            'payment_date' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.min' => 'Payment amount must be at least 0.01.',
            'customer_id.required' => 'Please select a customer.',
            'payment_date.required' => 'Please enter a payment date.',
        ];
    }
}
