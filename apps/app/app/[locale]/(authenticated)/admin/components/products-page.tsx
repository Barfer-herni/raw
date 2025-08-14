'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { ShoppingCart, Plus, Minus, Trash2, Package } from 'lucide-react';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { useCartStore, type Product } from '@/store/cartStore';

interface CartItem extends Product {
    quantity: number;
}

// Productos de ejemplo - en una app real vendrían de una API
const SAMPLE_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Comida Premium para Perros',
        description: 'Alimento de alta calidad con proteínas naturales',
        price: 29.99,
        category: 'Heras',
        image: '/api/placeholder/150/150',
        stock: 50
    },
    {
        id: '2',
        name: 'Juguete Interactivo',
        description: 'Juguete que estimula la mente de tu mascota',
        price: 19.99,
        category: 'Heras',
        image: '/api/placeholder/150/150',
        stock: 30
    },
    {
        id: '3',
        name: 'Cama para Mascotas',
        description: 'Cama cómoda y lavable para perros y gatos',
        price: 49.99,
        category: 'Heras',
        image: '/api/placeholder/150/150',
        stock: 25
    },
    {
        id: '4',
        name: 'Shampoo para Mascotas',
        description: 'Shampoo hipoalergénico con pH balanceado',
        price: 14.99,
        category: 'Heras',
        image: '/api/placeholder/150/150',
        stock: 40
    }
];

export function ProductsPage() {
    const [products] = useState<Product[]>(SAMPLE_PRODUCTS);
    const { toast } = useToast();
    
    const {
        items: cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems
    } = useCartStore();

    const handleAddToCart = (product: Product) => {
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem && existingItem.quantity >= product.stock) {
            toast({
                title: "Stock insuficiente",
                description: "No hay más unidades disponibles de este producto",
                variant: "destructive"
            });
            return;
        }
        
        addItem(product);
        toast({
            title: "Producto agregado",
            description: `${product.name} se agregó al carrito`,
        });
    };

    const handleRemoveFromCart = (productId: string) => {
        removeItem(productId);
        toast({
            title: "Producto removido",
            description: "El producto se removió del carrito",
        });
    };

    const handleUpdateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            handleRemoveFromCart(productId);
            return;
        }

        const product = products.find(p => p.id === productId);
        if (product && newQuantity > product.stock) {
            toast({
                title: "Stock insuficiente",
                description: "No hay suficientes unidades disponibles",
                variant: "destructive"
            });
            return;
        }

        updateQuantity(productId, newQuantity);
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast({
                title: "Carrito vacío",
                description: "Agrega productos antes de proceder al checkout",
                variant: "destructive"
            });
            return;
        }

        toast({
            title: "¡Compra exitosa!",
            description: `Total: $${getTotalPrice().toFixed(2)}`,
        });

        // Aquí iría la lógica real del checkout
        clearCart();
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Lista de Productos */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-6">
                        <Package className="h-6 w-6 text-green-600" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Productos Disponibles
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map((product) => (
                            <Card key={product.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 flex items-center justify-center">
                                        <Package className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <CardTitle className="text-lg">{product.name}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {product.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-3">
                                        <Badge variant="secondary">{product.category}</Badge>
                                        <span className="text-sm text-gray-500">
                                            Stock: {product.stock}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-bold text-green-600">
                                            ${product.price}
                                        </span>
                                        <Button
                                            onClick={() => handleAddToCart(product)}
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Agregar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Carrito de Compras */}
                <div className="w-full lg:w-80">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-green-600" />
                                <CardTitle>Carrito de Compras</CardTitle>
                            </div>
                            <CardDescription>
                                {getTotalItems()} producto{getTotalItems() !== 1 ? 's' : ''} en el carrito
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cart.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">
                                    Tu carrito está vacío
                                </p>
                            ) : (
                                <>
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{item.name}</p>
                                                    <p className="text-sm text-gray-500">${item.price}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="text-sm font-medium w-8 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveFromCart(item.id)}
                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-lg font-semibold">Total:</span>
                                            <span className="text-xl font-bold text-green-600">
                                                ${getTotalPrice().toFixed(2)}
                                            </span>
                                        </div>
                                        <Button
                                            onClick={handleCheckout}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                            size="lg"
                                        >
                                            Proceder al Checkout
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
