<?php

declare(strict_types=1);

namespace App\Data;

use App\Enums\TicketCategory;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Spatie\LaravelData\Attributes\Validation\Email;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;

final class SupportTicketData extends Data
{
    public function __construct(
        #[Required]
        #[StringType]
        #[Max(100)]
        public string $name,

        #[Required]
        #[StringType]
        #[Max(50)]
        public string $phone,

        #[Required]
        #[StringType]
        #[Max(5000)]
        public string $message,

        #[Nullable]
        #[Email]
        #[Max(255)]
        public ?string $email = null,

        public ?int $customer_id = null,

        public TicketStatus $status = TicketStatus::New,

        public TicketPriority $priority = TicketPriority::Normal,

        public TicketCategory $category = TicketCategory::General,

        public ?string $admin_notes = null,
    ) {}
}
