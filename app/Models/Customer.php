<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CustomerSource;
use App\Enums\CustomerStatus;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Customer extends Model
{
    /** @use HasFactory<CustomerFactory> */
    use HasFactory;

    public CustomerStatus $status;

    public CustomerSource $source;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'status',
        'source',
        'admin_notes',
    ];

    /**
     * Get or create a customer by phone number.
     *
     * @param  array<string, mixed>  $attributes
     */
    public static function findOrCreateByPhone(string $phone, array $attributes = []): self
    {
        $customer = self::query()->where('phone', $phone)->first();

        if ($customer) {
            // Update name if provided and different
            if (isset($attributes['name']) && $attributes['name'] !== $customer->name) {
                $customer->update(['name' => $attributes['name']]);
            }
            // Update other fields if provided
            if (isset($attributes['email']) && $attributes['email']) {
                $customer->update(['email' => $attributes['email']]);
            }
            if (isset($attributes['address']) && $attributes['address']) {
                $customer->update(['address' => $attributes['address']]);
            }

            return $customer;
        }

        return self::query()->create([
            'phone' => $phone,
            'name' => $attributes['name'] ?? '',
            'email' => $attributes['email'] ?? null,
            'address' => $attributes['address'] ?? null,
            'status' => CustomerStatus::Lead,
            'source' => $attributes['source'] ?? CustomerSource::Checkout,
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'status' => CustomerStatus::class,
            'source' => CustomerSource::class,
        ];
    }

    /**
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * @return HasMany<SupportTicket, $this>
     */
    public function supportTickets(): HasMany
    {
        return $this->hasMany(SupportTicket::class);
    }

    /**
     * Check if the customer is a lead.
     */
    public function isLead(): bool
    {
        return $this->status === CustomerStatus::Lead;
    }

    /**
     * Check if the customer is active.
     */
    public function isActive(): bool
    {
        return $this->status === CustomerStatus::Active;
    }

    /**
     * Get total revenue from this customer.
     */
    public function totalRevenue(): int
    {
        return (int) $this->orders()
            ->where('status', 'completed')
            ->sum('amount');
    }

    /**
     * Get the latest order.
     */
    public function latestOrder(): ?Order
    {
        return $this->orders()->latest()->first();
    }
}
