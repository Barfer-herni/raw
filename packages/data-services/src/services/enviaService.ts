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

    /**
     * Normaliza el formato de teléfono para Argentina
     */
    private formatPhoneNumber(phone: string): string {
        // Remover espacios y caracteres especiales
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');

        // Si ya tiene código de país, devolverlo
        if (cleaned.startsWith('+54')) {
            return cleaned;
        }

        // Si empieza con 54, agregar +
        if (cleaned.startsWith('54')) {
            return `+${cleaned}`;
        }

        // Si es número local argentino, agregar código de país
        if (cleaned.length >= 10) {
            return `+54${cleaned}`;
        }

        return phone; // Devolver original si no se puede formatear
    }

    /**
     * Normaliza códigos de estado/provincia para Argentina
     */
    private normalizeArgentinaState(state: string): string {
        const stateMap: { [key: string]: string } = {
            'buenos aires': 'BA',
            'ciudad autónoma de buenos aires': 'CABA',
            'ciudad de buenos aires': 'CABA',
            'capital federal': 'CABA',
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
        return stateMap[normalized] || state.toUpperCase();
    }

    /**
     * Obtiene las tarifas de envío disponibles
     */
    async getShippingRates(request: EnviaShippingRateRequest): Promise<EnviaShippingRateResponse> {
        try {
            // Validar configuración
            if (!this.config.apiKey) {
                return {
                    success: false,
                    message: 'API Key de Envía no configurada. Revisa la variable ENVIA_API_KEY.',
                };
            }
    
            // Validar que ambos países sean iguales
            if (request.origin.country !== request.destination.country) {
                return {
                    success: false,
                    message: `Error de configuración: País de origen (${request.origin.country}) y destino (${request.destination.country}) deben ser iguales para Envía Argentina.`,
                };
            }
    
            console.log('🚚 Envía API Request (HARDCODE):', {
                url: `${this.config.baseUrl}/ship/rate`,
                environment: this.config.environment,
                hasApiKey: !!this.config.apiKey,
                apiKeyLength: this.config.apiKey.length
            });
    
            const hardcodedRequest = {
                origin: {
                    name: "Raw and Fun",
                    company: "Raw and Fun",
                    email: "rawfun.info@gmail.com",
                    phone: "+5411128678999",
                    street: "Piñeyro",
                    number: "59",
                    district: "Avellaneda",
                    city: "Avellaneda",
                    state: "BA",
                    country: "AR",
                    postalCode: "1868",
                    reference: "",
                    coordinates: {
                        latitude: "-34.6746",
                        longitude: "-58.3731"
                    }
                },
                destination: {
                    name: "Admin",
                    company: "",
                    email: "admin@example.com",
                    phone: "+541234567890",
                    street: "Rodriguez Peña",
                    number: "100",
                    district: "Centro",
                    city: "Buenos Aires",
                    state: "BA",
                    country: "AR",
                    postalCode: "1020",
                    reference: "",
                    coordinates: {
                        latitude: "-34.6037",
                        longitude: "-58.3816"
                    }
                },
                packages: [
                    {
                        content: "Productos para mascotas",
                        amount: 1,
                        type: "box",
                        weight: 1, // peso en KG
                        insurance: 0,
                        declaredValue: 0,
                        weightUnit: "KG",
                        lengthUnit: "CM",
                        dimensions: {
                            length: 30,
                            width: 25,
                            height: 15
                        }
                    }
                ],
                shipment: {
                    carrier: "", // Se reemplazará dinámicamente
                    type: 1
                },
                settings: {
                    currency: "ARS"
                }
            };
    
            const carriers = ["oca", "andreani", "correo", "correo-argentino", "ca"];
            let allRates: EnviaShippingOption[] = [];
    
            for (const carrier of carriers) {
                const requestPerCarrier = {
                    ...hardcodedRequest,
                    shipment: {
                        ...hardcodedRequest.shipment,
                        carrier: carrier
                    }
                };
    
                const response = await fetch(`${this.config.baseUrl}/ship/rate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`,
                    },
                    body: JSON.stringify(requestPerCarrier),
                });
    
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
                    console.log(`🚚 Envía API Response para ${carrier}:`, data);
                    
                    // Log adicional para debug
                    if (data.data && data.data.length > 0) {
                        console.log(`🚚 ${carrier} devolvió ${data.data.length} opciones`);
                        data.data.forEach((option: any, index: number) => {
                            console.log(`   ${index + 1}. ${option.carrierDescription || option.carrier} - ${option.serviceDescription || option.service} - $${option.totalPrice}`);
                        });
                    } else {
                        console.log(`🚚 ${carrier} no devolvió opciones`);
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
        items: Array<{ weight: number; quantity: number }>,
        destinationAddress: Partial<EnviaAddress>
    ): Promise<EnviaShippingRateResponse> {
        // Dirección de origen por defecto (configurable)
        const origin: EnviaAddress = {
            name: process.env.STORE_ORIGIN_NAME || 'Raw and Fun',
            company: process.env.STORE_ORIGIN_NAME || 'Raw and Fun',
            email: process.env.STORE_ORIGIN_EMAIL || 'rawfun.info@gmail.com',
            phone: process.env.STORE_ORIGIN_PHONE || '+5411128678999',
            street: process.env.STORE_ORIGIN_STREET || 'Av. Corrientes',
            number: process.env.STORE_ORIGIN_NUMBER || '1234',
            district: process.env.STORE_ORIGIN_DISTRICT || 'Centro',
            city: process.env.STORE_ORIGIN_CITY || 'Buenos Aires',
            state: process.env.STORE_ORIGIN_STATE || 'CABA',
            country: process.env.STORE_ORIGIN_COUNTRY || 'AR',
            postalCode: process.env.STORE_ORIGIN_POSTAL_CODE || '1000',
        };

        // Calcular peso total y crear paquete
        const totalWeight = items.reduce((total, item) => {
            return total + (item.weight * item.quantity);
        }, 0);

        // Si no hay peso especificado, usar peso promedio por artículo
        const defaultWeight = totalWeight > 0 ? totalWeight : items.length * 0.5; // 500g por artículo por defecto

        const packages: EnviaPackage[] = [{
            content: 'Productos para mascotas',
            amount: 1,
            type: 'box',
            weight: Math.max(defaultWeight, 0.1), // Mínimo 100g
            dimensions: {
                large: 30,
                width: 25,
                height: 15,
            },
        }];

        // Crear dirección de destino completa
        const destination: EnviaAddress = {
            name: destinationAddress.name || 'Cliente',
            email: destinationAddress.email || 'cliente@email.com',
            phone: this.formatPhoneNumber(destinationAddress.phone || '+541112345678'),
            street: destinationAddress.street || '',
            number: '100', // Envía requiere number, usar valor por defecto
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
        });
    }
}

// Configuración por defecto
const defaultConfig: EnviaConfig = {
    apiKey: process.env.ENVIA_API_KEY || '',
    baseUrl: process.env.ENVIA_BASE_URL || 'https://api.envia.com',
    environment: (process.env.ENVIA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
};

// Instancia singleton del servicio
export const enviaService = new EnviaService(defaultConfig);

// Función helper para uso en Server Actions
export async function getShippingRatesForCheckout(
    cartItems: Array<{ weight?: number; quantity: number }>,
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        name?: string;
        email?: string;
        phone?: string;
    }
): Promise<EnviaShippingRateResponse> {
    const items = cartItems.map(item => ({
        weight: item.weight || 0.5, // Peso por defecto si no se especifica
        quantity: item.quantity,
    }));

    const destinationAddress: Partial<EnviaAddress> = {
        name: address.name,
        email: address.email,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        country: 'AR',
        postalCode: address.postalCode,
    };

    return enviaService.getCheckoutShippingRates(items, destinationAddress);
}

export { EnviaService };
