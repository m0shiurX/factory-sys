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
    Settings,
    Shield,
    UserRound,
    Users,
    Wallet,
} from 'lucide-react';

export function useAdminNavigation() {
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    // Inventory & Production - product-related items grouped together
    const inventoryItems: NavItem[] = [
        {
            title: 'Products',
            href: '/dashboard/products',
            icon: Box,
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
    ];

    // Sales & Transactions - revenue-related items grouped together
    const salesItems: NavItem[] = [
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
    ];

    // Customers
    const customerItems: NavItem[] = [
        {
            title: 'Customers',
            href: '/dashboard/customers',
            icon: UserRound,
        },
    ];

    // Administration & Access Control
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
        {
            title: 'Settings',
            href: '/dashboard/settings',
            icon: Settings,
        },
    ];

    const navSections: NavSection[] = [
        {
            items: mainNavItems,
        },
        {
            title: 'Inventory',
            items: inventoryItems,
        },
        {
            title: 'Sales & Finance',
            items: salesItems,
        },
        {
            title: 'Customers',
            items: customerItems,
        },
        {
            title: 'Administration',
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
