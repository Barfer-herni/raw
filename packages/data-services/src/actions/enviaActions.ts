'use server';

import { getShippingRatesForCheckout } from '../services/enviaService';
import type { EnviaShippingRateResponse } from '../types/envia';

export interface CartItemForShipping {
    id: string;
    name: string;
    quantity: number;
    weight?: number;
}

export interface ShippingAddress {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
}

export async function getShippingOptionsAction(
    cartItems: CartItemForShipping[],
    address: ShippingAddress
): Promise<EnviaShippingRateResponse> {
    try {
        if (!address.street || !address.city || !address.state || !address.postalCode) {
            console.error('❌ Dirección incompleta');
            return {
                success: false,
                message: 'Dirección de envío incompleta.',
            };
        }

        if (!cartItems || cartItems.length === 0) {
            console.error('❌ Carrito vacío');
            return {
                success: false,
                message: 'No hay productos en el carrito.',
            };
        }

        const result = await getShippingRatesForCheckout(cartItems, address);
        return result;
    } catch (error) {
        console.error('❌ Error en getShippingOptionsAction:', error instanceof Error ? error.message : error);
        return {
            success: false,
            message: 'Error interno del servidor.',
        };
    }
}
