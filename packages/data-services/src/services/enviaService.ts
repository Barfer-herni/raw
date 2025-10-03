/**
 * Servicio para integración con la API de Envía
 * Documentación: https://help.envia.com/api/
 */

// Re-export types for easier access
export type {
    EnviaAddress,
    EnviaPackage,
    EnviaShippingOption,
    EnviaShippingRateRequest,
    EnviaShippingRateResponse,
    EnviaConfig
} from '../types/envia';

import type {
    EnviaAddress,
    EnviaPackage,
    EnviaShippingOption,
    EnviaShippingRateRequest,
    EnviaShippingRateResponse,
    EnviaConfig
} from '../types/envia';

class EnviaService {
    private config: EnviaConfig;

    constructor(config: EnviaConfig) {
        this.config = config;
    }

    private formatPhoneNumber(phone: string): string {
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

    private normalizeArgentinaState(state: string): string {
        const stateMap: { [key: string]: string } = {
            'buenos aires': 'BA',
            'ciudad autónoma de buenos aires': 'CF',
            'ciudad de buenos aires': 'CF',
            'capital federal': 'CF',
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
            'tierra del fuego': 'TF'
        };

        const normalized = state.toLowerCase().trim();
        const result = stateMap[normalized] || state.toUpperCase();
        return result;
    }
    async getShippingRates(request: EnviaShippingRateRequest, carriers?: string[]): Promise<EnviaShippingRateResponse> {
        try {
            // Validar configuración
            if (!this.config.apiKey) {
                return {
                    success: false,
                    message: 'API Key de Envía no configurada. Revisa la variable ENVIA_API_KEY.',
                };
            }

            if (request.origin.country !== request.destination.country) {
                return {
                    success: false,
                    message: `Error de configuración: País de origen (${request.origin.country}) y destino (${request.destination.country}) deben ser iguales para Envía Argentina.`,
                };
            }

            // console.dir({
            //     '🚚 Envía API Request (DATOS REALES)': {
            //         url: `https://ship-test.envia.com/ship/rate`,
            //         environment: this.config.environment,
            //         hasApiKey: !!this.config.apiKey,
            //         apiKeyLength: this.config.apiKey.length,
            //         origin: request.origin,
            //         destination: request.destination,
            //         packages: request.packages
            //     }
            // }, { depth: null });

            const carriersToUse = carriers || ["oca", "andreani"];
            let allRates: EnviaShippingOption[] = [];

            for (const carrier of carriersToUse) {
                const requestPerCarrier = {
                    ...request,
                    shipment: {
                        carrier: carrier,
                        type: 1
                    },
                    settings: {
                        currency: "ARS"
                    },
                    origin: {
                        ...request.origin,
                        company: request.origin.company || request.origin.name
                    },
                    destination: {
                        ...request.destination,
                        company: request.destination.company || request.destination.name
                    }
                };

                console.dir( requestPerCarrier , { depth: null });

                const response = await fetch(`https://api.envia.com/ship/rate`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer 2295e529c604bdfe031bed210952f35ea19e64aaf0e3076e4341df4eb07753dd',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestPerCarrier),
                });

                console.log(response)

                // console.log(`🚚 Envía API Response para ${carrier}:`, response);

                let data = null;
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error(`🚚 Envía API Error para ${carrier}:`, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: Object.fromEntries(response.headers.entries()),
                        errorData
                    });
                    continue;
                } else {
                    data = await response.json();
                    if (data.meta === 'error') {
                        console.warn(`🚚 ${carrier} devolvió error:`, data.error?.message || 'Error desconocido');
                        continue;
                    }
                }

                const shippingOptions: EnviaShippingOption[] = data.data?.map((option: any) => ({
                    carrier: option.carrierDescription || option.carrier,
                    service: option.serviceDescription || option.service,
                    cost: parseFloat(option.totalPrice || option.cost || 0),
                    currency: option.currency || 'ARS',
                    delivery_estimate: option.deliveryEstimate || option.delivery_estimate || 'N/A',
                    delivery_time: option.delivery_time ? {
                        min_days: option.delivery_time.min_days || 1,
                        max_days: option.delivery_time.max_days || 7,
                    } : undefined,
                })) || [];

                allRates = allRates.concat(shippingOptions);
            }
            /// all states
            const response = await fetch('https://queries-test.envia.com/state?country_code=AR', {
                headers: {
                    'Authorization': '4c9edb0dbcd779e7d6dba37d48ed02031c80e6ffdf4c0421f699b16c39cb7d1c', // sin Bearer
                    'Content-Type': 'application/json'
                }
            });
            // console.log('🚚 Respuesta de Envía:', response);
            if (!response.ok) {
                const text = await response.text();
                console.error('🚚 Respuesta de Envía:', text);
                throw new Error(`No se pudo obtener estados de Argentina, status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: allRates,
            };
        } catch (error) {
            console.error('Error obteniendo tarifas de Envía:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido',
            };
        }
    }

    /**
     * Obtiene tarifas para el checkout basadas en el carrito y dirección
     */
    async getCheckoutShippingRates(
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
        // Dirección de origen por defecto (configurable)
        const origin: EnviaAddress = {
            name: process.env.STORE_ORIGIN_NAME || 'Raw and Fun',
            company: process.env.STORE_ORIGIN_NAME || 'Raw and Fun',
            email: process.env.STORE_ORIGIN_EMAIL || 'rawfun.info@gmail.com',
            phone: process.env.STORE_ORIGIN_PHONE || '+5411128678999',
            street: process.env.STORE_ORIGIN_STREET || 'Piñeyro',
            number: process.env.STORE_ORIGIN_NUMBER || '59',
            district: process.env.STORE_ORIGIN_DISTRICT || 'Avellaneda',
            city: process.env.STORE_ORIGIN_CITY || 'Avellaneda',
            // state: process.env.STORE_ORIGIN_STATE || 'CABA',
            state: 'BA',
            country: process.env.STORE_ORIGIN_COUNTRY || 'AR',
            postalCode: process.env.STORE_ORIGIN_POSTAL_CODE || '1868',
        };

        // Crear un paquete individual para cada producto con sus dimensiones específicas
        const packages: EnviaPackage[] = items.map((item, index) => {
            // console.log(`📦 Procesando item ${index + 1}:`, {
            //     weight: item.dimensions?.peso,
            //     dimensions: item.dimensions,
            //     quantity: item.quantity
            // });

            // Usar las dimensiones del producto si están disponibles, sino usar valores por defecto
            const dimensions = item.dimensions ? {
                length: Math.max(item.dimensions.profundidad, 1), // profundidad como length
                width: Math.max(item.dimensions.ancho, 1),
                height: Math.max(item.dimensions.alto, 1)
            } : {
                length: 20,
                width: 15,
                height: 10
            };

            // console.log(`📦 Peso del producto ${index + 1}:`, item.dimensions?.peso); 
            const packageData = {
                content: `Producto ${index + 1}`,
                amount: item.quantity,
                type: 'box' as const,
                weight: (item.dimensions?.peso || 50) / 1000, // Convertir gramos a kg
                dimensions: dimensions,
            };

            // console.log(`📦 Paquete creado ${index + 1}:`, packageData);

            return packageData;
        });

        // Crear dirección de destino completa
        const destination: EnviaAddress = {
            name: destinationAddress.name || 'Cliente',
            email: destinationAddress.email || 'cliente@email.com',
            phone: this.formatPhoneNumber(destinationAddress.phone || '+541112345678'),
            street: destinationAddress.street || '',
            number: destinationAddress.number || '100', // Usar el número real si está disponible
            district: destinationAddress.district || 'Centro',
            city: destinationAddress.city || '',
            state: this.normalizeArgentinaState(destinationAddress.state || ''),
            country: 'AR', // Siempre Argentina para consistencia
            postalCode: destinationAddress.postalCode || '',
            reference: destinationAddress.reference,
        };

        return this.getShippingRates({
            origin,
            destination,
            packages,
        }, carriers);
    }
}

const defaultConfig: EnviaConfig = {
    apiKey: process.env.ENVIA_API_KEY || '',
    baseUrl: process.env.ENVIA_BASE_URL || 'https://api.envia.com',
    environment: 'sandbox',
};

export const enviaService = new EnviaService(defaultConfig);

// Función helper para uso en Server Actions
export async function getShippingRatesForCheckout(
    cartItems: Array<{
        quantity: number;
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
    // Mapear cada item del carrito manteniendo sus dimensiones y peso individuales
    const items = cartItems.map(item => ({
        quantity: item.quantity,
        dimensions: item.dimensions // Mantener las dimensiones específicas del producto (incluye peso)
    }));

    const destinationAddress: Partial<EnviaAddress> = {
        name: address.name,
        email: address.email,
        phone: address.phone,
        street: address.street,
        number: address.number, // Incluir número de dirección
        city: address.city,
        state: address.state,
        country: 'AR',
        postalCode: address.postalCode,
    };

    return enviaService.getCheckoutShippingRates(items, destinationAddress, carriers);
}

export { EnviaService };
