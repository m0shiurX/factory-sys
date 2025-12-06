<?php

declare(strict_types=1);

namespace App\Actions;

use Spatie\Permission\Models\Role;

final readonly class DeleteRole
{
    /**
     * Delete a role.
     */
    public function handle(Role $role): bool
    {
        return (bool) $role->delete();
    }
}
