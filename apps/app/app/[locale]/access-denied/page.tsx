// import { SignOutButton } from '@repo/auth/client';
import { signOut, getCurrentUser } from '@repo/auth/server';
import { Button } from '@repo/design-system/components/ui/button';
import { Leaf, ShieldAlert, Clock } from 'lucide-react';
import { redirect } from 'next/navigation';

interface AccessDeniedProps {
    params: Promise<{
        locale: string;
    }>;
}

export default async function AccessDenied({ params }: AccessDeniedProps) {
    const currentUser = await getCurrentUser();
    const { locale } = await params;
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 p-4">
            <div className="max-w-md w-full mx-auto bg-white dark:bg-zinc-800 rounded-lg shadow-md p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <ShieldAlert className="h-10 w-10 text-red-500 dark:text-red-400" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Acceso Denegado
                </h1>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    No tienes permisos para acceder a esta área. Esta sección está reservada para usuarios autorizados de Barfer con el rol apropiado.
                </p>

                <div className="bg-gray-50 dark:bg-zinc-700/30 p-4 rounded-md text-left mb-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        ¿Necesitas acceso?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Si necesitas acceso a esta sección, contacta a un administrador de Barfer para solicitar la autorización apropiada para la gestión del sistema.
                    </p>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <ShieldAlert className="h-5 w-5" />
                        <span className="font-medium">Barfer</span>
                    </div>
                    <form action={async () => {
                        'use server';
                        await signOut();
                        redirect(`/${locale}/sign-in`);
                    }}>
                        <Button variant="outline">
                            Cerrar Sesión
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
} 