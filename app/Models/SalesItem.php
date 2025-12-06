<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SalesItem extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'sale_id',
        'product_id',
        'bundles',
        'extra_pieces',
        'total_pieces',
        'weight_kg',
        'rate_per_kg',
        'amount',
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
            'amount' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Sale, $this>
     */
    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
