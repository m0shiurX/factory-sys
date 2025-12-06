import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Shield, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Permission = {
    id: number;
    name: string;
};

type Role = {
    id: number;
    name: string;
    permissions: Permission[];
};

type Props = {
    roles: Role[];
};

export default function RolesIndex({ roles }: Props) {
    const { props } = usePage<{
        flash?: { success?: string; error?: string };
    }>();

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash?.success, props.flash?.error]);

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
        <AppLayout>
            <Head title="Roles" />
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Roles
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage roles and their permissions
                            </p>
                        </div>
                        <Link
                            href="/roles/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Add Role
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Roles
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {roles.length}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                        {roles.length === 0 ? (
                            <div className="py-16 text-center">
                                <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                <h3 className="text-sm font-medium text-foreground">
                                    No roles found
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add your first role to get started
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                #
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Permissions
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {roles.map((role, index) => (
                                            <tr
                                                key={role.id}
                                                className="transition hover:bg-muted/50"
                                            >
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-foreground">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-foreground">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-lg bg-primary/10 p-2">
                                                            <Shield className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <span className="font-medium capitalize">
                                                            {role.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    <div className="max-w-xs">
                                                        <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                                            {role.permissions
                                                                ?.length || 0}{' '}
                                                            permissions
                                                        </span>
                                                        {role.permissions &&
                                                            role.permissions
                                                                .length > 0 && (
                                                                <p
                                                                    className="mt-1 truncate text-xs text-muted-foreground"
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
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/roles/${role.id}/edit`}
                                                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    role.id,
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
