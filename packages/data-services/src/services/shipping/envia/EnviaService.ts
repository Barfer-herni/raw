import type { EnviaConfig, EnviaAddress, EnviaShippingRateResponse } from '../../../types/envia';
import { getCheckoutShippingRates } from './checkout';

export class EnviaService {
    private config: EnviaConfig;

    constructor(config: EnviaConfig) {
        this.config = config;
    }

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
        destination: Partial<EnviaAddress>,
        carriers?: string[]
    ): Promise<EnviaShippingRateResponse> {
        return getCheckoutShippingRates(this.config, items, destination, carriers);
    }
}

