import { type NavItem, type NavSection } from '@/types';
import {
    CreditCard,
    ExternalLink,
    FileText,
    Headphones,
    LayoutGrid,
    Shield,
    ShoppingCart,
    UserCheck,
    Users,
} from 'lucide-react';

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

    const supportSection: NavItem[] = [
        {
            title: 'Support',
            href: '/dashboard/support',
            icon: Headphones,
        },
    ];

    const salesSection: NavItem[] = [
        {
            title: 'Customers',
            href: '/dashboard/customers',
            icon: UserCheck,
        },
        {
            title: 'Orders',
            href: '/dashboard/orders',
            icon: ShoppingCart,
        },
        {
            title: 'Payments',
            href: '/dashboard/payments',
            icon: CreditCard,
        },
    ];

    const navSections: NavSection[] = [
        {
            items: mainNavItems,
        },
        {
            title: 'Sales',
            items: salesSection,
        },
        {
            title: 'Support',
            items: supportSection,
        },
        {
            title: 'Management',
            items: managementItems,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'View Website',
            href: '/',
            icon: ExternalLink,
        },
    ];

    return {
        navSections,
        mainNavItems,
        footerNavItems,
    };
}
