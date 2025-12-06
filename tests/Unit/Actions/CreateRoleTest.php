<?php

declare(strict_types=1);

use App\Actions\CreateRole;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

it('creates a role with name only', function (): void {
    $data = ['name' => 'Test Role'];

    $role = app(CreateRole::class)->handle($data);

    expect($role)->toBeInstanceOf(Role::class)
        ->and($role->name)->toBe('Test Role')
        ->and($role->permissions)->toHaveCount(0);
});

it('creates a role with permissions', function (): void {
    $permission1 = Permission::create(['name' => 'create-posts']);
    $permission2 = Permission::create(['name' => 'edit-posts']);

    $data = [
        'name' => 'Editor',
        'permissions' => [$permission1->id, $permission2->id],
    ];

    $role = app(CreateRole::class)->handle($data);

    expect($role->name)->toBe('Editor')
        ->and($role->permissions)->toHaveCount(2)
        ->and($role->hasPermissionTo('create-posts'))->toBeTrue()
        ->and($role->hasPermissionTo('edit-posts'))->toBeTrue();
});

it('creates a role and syncs permissions correctly', function (): void {
    $permission = Permission::create(['name' => 'delete-posts']);

    $data = [
        'name' => 'Moderator',
        'permissions' => [$permission->id],
    ];

    $role = app(CreateRole::class)->handle($data);

    expect($role->permissions)->toHaveCount(1)
        ->and($role->hasPermissionTo('delete-posts'))->toBeTrue();
});
