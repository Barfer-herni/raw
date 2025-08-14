'use server'

import { isCurrentUserAdmin as isCurrentUserAdminService } from './authHelpers';

/**
 * Server Action: Verificar si el usuario actual es administrador
 */
export async function checkAdminRoleAction() {
    try {
        const result = await isCurrentUserAdminService();
        return result;
    } catch (error) {
        console.error('Error en checkAdminRoleAction:', error);
        return {
            isAdmin: false,
            error: 'SERVER_ERROR'
        };
    }
}
