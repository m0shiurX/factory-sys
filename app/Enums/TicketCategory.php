<?php

declare(strict_types=1);

namespace App\Enums;

enum TicketCategory: string
{
    case General = 'general';
    case OrderIssue = 'order_issue';
    case ProductInquiry = 'product_inquiry';
    case Complaint = 'complaint';
    case Other = 'other';

    /**
     * Get all categories as array for dropdowns.
     *
     * @return array<string, string>
     */
    public static function options(): array
    {
        return array_combine(
            array_column(self::cases(), 'value'),
            array_map(fn (self $category): string => $category->label(), self::cases())
        );
    }

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::General => 'General Inquiry',
            self::OrderIssue => 'Order Issue',
            self::ProductInquiry => 'Product Inquiry',
            self::Complaint => 'Complaint',
            self::Other => 'Other',
        };
    }

    /**
     * Get icon name.
     */
    public function icon(): string
    {
        return match ($this) {
            self::General => 'message-circle',
            self::OrderIssue => 'package',
            self::ProductInquiry => 'help-circle',
            self::Complaint => 'alert-triangle',
            self::Other => 'more-horizontal',
        };
    }
}
