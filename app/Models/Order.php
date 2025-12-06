<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    public ?\Illuminate\Support\Carbon $subscription_ends_at = null;

    protected $fillable = [
        'customer_id',
        'order_number',
        'plan_slug',
        'plan_name',
        'plan_duration',
        'amount',
        'business_name',
        'status',
        'subscription_starts_at',
        'subscription_ends_at',
        'admin_notes',
    ];

    /**
     * Generate a unique order number.
     */
    public static function generateOrderNumber(): string
    {
        $year = date('Y');
        $lastOrder = self::query()
            ->whereYear('created_at', $year)
            ->orderByDesc('id')
            ->first();

        $sequence = $lastOrder ? ((int) mb_substr((string) $lastOrder->order_number, -5)) + 1 : 1;

        return sprintf('ORD-%s-%05d', $year, $sequence);
    }

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'amount' => 'integer',
            'subscription_starts_at' => 'date',
            'subscription_ends_at' => 'date',
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
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Check if the order is pending payment verification.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the subscription is active.
     */
    public function isSubscriptionActive(): bool
    {
        return $this->status === 'completed'
            && $this->subscription_ends_at
            && $this->subscription_ends_at->isFuture();
    }
}
