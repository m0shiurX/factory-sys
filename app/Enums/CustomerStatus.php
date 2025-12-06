<?php

declare(strict_types=1);

namespace App\Enums;

enum CustomerStatus: string
{
    case Lead = 'lead';
    case Pending = 'pending';
    case Active = 'active';
    case Expired = 'expired';

    /**
     * Get all statuses as array for dropdowns.
     *
     * @return array<string, string>
     */
    public static function options(): array
    {
        return array_combine(
            array_column(self::cases(), 'value'),
            array_map(fn (self $status): string => $status->label(), self::cases())
        );
    }

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Lead => 'Lead',
            self::Pending => 'Pending',
            self::Active => 'Active',
            self::Expired => 'Expired',
        };
    }

    /**
     * Get badge color class.
     */
    public function color(): string
    {
        return match ($this) {
            self::Lead => 'amber',
            self::Pending => 'blue',
            self::Active => 'emerald',
            self::Expired => 'slate',
        };
    }
}
