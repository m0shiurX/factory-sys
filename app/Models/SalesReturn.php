<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class SalesReturn extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'return_no',
        'customer_id',
        'sale_id',
        'return_date',
        'total_weight',
        'sub_total',
        'discount',
        'grand_total',
        'note',
        'created_by',
    ];

    /**
     * Generate the next return number.
     */
    public static function generateReturnNo(): string
    {
        $year = date('Y');
        $lastReturn = self::query()->whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $lastReturn
            ? (int) mb_substr((string) $lastReturn->return_no, -4) + 1
            : 1;

        return sprintf('SR-%s-%04d', $year, $nextNumber);
    }

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'return_date' => 'date',
            'total_weight' => 'decimal:2',
            'sub_total' => 'decimal:2',
            'discount' => 'decimal:2',
            'grand_total' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * @return BelongsTo<Sale, $this>
     */
    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<SalesReturnItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(SalesReturnItem::class);
    }
}
