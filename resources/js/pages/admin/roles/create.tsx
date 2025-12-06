import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
    {
        title: 'Create Role',
        href: '/roles/create',
    },
];

type Permissions = Record<string, Record<string, string[]>>;

type Permission = {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
};

type PageProps = {
    permissions: Permissions;
    allPermissions: Permission[];
};

export default function CreateRole({ permissions, allPermissions }: PageProps) {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        permissions: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
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
            return permission ? data.permissions.includes(permission.id) : false;
        });
    };

    const isAllSelected = allPermissions.every((permission) =>
        data.permissions.includes(permission.id),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Name Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Details</CardTitle>
                            <CardDescription>
                                Enter the name for this role
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="max-w-md space-y-2">
                                <Label htmlFor="role-name">Role Name</Label>
                                <Input
                                    id="role-name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="e.g. Admin, Manager, Editor"
                                    aria-invalid={!!errors.name}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions Card */}
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <div>
                                <CardTitle>Permissions</CardTitle>
                                <CardDescription>
                                    Select the permissions for this role
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="select-all"
                                    checked={isAllSelected}
                                    onCheckedChange={handleAllPermissionsToggle}
                                />
                                <Label
                                    htmlFor="select-all"
                                    className="cursor-pointer text-sm font-medium text-primary"
                                >
                                    Select All
                                </Label>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.entries(permissions).map(
                                ([category, modules]) => (
                                    <div
                                        key={category}
                                        className="overflow-hidden rounded-lg border"
                                    >
                                        {/* Category Header */}
                                        <div className="border-b bg-muted px-4 py-3">
                                            <h3 className="text-lg font-semibold capitalize">
                                                {category}
                                            </h3>
                                        </div>

                                        {Object.entries(modules).map(
                                            ([module, perms]) => (
                                                <div
                                                    key={module}
                                                    className="border-b last:border-b-0"
                                                >
                                                    {/* Module Header */}
                                                    <div className="flex items-center gap-3 bg-muted/50 px-4 py-3">
                                                        <Checkbox
                                                            id={`module-${module}`}
                                                            checked={isModuleSelected(
                                                                perms,
                                                            )}
                                                            onCheckedChange={() =>
                                                                handleModuleToggle(
                                                                    perms,
                                                                )
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor={`module-${module}`}
                                                            className="cursor-pointer text-base font-medium capitalize text-primary"
                                                        >
                                                            {module}
                                                        </Label>
                                                    </div>

                                                    {/* Permissions Grid */}
                                                    <div className="flex flex-wrap gap-4 p-4">
                                                        {perms.map(
                                                            (permission) => (
                                                                <div
                                                                    key={
                                                                        permission
                                                                    }
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <Checkbox
                                                                        id={
                                                                            permission
                                                                        }
                                                                        checked={isPermissionSelected(
                                                                            permission,
                                                                        )}
                                                                        onCheckedChange={() =>
                                                                            togglePermission(
                                                                                permission,
                                                                            )
                                                                        }
                                                                    />
                                                                    <Label
                                                                        htmlFor={
                                                                            permission
                                                                        }
                                                                        className="cursor-pointer rounded bg-secondary px-2 py-1 text-sm"
                                                                    >
                                                                        {
                                                                            permission
                                                                        }
                                                                    </Label>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ),
                            )}
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/roles">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Role'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
