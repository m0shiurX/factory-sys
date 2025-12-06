import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Pencil, Plus, Shield, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
];

type Permission = {
    id: number;
    name: string;
};

type Role = {
    id: number;
    name: string;
    permissions: Permission[];
};

type PageProps = {
    roles: Role[];
};

export default function RolesIndex({ roles }: PageProps) {
    const handleDelete = (roleId: number) => {
        if (
            confirm(
                'Are you sure you want to delete this role? This action cannot be undone.',
            )
        ) {
            router.delete(`/roles/${roleId}`, {
                preserveScroll: true,
            });
        }
    };

    const formatPermissions = (permissions: Permission[]) => {
        if (!permissions || permissions.length === 0) return '—';

        if (permissions.length <= 3) {
            return permissions.map((p) => p.name.replace(/_/g, ' ')).join(', ');
        }

        const first = permissions
            .slice(0, 2)
            .map((p) => p.name.replace(/_/g, ' '))
            .join(', ');
        return `${first} +${permissions.length - 2} more`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex-row items-center justify-between border-b">
                        <div>
                            <CardTitle>Roles</CardTitle>
                            <CardDescription>
                                Manage roles and their permissions
                            </CardDescription>
                        </div>
                        <Button asChild>
                            <Link href="/roles/create">
                                <Plus className="size-4" />
                                Create Role
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Permissions
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {roles.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                                                        <AlertTriangle className="size-6 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        No roles found
                                                    </p>
                                                    <Button
                                                        variant="link"
                                                        asChild
                                                        className="mt-2"
                                                    >
                                                        <Link href="/roles/create">
                                                            Create your first
                                                            role
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        roles.map((role, index) => (
                                            <tr
                                                key={role.id}
                                                className="transition-colors hover:bg-muted/50"
                                            >
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-foreground">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-foreground">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                                                            <Shield className="size-4 text-primary" />
                                                        </div>
                                                        <span className="font-medium capitalize">
                                                            {role.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    <div className="max-w-xs space-y-1">
                                                        <Badge variant="secondary">
                                                            {role.permissions
                                                                ?.length || 0}{' '}
                                                            permissions
                                                        </Badge>
                                                        {role.permissions &&
                                                            role.permissions
                                                                .length > 0 && (
                                                                <p
                                                                    className="truncate text-xs text-muted-foreground"
                                                                    title={role.permissions
                                                                        .map(
                                                                            (
                                                                                p,
                                                                            ) =>
                                                                                p.name,
                                                                        )
                                                                        .join(
                                                                            ', ',
                                                                        )}
                                                                >
                                                                    {formatPermissions(
                                                                        role.permissions,
                                                                    )}
                                                                </p>
                                                            )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/roles/${role.id}/edit`}
                                                            >
                                                                <Pencil className="size-4" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    role.id,
                                                                )
                                                            }
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="size-4" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
