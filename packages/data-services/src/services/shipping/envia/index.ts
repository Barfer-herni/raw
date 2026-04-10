/**
 * Punto de entrada principal del servicio de Envía
 * Re-exporta todo lo necesario desde los módulos individuales
 */



// Export service class
export { EnviaService } from './EnviaService';

// Export utilities
export { formatPhoneNumber, normalizeArgentinaState, validateAndCorrectArgentinaAddress } from './utils';

// Export config
export { getDefaultOriginAddress, DEFAULT_CARRIERS } from './config';

// Export modular functions
export { getShippingRates } from './rates';
export { getCheckoutShippingRates } from './checkout';

// Create default instance
import { EnviaService } from './EnviaService';
import type { EnviaConfig } from '../../../types/envia';

const defaultConfig: EnviaConfig = {
    apiKey: process.env.ENVIA_API_KEY || '',
    baseUrl: process.env.ENVIA_BASE_URL || 'https://api-test.envia.com',
    environment: 'sandbox',
};

export const enviaService = new EnviaService(defaultConfig);

// Helper function for Server Actions
import type { EnviaAddress, EnviaShippingRateResponse } from '../../../types/envia';

export async function getShippingRatesForCheckout(
    cartItems: Array<{
        quantity: number;
        unitPrice?: number;
        dimensions?: {
            alto: number;
            ancho: number;
            profundidad: number;
            peso: number;
        }
    }>,
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        name?: string;
        email?: string;
        phone?: string;
        number?: string;
    },
    carriers?: string[]
): Promise<EnviaShippingRateResponse> {
    const items = cartItems.map(item => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        dimensions: item.dimensions
    }));

    const destinationAddress: Partial<EnviaAddress> = {
        name: address.name,
        email: address.email,
        phone: address.phone,
        street: address.street,
        number: address.number,
        city: address.city,
        state: address.state,
        country: 'AR',
        postalCode: address.postalCode,
    };

    return enviaService.getCheckoutShippingRates(items, destinationAddress, carriers);
}
