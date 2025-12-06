import InputError from '@/components/common/input-error';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { FormEventHandler } from 'react';

type Role = {
    id: number;
    name: string;
};

type Props = {
    roles: Role[];
};

export default function UserCreate({ roles }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as number[],
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/users');
    };

    const toggleRole = (roleId: number) => {
        setData(
            'roles',
            data.roles.includes(roleId)
                ? data.roles.filter((id) => id !== roleId)
                : [...data.roles, roleId],
        );
    };

    return (
        <AppLayout>
            <Head title="Create User" />
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <Link
                            href="/users"
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-muted-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Add User
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Create a new user account
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
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    placeholder="Enter full name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    placeholder="Enter email address"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    placeholder="Enter password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Password Confirmation */}
                            <div>
                                <label
                                    htmlFor="password_confirmation"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    placeholder="Confirm password"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            {/* Roles */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                    Roles
                                </label>
                                <p className="mb-3 text-xs text-muted-foreground">
                                    Assign one or more roles to this user
                                </p>
                                {roles.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {roles.map((role) => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() =>
                                                    toggleRole(role.id)
                                                }
                                                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${data.roles.includes(role.id)
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                {role.name}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No roles available. Create roles first.
                                    </p>
                                )}
                                <InputError message={errors.roles} />
                            </div>

                            {/* Submit */}
                            <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
                                <Link
                                    href="/users"
                                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                                >
                                    <Plus className="h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
