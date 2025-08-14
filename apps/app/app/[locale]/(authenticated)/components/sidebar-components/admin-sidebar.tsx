import { getAuthorizedSidebarItems, type SidebarItem } from '@repo/auth/server-permissions';
import { AdminSidebarClient } from './admin-sidebar-client';
import { Dictionary } from '@repo/internationalization';

type AdminSidebarProps = {
    dictionary: Dictionary;
};

export async function AdminSidebar({ dictionary }: AdminSidebarProps) {
    // Obtener elementos autorizados del servidor
    const authorizedItems = await getAuthorizedSidebarItems();

    return <AdminSidebarClient items={authorizedItems} dictionary={dictionary} />;
}

