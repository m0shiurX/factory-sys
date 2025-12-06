<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Product;
use App\Models\SalesReturn;
use App\Models\SalesReturnItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SalesReturnItem>
 */
final class SalesReturnItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $bundles = fake()->numberBetween(1, 20);
        $extraPieces = fake()->numberBetween(0, 10);
        $totalPieces = ($bundles * 10) + $extraPieces;
        $weightKg = fake()->randomFloat(2, 10, 200);
        $ratePerKg = fake()->randomFloat(2, 50, 200);
        $subTotal = $weightKg * $ratePerKg;

        return [
            'sales_return_id' => SalesReturn::factory(),
            'product_id' => Product::factory(),
            'bundles' => $bundles,
            'extra_pieces' => $extraPieces,
            'total_pieces' => $totalPieces,
            'weight_kg' => $weightKg,
            'rate_per_kg' => $ratePerKg,
            'sub_total' => $subTotal,
        ];
    }

    /**
     * Create an item for a specific sales return.
     */
    public function forSalesReturn(SalesReturn $salesReturn): static
    {
        return $this->state(fn (array $attributes): array => [
            'sales_return_id' => $salesReturn->id,
        ]);
    }

    /**
     * Create an item for a specific product.
     */
    public function forProduct(Product $product): static
    {
        return $this->state(fn (array $attributes): array => [
            'product_id' => $product->id,
        ]);
    }
}
