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
}

interface CartItem extends Product {
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
    showNotification: (productName: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children, locale }: { children: ReactNode; locale: string }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const router = useRouter();

    // Cargar carrito desde localStorage al inicializar
    useEffect(() => {
        console.log('🛒 CartContext: Inicializando carrito...');
        console.log('🛒 CartContext: localStorage disponible:', typeof window !== 'undefined' && window.localStorage);
        
        if (typeof window === 'undefined' || !window.localStorage) {
            console.error('🛒 CartContext: localStorage no disponible');
            return;
        }
        
        try {
            const savedCart = localStorage.getItem('barfer-cart');
            console.log('🛒 CartContext: Contenido raw de localStorage:', savedCart);
            console.log('🛒 CartContext: Tipo de contenido:', typeof savedCart);
            
            if (savedCart && savedCart !== 'undefined' && savedCart !== 'null') {
                const parsedCart = JSON.parse(savedCart);
                console.log('🛒 CartContext: Carrito parseado:', parsedCart);
                console.log('🛒 CartContext: Es array:', Array.isArray(parsedCart));
                
                if (Array.isArray(parsedCart)) {
                    setCart(parsedCart);
                } else {
                    console.error('🛒 CartContext: El carrito no es un array válido');
                    setCart([]);
                }
            } else {
                console.log('🛒 CartContext: No hay carrito guardado en localStorage');
                setCart([]);
            }
        } catch (error) {
            console.error('🛒 CartContext: Error cargando carrito desde localStorage:', error);
            setCart([]);
        }
    }, []);

    // Guardar carrito en localStorage cada vez que cambie (evitar guardar array vacío inicial)
    useEffect(() => {
        // Solo guardar si el carrito ha sido inicializado (no es el estado inicial vacío)
        if (cart.length > 0) {
            try {
                localStorage.setItem('barfer-cart', JSON.stringify(cart));
                console.log('🛒 CartContext: Carrito guardado en localStorage:', cart);
            } catch (error) {
                console.error('🛒 CartContext: Error guardando carrito en localStorage:', error);
            }
        }
    }, [cart]);

    const addToCart = (product: Product, quantity: number = 1) => {
        console.log('🛒 CartContext: Agregando al carrito:', { product, quantity });
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                const newCart = prevCart.map(item =>
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
                console.log('🛒 CartContext: Producto existente, nueva cantidad:', newCart);
                return newCart;
            } else {
                const newCart = [...prevCart, { ...product, quantity }];
                console.log('🛒 CartContext: Nuevo producto agregado:', newCart);
                return newCart;
            }
        });
    };

    const showNotification = (productName: string, quantity: number) => {
        // This will be handled by the component that uses this context
        // We'll pass this function to trigger notifications
    };

    const removeFromCart = (productId: string) => {
        console.log('🛒 CartContext: Removiendo del carrito:', productId);
        setCart(prevCart => {
            const newCart = prevCart.filter(item => item.id !== productId);
            console.log('🛒 CartContext: Producto removido, nuevo carrito:', newCart);
            return newCart;
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        console.log('🛒 CartContext: Actualizando cantidad:', { productId, quantity });
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
            console.log('🛒 CartContext: Cantidad actualizada, nuevo carrito:', newCart);
            return newCart;
        });
    };

    const getTotalItems = () => {
        const total = cart.reduce((total, item) => total + item.quantity, 0);
        console.log('🛒 CartContext: Total de items:', total);
        return total;
    };

    const getTotalPrice = () => {
        const total = cart.reduce((total, item) => {
            // Manejar diferentes formatos de precios
            let price = 0;
            if (item.priceRange) {
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
        console.log('🛒 CartContext: Precio total:', total);
        return total;
    };

    const checkout = () => {
        console.log('🛒 CartContext: Redirigiendo al checkout con carrito:', cart);
        router.push(`/${locale}/admin/checkout`);
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
