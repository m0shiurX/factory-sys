<?php

declare(strict_types=1);

use App\Actions\UpdateRole;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

it('updates a role name', function (): void {
    $role = Role::create(['name' => 'Old Name']);

    $data = ['name' => 'New Name'];

    $updatedRole = app(UpdateRole::class)->handle($role, $data);

    expect($updatedRole->name)->toBe('New Name');
});

it('updates a role with permissions', function (): void {
    $permission1 = Permission::create(['name' => 'view-reports']);
    $permission2 = Permission::create(['name' => 'create-reports']);

    $role = Role::create(['name' => 'Reporter']);

    $data = [
        'name' => 'Senior Reporter',
        'permissions' => [$permission1->id, $permission2->id],
    ];

    $updatedRole = app(UpdateRole::class)->handle($role, $data);

    expect($updatedRole->name)->toBe('Senior Reporter')
        ->and($updatedRole->permissions)->toHaveCount(2)
        ->and($updatedRole->hasPermissionTo('view-reports'))->toBeTrue()
        ->and($updatedRole->hasPermissionTo('create-reports'))->toBeTrue();
});

it('replaces existing permissions when updating', function (): void {
    $permission1 = Permission::create(['name' => 'old-permission']);
    $permission2 = Permission::create(['name' => 'new-permission']);

    $role = Role::create(['name' => 'Test Role']);
    $role->givePermissionTo('old-permission');

    $data = [
        'name' => 'Test Role',
        'permissions' => [$permission2->id],
    ];

    $updatedRole = app(UpdateRole::class)->handle($role, $data);

    expect($updatedRole->permissions)->toHaveCount(1)
        ->and($updatedRole->hasPermissionTo('new-permission'))->toBeTrue()
        ->and($updatedRole->hasPermissionTo('old-permission'))->toBeFalse();
});

it('updates role without changing permissions when not provided', function (): void {
    $permission = Permission::create(['name' => 'keep-permission']);
    $role = Role::create(['name' => 'Original']);
    $role->givePermissionTo('keep-permission');

    $data = ['name' => 'Updated'];

    $updatedRole = app(UpdateRole::class)->handle($role, $data);

    expect($updatedRole->name)->toBe('Updated')
        ->and($updatedRole->permissions)->toHaveCount(1)
        ->and($updatedRole->hasPermissionTo('keep-permission'))->toBeTrue();
});
