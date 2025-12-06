import InputError from '@/components/common/input-error';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { FormEventHandler } from 'react';

type Permissions = Record<string, Record<string, string[]>>;

type Permission = {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
};

type Props = {
    permissions: Permissions;
    allPermissions: Permission[];
};

export default function RoleCreate({ permissions, allPermissions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as number[],
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/roles');
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

        setData('permissions', allSelected ? [] : allPermissionIds);
    };

    const isModuleSelected = (perms: string[]) => {
        return perms.every((permissionName) => {
            const permission = allPermissions.find(
                (p) => p.name === permissionName,
            );
            return permission
                ? data.permissions.includes(permission.id)
                : false;
        });
    };

    const isAllSelected = allPermissions.every((permission) =>
        data.permissions.includes(permission.id),
    );

    return (
        <AppLayout>
            <Head title="Create Role" />
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <Link
                            href="/roles"
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-muted-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Add Role
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Create a new role with permissions
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Role Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full max-w-md rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    placeholder="e.g. Admin, Manager, Editor"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Permissions */}
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <label className="block text-sm font-medium text-foreground">
                                        Permissions
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={handleAllPermissionsToggle}
                                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-primary">
                                            Select All
                                        </span>
                                    </label>
                                </div>

                                <div className="space-y-4">
                                    {Object.entries(permissions).map(
                                        ([category, modules]) => (
                                            <div
                                                key={category}
                                                className="overflow-hidden rounded-lg border border-border"
                                            >
                                                {/* Category Header */}
                                                <div className="border-b border-border bg-muted px-4 py-3">
                                                    <h3 className="text-base font-semibold capitalize text-foreground">
                                                        {category}
                                                    </h3>
                                                </div>

                                                {Object.entries(modules).map(
                                                    ([module, perms]) => (
                                                        <div
                                                            key={module}
                                                            className="border-b border-border last:border-b-0"
                                                        >
                                                            {/* Module Header */}
                                                            <div className="flex items-center gap-3 bg-muted/50 px-4 py-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isModuleSelected(
                                                                        perms,
                                                                    )}
                                                                    onChange={() =>
                                                                        handleModuleToggle(
                                                                            perms,
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                                                />
                                                                <span className="text-sm font-medium capitalize text-primary">
                                                                    {module}
                                                                </span>
                                                            </div>

                                                            {/* Permissions Grid */}
                                                            <div className="flex flex-wrap gap-4 p-4">
                                                                {perms.map(
                                                                    (
                                                                        permission,
                                                                    ) => (
                                                                        <label
                                                                            key={
                                                                                permission
                                                                            }
                                                                            className="flex cursor-pointer items-center gap-2"
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isPermissionSelected(
                                                                                    permission,
                                                                                )}
                                                                                onChange={() =>
                                                                                    togglePermission(
                                                                                        permission,
                                                                                    )
                                                                                }
                                                                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                                                            />
                                                                            <span className="rounded bg-muted px-2 py-1 text-sm text-foreground">
                                                                                {
                                                                                    permission
                                                                                }
                                                                            </span>
                                                                        </label>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
                                <Link
                                    href="/roles"
                                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-background"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
                                >
                                    <Plus className="h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Role'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
