<?php

declare(strict_types=1);

use App\Data\RoleData;
use Spatie\LaravelData\Support\Validation\ValidationContext;
use Spatie\LaravelData\Support\Validation\ValidationPath;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

it('can instantiate with all properties', function (): void {
    $data = RoleData::from([
        'id' => 1,
        'name' => 'Admin',
        'permissions' => [1, 2, 3],
    ]);

    expect($data->id)->toBe(1)
        ->and($data->name)->toBe('Admin')
        ->and($data->permissions)->toBe([1, 2, 3]);
});

it('can create from an existing role model', function (): void {
    $permission1 = Permission::create(['name' => 'view-dashboard']);
    $permission2 = Permission::create(['name' => 'manage-users']);

    $role = Role::create(['name' => 'Manager']);
    $role->givePermissionTo(['view-dashboard', 'manage-users']);

    $data = RoleData::fromModel($role->fresh());

    expect($data->id)->toBe($role->id)
        ->and($data->name)->toBe('Manager')
        ->and($data->permissions)->toBeArray()
        ->and($data->permissions)->toHaveCount(2);
});

it('has validation rules without role id', function (): void {
    $payload = ['name' => 'Test Role'];
    $context = new ValidationContext($payload, $payload, new ValidationPath());
    $rules = RoleData::rules($context);

    expect($rules)->toBeArray()
        ->and($rules)->toHaveKey('name')
        ->and($rules)->toHaveKey('permissions.*');
});

it('has validation rules with role id for name uniqueness', function (): void {
    $role = Role::create(['name' => 'Existing Role']);
    $payload = ['id' => $role->id, 'name' => 'Updated Name'];
    $context = new ValidationContext($payload, $payload, new ValidationPath());
    $rules = RoleData::rules($context);

    expect($rules)->toBeArray()
        ->and($rules)->toHaveKey('name')
        ->and($rules)->toHaveKey('permissions.*');
});
