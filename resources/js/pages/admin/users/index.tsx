import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Trash2, User as UserIcon, Users } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Role = {
    id: number;
    name: string;
};

type User = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    roles: Role[];
};

type PaginatedUsers = {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};

type Props = {
    users: PaginatedUsers;
};

export default function UsersIndex({ users }: Props) {
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

    const handleDelete = (userId: number) => {
        if (
            confirm(
                'Are you sure you want to delete this user? This action cannot be undone.',
            )
        ) {
            router.delete(`/users/${userId}`, {
                preserveScroll: true,
            });
        }
    };

    const formatRoles = (roles: Role[]) => {
        if (!roles || roles.length === 0) return '—';

        if (roles.length <= 2) {
            return roles.map((r) => r.name).join(', ');
        }

        const first = roles
            .slice(0, 2)
            .map((r) => r.name)
            .join(', ');
        return `${first} +${roles.length - 2} more`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout>
            <Head title="Users" />
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Users
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage user accounts and their roles
                            </p>
                        </div>
                        <Link
                            href="/users/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Add User
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Users
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {users.total}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Verified Users
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {
                                            users.data.filter(
                                                (u) => u.email_verified_at,
                                            ).length
                                        }
                                    </p>
                                </div>
                                <div className="rounded-lg bg-green-500/10 p-2">
                                    <UserIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Unverified Users
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {
                                            users.data.filter(
                                                (u) => !u.email_verified_at,
                                            ).length
                                        }
                                    </p>
                                </div>
                                <div className="rounded-lg bg-amber-500/10 p-2">
                                    <UserIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-xl border border-border bg-card">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Roles
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Created
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="transition hover:bg-muted/50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                                        {user.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-foreground">
                                                        {user.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {formatRoles(user.roles)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.email_verified_at ? (
                                                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                                        Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/users/${user.id}/edit`}
                                                        className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                        title="Edit user"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                user.id,
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                                                        title="Delete user"
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

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-border px-6 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing page {users.current_page} of{' '}
                                    {users.last_page}
                                </div>
                                <div className="flex gap-2">
                                    {users.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            preserveScroll
                                            className={`rounded-lg px-3 py-1.5 text-sm transition ${link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : link.url
                                                        ? 'text-muted-foreground hover:bg-muted'
                                                        : 'cursor-not-allowed text-muted-foreground/50'
                                                }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {users.data.length === 0 && (
                            <div className="py-12 text-center">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-sm font-medium text-foreground">
                                    No users found
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Get started by creating a new user.
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href="/users/create"
                                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add User
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
