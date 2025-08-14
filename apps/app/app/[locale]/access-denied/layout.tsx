import { ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import Link from 'next/link';

type AccessDeniedLayoutProps = {
    readonly children: ReactNode;
};

export default function AccessDeniedLayout({ children }: AccessDeniedLayoutProps) {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
            <header className="p-4 border-b border-gray-200 dark:border-zinc-800">
                <div className="container mx-auto">
                    <Link href="/" className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-blue-500" />
                        <span className="font-bold text-lg">Barfer</span>
                    </Link>
                </div>
            </header>
            {children}
        </div>
    );
} 