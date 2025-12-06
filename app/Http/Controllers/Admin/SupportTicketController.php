<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\TicketCategory;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\SupportTicket;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Inertia\Inertia;
use Inertia\Response;

final class SupportTicketController
{
    /**
     * Display a listing of support tickets.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $priority = $request->query('priority');
        $category = $request->query('category');
        $search = $request->query('search');

        $query = SupportTicket::query()->with('customer');

        if (! empty($status)) {
            $query->where('status', $status);
        }

        if (! empty($priority)) {
            $query->where('priority', $priority);
        }

        if (! empty($category)) {
            $query->where('category', $category);
        }

        if (! empty($search)) {
            $query->where(function (Builder $q) use ($search): void {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('phone', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('message', 'like', '%'.$search.'%');
            });
        }

        $tickets = $query->latest()->paginate(20)->withQueryString();

        // Stats
        $totalTickets = SupportTicket::query()->count();
        $newTickets = SupportTicket::query()->where('status', TicketStatus::New)->count();
        $inProgressTickets = SupportTicket::query()->where('status', TicketStatus::InProgress)->count();
        $resolvedTickets = SupportTicket::query()->where('status', TicketStatus::Resolved)->count();
        $thisMonth = SupportTicket::query()
            ->whereMonth('created_at', Date::now()->month)
            ->whereYear('created_at', Date::now()->year)
            ->count();

        return Inertia::render('admin/support/index', [
            'tickets' => $tickets,
            'stats' => [
                'total' => $totalTickets,
                'new' => $newTickets,
                'in_progress' => $inProgressTickets,
                'resolved' => $resolvedTickets,
                'this_month' => $thisMonth,
            ],
            'statuses' => TicketStatus::options(),
            'priorities' => TicketPriority::options(),
            'categories' => TicketCategory::options(),
            'filters' => $request->only(['status', 'priority', 'category', 'search']),
        ]);
    }

    /**
     * Display the specified ticket.
     */
    public function show(SupportTicket $ticket): Response
    {
        $ticket->load(['customer.orders' => function (Builder $query): void {
            $query->latest()->take(5);
        }]);

        return Inertia::render('admin/support/show', [
            'ticket' => $ticket,
            'statuses' => TicketStatus::options(),
            'priorities' => TicketPriority::options(),
            'categories' => TicketCategory::options(),
        ]);
    }

    /**
     * Update the specified ticket.
     */
    public function update(Request $request, SupportTicket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string'],
            'priority' => ['required', 'string'],
            'category' => ['required', 'string'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $ticket->update($validated);

        return back()->with('success', 'Ticket updated successfully.');
    }

    /**
     * Remove the specified ticket.
     */
    public function destroy(SupportTicket $ticket): RedirectResponse
    {
        $ticket->delete();

        return to_route('admin.support.index')
            ->with('success', 'Ticket deleted successfully.');
    }
}
