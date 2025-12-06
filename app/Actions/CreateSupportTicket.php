<?php

declare(strict_types=1);

namespace App\Actions;

use App\Data\SupportTicketData;
use App\Models\Customer;
use App\Models\SupportTicket;
use Illuminate\Support\Facades\DB;

final readonly class CreateSupportTicket
{
    /**
     * Execute the action - creates a support ticket from validated data.
     */
    public function handle(SupportTicketData $data): SupportTicket
    {
        return DB::transaction(function () use ($data): SupportTicket {
            // Try to find existing customer by phone if not already provided
            $customerId = $data->customer_id;

            if ($customerId === null) {
                $customer = Customer::query()->where('phone', $data->phone)->first();
                $customerId = $customer?->id;
            }

            return SupportTicket::query()->create([
                'customer_id' => $customerId,
                'name' => $data->name,
                'email' => $data->email,
                'phone' => $data->phone,
                'message' => $data->message,
                'status' => $data->status,
                'priority' => $data->priority,
                'category' => $data->category,
                'admin_notes' => $data->admin_notes,
            ]);
        });
    }
}
