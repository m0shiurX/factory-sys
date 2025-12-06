<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class Customer extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'phone',
        'address',
        'opening_balance',
        'opening_date',
        'total_due',
        'credit_limit',
        'is_active',
    ];

    /**
     * Check if customer is over credit limit.
     */
    public function isOverCreditLimit(): bool
    {
        return $this->credit_limit > 0 && $this->total_due > $this->credit_limit;
    }

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'opening_balance' => 'decimal:2',
            'opening_date' => 'date',
            'total_due' => 'decimal:2',
            'credit_limit' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get available credit.
     */
    public function getAvailableCreditAttribute(): float
    {
        if ($this->credit_limit <= 0) {
            return 0;
        }

        return max(0, $this->credit_limit - $this->total_due);
    }
}
