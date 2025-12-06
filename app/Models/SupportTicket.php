<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\TicketCategory;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Database\Factories\SupportTicketFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SupportTicket extends Model
{
    /** @use HasFactory<SupportTicketFactory> */
    use HasFactory;

    public TicketStatus $status;

    public TicketPriority $priority;

    public TicketCategory $category;

    protected $fillable = [
        'customer_id',
        'name',
        'email',
        'phone',
        'message',
        'status',
        'priority',
        'category',
        'admin_notes',
    ];

    /**
     * @property TicketStatus $status
     * @property TicketPriority $priority
     * @property TicketCategory $category
     */

    /**
     * Auto-link to customer by phone number.
     */
    public static function linkToCustomer(self $ticket): void
    {
        if ($ticket->customer_id) {
            return;
        }

        $customer = Customer::query()->where('phone', $ticket->phone)->first();

        if ($customer) {
            $ticket->update(['customer_id' => $customer->id]);
        }
    }

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'status' => TicketStatus::class,
            'priority' => TicketPriority::class,
            'category' => TicketCategory::class,
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
     * Check if the ticket is new/unread.
     */
    public function isNew(): bool
    {
        return $this->status === TicketStatus::New;
    }

    /**
     * Check if the ticket is open (new or in progress).
     */
    public function isOpen(): bool
    {
        return in_array($this->status, [TicketStatus::New, TicketStatus::InProgress], true);
    }

    /**
     * Check if the ticket is closed or resolved.
     */
    public function isClosed(): bool
    {
        return in_array($this->status, [TicketStatus::Resolved, TicketStatus::Closed], true);
    }
}
