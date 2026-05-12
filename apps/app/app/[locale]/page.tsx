
import { getDictionary } from '@repo/internationalization';
import { getCurrentUser } from '@repo/auth/server';
import { PublicHome } from './public-home';

export default async function Home({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);
    // Usar el resultado de getCurrentUser (verifica JWT contra DB) en
    // lugar de la mera presencia de la cookie, que podría estar forjada
    // o corresponder a un usuario eliminado.
    const user = await getCurrentUser();
    const isAuthenticated = !!user;

    return (
        <PublicHome
            locale={locale}
            dictionary={dictionary}
            isAuthenticated={isAuthenticated}
            user={user}
        />
    );
}
