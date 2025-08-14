'use client';

import { Avatar, AvatarFallback } from '@repo/design-system/components/ui/avatar';
import { Button } from '@repo/design-system/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@repo/design-system/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';
import { useTransition } from 'react';
import { Dictionary } from '@repo/internationalization';
import { logoutAction } from '../actions';
import Link from 'next/link';

interface UserMenuProps {
    userName?: string;
    dictionary?: Dictionary;
    locale?: string;
}

export function UserMenu({ userName, dictionary, locale = 'es' }: UserMenuProps) {
    const [isPending, startTransition] = useTransition();

    const handleLogout = () => {
        startTransition(async () => {
            await logoutAction(locale);
        });
    };

    // Get user initials from name
    const getInitials = () => {
        if (!userName) return '👤';

        const parts = userName.split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const logoutText = dictionary?.app?.admin?.navigation?.logout ||
        dictionary?.app?.client?.navigation?.logout ||
        dictionary?.app?.pharmacy?.navigation?.logout ||
        'Cerrar sesión';
    const loggingOutText = dictionary?.app?.admin?.navigation?.loggingOut ||
        dictionary?.app?.client?.navigation?.loggingOut ||
        dictionary?.app?.pharmacy?.navigation?.loggingOut ||
        'Cerrando sesión...';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-12 w-12 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Menú de usuario"
                >
                    <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {getInitials()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {userName && (
                    <>
                        <DropdownMenuItem disabled className="font-medium text-center justify-center">
                            {userName}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}
                <DropdownMenuItem asChild>
                    <Link href={`/${locale}/admin/account`} className="flex items-center cursor-pointer">
                        <User className="mr-2 h-5 w-5" />
                        Mi perfil
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isPending}
                    className="text-destructive dark:text-red-400 focus:text-destructive dark:focus:text-red-300 cursor-pointer"
                >
                    <LogOut className="mr-2 h-5 w-5" />
                    {isPending ? loggingOutText : logoutText}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
