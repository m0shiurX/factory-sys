import Footer from '@/components/public/Footer';
import Header from '@/components/public/Header';
import React from 'react';
import { Toaster } from 'sonner';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <Header />
            {children}
            <Footer />
            <Toaster position="top-right" />
        </div>
    );
}
