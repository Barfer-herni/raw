import { ReactNode } from 'react';
import { hasPermission, hasAnyPermission, hasAllPermissions, isAdmin, type Permission } from '../server-permissions';

interface PermissionGateProps {
    children: ReactNode;
    permission?: Permission;
    permissions?: Permission[];
    requireAll?: boolean; // Si es true, requiere TODOS los permisos. Si es false, requiere AL MENOS UNO
    requireAdmin?: boolean;
    fallback?: ReactNode;
}

/**
 * Componente Server Component que protege contenido basado en permisos
 * Solo muestra el contenido si el usuario tiene los permisos necesarios
 */
export async function PermissionGate({
    children,
    permission,
    permissions = [],
    requireAll = true,
    requireAdmin = false,
    fallback = null
}: PermissionGateProps) {
    let hasAccess = false;

    if (requireAdmin) {
        hasAccess = await isAdmin();
    } else if (permission) {
        hasAccess = await hasPermission(permission);
    } else if (permissions.length > 0) {
        hasAccess = requireAll
            ? await hasAllPermissions(permissions)
            : await hasAnyPermission(permissions);
    } else {
        // Si no se especifica ningún permiso, permitir acceso
        hasAccess = true;
    }

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Componente para mostrar contenido solo a administradores
 */
export async function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
    return (
        <PermissionGate requireAdmin fallback={fallback}>
            {children}
        </PermissionGate>
    );
}

/**
 * Componente para mostrar contenido basado en un permiso específico
 */
export async function RequirePermission({
    permission,
    children,
    fallback = null
}: {
    permission: Permission;
    children: ReactNode;
    fallback?: ReactNode;
}) {
    return (
        <PermissionGate permission={permission} fallback={fallback}>
            {children}
        </PermissionGate>
    );
} 