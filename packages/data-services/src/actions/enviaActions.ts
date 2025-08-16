'use server';

import { getShippingRatesForCheckout } from '../services/enviaService';
import type { EnviaShippingRateResponse } from '../types/envia';

export interface CartItemForShipping {
    id: string;
    name: string;
    quantity: number;
    weight?: number; // Peso en kg
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

/**
 * Server Action para obtener opciones de envío en el checkout
 */
export async function getShippingOptionsAction(
    cartItems: CartItemForShipping[],
    address: ShippingAddress
): Promise<EnviaShippingRateResponse> {
    try {
        console.log('🚚 Obteniendo opciones de envío para:', {
            itemsCount: cartItems.length,
            destination: `${address.city}, ${address.state}`,
        });

        // Validar datos requeridos
        if (!address.street || !address.city || !address.state || !address.postalCode) {
            return {
                success: false,
                message: 'Dirección de envío incompleta. Completa todos los campos requeridos.',
            };
        }

        if (!cartItems || cartItems.length === 0) {
            return {
                success: false,
                message: 'No hay productos en el carrito.',
            };
        }

        // Llamar al servicio de Envía
        const result = await getShippingRatesForCheckout(cartItems, address);

        console.log('🚚 Respuesta de Envía:', result);

        return result;
    } catch (error) {
        console.error('🚚 Error obteniendo opciones de envío:', error);
        return {
            success: false,
            message: 'Error interno del servidor. Intenta nuevamente más tarde.',
        };
    }
}

/**
 * Server Action para obtener opciones de envío de respaldo (fallback)
 * En caso de que la API de Envía no esté disponible
 */
export async function getFallbackShippingOptionsAction(
    totalWeight?: number
): Promise<EnviaShippingRateResponse> {
    console.log('🚚 Usando opciones de envío de respaldo');

    // Opciones de envío hardcodeadas como respaldo (simulando tus operadores configurados)
    const fallbackOptions = [
        {
            carrier: 'OCA',
            service: 'Envío Estándar - OCA',
            cost: 2500,
            currency: 'ARS',
            delivery_estimate: '2-4 días hábiles',
            delivery_time: {
                min_days: 2,
                max_days: 4,
            },
        },
        {
            carrier: 'Andreani',
            service: 'Envío Express - Andreani',
            cost: 3200,
            currency: 'ARS',
            delivery_estimate: '1-3 días hábiles',
            delivery_time: {
                min_days: 1,
                max_days: 3,
            },
        },
        {
            carrier: 'Correo Argentino',
            service: 'Envío Nacional - Correo Argentino',
            cost: 1800,
            currency: 'ARS',
            delivery_estimate: '3-7 días hábiles',
            delivery_time: {
                min_days: 3,
                max_days: 7,
            },
        },
    ];

    return {
        success: true,
        data: fallbackOptions,
    };
}
