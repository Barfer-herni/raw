'use client';

import { useState, useEffect, ReactNode } from 'react';
import { checkAdminRoleAction } from '@repo/data-services/src/actions';
import { AdminButton } from '../../components/admin-button';
import { CartButton } from '../../components/cart-button';
import { UserHeaderClient } from '../../components/user-header/userHeaderClient';
import { CartProvider } from '../../components/cart-context';
import { Dictionary } from '@repo/internationalization';

interface AdminPageWrapperProps {
    children: ReactNode;
    logo: ReactNode;
    title: string;
    dictionary: Dictionary;
    locale: string;
}

export function AdminPageWrapper({ children, logo, title, dictionary, locale }: AdminPageWrapperProps) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);

    // Verificar permisos de administrador
    useEffect(() => {
        const checkAdminRole = async () => {
            try {
                const result = await checkAdminRoleAction();
                setIsAdmin(result.isAdmin);
            } catch (error) {
                console.error('Error verificando rol de admin:', error);
                setIsAdmin(false);
            } finally {
                setIsLoadingAdmin(false);
            }
        };

        checkAdminRole();
    }, []);

    const headerExtraItems = (
        <div className="flex items-center gap-2">
            <AdminButton locale={locale} isAdmin={isAdmin} isLoadingAdmin={isLoadingAdmin} />
            <CartButton />
        </div>
    );

    return (
        <CartProvider locale={locale}>
            <div className="flex w-full min-h-screen bg-barfer-white text-gray-900">
                <UserHeaderClient
                    logo={logo}
                    title={title}
                    extraItems={headerExtraItems}
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
