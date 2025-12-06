<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateUser;
use App\Actions\DeleteUser;
use App\Actions\UpdateUser;
use App\Data\UserData;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

final class UserManagementController
{
    /**
     * Display a listing of users.
     */
    public function index(): Response
    {
        $users = User::with('roles')->orderBy('name')->paginate(20);

        return Inertia::render('admin/users/index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'roles' => Role::all(),
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request, CreateUser $action): RedirectResponse
    {
        $data = UserData::from($request->validated());
        $user = $action->handle($data);

        // Sync roles if provided
        $roles = $request->validated('roles', []);
        if (is_array($roles) && count($roles) > 0) {
            $user->syncRoles($roles);
        }

        return to_route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): Response
    {
        $user->load('roles');

        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $user->load('roles');

        return Inertia::render('admin/users/edit', [
            'user' => $user,
            'roles' => Role::all(),
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user, UpdateUser $action): RedirectResponse
    {
        $validated = $request->validated();

        // Only include password in update if it was provided
        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = $validated['password'];
        }

        $data = UserData::from($updateData);
        $action->handle($user, $data);

        // Sync roles if provided
        $roles = $validated['roles'] ?? [];
        $user->syncRoles($roles);

        return to_route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user, DeleteUser $action): RedirectResponse
    {
        // Prevent self-deletion
        /** @var User|null $currentUser */
        $currentUser = Auth::user();

        if ($currentUser !== null && $user->id === $currentUser->id) {
            return to_route('users.index')
                ->with('error', 'You cannot delete your own account.');
        }

        $action->handle($user);

        return to_route('users.index')
            ->with('success', 'User deleted successfully.');
    }
}
