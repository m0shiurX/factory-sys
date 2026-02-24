import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSearchableDropdownOptions<T> {
    items: T[];
    onSelect: (item: T) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
}

interface UseSearchableDropdownReturn {
    highlightedIndex: number;
    setHighlightedIndex: (index: number) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
    getItemProps: (index: number) => {
        ref: (el: HTMLButtonElement | null) => void;
        className: string;
    };
    itemRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
}

export function useSearchableDropdown<T>({
    items,
    onSelect,
    isOpen,
    setIsOpen,
    inputRef,
}: UseSearchableDropdownOptions<T>): UseSearchableDropdownReturn {
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Reset highlighted index when items change or dropdown closes
    useEffect(() => {
        if (!isOpen) {
            setHighlightedIndex(-1);
        }
    }, [isOpen]);

    // Reset highlighted index when items change
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [items]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
            itemRefs.current[highlightedIndex]?.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
            });
        }
    }, [highlightedIndex]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!isOpen || items.length === 0) {
                // Open dropdown on arrow down
                if (e.key === 'ArrowDown' && !isOpen) {
                    setIsOpen(true);
                    setHighlightedIndex(0);
                    e.preventDefault();
                }
                return;
            }

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setHighlightedIndex((prev) =>
                        prev < items.length - 1 ? prev + 1 : prev,
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (highlightedIndex >= 0 && highlightedIndex < items.length) {
                        onSelect(items[highlightedIndex]);
                        setHighlightedIndex(-1);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setIsOpen(false);
                    setHighlightedIndex(-1);
                    break;
                case 'Tab':
                    // Allow tab to close and move focus
                    if (highlightedIndex >= 0 && highlightedIndex < items.length) {
                        onSelect(items[highlightedIndex]);
                    }
                    setIsOpen(false);
                    setHighlightedIndex(-1);
                    break;
            }
        },
        [isOpen, items, highlightedIndex, onSelect, setIsOpen],
    );

    const getItemProps = useCallback(
        (index: number) => ({
            ref: (el: HTMLButtonElement | null) => {
                itemRefs.current[index] = el;
            },
            className:
                index === highlightedIndex
                    ? 'bg-primary/10 dark:bg-primary/20'
                    : '',
        }),
        [highlightedIndex],
    );

    return {
        highlightedIndex,
        setHighlightedIndex,
        handleKeyDown,
        dropdownRef,
        getItemProps,
        itemRefs,
    };
}
