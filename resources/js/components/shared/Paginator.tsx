import { Link } from '@inertiajs/react';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}
export interface PaginatorProps {
    pagination: PaginationLink[];
}

export default function Paginator({ pagination }: PaginatorProps) {
    return (
        <nav className="mt-6 flex items-center justify-center space-x-1">
            {pagination.map((link, index) => {
                const isActive = link.active;
                const isDisabled = !link.url;

                return (
                    <Link
                        key={index}
                        href={link.url ?? '#'}
                        className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                            isDisabled
                                ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                                : isActive
                                  ? 'border-cyan-950 bg-cyan-950 text-white'
                                  : 'border-gray-300 bg-white text-gray-700 hover:bg-cyan-900 hover:text-white'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </nav>
    );
}
