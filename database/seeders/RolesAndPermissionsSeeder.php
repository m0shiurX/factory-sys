<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

final class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Resetting cached roles and permissions
        app()->make(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = config('permissions');

        if (! is_array($permissions)) {
            return;
        }

        foreach ($permissions as $modules) {
            if (! is_array($modules)) {
                continue;
            }

            foreach ($modules as $modulePermissions) {
                if (! is_array($modulePermissions)) {
                    continue;
                }

                foreach ($modulePermissions as $permission) {
                    if (! is_string($permission)) {
                        continue;
                    }

                    Permission::query()->firstOrCreate(['name' => $permission]);
                }
            }
        }

        /**************************************
         * Creating Roles
         **************************************/
        $admin_role = Role::create(['name' => 'admin']);

        // Assign all permissions to admin
        $admin_role->givePermissionTo(Permission::all());

        // Create admin user (without faker dependency)
        $admin = \App\Models\User::query()->firstOrCreate(
            ['email' => 'admin@app.test'],
            [
                'name' => 'Administrator',
                'email_verified_at' => now(),
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ]
        );
        $admin->assignRole($admin_role);
    }
}
