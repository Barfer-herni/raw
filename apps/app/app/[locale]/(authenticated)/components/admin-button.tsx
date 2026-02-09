'use client';

import { DollarSign, Table, BarChart3, MinusCircle } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@repo/design-system/lib/utils';

interface AdminButtonProps {
    locale?: string;
    isAdmin: boolean;
    isLoadingAdmin: boolean;
}

export function AdminButton({ locale = 'es', isAdmin, isLoadingAdmin }: AdminButtonProps) {
    const pathname = usePathname();

    if (isLoadingAdmin || !isAdmin) {
        return null;
    }

    const isActiveRoute = (route: string) => pathname.includes(route);

    return (
        <div className="fixed left-0 top-0 h-screen w-20 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 z-40 flex flex-col items-center pt-20 gap-4">
            {/* Botón de Precios */}
            <Link href={`/${locale}/admin/productos`}>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative h-12 w-12 group",
                        isActiveRoute('/admin/productos')
                            ? "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    title="Gestión de Productos"
                >
                    <DollarSign className="h-6 w-6" />
                    {/* Tooltip */}
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap dark:bg-gray-50 dark:text-gray-900">
                        Precios
                    </div>
                </Button>
            </Link>

            {/* Botón de Ordenes */}
            <Link href={`/${locale}/admin/orders`}>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative h-12 w-12 group",
                        isActiveRoute('/admin/orders')
                            ? "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    title="Gestión de Órdenes"
                >
                    <Table className="h-6 w-6" />
                    {/* Tooltip */}
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap dark:bg-gray-50 dark:text-gray-900">
                        Ordenes
                    </div>
                </Button>
            </Link>

            {/* Botón de Balance */}
            <Link href={`/${locale}/admin/balance`}>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative h-12 w-12 group",
                        isActiveRoute('/admin/balance')
                            ? "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    title="Balance"
                >
                    <BarChart3 className="h-6 w-6" />
                    {/* Tooltip */}
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap dark:bg-gray-50 dark:text-gray-900">
                        Balance
                    </div>
                </Button>
            </Link>

            {/* Botón de Salidas */}
            <Link href={`/${locale}/admin/salidas`}>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative h-12 w-12 group",
                        isActiveRoute('/admin/salidas')
                            ? "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    title="Salidas"
                >
                    <MinusCircle className="h-6 w-6" />
                    {/* Tooltip */}
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap dark:bg-gray-50 dark:text-gray-900">
                        Salidas
                    </div>
                </Button>
            </Link>
        </div>
    );
}
