'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
    id: string;
    name: string;
    description: string;
    priceRange: string;
    category: string;
    image: string;
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

    const addToCart = (product: Product, quantity: number = 1) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prevCart, { ...product, quantity }];
            }
        });
    };

    const showNotification = (productName: string, quantity: number) => {
        // This will be handled by the component that uses this context
        // We'll pass this function to trigger notifications
    };

    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId 
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => {
            // Extract the first number from priceRange (e.g., "3000 - 4000" -> 3000)
            const price = parseFloat(item.priceRange.split(' ')[0]) || 0;
            return total + (price * item.quantity);
        }, 0);
    };

    const checkout = () => {
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
