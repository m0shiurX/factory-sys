<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): true
    {
        return true; // Public checkout, no auth required
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Customer ID (from lead capture)
            'customer_id' => ['required', 'integer', 'exists:customers,id'],

            // Plan info
            'plan_slug' => ['required', 'string', Rule::in(['monthly', 'yearly', 'mega-savings'])],
            'plan_name' => ['required', 'string', 'max:255'],
            'plan_duration' => ['required', 'string', 'max:50'],
            'amount' => ['required', 'integer', 'min:1000'],

            // Business name (optional)
            'business_name' => ['nullable', 'string', 'max:255'],

            // Payment info
            'payment_method' => ['required', 'string', Rule::in(['bkash', 'nagad', 'upay', 'bank'])],
            'gateway_number' => ['required', 'string', 'max:50'],
            'transaction_id' => ['required', 'string', 'max:100'],
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
            'customer_id.required' => 'Customer information is required. Please go back and fill your details.',
            'customer_id.exists' => 'Customer not found. Please refresh and try again.',
            'gateway_number.required' => 'Please provide your payment number.',
            'transaction_id.required' => 'Please provide the transaction ID.',
            'plan_slug.in' => 'Please select a valid plan.',
            'payment_method.in' => 'Please select a valid payment method.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'customer_id' => 'customer',
            'gateway_number' => 'payment number',
            'transaction_id' => 'transaction ID',
        ];
    }
}
