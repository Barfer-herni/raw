'use server'

import { mongoLoginWithGoogleSession } from '@repo/data-services';

export async function loginWithGoogleAction(credential: string) {
    try {
        const result = await mongoLoginWithGoogleSession(credential);
        return {
            success: result.success,
            message: result.message,
            userRole: result.user?.role
        };
    } catch (error) {
        return { success: false, message: 'Error interno del servidor' };
    }
}
