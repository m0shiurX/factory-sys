import { type NavItem, type NavSection } from '@/types';
import {
    BarChart3,
    Box,
    Coins,
    Factory,
    FileText,
    LayoutGrid,
    Receipt,
    RotateCcw,
    Shield,
    UserRound,
    Users,
    Wallet,
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

    const businessItems: NavItem[] = [
        {
            title: 'Sales',
            href: '/dashboard/sales',
            icon: Receipt,
        },
        {
            title: 'Sales Returns',
            href: '/dashboard/sales-returns',
            icon: RotateCcw,
        },
        {
            title: 'Payments',
            href: '/dashboard/payments',
            icon: Wallet,
        },
        {
            title: 'Expenses',
            href: '/dashboard/expenses',
            icon: Coins,
        },
        {
            title: 'Production',
            href: '/dashboard/productions',
            icon: Factory,
        },
        {
            title: 'Stock Report',
            href: '/dashboard/stock',
            icon: BarChart3,
        },
        {
            title: 'Products',
            href: '/dashboard/products',
            icon: Box,
        },
        {
            title: 'Customers',
            href: '/dashboard/customers',
            icon: UserRound,
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
            title: 'Business',
            items: businessItems,
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
