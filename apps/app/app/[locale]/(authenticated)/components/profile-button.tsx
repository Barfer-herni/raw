'use client';

import { User } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';
import Link from 'next/link';

interface ProfileButtonProps {
    locale?: string;
}

export function ProfileButton({ locale = 'es' }: ProfileButtonProps) {
    return (
        <Link href={`/${locale}/admin/account`}>
            <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Mi Perfil"
            >
                <User className="h-5 w-5" />
            </Button>
        </Link>
    );
}
