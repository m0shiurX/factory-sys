<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateRole;
use App\Actions\DeleteRole;
use App\Actions\UpdateRole;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

final class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index(): Response
    {
        $roles = Role::with('permissions')->get();

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): Response
    {
        return Inertia::render('admin/roles/create', [
            'permissions' => $this->getGroupedPermissions(),
            'allPermissions' => Permission::all(),
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request, CreateRole $createRole): RedirectResponse
    {
        $validatedData = $this->validateRoleRequest($request);

        $createRole->handle($validatedData);

        return to_route('roles.index')
            ->with('success', $this->getSuccessMessages()['created']);
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(Role $role): Response
    {
        $roleWithPermissions = $role->load('permissions');
        $allPermissions = Permission::all();

        return Inertia::render('admin/roles/edit', [
            'role' => $roleWithPermissions,
            'permissions' => $this->getGroupedPermissions(),
            'allPermissions' => $allPermissions,
        ]);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, Role $role, UpdateRole $updateRole): RedirectResponse
    {
        $validatedData = $this->validateRoleRequest($request, (int) $role->id);

        $updateRole->handle($role, $validatedData);

        return to_route('roles.index')
            ->with('success', $this->getSuccessMessages()['updated']);
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role, DeleteRole $deleteRole): RedirectResponse
    {
        $deleteRole->handle($role);

        return to_route('roles.index')
            ->with('success', $this->getSuccessMessages()['deleted']);
    }

    /**
     * Get success messages for role operations.
     *
     * @return array<string, string>
     */
    private function getSuccessMessages(): array
    {
        return [
            'created' => 'Role created successfully.',
            'updated' => 'Role updated successfully.',
            'deleted' => 'Role deleted successfully.',
        ];
    }

    /**
     * Validate role request data.
     *
     * @return array{name: string, permissions?: array<int, int>}
     */
    private function validateRoleRequest(Request $request, ?int $roleId = null): array
    {
        $rules = [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->ignore($roleId),
            ],
            'permissions' => 'sometimes|array',
            'permissions.*' => 'required|integer|exists:permissions,id',
        ];

        /** @var array{name: string, permissions?: array<int, int>} */
        return $request->validate($rules);
    }

    /**
     * Fetch permissions from the database and dynamically group them for better UI.
     *
     * @return array<string, array<string, array<string>>>
     */
    private function getGroupedPermissions(): array
    {
        /** @var mixed $permissionsFromConfig */
        $permissionsFromConfig = config('permissions');

        /** @var array<int, string> $permissionsFromDb */
        $permissionsFromDb = Permission::query()->pluck('name')->toArray();

        /** @var array<string, array<string, array<string>>> $groupedPermissions */
        $groupedPermissions = [];

        if (! is_array($permissionsFromConfig)) {
            return $groupedPermissions;
        }

        foreach ($permissionsFromConfig as $mainGroup => $subGroups) {
            if (! is_array($subGroups)) {
                continue;
            }

            /** @var string $mainGroupKey */
            $mainGroupKey = (string) $mainGroup;

            foreach ($subGroups as $subGroup => $permissions) {
                if (! is_array($permissions)) {
                    continue;
                }

                /** @var string $subGroupKey */
                $subGroupKey = (string) $subGroup;

                // Filter and validate permissions to ensure they are strings
                /** @var array<string> $validStringPermissions */
                $validStringPermissions = [];
                foreach ($permissions as $permission) {
                    if (is_string($permission) && in_array($permission, $permissionsFromDb, true)) {
                        $validStringPermissions[] = $permission;
                    }
                }

                $groupedPermissions[$mainGroupKey][$subGroupKey] = $validStringPermissions;
            }
        }

        return $groupedPermissions;
    }
}
