import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@repo/auth/server';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        
        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no autenticado' },
                { status: 401 }
            );
        }

        // Retornar datos del usuario sin información sensible
        return NextResponse.json({
            id: user.id,
            name: user.name || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || {
                street: '',
                apartment: '',
                city: '',
                province: '',
                postalCode: '',
                notes: ''
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
