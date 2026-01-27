import InputError from '@/components/common/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { Building2, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

type Settings = {
    company_name?: string;
    company_address?: string;
    company_phone?: string;
    invoice_footer_message?: string;
    invoice_developed_by?: string;
};

type Props = {
    settings: Settings;
};

export default function SettingsIndex({ settings }: Props) {
    const { data, setData, put, errors, processing, recentlySuccessful } =
        useForm({
            company_name: settings.company_name || '',
            company_address: settings.company_address || '',
            company_phone: settings.company_phone || '',
            invoice_footer_message: settings.invoice_footer_message || '',
            invoice_developed_by: settings.invoice_developed_by || '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put('/dashboard/settings');
    };

    return (
        <AppLayout>
            <Head title="Settings" />
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-foreground">
                                    Settings
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Configure your company and invoice settings
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Settings Form */}
                    <form onSubmit={submit}>
                        <div className="space-y-6">
                            {/* Company Information */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold text-foreground">
                                    Company Information
                                </h2>
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="company_name">
                                            Company Name
                                        </Label>
                                        <Input
                                            id="company_name"
                                            value={data.company_name}
                                            onChange={(e) =>
                                                setData(
                                                    'company_name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter company name"
                                        />
                                        <InputError message={errors.company_name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="company_address">
                                            Company Address
                                        </Label>
                                        <textarea
                                            id="company_address"
                                            value={data.company_address}
                                            onChange={(e) =>
                                                setData(
                                                    'company_address',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter company address"
                                            rows={2}
                                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <InputError message={errors.company_address} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="company_phone">
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="company_phone"
                                            value={data.company_phone}
                                            onChange={(e) =>
                                                setData(
                                                    'company_phone',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter phone number"
                                        />
                                        <InputError message={errors.company_phone} />
                                    </div>
                                </div>
                            </div>

                            {/* Invoice Settings */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold text-foreground">
                                    Invoice Settings
                                </h2>
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="invoice_footer_message">
                                            Footer Message
                                        </Label>
                                        <Input
                                            id="invoice_footer_message"
                                            value={data.invoice_footer_message}
                                            onChange={(e) =>
                                                setData(
                                                    'invoice_footer_message',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., Thank you for your business!"
                                        />
                                        <InputError
                                            message={errors.invoice_footer_message}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="invoice_developed_by">
                                            Developed By Text
                                        </Label>
                                        <Input
                                            id="invoice_developed_by"
                                            value={data.invoice_developed_by}
                                            onChange={(e) =>
                                                setData(
                                                    'invoice_developed_by',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., Developed by example.com"
                                        />
                                        <InputError
                                            message={errors.invoice_developed_by}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Leave empty to hide this from invoices
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-emerald-600">
                                        Settings saved successfully!
                                    </p>
                                </Transition>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
