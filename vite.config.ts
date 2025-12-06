import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { imagetools } from 'vite-imagetools';
import path from 'path';

export default defineConfig(({ isSsrBuild }) => ({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
        imagetools(),
        ViteImageOptimizer({
            png: {
                quality: 80,
            },
            jpeg: {
                quality: 80,
            },
            jpg: {
                quality: 80,
            },
            webp: {
                lossless: false,
                quality: 80,
            },
            avif: {
                lossless: false,
                quality: 75,
            },
        }),
    ],
    resolve: {
        alias: {
            '@/images': path.resolve(__dirname, './resources/images'),
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
    build: {
        rollupOptions: {
            output: isSsrBuild
                ? undefined
                : {
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom'],
                        inertia: ['@inertiajs/react'],
                    },
                },
        },
        chunkSizeWarningLimit: 1000,
        cssCodeSplit: true,
    },
}));
