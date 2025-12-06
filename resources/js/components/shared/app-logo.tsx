import logo from '@/images/logo/lavloss.png';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface AppLogoProps {
    collapsed?: boolean;
}

export default function AppLogo({ collapsed = false }: AppLogoProps) {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="group relative flex w-full items-center justify-center gap-2.5 rounded-lg transition-all duration-200">
            {/* Logo container */}
            <div className="flex items-center justify-center rounded-full transition-all duration-200">
                <img
                    src={logo}
                    className="h-auto w-10 rounded-full transition-transform duration-200 group-hover:scale-105"
                    alt={`${name} by Spaceworks`}
                />
            </div>

            {!collapsed && (
                <div className="flex flex-1 flex-col justify-center overflow-hidden">
                    <div className="space-y-0.5">
                        <h2 className="truncate text-xl leading-none font-bold text-foreground transition-colors duration-200">
                            {name}
                        </h2>
                        <p className="truncate text-xs leading-none text-muted-foreground transition-colors duration-200 group-hover:text-muted-foreground/80">
                            by Spaceworks
                        </p>
                    </div>
                </div>
            )}

            {/* Animated accent line on hover (collapsed state) */}
            {collapsed && (
                <div className="absolute inset-0 rounded-lg bg-linear-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            )}
        </div>
    );
}
