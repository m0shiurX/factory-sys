<?php

declare(strict_types=1);

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    $this->adminUser = User::factory()->create();
});

it('renders users index page', function (): void {
    $response = $this->actingAs($this->adminUser)
        ->get(route('users.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/users/index'));
});

it('renders create user page', function (): void {
    $response = $this->actingAs($this->adminUser)
        ->get(route('users.create'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/users/create'));
});

it('can create a new user', function (): void {
    $response = $this->actingAs($this->adminUser)
        ->post(route('users.store'), [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password1234',
            'password_confirmation' => 'password1234',
        ]);

    $response->assertRedirectToRoute('users.index')
        ->assertSessionHas('success');

    $this->assertDatabaseHas('users', [
        'name' => 'New User',
        'email' => 'newuser@example.com',
    ]);
});

it('can create a user with roles', function (): void {
    $role = Role::create(['name' => 'editor']);

    $response = $this->actingAs($this->adminUser)
        ->post(route('users.store'), [
            'name' => 'User With Role',
            'email' => 'roleuser@example.com',
            'password' => 'password1234',
            'password_confirmation' => 'password1234',
            'roles' => [$role->id],
        ]);

    $response->assertRedirectToRoute('users.index');

    $user = User::query()->where('email', 'roleuser@example.com')->first();
    expect($user->hasRole('editor'))->toBeTrue();
});

it('renders edit user page', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($this->adminUser)
        ->get(route('users.edit', $user));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/users/edit'));
});

it('can update a user', function (): void {
    $user = User::factory()->create([
        'name' => 'Old Name',
        'email' => 'old@example.com',
    ]);

    $response = $this->actingAs($this->adminUser)
        ->put(route('users.update', $user), [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
        ]);

    $response->assertRedirectToRoute('users.index')
        ->assertSessionHas('success');

    $user->refresh();
    expect($user->name)->toBe('Updated Name')
        ->and($user->email)->toBe('updated@example.com');
});

it('can update user roles', function (): void {
    $user = User::factory()->create();
    $role = Role::create(['name' => 'manager']);

    $response = $this->actingAs($this->adminUser)
        ->put(route('users.update', $user), [
            'name' => $user->name,
            'email' => $user->email,
            'roles' => [$role->id],
        ]);

    $response->assertRedirectToRoute('users.index');

    $user->refresh();
    expect($user->hasRole('manager'))->toBeTrue();
});

it('can delete a user', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($this->adminUser)
        ->delete(route('users.destroy', $user));

    $response->assertRedirectToRoute('users.index')
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

it('cannot delete own account', function (): void {
    $response = $this->actingAs($this->adminUser)
        ->delete(route('users.destroy', $this->adminUser));

    $response->assertRedirectToRoute('users.index')
        ->assertSessionHas('error');

    $this->assertDatabaseHas('users', ['id' => $this->adminUser->id]);
});

it('renders show user page', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($this->adminUser)
        ->get(route('users.show', $user));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/users/show'));
});

it('requires authentication for user management', function (): void {
    $response = $this->get(route('users.index'));

    $response->assertRedirect(route('login'));
});
