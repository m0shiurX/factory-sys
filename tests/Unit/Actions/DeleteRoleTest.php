<?php

declare(strict_types=1);

use App\Actions\DeleteRole;
use Spatie\Permission\Models\Role;

it('deletes a role', function (): void {
    $role = Role::create(['name' => 'To Delete']);

    $result = app(DeleteRole::class)->handle($role);

    expect($result)->toBeTrue()
        ->and(Role::query()->where('name', 'To Delete')->exists())->toBeFalse();
});

it('returns true when role is deleted successfully', function (): void {
    $role = Role::create(['name' => 'Another Role']);

    $result = app(DeleteRole::class)->handle($role);

    expect($result)->toBeTrue();
});
