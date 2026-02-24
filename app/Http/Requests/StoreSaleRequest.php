<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class StoreSaleRequest extends FormRequest
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
            'bill_no' => ['required', 'string', 'max:50', 'unique:sales,bill_no'],
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'sale_date' => ['required', 'date'],
            'total_pieces' => ['required', 'integer', 'min:0'],
            'total_weight_kg' => ['required', 'numeric', 'min:0'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'net_amount' => ['required', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'due_amount' => ['required', 'numeric', 'min:0'],
            'payment_type_id' => ['nullable', 'integer', 'exists:payment_types,id'],
            'payment_ref' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.bundles' => ['required', 'integer', 'min:0'],
            'items.*.extra_pieces' => ['required', 'integer', 'min:0'],
            'items.*.total_pieces' => ['required', 'integer', 'min:1'],
            'items.*.weight_kg' => ['required', 'numeric', 'min:0.01'],
            'items.*.rate_per_kg' => ['required', 'numeric', 'min:0'],
            'items.*.amount' => ['required', 'numeric', 'min:0'],
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
            'items.required' => 'At least one product item is required.',
            'items.min' => 'At least one product item is required.',
            'items.*.weight_kg.min' => 'Weight must be at least 0.01 kg.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $this->validateStockAvailability($validator);
        });
    }

    /**
     * Validate that sufficient stock is available for all items.
     */
    private function validateStockAvailability(Validator $validator): void
    {
        /** @var array<int, array{product_id: int, total_pieces: int}> $items */
        $items = $this->input('items', []);

        if (empty($items)) {
            return;
        }

        // Aggregate total pieces requested per product (in case same product appears multiple times)
        /** @var array<int, int> $requestedPieces */
        $requestedPieces = [];
        foreach ($items as $item) {
            $productId = (int) ($item['product_id'] ?? 0);
            $pieces = (int) ($item['total_pieces'] ?? 0);
            $requestedPieces[$productId] = ($requestedPieces[$productId] ?? 0) + $pieces;
        }

        // Fetch all products with their stock
        $productIds = array_keys($requestedPieces);
        $products = Product::query()
            ->whereIn('id', $productIds)
            ->select(['id', 'name', 'size', 'stock_pieces', 'pieces_per_bundle'])
            ->get()
            ->keyBy('id');

        foreach ($requestedPieces as $productId => $totalRequested) {
            $product = $products->get($productId);

            if (! $product) {
                continue;
            }

            if ($totalRequested > $product->stock_pieces) {
                $productName = $product->name . ($product->size ? " ({$product->size})" : '');
                $availableStock = $this->formatStock($product->stock_pieces, $product->pieces_per_bundle);
                $requestedStock = $this->formatStock($totalRequested, $product->pieces_per_bundle);

                $validator->errors()->add(
                    'items',
                    "Insufficient stock for {$productName}. Available: {$availableStock}, Requested: {$requestedStock}",
                );
            }
        }
    }

    /**
     * Format stock display with bundles and pieces.
     */
    private function formatStock(int $pieces, int $piecesPerBundle): string
    {
        $bundles = intdiv($pieces, $piecesPerBundle);
        $remaining = $pieces % $piecesPerBundle;

        if ($bundles > 0 && $remaining > 0) {
            return "{$bundles} bdl + {$remaining} pcs";
        }
        if ($bundles > 0) {
            return "{$bundles} bdl";
        }

        return "{$pieces} pcs";
    }
}
