<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\SalesReturnItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SalesReturnItem extends Model
{
    /**
     * @use HasFactory<SalesReturnItemFactory>
     */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'sales_return_id',
        'product_id',
        'description',
        'bundles',
        'extra_pieces',
        'total_pieces',
        'weight_kg',
        'rate_per_kg',
        'sub_total',
    ];

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'bundles' => 'integer',
            'extra_pieces' => 'integer',
            'total_pieces' => 'integer',
            'weight_kg' => 'decimal:2',
            'rate_per_kg' => 'decimal:2',
            'sub_total' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<SalesReturn, $this>
     */
    public function salesReturn(): BelongsTo
    {
        return $this->belongsTo(SalesReturn::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
