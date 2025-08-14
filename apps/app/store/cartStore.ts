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
                console.log('🛒 CartStore: Agregando producto:', product);
                set((state) => {
                    const existingItem = state.items.find(item => item.id === product.id);
                    
                    if (existingItem) {
                        if (existingItem.quantity >= product.stock) {
                            console.log('🛒 CartStore: No se puede agregar, stock insuficiente');
                            return state; // No agregar si no hay stock
                        }
                        
                        const newItems = state.items.map(item =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        );
                        console.log('🛒 CartStore: Producto existente, nueva cantidad:', newItems);
                        return { items: newItems };
                    } else {
                        const newItems = [...state.items, { ...product, quantity: 1 }];
                        console.log('🛒 CartStore: Nuevo producto agregado:', newItems);
                        return { items: newItems };
                    }
                });
            },
            
            removeItem: (productId: string) => {
                console.log('🛒 CartStore: Removiendo producto:', productId);
                set((state) => {
                    const newItems = state.items.filter(item => item.id !== productId);
                    console.log('🛒 CartStore: Producto removido, nuevo carrito:', newItems);
                    return { items: newItems };
                });
            },
            
            updateQuantity: (productId: string, quantity: number) => {
                console.log('🛒 CartStore: Actualizando cantidad:', { productId, quantity });
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
                    console.log('🛒 CartStore: Cantidad actualizada, nuevo carrito:', newItems);
                    return { items: newItems };
                });
            },
            
            clearCart: () => {
                console.log('🛒 CartStore: Limpiando carrito');
                set({ items: [] });
            },
            
            getTotalPrice: () => {
                const { items } = get();
                const total = items.reduce((total, item) => total + (item.price * item.quantity), 0);
                console.log('🛒 CartStore: Precio total:', total);
                return total;
            },
            
            getTotalItems: () => {
                const { items } = get();
                const total = items.reduce((total, item) => total + item.quantity, 0);
                console.log('🛒 CartStore: Total de items:', total);
                return total;
            }
        }),
        {
            name: 'cart-storage',
        }
    )
);
