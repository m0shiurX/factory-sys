import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, PenTool, Trash2 } from 'lucide-react';

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

export default function RolesIndex() {
    const { props } = usePage<PageProps>();
    const { roles } = props;

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
            <div className="flex h-full flex-1 flex-col gap-6 rounded-lg bg-background p-4 dark:bg-background">
                <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm dark:border-border dark:bg-card">
                    {/* Table Header with Create Button */}
                    <div className="flex items-center justify-between border-b border-border px-4 py-5 sm:px-6 dark:border-border">
                        <h3 className="text-lg font-semibold text-foreground dark:text-foreground">
                            Roles
                        </h3>
                        <Link
                            href="/roles/create"
                            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90"
                        >
                            Create Role
                        </Link>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border dark:divide-border">
                            <thead className="bg-background dark:bg-card">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase dark:text-muted-foreground"
                                    >
                                        #
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase dark:text-muted-foreground"
                                    >
                                        Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase dark:text-muted-foreground"
                                    >
                                        Permissions
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase dark:text-muted-foreground"
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card dark:divide-border dark:bg-background">
                                {roles.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted dark:bg-muted">
                                                    <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                                                    No roles found
                                                </p>
                                                <Link
                                                    href="/roles/create"
                                                    className="mt-2 text-sm font-medium text-primary hover:text-primary dark:text-primary"
                                                >
                                                    Create your first role
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    roles.map((role, index) => (
                                        <tr
                                            key={role.id}
                                            className="transition-colors hover:bg-background dark:hover:bg-card/80"
                                        >
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-foreground dark:text-foreground">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-foreground dark:text-foreground">
                                                <div className="flex items-center">
                                                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600">
                                                        <span className="text-xs font-semibold text-white uppercase">
                                                            {role.name.charAt(
                                                                0,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium capitalize">
                                                        {role.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground dark:text-muted-foreground">
                                                <div className="max-w-xs">
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
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
                                                                        (p) =>
                                                                            p.name,
                                                                    )
                                                                    .join(', ')}
                                                            >
                                                                {formatPermissions(
                                                                    role.permissions,
                                                                )}
                                                            </p>
                                                        )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={`/roles/${role.id}/edit`}
                                                        className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 hover:text-primary dark:text-primary dark:hover:bg-primary/20 dark:hover:text-primary/80"
                                                    >
                                                        <PenTool className="h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                role.id,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive dark:text-destructive dark:hover:bg-destructive/20 dark:hover:text-destructive/80"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
