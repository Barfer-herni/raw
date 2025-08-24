import type { ReactNode } from 'react';
import { getDictionary } from '@repo/internationalization';
import { AdminPageWrapper } from './components/admin-page-wrapper';
import Image from 'next/image';
import Link from 'next/link';
import logo from '@/public/barfer.png';

type AdminLayoutProps = {
    readonly children: ReactNode;
    readonly params: Promise<{
        locale: string;
    }>;
};

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);

    return (
        <AdminPageWrapper
            logo={
                <Link href={`/${locale}`}>
                    <Image src={logo} alt="RAW" width={48} height={48} className="cursor-pointer hover:opacity-80 transition-opacity" />
                </Link>
            }
            title=""
            dictionary={dictionary}
            locale={locale}
        >
            {children}
        </AdminPageWrapper>
    );
} 