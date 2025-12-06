<?php

declare(strict_types=1);

namespace App\Enums;

enum CustomerSource: string
{
    case Checkout = 'checkout';
    case Manual = 'manual';
    case Import = 'import';

    /**
     * Get all sources as array for dropdowns.
     *
     * @return array<string, string>
     */
    public static function options(): array
    {
        return array_combine(
            array_column(self::cases(), 'value'),
            array_map(fn (self $source): string => $source->label(), self::cases())
        );
    }

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Checkout => 'Checkout',
            self::Manual => 'Manual',
            self::Import => 'Import',
        };
    }
}
