'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface Product {
    id: string;
    name: string;
    description: string;
    priceRange: string;
    category: string;
    image: string;
    stock: number;
    // Campos para precios de oferta
    originalPrice?: string;  // Precio original (se mostrará tachado)
    offerPrice?: string;     // Precio de oferta (se mostrará destacado)
    isOnOffer?: boolean;     // Si el producto está en oferta
    // Campos para envío        // Peso en kg
    dimensions?: {           // Dimensiones en cm
        alto: number;
        ancho: number;
        profundidad: number;
        peso: number;
    };
}

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    checkout: () => void;
    clearCart: () => void;
    showNotification: (productName: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children, locale }: { children: ReactNode; locale: string }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const router = useRouter();

    // Cargar carrito desde localStorage al inicializar
    useEffect(() => {
        if (typeof window === 'undefined' || !window.localStorage) {
            return;
        }
        try {
            const savedCart = localStorage.getItem('barfer-cart');
            if (savedCart && savedCart !== 'undefined' && savedCart !== 'null') {
                const parsedCart = JSON.parse(savedCart);

                if (Array.isArray(parsedCart)) {
                    setCart(parsedCart);
                } else {
                    setCart([]);
                }
            } else {
                setCart([]);
            }
        } catch (error) {
            setCart([]);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    // Guardar carrito en localStorage cada vez que cambie
    useEffect(() => {
        // Solo guardar si el contexto ha sido inicializado para evitar sobreescribir con el estado inicial vacío
        if (isInitialized) {
            try {
                localStorage.setItem('barfer-cart', JSON.stringify(cart));
            } catch (error) {
            }
        }
    }, [cart, isInitialized]);

    const addToCart = (product: Product, quantity: number = 1) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                const newCart = prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
                return newCart;
            } else {
                const newCart = [...prevCart, { ...product, quantity }];
                return newCart;
            }
        });
    };

    const showNotification = (productName: string, quantity: number) => {
    };

    const removeFromCart = (productId: string) => {
        setCart(prevCart => {
            const newCart = prevCart.filter(item => item.id !== productId);
            return newCart;
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prevCart => {
            const newCart = prevCart.map(item =>
                item.id === productId
                    ? { ...item, quantity }
                    : item
            );
            return newCart;
        });
    };

    const getTotalItems = () => {
        const total = cart.reduce((total, item) => total + item.quantity, 0);
        return total;
    };

    const getTotalPrice = () => {
        const total = cart.reduce((total, item) => {
            // Manejar diferentes formatos de precios
            let price = 0;

            // Si el producto está en oferta, usar precio de oferta
            if (item.isOnOffer && item.offerPrice) {
                if (item.offerPrice.includes(' - ')) {
                    // Formato "1500 - 2200"
                    const parts = item.offerPrice.split(' - ');
                    const min = parseFloat(parts[0]) || 0;
                    const max = parseFloat(parts[1]) || 0;
                    price = (min + max) / 2;
                } else {
                    // Formato simple "1500" o con texto
                    price = parseFloat(item.offerPrice.replace(/[^0-9.]/g, '')) || 0;
                }
            } else if (item.priceRange) {
                // Usar precio normal
                if (item.priceRange.includes(' - ')) {
                    // Formato "3000 - 4000"
                    const parts = item.priceRange.split(' - ');
                    const min = parseFloat(parts[0]) || 0;
                    const max = parseFloat(parts[1]) || 0;
                    price = (min + max) / 2;
                } else {
                    // Formato simple "3000" o con texto
                    price = parseFloat(item.priceRange.replace(/[^0-9.]/g, '')) || 0;
                }
            }
            return total + (price * item.quantity);
        }, 0);
        return total;
    };

    const checkout = () => {
        router.push(`/${locale}/user/checkout`);
    };

    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            getTotalItems,
            getTotalPrice,
            checkout,
            clearCart,
            showNotification
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
