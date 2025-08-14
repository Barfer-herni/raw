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
                        
                        return {
                            items: state.items.map(item =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            )
                        };
                    } else {
                        return {
                            items: [...state.items, { ...product, quantity: 1 }]
                        };
                    }
                });
            },
            
            removeItem: (productId: string) => {
                set((state) => ({
                    items: state.items.filter(item => item.id !== productId)
                }));
            },
            
            updateQuantity: (productId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                
                set((state) => ({
                    items: state.items.map(item =>
                        item.id === productId
                            ? { ...item, quantity }
                            : item
                    )
                }));
            },
            
            clearCart: () => {
                set({ items: [] });
            },
            
            getTotalPrice: () => {
                const { items } = get();
                return items.reduce((total, item) => total + (item.price * item.quantity), 0);
            },
            
            getTotalItems: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.quantity, 0);
            }
        }),
        {
            name: 'cart-storage',
        }
    )
);
