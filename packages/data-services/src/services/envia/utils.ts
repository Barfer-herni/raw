/**
 * Utilidades para el servicio de Envía
 */

import type { EnviaAddress } from '../../types/envia';

/**
 * Formatea un número de teléfono al formato argentino (+54...)
 */
export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    if (cleaned.startsWith('+54')) {
        return cleaned;
    }
    if (cleaned.startsWith('54')) {
        return `+${cleaned}`;
    }

    if (cleaned.length >= 10) {
        return `+54${cleaned}`;
    }

    return phone;
}

/**
 * Normaliza el código de provincia de Argentina a formato de 2 letras
 */
export function normalizeArgentinaState(state: string): string {
    const stateMap: { [key: string]: string } = {
        'buenos aires': 'BA',
        'ciudad autónoma de buenos aires': 'C',
        'ciudad de buenos aires': 'C',
        'capital federal': 'C',
        'caba': 'C',
        'córdoba': 'CB',
        'santa fe': 'SF',
        'mendoza': 'MZ',
        'tucumán': 'TM',
        'entre ríos': 'ER',
        'salta': 'SA',
        'misiones': 'MN',
        'chaco': 'CC',
        'corrientes': 'CR',
        'santiago del estero': 'SE',
        'san juan': 'SJ',
        'jujuy': 'JY',
        'río negro': 'RN',
        'formosa': 'FM',
        'neuquén': 'NQ',
        'chubut': 'CT',
        'san luis': 'SL',
        'catamarca': 'CA',
        'la rioja': 'LR',
        'la pampa': 'LP',
        'santa cruz': 'SC',
        'tierra del fuego': 'TF',
        // Códigos directos también
        'ba': 'BA',
        'c': 'C',
        'cf': 'C',
        'cat': 'CA',
        'cha': 'CC',
        'chu': 'CT',
        'cor': 'CB',
        'er': 'ER',
        'for': 'FM',
        'juj': 'JY',
        'lp': 'LP',
        'lr': 'LR',
        'men': 'MZ',
        'mis': 'MN',
        'neu': 'NQ',
        'rn': 'RN',
        'sal': 'SA',
        'sj': 'SJ',
        'sl': 'SL',
        'sc': 'SC',
        'sf': 'SF',
        'se': 'SE',
        'tf': 'TF',
        'tuc': 'TM'
    };

    const normalized = state.toLowerCase().trim();
    const result = stateMap[normalized] || state.toUpperCase().substring(0, 2);

    return result;
}

/**
 * Valida y corrige automáticamente direcciones de Argentina
 * IMPORTANTE: Para CABA hay CPs con C (C1000) y sin C (1000-1429)
 * Reglas según Andreani:
 * - CP C1000-C1499 O 1000-1429 (sin C) → CABA → state = "BA"
 * - CP 1430-1999 → Provincia de Buenos Aires → state = "BA"
 */
export function validateAndCorrectArgentinaAddress(address: EnviaAddress): void {
    const cleanPostalCode = address.postalCode.replace(/\s/g, '');
    
    // CABA: CP con C (C1000-C1499) o sin C (1000-1429)
    // Andreani/Correo Argentino usan state="BA" para todo Buenos Aires
    if (cleanPostalCode.match(/^C1[0-4]\d{2}$/i) || cleanPostalCode.match(/^1[0-4][0-2]\d$/)) {
        if (address.state !== 'BA') {
            console.warn(`⚠️  CP ${cleanPostalCode} es de CABA, corrigiendo state de "${address.state}" a "BA"`);
            address.state = 'BA';
        }
    }
    // Provincia de Buenos Aires: CP 1430-1999
    else if (cleanPostalCode.match(/^1[4-9]\d{2}$/)) {
        if (address.state !== 'BA') {
            console.warn(`⚠️  CP ${cleanPostalCode} es de Provincia BA, corrigiendo state de "${address.state}" a "BA"`);
            address.state = 'BA';
        }
    }
}
