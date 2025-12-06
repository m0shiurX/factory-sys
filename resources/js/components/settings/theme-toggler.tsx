import { useAppearance } from '@/hooks/use-appearance';
import { MoonIcon, SunIcon } from 'lucide-react';

export function ThemeToggler() {
    const { appearance, updateAppearance } = useAppearance();
    const handleChangeTheme = () => {
        if (appearance === 'light') {
            updateAppearance('dark');
        } else {
            updateAppearance('light');
        }
    };
    return (
        <>
            <div className="relative flex-1">
                <button
                    onClick={handleChangeTheme}
                    className="ml-auto block w-fit cursor-pointer text-center dark:text-white"
                >
                    {appearance === 'light' ? (
                        <MoonIcon className="text-zinc-400"></MoonIcon>
                    ) : (
                        <SunIcon className="text-zinc-400"></SunIcon>
                    )}
                </button>
            </div>
        </>
    );
}
