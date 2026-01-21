import { getCurrentUser } from '@repo/auth/server';
import { getDictionary } from '@repo/internationalization';
import { hasPermission, requirePermission } from '@repo/auth/server-permissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { ProfileSection } from './components/ProfileSection';
import { PasswordSection } from './components/PasswordSection';
import { DeliveryInfoSection } from './components/DeliveryInfoSection';
import { UsersSection } from './components/UsersSection';
import { CategoryPermissionsManager } from './components/CategoryPermissionsManager';
// Importar directamente desde el archivo del servicio
import { getAllGestorUsers } from '@repo/data-services/src/services/gestorUsersService';

interface AccountPageProps {
    params: Promise<{ locale: string }>;
}

export default async function AccountPage({ params }: AccountPageProps) {
    // Verificar permisos básicos
    await requirePermission('account:view_own');
    const { locale } = await params;

    // Obtener datos en el servidor
    const [currentUser, dictionary] = await Promise.all([
        getCurrentUser(),
        getDictionary(locale)
    ]);

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-muted-foreground">Usuario no encontrado</p>
                </div>
            </div>
        );
    }

    // Verificar si puede gestionar usuarios para obtener la lista
    const canManageUsers = await hasPermission('account:manage_users');
    const users = canManageUsers ? await getAllGestorUsers(currentUser.id) : []; // Solo usuarios de gestión (users_gestor)

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                    <a
                        href="/admin"
                        className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver a la Tienda
                    </a>
                    <h1 className="text-2xl md:text-3xl font-bold">
                        Gestión de Cuenta
                    </h1>
                </div>
                <div className="text-sm text-muted-foreground">
                    Configuración y usuarios
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <div className="overflow-x-auto">
                    <TabsList className={`grid w-full ${canManageUsers ? 'grid-cols-3' : 'grid-cols-1'} min-w-[300px] md:min-w-0`}>
                        <TabsTrigger value="profile" className="text-sm">
                            Mi Perfil
                        </TabsTrigger>
                        {canManageUsers && (
                            <>
                                <TabsTrigger value="users" className="text-sm">
                                    Gestión de Usuarios
                                </TabsTrigger>
                                <TabsTrigger value="permissions" className="text-sm">
                                    Permisos por Categoría
                                </TabsTrigger>
                            </>
                        )}
                    </TabsList>
                </div>

                <TabsContent value="profile" className="space-y-4">
                    <ProfileSection currentUser={currentUser} dictionary={dictionary} />
                    <DeliveryInfoSection currentUser={currentUser} dictionary={dictionary} />
                    <PasswordSection currentUser={currentUser} dictionary={dictionary} />
                </TabsContent>

                {canManageUsers && (
                    <>
                        <TabsContent value="users" className="space-y-4">
                            <UsersSection
                                users={users}
                                currentUser={currentUser}
                                dictionary={dictionary}
                            />
                        </TabsContent>
                        <TabsContent value="permissions" className="space-y-4">
                            <CategoryPermissionsManager
                                users={users}
                                currentUser={currentUser}
                                dictionary={dictionary}
                            />
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
} 