<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Payment;
use App\Models\PaymentType;
use App\Models\Product;
use App\Models\Production;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

final class PaginationDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->command?->warn('Pagination demo data is only available in local and testing environments.');

            return;
        }

        DB::transaction(function (): void {
            if (Customer::query()->where('name', 'Pagination Demo Customer 01')->exists()) {
                $this->command?->info('Pagination demo data already exists; leaving testing edits intact.');

                return;
            }

            $userId = User::query()->orderBy('id')->value('id');
            $paymentType = PaymentType::query()->firstOrCreate(['name' => 'Cash'], ['is_active' => true]);

            for ($index = 1; $index <= 20; $index++) {
                $customer = Customer::factory()->create([
                    'name' => sprintf('Pagination Demo Customer %02d', $index),
                    'phone' => sprintf('0179900%04d', $index),
                    'address' => sprintf('Demo Shop %02d, Dhaka', $index),
                    'opening_balance' => 0,
                    'opening_date' => null,
                    'total_due' => 0,
                    'credit_limit' => 100000,
                    'is_active' => true,
                ]);
                $product = Product::factory()->create([
                    'name' => sprintf('Pagination Demo Product %02d', $index),
                    'size' => ['Small', 'Medium', 'Large'][($index - 1) % 3],
                    'pieces_per_bundle' => 20,
                    'rate_per_kg' => 100 + $index * 5,
                    'stock_pieces' => 1000,
                    'min_stock_alert' => 50,
                    'is_active' => true,
                ]);

                Production::query()->create([
                    'product_id' => $product->id,
                    'pieces_produced' => 1000,
                    'production_date' => today()->subDays(21)->toDateString(),
                    'note' => 'Pagination demo opening production',
                    'created_by' => $userId,
                ]);

                for ($invoice = 1; $invoice <= 2; $invoice++) {
                    $bundles = $invoice + 1;
                    $extraPieces = $index % 5;
                    $pieces = $bundles * $product->pieces_per_bundle + $extraPieces;
                    $weight = $bundles * 5;
                    $total = $weight * (float) $product->rate_per_kg;
                    $discount = $invoice === 2 ? 50 : 0;
                    $net = $total - $discount;
                    $scenario = ($index + $invoice) % 4;
                    $paymentAmount = match ($scenario) {
                        0 => $net / 2,
                        1 => $net,
                        2 => $net + 500,
                        3 => $net / 4,
                    };
                    $isGeneralPayment = $scenario === 3;
                    $paid = $isGeneralPayment ? 0 : $paymentAmount;
                    $saleDate = today()->subDays(20 - $index + 2 - $invoice);

                    $sale = Sale::query()->create([
                        'bill_no' => Sale::generateBillNo(),
                        'customer_id' => $customer->id,
                        'sale_date' => $saleDate->toDateString(),
                        'total_pieces' => $pieces,
                        'total_weight_kg' => $weight,
                        'total_amount' => $total,
                        'discount' => $discount,
                        'net_amount' => $net,
                        'paid_amount' => $paid,
                        'due_amount' => max(0, $net - $paid),
                        'notes' => 'Pagination demo sale',
                        'created_by' => $userId,
                    ]);
                    $sale->items()->create([
                        'product_id' => $product->id,
                        'bundles' => $bundles,
                        'extra_pieces' => $extraPieces,
                        'total_pieces' => $pieces,
                        'weight_kg' => $weight,
                        'rate_per_kg' => $product->rate_per_kg,
                        'amount' => $total,
                    ]);
                    $product->decrement('stock_pieces', $pieces);

                    Payment::query()->create([
                        'customer_id' => $customer->id,
                        'sale_id' => $isGeneralPayment ? null : $sale->id,
                        'amount' => $paymentAmount,
                        'payment_type_id' => $paymentType->id,
                        'payment_ref' => 'DEMO-'.$sale->bill_no,
                        'payment_date' => $saleDate->copy()->addDay()->min(today())->toDateString(),
                        'note' => $isGeneralPayment ? 'Pagination demo general payment' : 'Pagination demo invoice payment',
                        'created_by' => $userId,
                    ]);
                    $customer->increment('total_due', $net - $paymentAmount);
                }
            }

            $this->command?->info('Created 20 customers, 20 products, 20 productions, 40 sales and 40 payments.');
        });
    }
}
