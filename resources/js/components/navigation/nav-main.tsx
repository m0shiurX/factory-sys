import {
    SidebarGroup,
    // SidebarGroupLabel,
    SidebarMenu,
    // SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { NavSection, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function NavMain({
    items = [],
    sections = [],
}: {
    items?: NavItem[];
    sections?: NavSection[];
}) {
    const page = usePage();

    const { state } = useSidebar();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{
        top: number;
        left: number;
    } | null>(null);
    const isCollapsed = state === 'collapsed';
    const toggleExpanded = (itemTitle: string) => {
        if (isCollapsed) return; // Don't expand in collapsed mode

        const newExpanded = new Set<string>();

        // If the clicked item is already expanded, close it (accordion behavior)
        if (!expandedItems.has(itemTitle)) {
            newExpanded.add(itemTitle);
        }
        // If it was expanded, leave the set empty (close it)

        setExpandedItems(newExpanded);
    };

    const isItemActive = (item: NavItem): boolean => {
        const normalizeUrl = (url: string) => url?.split('?')[0]; // Remove query params

        if (normalizeUrl(item.href) === normalizeUrl(page.url)) return true;

        if (item.childRoutes) {
            return item.childRoutes.some(
                (child) => normalizeUrl(child.href) === normalizeUrl(page.url),
            );
        }

        return false;
    };

    const isChildActive = (child: NavItem): boolean => {
        return child.href === page.url;
    };

    const handleMouseEnter = (
        item: NavItem,
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        if (isCollapsed && item.childRoutes) {
            const rect = event.currentTarget.getBoundingClientRect();
            setDropdownPosition({
                top: rect.top,
                left: rect.right + 8,
            });
            setHoveredItem(item.title);
        }
    };

    const handleMouseLeave = () => {
        // Use a small delay to allow moving to the dropdown
        setTimeout(() => {
            setHoveredItem(null);
            setDropdownPosition(null);
        }, 100);
    };

    const renderNavItem = (item: NavItem) => (
        <SidebarMenuItem key={item.title} className="relative">
            {item?.childRoutes ? (
                <>
                    {/* Parent Menu Item with Children */}
                    <div
                        className="group relative"
                        onMouseEnter={(e) => handleMouseEnter(item, e)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button
                            onClick={() => toggleExpanded(item.title)}
                            className={`group/parent relative flex h-8 w-full cursor-pointer items-center gap-3 rounded-md p-2 text-sm transition-all duration-200 ease-linear hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isCollapsed ? 'justify-center' : ''
                                } ${isItemActive(item)
                                    ? 'bg-primary font-medium text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                                    : 'text-sidebar-foreground'
                                }`}
                        >
                            <div className="flex aspect-square items-center justify-center">
                                {item.icon && <item.icon className="size-5" />}
                            </div>
                            {!isCollapsed && (
                                <>
                                    <div className="flex-1 truncate text-left">
                                        {item.title}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {item.badge && (
                                            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs leading-none font-bold text-white">
                                                {item.badge}
                                            </span>
                                        )}
                                        <ChevronRight
                                            className={`h-4 w-4 transition-transform duration-200 ease-in-out ${expandedItems.has(item.title)
                                                ? 'rotate-90'
                                                : ''
                                                }`}
                                        />
                                    </div>
                                </>
                            )}
                        </button>

                        {/* Floating dropdown for collapsed mode */}
                        {isCollapsed &&
                            hoveredItem === item.title &&
                            item.childRoutes &&
                            dropdownPosition && (
                                <div
                                    className="fixed z-100 w-56 rounded-md border border-sidebar-border bg-sidebar shadow-xl backdrop-blur-sm"
                                    style={{
                                        left: dropdownPosition.left,
                                        top: dropdownPosition.top,
                                        transform: 'translateY(-50%)',
                                    }}
                                    onMouseEnter={() =>
                                        setHoveredItem(item.title)
                                    }
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className="p-1">
                                        <div className="mb-1 border-b border-sidebar-border px-3 py-2 text-xs font-semibold text-sidebar-foreground">
                                            {item.title}
                                        </div>
                                        {item.childRoutes.map(
                                            (child: NavItem, index: number) => (
                                                <Link
                                                    key={index}
                                                    href={child.href || '#'}
                                                    className={`block w-full rounded-md px-3 py-2 text-sm transition-all duration-200 ease-linear hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isChildActive(child)
                                                        ? 'bg-primary font-medium text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                                                        : 'text-sidebar-foreground'
                                                        }`}
                                                >
                                                    {child.title}
                                                </Link>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* Submenu with smooth animation - only show when not collapsed */}
                    {!isCollapsed && (
                        <div
                            className={`overflow-hidden transition-all duration-200 ease-in-out ${expandedItems.has(item.title)
                                ? 'max-h-96 opacity-100'
                                : 'max-h-0 opacity-0'
                                }`}
                            onClick={(e) => e.stopPropagation()} // Prevent clicks inside submenu from bubbling up
                        >
                            {item.childRoutes &&
                                item.childRoutes.length > 0 && (
                                    <div className="relative mt-1 flex flex-col gap-1 pb-1">
                                        {item.childRoutes.map(
                                            (child: NavItem, index: number) => (
                                                <Link
                                                    key={index}
                                                    href={child.href || '#'}
                                                    className={`group relative z-10 flex h-9 w-full cursor-pointer items-center gap-3 rounded-md px-3 pl-10 text-sm transition-all duration-200 ease-linear hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isChildActive(child)
                                                        ? 'bg-primary font-medium text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                                                        : 'text-sidebar-foreground/70'
                                                        }`}
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    } // Prevent child clicks from bubbling up
                                                    prefetch
                                                >
                                                    <div className="flex-1 truncate text-left">
                                                        {child.title}
                                                    </div>
                                                    {/* Active indicator */}
                                                    {isChildActive(child) && (
                                                        <div className="absolute top-1/2 left-4.5 h-1 w-1 -translate-y-1/2 rounded-full bg-sidebar-primary"></div>
                                                    )}
                                                </Link>
                                            ),
                                        )}
                                        {/* Connecting line for submenu */}
                                        <div className="absolute top-1 left-5 h-[calc(100%-0.5rem)] w-px bg-sidebar-border"></div>
                                    </div>
                                )}
                        </div>
                    )}
                </>
            ) : (
                /* Simple Menu Item without Children */
                <Link
                    href={item.href || '#'}
                    className={`group/parent relative flex h-8 w-full cursor-pointer items-center gap-3 rounded-md p-2 text-sm transition-all duration-200 ease-linear hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isCollapsed ? 'justify-center' : ''
                        } ${isItemActive(item)
                            ? 'bg-primary font-medium text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                            : 'text-sidebar-foreground'
                        }`}
                >
                    <div className="flex aspect-square items-center justify-center">
                        {item.icon && <item.icon className="size-5" />}
                    </div>
                    {!isCollapsed && (
                        <>
                            <div className="flex-1 truncate text-left">
                                {item.title}
                            </div>
                            <div className="flex items-center gap-1">
                                {item.badge && (
                                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs leading-none font-bold text-white">
                                        {item.badge}
                                    </span>
                                )}
                                {/* Active indicator */}
                                {isItemActive(item) && (
                                    <div className="h-1 w-1 rounded-full bg-sidebar-primary"></div>
                                )}
                            </div>
                        </>
                    )}
                </Link>
            )}
        </SidebarMenuItem>
    );
    return (
        <SidebarGroup className="scrollbar-hide flex w-full flex-col gap-2 overflow-y-auto p-2">
            {sections.length > 0 ? (
                // Render organized sections
                <div className="space-y-2">
                    {sections.map((section, sectionIndex) => (
                        <div key={section.title || sectionIndex} className="">
                            {section.title && !isCollapsed && (
                                <div className="px-3 py-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                    {section.title}
                                </div>
                            )}
                            <SidebarMenu className="space-y-1">
                                {section.items.map(renderNavItem)}
                            </SidebarMenu>
                            {/* Add separator between sections (except last) - only when not collapsed */}
                            {!isCollapsed &&
                                sectionIndex < sections.length - 1 && (
                                    <div className="my-2 h-px bg-sidebar-border"></div>
                                )}
                        </div>
                    ))}
                </div>
            ) : (
                // Render flat items (fallback)
                <SidebarMenu className="space-y-1">
                    {items.map(renderNavItem)}
                </SidebarMenu>
            )}
        </SidebarGroup>
    );
}
