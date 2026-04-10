import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    stock: number;
}

export interface CartItem extends Product {
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product: Product) => {
                set((state) => {
                    const existingItem = state.items.find(item => item.id === product.id);

                    if (existingItem) {
                        if (existingItem.quantity >= product.stock) {
                            return state; // No agregar si no hay stock
                        }

                        const newItems = state.items.map(item =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        );
                        return { items: newItems };
                    } else {
                        const newItems = [...state.items, { ...product, quantity: 1 }];
                        return { items: newItems };
                    }
                });
            },

            removeItem: (productId: string) => {
                set((state) => {
                    const newItems = state.items.filter(item => item.id !== productId);
                    return { items: newItems };
                });
            },

            updateQuantity: (productId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                set((state) => {
                    const newItems = state.items.map(item =>
                        item.id === productId
                            ? { ...item, quantity }
                            : item
                    );
                    return { items: newItems };
                });
            },

            clearCart: () => {
                set({ items: [] });
            },

            getTotalPrice: () => {
                const { items } = get();
                const total = items.reduce((total, item) => total + (item.price * item.quantity), 0);
                return total;
            },

            getTotalItems: () => {
                const { items } = get();
                const total = items.reduce((total, item) => total + item.quantity, 0);
                return total;
            }
        }),
        {
            name: 'cart-storage',
        }
    )
);
