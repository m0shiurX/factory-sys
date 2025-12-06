import Divider from '@/components/ui/divide';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { Activity } from 'lucide-react';
import { NavUser } from '../navigation/nav-user';
import { ThemeToggler } from '../settings/theme-toggler';
import { Breadcrumbs } from './breadcrumbs';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex w-full items-center gap-2">
                <div className="flex flex-1 items-center">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                <div className="flex items-center">
                    <div className="mr-4 hidden items-center gap-4 lg:flex">
                        <Link href={''}>
                            <Activity className="text-muted-foreground"></Activity>
                        </Link>
                    </div>
                    <ThemeToggler />
                    <Divider className="mx-4"></Divider>
                    <NavUser />
                </div>
            </div>
        </header>
    );
}
