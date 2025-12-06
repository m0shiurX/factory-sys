<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\PaymentType;
use Illuminate\Database\Seeder;

final class PaymentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $paymentTypes = [
            ['name' => 'Cash', 'is_active' => true],
            ['name' => 'Bank Transfer', 'is_active' => true],
            ['name' => 'bKash', 'is_active' => true],
            ['name' => 'Nagad', 'is_active' => true],
            ['name' => 'Rocket', 'is_active' => true],
            ['name' => 'Check', 'is_active' => true],
        ];

        foreach ($paymentTypes as $type) {
            PaymentType::firstOrCreate(
                ['name' => $type['name']],
                ['is_active' => $type['is_active']]
            );
        }
    }
}
