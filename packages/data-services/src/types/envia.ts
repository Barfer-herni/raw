/**
 * Tipos para la integración con Envía
 * Este archivo NO contiene lógica de servidor y es safe para componentes cliente
 */

export interface EnviaAddress {
    name: string;
    company?: string;
    email: string;
    phone: string;
    street: string;
    number?: string;
    district: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    reference?: string;
}

export interface EnviaPackage {
    content: string;
    amount: number;
    type: 'box' | 'envelope' | 'pak';
    weight: number;
    dimensions: {
        large: number; // cm
        width: number; // cm
        height: number; // cm
    };
}

export interface EnviaShippingOption {
    carrier: string;
    service: string;
    cost: number;
    currency: string;
    delivery_estimate: string;
    delivery_time?: {
        min_days: number;
        max_days: number;
    };
}

export interface EnviaShippingRateRequest {
    origin: EnviaAddress;
    destination: EnviaAddress;
    packages: EnviaPackage[];
}

export interface EnviaShippingRateResponse {
    success: boolean;
    message?: string;
    data?: EnviaShippingOption[];
}

export interface EnviaConfig {
    apiKey: string;
    baseUrl: string;
    environment: 'sandbox' | 'production';
}
