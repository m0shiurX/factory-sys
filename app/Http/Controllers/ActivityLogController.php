<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

final class ActivityLogController
{
    /**
     * Display a listing of activity logs.
     */
    public function index(Request $request): Response
    {
        $query = Activity::with(['causer', 'subject'])
            ->latest();

        // Filter by log name
        if ($request->filled('log_name')) {
            $query->where('log_name', $request->input('log_name'));
        }

        // Filter by event type
        if ($request->filled('event')) {
            $query->where('event', $request->input('event'));
        }

        // Filter by causer (user)
        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->input('causer_id'))
                ->where('causer_type', \App\Models\User::class);
        }

        // Filter by subject type
        if ($request->filled('subject_type')) {
            $query->where('subject_type', $request->input('subject_type'));
        }

        // Search in description
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('description', 'like', "%{$search}%");
        }

        $activities = $query->paginate(20)->withQueryString();

        // Get unique log names for filter dropdown
        $logNames = Activity::query()
            ->distinct()
            ->pluck('log_name')
            ->filter()
            ->values();

        // Get unique event types for filter dropdown
        $eventTypes = Activity::query()
            ->distinct()
            ->pluck('event')
            ->filter()
            ->values();

        return Inertia::render('admin/activities/index', [
            'activities' => $activities,
            'logNames' => $logNames,
            'eventTypes' => $eventTypes,
            'filters' => $request->only(['log_name', 'event', 'causer_id', 'subject_type', 'search']),
        ]);
    }

    /**
     * Display the specified activity log.
     */
    public function show(Activity $activity): Response
    {
        $activity->load(['causer', 'subject']);

        return Inertia::render('admin/activities/show', [
            'activity' => $activity,
        ]);
    }
}
