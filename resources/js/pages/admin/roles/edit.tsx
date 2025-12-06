import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
    {
        title: 'Edit Role',
        href: `/roles/edit`,
    },
];

type Permissions = Record<string, Record<string, string[]>>;

type Permission = {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    pivot?: {
        role_id: number;
        permission_id: number;
    };
};

type Role = {
    id: number;
    name: string;
    permissions: Permission[];
};

type PageProps = {
    role: Role;
    permissions: Permissions;
    allPermissions: Permission[];
};

export default function EditRole({
    role,
    permissions,
    allPermissions,
}: PageProps) {
    const { data, setData, put, errors, processing } = useForm({
        name: role.name,
        permissions: role.permissions.map((p) => p.id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/roles/${role.id}`);
    };

    const isPermissionSelected = (permissionName: string) => {
        const permission = allPermissions.find(
            (p) => p.name === permissionName,
        );
        return permission ? data.permissions.includes(permission.id) : false;
    };

    const togglePermission = (permissionName: string) => {
        const permission = allPermissions.find(
            (p) => p.name === permissionName,
        );
        if (!permission) return;
        setData(
            'permissions',
            data.permissions.includes(permission.id)
                ? data.permissions.filter((id) => id !== permission.id)
                : [...data.permissions, permission.id],
        );
    };

    const handleModuleToggle = (perms: string[]) => {
        const permissionIds = perms
            .map((permissionName) => {
                const permission = allPermissions.find(
                    (p) => p.name === permissionName,
                );
                return permission?.id;
            })
            .filter(Boolean) as number[];

        const allSelected = permissionIds.every((id) =>
            data.permissions.includes(id),
        );

        setData(
            'permissions',
            allSelected
                ? data.permissions.filter((id) => !permissionIds.includes(id))
                : [...new Set([...data.permissions, ...permissionIds])],
        );
    };
    const handleAllPermissionsToggle = () => {
        const allPermissionIds = allPermissions.map(
            (permission) => permission.id,
        );
        const allSelected = allPermissionIds.every((id) =>
            data.permissions.includes(id),
        );

        setData(
            'permissions',
            allSelected
                ? data.permissions.filter(
                      (id) => !allPermissionIds.includes(id),
                  )
                : [...new Set([...data.permissions, ...allPermissionIds])],
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Role" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-lg bg-background p-4 dark:bg-background">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Role Name Field */}
                    <div className="flex items-center gap-4">
                        <div className="w-full max-w-md">
                            <label
                                className="mb-2 block text-sm font-medium text-foreground dark:text-muted-foreground"
                                htmlFor="role-name"
                            >
                                Role Name
                            </label>
                            <input
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                value={data.name}
                                className="w-full rounded-md border border-border bg-card px-4 py-2 text-foreground shadow-sm transition-colors focus:border-ring focus:ring-2 focus:ring-ring dark:border-border dark:bg-card dark:text-foreground"
                                id="role-name"
                                type="text"
                                placeholder="e.g. Admin"
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-destructive dark:text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div className="mt-7 space-x-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center rounded-md bg-primary px-4 py-[11px] text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Updating...' : 'Update Role'}
                            </button>
                            <Link
                                href="/roles"
                                className="inline-flex items-center rounded-md border border-border bg-card px-4 py-[11px] text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-background dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-muted"
                            >
                                Cancel
                            </Link>
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="block text-lg font-medium text-foreground dark:text-foreground">
                                Permissions
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={allPermissions.every(
                                        (permission) =>
                                            data.permissions.includes(
                                                permission.id,
                                            ),
                                    )}
                                    onChange={() =>
                                        handleAllPermissionsToggle()
                                    }
                                    className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-2 focus:ring-ring dark:border-border dark:bg-card dark:text-primary dark:focus:ring-ring"
                                />
                                <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    All Permissions
                                </h4>
                            </div>
                        </div>

                        {Object.entries(permissions).map(
                            ([category, modules]) => (
                                <div
                                    key={category}
                                    className="overflow-hidden rounded-lg border border-border shadow-sm dark:border-border"
                                >
                                    {/* Category Header */}
                                    <h3 className="border-b border-border bg-muted px-4 py-3 text-xl font-semibold text-foreground capitalize dark:border-border dark:bg-card dark:text-muted-foreground">
                                        {category}
                                    </h3>

                                    {Object.entries(modules).map(
                                        ([module, perms]) => (
                                            <div
                                                key={module}
                                                className="border-gray-600 bg-card dark:bg-background"
                                            >
                                                {/* Module Checkbox */}
                                                <div className="flex items-center gap-3 border-b border-gray-100 bg-background px-4 py-3 transition-colors dark:border-border dark:bg-card/80">
                                                    <input
                                                        type="checkbox"
                                                        checked={perms.every(
                                                            (
                                                                permissionName,
                                                            ) => {
                                                                const permission =
                                                                    allPermissions.find(
                                                                        (p) =>
                                                                            p.name ===
                                                                            permissionName,
                                                                    );
                                                                return permission
                                                                    ? data.permissions.includes(
                                                                          permission.id,
                                                                      )
                                                                    : false;
                                                            },
                                                        )}
                                                        onChange={() =>
                                                            handleModuleToggle(
                                                                perms,
                                                            )
                                                        }
                                                        className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-2 focus:ring-ring dark:border-border dark:bg-card dark:text-primary dark:focus:ring-ring"
                                                    />
                                                    <h4 className="text-lg font-semibold text-green-600 capitalize dark:text-green-400">
                                                        {module}
                                                    </h4>
                                                </div>

                                                {/* Permissions Grid */}
                                                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3">
                                                    {perms.map((permission) => (
                                                        <div
                                                            key={permission}
                                                            className="flex items-center"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                id={permission}
                                                                checked={isPermissionSelected(
                                                                    permission,
                                                                )}
                                                                onChange={() =>
                                                                    togglePermission(
                                                                        permission,
                                                                    )
                                                                }
                                                                className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-2 focus:ring-ring dark:border-border dark:bg-card dark:text-primary dark:focus:ring-ring"
                                                            />
                                                            <label
                                                                htmlFor={
                                                                    permission
                                                                }
                                                                className="ml-3 rounded bg-blue-100/50 px-3 py-1 text-sm font-medium text-foreground transition-colors hover:bg-blue-200/50 dark:bg-muted dark:text-foreground dark:hover:bg-muted"
                                                            >
                                                                {permission}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ),
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 border-t border-border pt-6 dark:border-border">
                        <Link
                            href="/roles"
                            className="inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-background dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-muted"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center rounded-md bg-primary px-4 py-[11px] text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Updating...' : 'Update Role'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
