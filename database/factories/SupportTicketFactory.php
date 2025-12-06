<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\TicketCategory;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Customer;
use App\Models\SupportTicket;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupportTicket>
 */
final class SupportTicketFactory extends Factory
{
    protected $model = SupportTicket::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => fake()->optional(0.5)->passthrough(Customer::factory()),
            'name' => fake()->name(),
            'email' => fake()->optional(0.7)->safeEmail(),
            'phone' => '01'.fake()->numerify('#########'),
            'message' => fake()->paragraph(3),
            'status' => fake()->randomElement(TicketStatus::cases()),
            'priority' => fake()->randomElement(TicketPriority::cases()),
            'category' => fake()->randomElement(TicketCategory::cases()),
            'admin_notes' => fake()->optional(0.3)->sentence(),
        ];
    }

    /**
     * New ticket status.
     */
    public function statusNew(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => TicketStatus::New,
        ]);
    }

    /**
     * In progress status.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => TicketStatus::InProgress,
        ]);
    }

    /**
     * Resolved status.
     */
    public function resolved(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => TicketStatus::Resolved,
        ]);
    }

    /**
     * Closed status.
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => TicketStatus::Closed,
        ]);
    }

    /**
     * Urgent priority.
     */
    public function urgent(): static
    {
        return $this->state(fn (array $attributes): array => [
            'priority' => TicketPriority::Urgent,
        ]);
    }

    /**
     * High priority.
     */
    public function highPriority(): static
    {
        return $this->state(fn (array $attributes): array => [
            'priority' => TicketPriority::High,
        ]);
    }

    /**
     * With customer.
     */
    public function withCustomer(?Customer $customer = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'customer_id' => $customer->id ?? Customer::factory(),
        ]);
    }
}
