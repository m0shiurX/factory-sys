<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use Illuminate\Database\Seeder;

final class ExpenseCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Electricity', 'is_active' => true],
            ['name' => 'Gas', 'is_active' => true],
            ['name' => 'Transport', 'is_active' => true],
            ['name' => 'Labor', 'is_active' => true],
            ['name' => 'Raw Materials', 'is_active' => true],
            ['name' => 'Maintenance', 'is_active' => true],
            ['name' => 'Office Supplies', 'is_active' => true],
            ['name' => 'Miscellaneous', 'is_active' => true],
        ];

        foreach ($categories as $category) {
            ExpenseCategory::query()->firstOrCreate(['name' => $category['name']], ['is_active' => $category['is_active']]);
        }
    }
}
