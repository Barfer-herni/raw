/**
 * Servicio para checkout - prepara las tarifas de envío desde el carrito
 */

import type { EnviaAddress, EnviaPackage, EnviaShippingRateResponse } from '../../types/envia';
import { formatPhoneNumber, normalizeArgentinaState } from './utils';
import { getDefaultOriginAddress } from './config';
import { getShippingRates } from './rates';
import type { EnviaConfig } from '../../types/envia';

/**
 * Obtiene tarifas para el checkout basadas en el carrito y dirección de destino
 */
export async function getCheckoutShippingRates(
    config: EnviaConfig,
    items: Array<{
        quantity: number;
        dimensions?: {
            alto: number;
            ancho: number;
            profundidad: number;
            peso: number;
        }
    }>,
    destinationAddress: Partial<EnviaAddress>,
    carriers?: string[]
): Promise<EnviaShippingRateResponse> {
    // Usar dirección de origen por defecto (Lanús)
    const origin = getDefaultOriginAddress();

    // Crear un paquete individual para cada producto con sus dimensiones específicas
    const packages: EnviaPackage[] = items.map((item, index) => {
        // Usar las dimensiones del producto si están disponibles, sino usar valores por defecto
        const dimensions = item.dimensions ? {
            length: Math.max(item.dimensions.profundidad, 10), // Mínimo 10cm
            width: Math.max(item.dimensions.ancho, 10),
            height: Math.max(item.dimensions.alto, 10)
        } : {
            length: 20,
            width: 15,
            height: 10
        };

        const packageData = {
            content: `Producto ${index + 1}`,
            amount: item.quantity,
            type: 'box' as const,
            weight: Math.max((item.dimensions?.peso || 50) / 1000, 0.1), // Mínimo 100g (0.1kg)
            dimensions: dimensions,
        };

        return packageData;
    });

    // Crear dirección de destino completa
    const destination: EnviaAddress = {
        name: destinationAddress.name || 'Cliente',
        email: destinationAddress.email || 'cliente@email.com',
        phone: formatPhoneNumber(destinationAddress.phone || '+541112345678'),
        street: destinationAddress.street || '',
        number: destinationAddress.number || '100',
        district: destinationAddress.district || 'Centro',
        city: destinationAddress.city || '',
        state: normalizeArgentinaState(destinationAddress.state || ''),
        country: 'AR',
        postalCode: destinationAddress.postalCode || '',
        reference: destinationAddress.reference,
    };

    return getShippingRates(config, {
        origin,
        destination,
        packages,
    }, carriers);
}
