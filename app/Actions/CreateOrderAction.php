<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CustomerStatus;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

final readonly class CreateOrderAction
{
    /**
     * Execute the action to create an order with initial payment.
     *
     * @param  array{
     *     customer_id: int,
     *     plan_slug: string,
     *     plan_name: string,
     *     plan_duration: string,
     *     amount: int,
     *     business_name?: string|null,
     *     payment_method: string,
     *     gateway_number?: string|null,
     *     transaction_id?: string|null,
     * }  $data
     */
    public function handle(array $data): Order
    {
        return DB::transaction(function () use ($data): Order {
            // Update customer status to pending
            Customer::query()
                ->where('id', $data['customer_id'])
                ->update(['status' => CustomerStatus::Pending]);

            // Create the order
            $order = Order::query()->create([
                'customer_id' => $data['customer_id'],
                'order_number' => Order::generateOrderNumber(),
                'plan_slug' => $data['plan_slug'],
                'plan_name' => $data['plan_name'],
                'plan_duration' => $data['plan_duration'],
                'amount' => $data['amount'],
                'business_name' => $data['business_name'] ?? null,
                'status' => 'pending',
            ]);

            // Create the initial payment record
            Payment::query()->create([
                'order_id' => $order->id,
                'method' => $data['payment_method'],
                'gateway_number' => $data['gateway_number'] ?? null,
                'transaction_id' => $data['transaction_id'] ?? null,
                'amount' => $data['amount'],
                'status' => 'pending',
            ]);

            return $order;
        });
    }
}
