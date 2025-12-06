<?php

declare(strict_types=1);

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function (): void {
    $this->user = User::factory()->create();
});

it('displays the roles index page', function (): void {
    $role1 = Role::create(['name' => 'Admin']);
    $role2 = Role::create(['name' => 'Editor']);

    actingAs($this->user)
        ->get(route('roles.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/roles/index')
            ->has('roles', 2));
});

it('displays the create role page', function (): void {
    Permission::create(['name' => 'view-dashboard']);
    Permission::create(['name' => 'manage-users']);

    actingAs($this->user)
        ->get(route('roles.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/roles/create')
            ->has('allPermissions'));
});

it('stores a new role without permissions', function (): void {
    actingAs($this->user)
        ->post(route('roles.store'), [
            'name' => 'New Role',
        ])
        ->assertRedirect(route('roles.index'))
        ->assertSessionHas('success', 'Role created successfully.');

    assertDatabaseHas('roles', ['name' => 'New Role']);
});

it('stores a new role with permissions', function (): void {
    $permission1 = Permission::create(['name' => 'create-posts']);
    $permission2 = Permission::create(['name' => 'edit-posts']);

    actingAs($this->user)
        ->post(route('roles.store'), [
            'name' => 'Content Manager',
            'permissions' => [$permission1->id, $permission2->id],
        ])
        ->assertRedirect(route('roles.index'))
        ->assertSessionHas('success', 'Role created successfully.');

    $role = Role::query()->where('name', 'Content Manager')->first();
    expect($role)->not->toBeNull()
        ->and($role->hasPermissionTo('create-posts'))->toBeTrue()
        ->and($role->hasPermissionTo('edit-posts'))->toBeTrue();
});

it('validates role name is required when storing', function (): void {
    actingAs($this->user)
        ->post(route('roles.store'), [
            'name' => '',
        ])
        ->assertSessionHasErrors(['name']);
});

it('validates role name is unique when storing', function (): void {
    Role::create(['name' => 'Existing Role']);

    actingAs($this->user)
        ->post(route('roles.store'), [
            'name' => 'Existing Role',
        ])
        ->assertSessionHasErrors(['name']);
});

it('validates permissions are integers when storing', function (): void {
    actingAs($this->user)
        ->post(route('roles.store'), [
            'name' => 'Test Role',
            'permissions' => ['invalid'],
        ])
        ->assertSessionHasErrors(['permissions.0']);
});

it('validates permissions exist in database when storing', function (): void {
    actingAs($this->user)
        ->post(route('roles.store'), [
            'name' => 'Test Role',
            'permissions' => [99999],
        ])
        ->assertSessionHasErrors(['permissions.0']);
});

it('displays the edit role page', function (): void {
    $permission = Permission::create(['name' => 'view-reports']);
    $role = Role::create(['name' => 'Reporter']);
    $role->givePermissionTo('view-reports');

    actingAs($this->user)
        ->get(route('roles.edit', $role))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/roles/edit')
            ->has('role')
            ->has('allPermissions'));
});

it('updates a role name', function (): void {
    $role = Role::create(['name' => 'Old Name']);

    actingAs($this->user)
        ->put(route('roles.update', $role), [
            'name' => 'New Name',
        ])
        ->assertRedirect(route('roles.index'))
        ->assertSessionHas('success', 'Role updated successfully.');

    assertDatabaseHas('roles', ['id' => $role->id, 'name' => 'New Name']);
});

it('updates a role with permissions', function (): void {
    $permission1 = Permission::create(['name' => 'delete-posts']);
    $permission2 = Permission::create(['name' => 'publish-posts']);

    $role = Role::create(['name' => 'Moderator']);

    actingAs($this->user)
        ->put(route('roles.update', $role), [
            'name' => 'Senior Moderator',
            'permissions' => [$permission1->id, $permission2->id],
        ])
        ->assertRedirect(route('roles.index'))
        ->assertSessionHas('success', 'Role updated successfully.');

    $role->refresh();
    expect($role->name)->toBe('Senior Moderator')
        ->and($role->hasPermissionTo('delete-posts'))->toBeTrue()
        ->and($role->hasPermissionTo('publish-posts'))->toBeTrue();
});

