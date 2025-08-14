'use server';

import { signOut } from '@repo/auth/server';
import { redirect } from 'next/navigation';

export async function logoutAction(locale: string = 'es') {
    try {
        const result = await signOut();

        // Siempre redirigir, incluso si hay un error menor
        // Es mejor que el usuario salga de la sesión aunque haya un problema técnico
        redirect(`/${locale}/sign-in`);
    } catch (error) {
        console.error('Error en logout action:', error);
        // Incluso con error, redirigir para evitar que el usuario se quede atascado
        redirect(`/${locale}/sign-in`);
    }
} 