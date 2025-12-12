/**
 * Clase principal del servicio de Envía
 */

import type {
    EnviaAddress,
    EnviaShippingRateRequest,
    EnviaShippingRateResponse,
    EnviaConfig
} from '../../types/envia';
import { getShippingRates } from './rates';
import { getCheckoutShippingRates } from './checkout';

export class EnviaService {
    private config: EnviaConfig;

    constructor(config: EnviaConfig) {
        this.config = config;
    }

    /**
     * Obtiene tarifas de envío para un request específico
     */
    async getShippingRates(
        request: EnviaShippingRateRequest,
        carriers?: string[]
    ): Promise<EnviaShippingRateResponse> {
        return getShippingRates(this.config, request, carriers);
    }

    /**
     * Obtiene tarifas de envío para el checkout
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
        return getCheckoutShippingRates(this.config, items, destinationAddress, carriers);
    }
}
