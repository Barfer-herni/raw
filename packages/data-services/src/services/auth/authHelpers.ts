'use server'

import { getCurrentUser } from './authService';

/**
 * Verificar si el usuario actual es administrador
 */
export async function isCurrentUserAdmin(): Promise<{ isAdmin: boolean; user?: any; error?: string }> {
    try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            return {
                isAdmin: false,
                error: 'NO_USER_FOUND'
            };
        }

        const isAdmin = currentUser.role === 'admin';
        
        return {
            isAdmin,
            user: currentUser
        };
    } catch (error) {
        console.error('Error verificando rol de administrador:', error);
        return {
            isAdmin: false,
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Verificar si un usuario específico es administrador
 */
export async function isUserAdmin(userId: string): Promise<{ isAdmin: boolean; user?: any; error?: string }> {
    try {
        const { getUserById } = await import('./authService');
        const user = await getUserById(userId);
        
        if (!user) {
            return {
                isAdmin: false,
                error: 'USER_NOT_FOUND'
            };
        }

        const isAdmin = user.role === 'admin';
        
        return {
            isAdmin,
            user
        };
    } catch (error) {
        console.error('Error verificando rol de usuario:', error);
        return {
            isAdmin: false,
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Middleware para proteger rutas de administrador
 */
export async function requireAdminRole(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
        const { isAdmin, user, error } = await isCurrentUserAdmin();
        
        if (error) {
            return {
                success: false,
                error
            };
        }
        
        if (!isAdmin) {
            return {
                success: false,
                error: 'INSUFFICIENT_PERMISSIONS'
            };
        }
        
        return {
            success: true,
            user
        };
    } catch (error) {
        console.error('Error en requireAdminRole:', error);
        return {
            success: false,
            error: 'SERVER_ERROR'
        };
    }
}
