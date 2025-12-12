/**
 * Servicio para obtener tarifas de envío
 */

import type {
    EnviaAddress,
    EnviaPackage,
    EnviaShippingOption,
    EnviaShippingRateRequest,
    EnviaShippingRateResponse,
    EnviaConfig
} from '../../types/envia';
import { validateAndCorrectArgentinaAddress } from './utils';
import { DEFAULT_CARRIERS } from './config';

/**
 * Obtiene tarifas de envío desde la API de Envía
 */
export async function getShippingRates(
    config: EnviaConfig,
    request: EnviaShippingRateRequest,
    carriers?: string[]
): Promise<EnviaShippingRateResponse> {
    try {
        // Validar configuración
        if (!config.apiKey) {
            console.error('❌ [ENVIA] API Key no configurada');
            return {
                success: false,
                message: 'API Key de Envía no configurada. Revisa la variable ENVIA_API_KEY.',
            };
        }

        if (request.origin.country !== request.destination.country) {
            console.error(`❌ [ENVIA] País origen (${request.origin.country}) ≠ destino (${request.destination.country})`);
            return {
                success: false,
                message: `País de origen y destino deben ser iguales.`,
            };
        }

        // Validar y corregir direcciones de Argentina automáticamente
        if (request.origin.country === 'AR') {
            validateAndCorrectArgentinaAddress(request.origin);
        }
        if (request.destination.country === 'AR') {
            validateAndCorrectArgentinaAddress(request.destination);
        }

        const carriersToUse = carriers || DEFAULT_CARRIERS;
        let allRates: EnviaShippingOption[] = [];

        for (const carrier of carriersToUse) {
            // Formatear request según el ejemplo que funciona (sin district, reference, company)
            const requestBody = {
                origin: {
                    name: request.origin.name,
                    phone: request.origin.phone,
                    city: request.origin.city,
                    state: request.origin.state,
                    country: request.origin.country,
                    postalCode: request.origin.postalCode
                },
                destination: {
                    name: request.destination.name,
                    phone: request.destination.phone,
                    city: request.destination.city,
                    state: request.destination.state,
                    country: request.destination.country,
                    postalCode: request.destination.postalCode
                },
                packages: request.packages.map(pkg => ({
                    type: pkg.type,
                    content: pkg.content,
                    amount: pkg.amount,
                    declaredValue: 80000,
                    lengthUnit: 'CM',
                    weightUnit: 'KG',
                    weight: pkg.weight,
                    dimensions: {
                        length: pkg.dimensions.length,
                        width: pkg.dimensions.width,
                        height: pkg.dimensions.height
                    }
                })),
                shipment: {
                    type: 1,
                    carrier: carrier
                }
            };

            console.log('Request Body:', JSON.stringify(requestBody, null, 2));

            const apiUrl = config.baseUrl ? `${config.baseUrl}/ship/rate` : 'https://api-test.envia.com/ship/rate';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
            });

            let data = null;
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`❌ [${carrier.toUpperCase()}] HTTP ${response.status}:`, errorData);
                continue;
            } else {
                data = await response.json();

                if (data.meta === 'error') {
                    console.error(`❌ [${carrier.toUpperCase()}] ${data.error?.message || 'Error'} (code: ${data.error?.code})`);
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

        return {
            success: true,
            data: allRates,
        };
    } catch (error) {
        console.error('❌ [ENVIA] Error crítico:', error instanceof Error ? error.message : error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}
