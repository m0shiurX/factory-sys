import AppLogo from '@/components/shared/app-logo';
import { useSidebar } from '@/components/ui/sidebar';

export default function SidebarLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return <AppLogo collapsed={isCollapsed} />;
}
