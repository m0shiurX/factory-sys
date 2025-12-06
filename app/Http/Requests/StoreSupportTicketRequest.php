<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Data\SupportTicketData;
use Illuminate\Foundation\Http\FormRequest;

final class StoreSupportTicketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): true
    {
        return true; // Public contact form, no auth required
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'message' => ['required', 'string', 'max:5000'],
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
            'name.required' => 'Please provide your name.',
            'phone.required' => 'Please provide your phone number.',
            'message.required' => 'Please write your message.',
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
            'name' => 'name',
            'email' => 'email address',
            'phone' => 'phone number',
            'message' => 'message',
        ];
    }

    /**
     * Convert the validated data to a DTO.
     */
    public function toData(): SupportTicketData
    {
        return SupportTicketData::from($this->validated());
    }
}
