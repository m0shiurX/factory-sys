<?php

declare(strict_types=1);

namespace App\Enums;

enum TicketStatus: string
{
    case New = 'new';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';
    case Closed = 'closed';

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
            self::New => 'New',
            self::InProgress => 'In Progress',
            self::Resolved => 'Resolved',
            self::Closed => 'Closed',
        };
    }

    /**
     * Get badge color class.
     */
    public function color(): string
    {
        return match ($this) {
            self::New => 'red',
            self::InProgress => 'blue',
            self::Resolved => 'emerald',
            self::Closed => 'slate',
        };
    }
}
