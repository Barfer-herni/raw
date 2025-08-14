'use client';

import { Settings } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';
import Link from 'next/link';

interface AdminButtonProps {
    locale?: string;
    isAdmin: boolean;
    isLoadingAdmin: boolean;
}

export function AdminButton({ locale = 'es', isAdmin, isLoadingAdmin }: AdminButtonProps) {
    if (isLoadingAdmin || !isAdmin) {
        return null;
    }

    return (
        <Link href={`/${locale}/admin/productos`}>
            <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Gestión de Productos"
            >
                <Settings className="h-5 w-5" />
            </Button>
        </Link>
    );
}
