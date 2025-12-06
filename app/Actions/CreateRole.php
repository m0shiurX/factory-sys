<?php

declare(strict_types=1);

namespace App\Actions;

use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

final readonly class CreateRole
{
    /**
     * Create a new role with permissions.
     *
     * @param  array{name: string, permissions?: array<int, int>}  $data
     */
    public function handle(array $data): Role
    {
        return DB::transaction(function () use ($data): Role {
            /** @var Role $role */
            $role = Role::create(['name' => $data['name']]);

            if (isset($data['permissions']) && $data['permissions'] !== []) {
                /** @var array<int, string> $permissionNames */
                $permissionNames = Permission::query()
                    ->whereIn('id', $data['permissions'])
                    ->pluck('name')
                    ->toArray();

                $role->syncPermissions($permissionNames);
            }

            return $role;
        });
    }
}