it('validates role name is required when updating', function (): void {
    $role = Role::create(['name' => 'Test Role']);

    actingAs($this->user)
        ->put(route('roles.update', $role), [
            'name' => '',
        ])
        ->assertSessionHasErrors(['name']);
});

it('validates role name is unique when updating except current role', function (): void {
    $role1 = Role::create(['name' => 'Role One']);
    $role2 = Role::create(['name' => 'Role Two']);

    actingAs($this->user)
        ->put(route('roles.update', $role2), [
            'name' => 'Role One',
        ])
        ->assertSessionHasErrors(['name']);
});

it('allows updating role with same name', function (): void {
    $role = Role::create(['name' => 'Same Name']);

    actingAs($this->user)
        ->put(route('roles.update', $role), [
            'name' => 'Same Name',
        ])
        ->assertRedirect(route('roles.index'))
        ->assertSessionHasNoErrors();
});

it('deletes a role', function (): void {
    $role = Role::create(['name' => 'To Delete']);

    actingAs($this->user)
        ->delete(route('roles.destroy', $role))
        ->assertRedirect(route('roles.index'))
        ->assertSessionHas('success', 'Role deleted successfully.');

    assertDatabaseMissing('roles', ['id' => $role->id]);
});

it('loads roles with permissions relationship on index', function (): void {
    $permission = Permission::create(['name' => 'test-permission']);
    $role = Role::create(['name' => 'Test Role']);
    $role->givePermissionTo('test-permission');

    actingAs($this->user)
        ->get(route('roles.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/roles/index')
            ->has('roles.0.permissions'));
});

it('includes grouped permissions on create page', function (): void {
    Permission::create(['name' => 'view-posts']);
    Permission::create(['name' => 'create-posts']);

    actingAs($this->user)
        ->get(route('roles.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/roles/create')
            ->has('permissions'));
});

it('includes grouped permissions on edit page', function (): void {
    Permission::create(['name' => 'view-comments']);
    $role = Role::create(['name' => 'Comment Manager']);

    actingAs($this->user)
        ->get(route('roles.edit', $role))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/roles/edit')
            ->has('permissions'));
});

it('handles when permissions config is not an array', function (): void {
    config(['permissions' => 'invalid-config']);

    actingAs($this->user)
        ->get(route('roles.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/roles/create')
            ->has('permissions')
            ->where('permissions', []));
});

it('handles when config subgroup is not an array', function (): void {
    config(['permissions' => [
        'platform' => 'invalid-subgroup',
        'valid' => [
            'test' => ['access_test'],
        ],
    ]]);

    Permission::create(['name' => 'access_test']);

    actingAs($this->user)
        ->get(route('roles.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/roles/create')
            ->has('permissions'));
});

it('handles when config permissions array is not an array', function (): void {
    config(['permissions' => [
        'platform' => [
            'invalid' => 'not-an-array',
            'valid' => ['access_valid'],
        ],
    ]]);

    Permission::create(['name' => 'access_valid']);

    actingAs($this->user)
        ->get(route('roles.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/roles/create')
            ->has('permissions'));
});

it('filters out non-string permissions from config', function (): void {
    config(['permissions' => [
        'platform' => [
            'mixed' => [
                'valid_permission',
                123,
                null,
                ['nested'],
                'another_valid',
            ],
        ],
    ]]);

    Permission::create(['name' => 'valid_permission']);
    Permission::create(['name' => 'another_valid']);

    actingAs($this->user)
        ->get(route('roles.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/roles/create')
            ->has('permissions')
            ->where('permissions.platform.mixed', ['valid_permission', 'another_valid']));
});

it('filters out permissions that do not exist in database', function (): void {
    config(['permissions' => [
        'platform' => [
            'test' => [
                'exists_in_db',
                'does_not_exist',
                'also_exists',
            ],
        ],
    ]]);

    Permission::create(['name' => 'exists_in_db']);
    Permission::create(['name' => 'also_exists']);

    actingAs($this->user)
        ->get(route('roles.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/roles/create')
            ->has('permissions')
            ->where('permissions.platform.test', ['exists_in_db', 'also_exists']));
});
