'use client';

import { useState } from 'react';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';
import { useCart } from './cart-context';

export function CartButton() {
    const { cart, getTotalItems, getTotalPrice, updateQuantity, removeFromCart, checkout } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    return (
        <div className="relative">
            <Button
                onClick={toggleCart}
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Carrito de Compras"
            >
                <ShoppingCart className="h-5 w-5" />
                
                {/* Badge con cantidad de items */}
                {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {getTotalItems()}
                    </span>
                )}
            </Button>

            {/* Carrito desplegable */}
            {isCartOpen && (
                <div className="fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 z-50" onClick={toggleCart}>
                    <div className="absolute top-4 bottom-4 right-4 w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Carrito de Compras</h2>
                                <Button
                                    onClick={toggleCart}
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {cart.length} producto{cart.length !== 1 ? 's' : ''} en el carrito
                            </p>
                        </div>

                        <div className="p-4">
                            {cart.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Tu carrito está vacío</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-sm line-clamp-2">{item.name}</h4>
                                                    <p className="text-orange-600 font-bold">${item.priceRange}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                                        <Button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => removeFromCart(item.id)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-red-500 hover:text-red-700 ml-auto"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-lg font-semibold">Total:</span>
                                            <span className="text-xl font-bold text-orange-600">
                                                ${getTotalPrice().toFixed(0)}
                                            </span>
                                        </div>
                                        <Button
                                            onClick={checkout}
                                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                                        >
                                            Proceder al Checkout
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
