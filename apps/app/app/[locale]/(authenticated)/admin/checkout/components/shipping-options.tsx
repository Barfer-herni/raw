'use client';

import { useState, useEffect } from 'react';
import { getShippingOptionsAction, getFallbackShippingOptionsAction, type EnviaShippingOption } from '@repo/data-services/src/client-safe';

interface CartItem {
    id: string;
    name: string;
    quantity: number;
    dimensions?: {
        alto: number;
        ancho: number;
        profundidad: number;
        peso: number;
    };
}

interface ShippingAddress {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
}

interface ShippingOptionsProps {
    cartItems: CartItem[];
    address: ShippingAddress;
    onShippingSelect: (option: EnviaShippingOption | null) => void;
    selectedOption: EnviaShippingOption | null;
}

export function ShippingOptions({ cartItems, address, onShippingSelect, selectedOption }: ShippingOptionsProps) {
    const [shippingOptions, setShippingOptions] = useState<EnviaShippingOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Función para verificar si la dirección está completa
    const isAddressComplete = () => {
        return address.street && address.city && address.state && address.postalCode;
    };

    // Función para obtener las opciones de envío
    const fetchShippingOptions = async () => {
        if (!isAddressComplete() || cartItems.length === 0) {
            setShippingOptions([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('🚚 Obteniendo opciones de envío...');
            
            // Intentar obtener opciones reales de Envía
            const result = await getShippingOptionsAction(cartItems, address);
            
            if (result.success && result.data && result.data.length > 0) {
                console.log('🚚 Opciones de Envía obtenidas:', result.data);
                setShippingOptions(result.data);
            } else {
                // Si no hay opciones o hay error, usar opciones de respaldo
                console.log('🚚 Usando opciones de respaldo');
                const fallbackResult = await getFallbackShippingOptionsAction();
                
                if (fallbackResult.success && fallbackResult.data) {
                    setShippingOptions(fallbackResult.data);
                } else {
                    setError('No se pudieron obtener opciones de envío. Intenta nuevamente.');
                    setShippingOptions([]);
                }
            }
        } catch (error) {
            console.error('🚚 Error obteniendo opciones de envío:', error);
            
            // En caso de error, usar opciones de respaldo
            try {
                const fallbackResult = await getFallbackShippingOptionsAction();
                if (fallbackResult.success && fallbackResult.data) {
                    setShippingOptions(fallbackResult.data);
                } else {
                    setError('No se pudieron obtener opciones de envío. Intenta nuevamente.');
                    setShippingOptions([]);
                }
            } catch (fallbackError) {
                setError('Error obteniendo opciones de envío. Intenta nuevamente.');
                setShippingOptions([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Efecto para obtener opciones cuando cambie la dirección o el carrito
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchShippingOptions();
        }, 500); // Debounce de 500ms

        return () => clearTimeout(timeoutId);
    }, [address.street, address.city, address.state, address.postalCode, cartItems.length]);

    // Función para formatear el precio
    const formatPrice = (price: number, currency: string = 'ARS') => {
        if (price === 0) return 'Gratis';
        return `$${price.toFixed(0)} ${currency}`;
    };

    // Función para obtener el ícono del servicio
    const getServiceIcon = (carrier: string, service: string) => {
        if (service.toLowerCase().includes('retiro') || service.toLowerCase().includes('pickup')) {
            return '🏪';
        }
        if (service.toLowerCase().includes('express') || service.toLowerCase().includes('rápido')) {
            return '⚡';
        }
        return '📦';
    };

    // Si la dirección no está completa, mostrar mensaje
    if (!isAddressComplete()) {
        return (
            <div className="bg-barfer-white rounded-xl shadow-lg border-2 border-barfer-green p-6">
                <h2 className="text-2xl font-bold text-gray-900 font-poppins mb-4">
                    Opciones de Envío
                </h2>
                <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-600 text-lg">
                        Completa tu dirección de entrega para ver las opciones de envío disponibles
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-barfer-white rounded-xl shadow-lg border-2 border-barfer-green p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-poppins">
                    Opciones de Envío
                </h2>
                {isLoading && (
                    <div className="flex items-center text-barfer-green">
                        <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Consultando opciones...
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                    <button
                        onClick={fetchShippingOptions}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium underline"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {shippingOptions.length === 0 && !isLoading && !error && (
                <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293L15 17H9l-4.707-3.707A1 1 0 003.586 13H1" />
                    </svg>
                    <p className="text-gray-600 text-lg">
                        No hay opciones de envío disponibles para esta dirección
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {shippingOptions.map((option, index) => (
                    <div
                        key={index}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                            selectedOption === option
                                ? 'border-barfer-green bg-green-50'
                                : 'border-gray-200 hover:border-barfer-green'
                        }`}
                        onClick={() => onShippingSelect(option)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        checked={selectedOption === option}
                                        onChange={() => onShippingSelect(option)}
                                        className="w-4 h-4 text-barfer-green border-gray-300 focus:ring-barfer-green"
                                    />
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">
                                        {getServiceIcon(option.carrier, option.service)}
                                    </span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {option.carrier}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {option.service}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold text-lg ${
                                    option.cost === 0 ? 'text-green-600' : 'text-barfer-orange'
                                }`}>
                                    {formatPrice(option.cost, option.currency)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {option.delivery_estimate}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {shippingOptions.length > 0 && !selectedOption && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                        ⚠️ Selecciona una opción de envío para continuar
                    </p>
                </div>
            )}
        </div>
    );
}
