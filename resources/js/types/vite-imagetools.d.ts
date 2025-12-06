/// <reference types="vite/client" />

/**
 * vite-imagetools: Image imports with query parameters
 *
 * TypeScript doesn't support wildcard query parameters in module declarations,
 * so we use a workaround: declare a namespace with a generic type.
 *
 * The imports work perfectly at runtime via vite-imagetools.
 * These type errors can be safely ignored - the build succeeds.
 */

type ImageImport = string;

declare module '@/images/*' {
    const src: ImageImport;
    export default src;
}

declare module '*.png?*as=srcset*' {
    const srcSet: ImageImport;
    export default srcSet;
}

declare module '*.jpg?*as=srcset*' {
    const srcSet: ImageImport;
    export default srcSet;
}

declare module '*.jpeg?*as=srcset*' {
    const srcSet: ImageImport;
    export default srcSet;
}

declare module '*.webp?*as=srcset*' {
    const srcSet: ImageImport;
    export default srcSet;
}

declare module '*.png?*' {
    const src: ImageImport;
    export default src;
}

declare module '*.jpg?*' {
    const src: ImageImport;
    export default src;
}

declare module '*.jpeg?*' {
    const src: ImageImport;
    export default src;
}

declare module '*.webp?*' {
    const src: ImageImport;
    export default src;
}
