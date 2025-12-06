<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Sale extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'bill_no',
        'customer_id',
        'sale_date',
        'total_pieces',
        'total_weight_kg',
        'total_amount',
        'discount',
        'net_amount',
        'paid_amount',
        'due_amount',
        'payment_type_id',
        'notes',
        'created_by',
    ];

    /**
     * Generate the next bill number.
     */
    public static function generateBillNo(): string
    {
        $year = date('Y');
        $lastSale = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $lastSale
            ? (int) mb_substr($lastSale->bill_no, -4) + 1
            : 1;

        return sprintf('FS-%s-%04d', $year, $nextNumber);
    }

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'sale_date' => 'date',
            'total_pieces' => 'integer',
            'total_weight_kg' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'discount' => 'decimal:2',
            'net_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'due_amount' => 'decimal:2',
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
     * @return BelongsTo<PaymentType, $this>
     */
    public function paymentType(): BelongsTo
    {
        return $this->belongsTo(PaymentType::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<SalesItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(SalesItem::class);
    }
}
