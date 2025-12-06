<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class Product extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'size',
        'pieces_per_bundle',
        'rate_per_kg',
        'stock_pieces',
        'min_stock_alert',
        'is_active',
    ];

    /**
     * Get the display name with size.
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->size ? "{$this->name} ({$this->size})" : $this->name;
    }

    /**
     * Format stock as bundles + pieces.
     */
    public function getFormattedStockAttribute(): string
    {
        $bundles = (int) floor($this->stock_pieces / $this->pieces_per_bundle);
        $remaining = $this->stock_pieces % $this->pieces_per_bundle;

        if ($remaining > 0) {
            return "{$bundles} bundles + {$remaining} pcs";
        }

        return "{$bundles} bundles";
    }

    /**
     * Check if stock is below minimum alert level.
     */
    public function isLowStock(): bool
    {
        return $this->stock_pieces <= $this->min_stock_alert;
    }

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'pieces_per_bundle' => 'integer',
            'rate_per_kg' => 'decimal:2',
            'stock_pieces' => 'integer',
            'min_stock_alert' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
