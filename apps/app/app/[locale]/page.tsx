
import { getDictionary } from '@repo/internationalization';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@repo/auth/server';
import { PublicHome } from './public-home';

export default async function Home({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);
    const cookieStore = await cookies();
    const isAuthenticated = !!cookieStore.get('auth-token');
    const user = await getCurrentUser();

    return (
        <PublicHome
            locale={locale}
            dictionary={dictionary}
            isAuthenticated={isAuthenticated}
            user={user}
        />
    );
}
