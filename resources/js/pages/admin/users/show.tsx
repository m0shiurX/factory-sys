import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Mail, Shield, User as UserIcon } from 'lucide-react';

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
    updated_at: string;
    roles: Role[];
};

type Props = {
    user: User;
};

export default function UserShow({ user }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title={`User - ${user.name}`} />
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/users"
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-muted-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-foreground">
                                    User Details
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    View user information
                                </p>
                            </div>
                        </div>
                        <Link
                            href={`/users/${user.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Edit className="h-4 w-4" />
                            Edit User
                        </Link>
                    </div>

                    {/* User Card */}
                    <div className="rounded-xl border border-border bg-card p-6">
                        {/* Profile Header */}
                        <div className="mb-6 flex items-center gap-4 border-b border-border pb-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">
                                    {user.name}
                                </h2>
                                <div className="mt-1 flex items-center gap-2">
                                    {user.email_verified_at ? (
                                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                            Unverified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            {/* Email */}
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-muted p-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Email Address
                                    </p>
                                    <p className="mt-0.5 text-sm text-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            {/* Roles */}
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-muted p-2">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Roles
                                    </p>
                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                        {user.roles.length > 0 ? (
                                            user.roles.map((role) => (
                                                <span
                                                    key={role.id}
                                                    className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                                                >
                                                    {role.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                No roles assigned
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Created At */}
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-muted p-2">
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Member Since
                                    </p>
                                    <p className="mt-0.5 text-sm text-foreground">
                                        {formatDate(user.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
