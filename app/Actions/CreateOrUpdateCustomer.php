<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CustomerSource;
use App\Enums\CustomerStatus;
use App\Models\Customer;

final readonly class CreateOrUpdateCustomer
{
    /**
     * Create or update a customer by phone number.
     *
     * @param array{
     *     name: string,
     *     phone: string,
     *     email?: string|null,
     *     address?: string|null,
     *     status?: CustomerStatus,
     *     source?: CustomerSource,
     * } $data
     */
    public function handle(array $data): Customer
    {
        $customer = Customer::query()->where('phone', $data['phone'])->first();

        if ($customer) {
            // Update existing customer
            $updateData = ['name' => $data['name']];

            if (isset($data['email']) && $data['email']) {
                $updateData['email'] = $data['email'];
            }
            if (isset($data['address']) && $data['address']) {
                $updateData['address'] = $data['address'];
            }

            $customer->update($updateData);

            return $customer;
        }

        // Create new customer as lead
        return Customer::query()->create([
            'name' => $data['name'],
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'address' => $data['address'] ?? null,
            'status' => $data['status'] ?? CustomerStatus::Lead,
            'source' => $data['source'] ?? CustomerSource::Checkout,
        ]);
    }
}
