/**
 * Servicio para checkout - prepara las tarifas de envío desde el carrito
 */

import type { EnviaAddress, EnviaPackage, EnviaShippingRateResponse } from '../../../types/envia';
import { formatPhoneNumber, normalizeArgentinaState } from './utils';
import { getDefaultOriginAddress } from './config';
import { getShippingRates } from './rates';
import type { EnviaConfig } from '../../../types/envia';

/**
 * Obtiene tarifas para el checkout basadas en el carrito y dirección de destino
 */
export async function getCheckoutShippingRates(
    config: EnviaConfig,
    items: Array<{
        quantity: number;
        unitPrice?: number;
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

    // Consolidar todos los productos en UN SOLO paquete para reducir costos
    // Los carriers cobran por bulto, así que enviamos todo junto
    let totalWeight = 0;
    let totalDeclaredValue = 0;
    let maxLength = 20;
    let maxWidth = 15;
    let maxHeight = 10;

    for (const item of items) {
        // Sumar peso total: peso unitario × cantidad
        const itemWeight = item.dimensions?.peso || 0.1; // kg directamente
        totalWeight += itemWeight * item.quantity;

        // Sumar valor declarado: precio × cantidad
        totalDeclaredValue += (item.unitPrice || 0) * item.quantity;

        // Usar las dimensiones más grandes como referencia de la caja
        if (item.dimensions) {
            maxLength = Math.max(maxLength, item.dimensions.profundidad);
            maxWidth = Math.max(maxWidth, item.dimensions.ancho);
            maxHeight = Math.max(maxHeight, item.dimensions.alto);
        }
    }

    const packages: EnviaPackage[] = [{
        content: 'Pedido completo',
        amount: 1, // 1 solo bulto
        type: 'box' as const,
        weight: Math.max(totalWeight, 0.1), // Mínimo 100g
        dimensions: {
            length: Math.max(maxLength, 10),
            width: Math.max(maxWidth, 10),
            height: Math.max(maxHeight, 10),
        },
        declaredValue: Math.max(totalDeclaredValue, 1000), // Mínimo 1000 ARS
    }];

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
