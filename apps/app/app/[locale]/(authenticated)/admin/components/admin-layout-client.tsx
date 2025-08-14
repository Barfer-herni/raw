'use client';

import { type ReactNode } from 'react';
import { UserHeaderClient } from '../../components/user-header/userHeaderClient';
import { CartButton } from '../../components/cart-button';
import { CartProvider } from '../../components/cart-context';
import { Dictionary } from '@repo/internationalization';

interface AdminLayoutClientProps {
    children: ReactNode;
    logo: ReactNode;
    title: string;
    dictionary: Dictionary;
    locale: string;
}

export function AdminLayoutClient({ children, logo, title, dictionary, locale }: AdminLayoutClientProps) {
    return (
        <CartProvider locale={locale}>
            <div className="flex w-full min-h-screen bg-barfer-white text-gray-900">
                <UserHeaderClient
                    logo={logo}
                    title={title}
                    extraItems={<CartButton />}
                    dictionary={dictionary}
                    locale={locale}
                />

                <div className="pt-16 flex w-full h-full">
                    <main className="bg-gradient-to-br from-barfer-white to-gray-50 flex-1 min-h-screen pb-20 md:pb-0">
                        {children}
                    </main>
                </div>
            </div>
        </CartProvider>
    );
}
