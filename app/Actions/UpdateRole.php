<?php

declare(strict_types=1);

namespace App\Actions;

use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

final readonly class UpdateRole
{
    /**
     * Update an existing role with permissions.
     *
     * @param  array{name: string, permissions?: array<int, int>}  $data
     */
    public function handle(Role $role, array $data): Role
    {
        return DB::transaction(function () use ($role, $data): Role {
            $role->update(['name' => $data['name']]);

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
