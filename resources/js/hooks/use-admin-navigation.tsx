import { type NavItem, type NavSection } from '@/types';
import { FileText, LayoutGrid, Shield, Users } from 'lucide-react';

/**
childRoutes: [
    {
        title: 'Admins',
        href: '/users',
    },
    {
        title: 'Create User',
        href: '/users/create',
    },
],
**/
export function useAdminNavigation() {
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    const managementItems: NavItem[] = [
        {
            title: 'User Management',
            icon: Users,
            href: '/users',
        },
        {
            title: 'Roles & Permissions',
            href: '/roles',
            icon: Shield,
        },
        {
            title: 'Activity Log',
            href: '/activities',
            icon: FileText,
        },
    ];

    const navSections: NavSection[] = [
        {
            items: mainNavItems,
        },
        {
            title: 'Management',
            items: managementItems,
        },
    ];

    const footerNavItems: NavItem[] = [];

    return {
        navSections,
        mainNavItems,
        footerNavItems,
    };
}
