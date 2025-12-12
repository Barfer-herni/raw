/**
 * Configuración por defecto para el origen de envíos
 * Santiago Plaul 2745, Lanús, Buenos Aires
 */

import type { EnviaAddress } from '../../types/envia';

/**
 * Obtiene la dirección de origen configurada desde las variables de entorno
 * o usa valores por defecto de Lanús
 */
export function getDefaultOriginAddress(): EnviaAddress {
    return {
        name: process.env.STORE_ORIGIN_NAME || 'Raw and Fun',
        company: process.env.STORE_ORIGIN_NAME || 'Raw and Fun',
        email: process.env.STORE_ORIGIN_EMAIL || 'rawfun.info@gmail.com',
        phone: process.env.STORE_ORIGIN_PHONE || '+5411128678999',
        street: process.env.STORE_ORIGIN_STREET || 'Santiago Plaul',
        number: process.env.STORE_ORIGIN_NUMBER || '2745',
        district: process.env.STORE_ORIGIN_DISTRICT || '',
        city: process.env.STORE_ORIGIN_CITY || 'Lanús',
        state: 'BA',
        country: process.env.STORE_ORIGIN_COUNTRY || 'AR',
        postalCode: process.env.STORE_ORIGIN_POSTAL_CODE || '1824',
    };
}

/**
 * Carriers disponibles por defecto
 */
export const DEFAULT_CARRIERS = ['andreani', 'correoargentino'];
