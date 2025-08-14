'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart, type Product } from '../../components/cart-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// Usando Product del CartContext que ya incluye stock

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const { cart } = useCart();
    const pathname = usePathname();
    const [localQuantity, setLocalQuantity] = useState(1);
    
    // Extraer locale del pathname
    const locale = pathname.split('/')[1] || 'es';
    
    // Obtener la cantidad actual de este producto en el carrito
    const cartItem = cart.find(item => item.id === product.id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    
    // Sincronizar el contador local con la cantidad del carrito
    useEffect(() => {
        if (cartQuantity > 0) {
            // Si hay productos en el carrito, el contador muestra esa cantidad
            setLocalQuantity(cartQuantity);
        } else {
            // Si no hay productos, el contador empieza en 1
            setLocalQuantity(1);
        }
    }, [cartQuantity]);

    const handleAddToCart = () => {
        // Calcular cuánto agregar basado en la diferencia entre el contador local y lo que ya está en el carrito
        const quantityToAdd = localQuantity - cartQuantity;
        console.log('🛒 ProductCard: Intentando agregar al carrito:', {
            product,
            localQuantity,
            cartQuantity,
            quantityToAdd
        });
        
        if (quantityToAdd > 0) {
            console.log('🛒 ProductCard: Llamando a onAddToCart con:', { product, quantity: quantityToAdd });
            onAddToCart(product, quantityToAdd);
        } else {
            console.log('🛒 ProductCard: No se puede agregar, quantityToAdd <= 0');
        }
    };

    const incrementQuantity = () => {
        setLocalQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (localQuantity > 1) {
            setLocalQuantity(prev => prev - 1);
        }
    };

    return (
        <div className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white rounded-xl overflow-hidden">
            {/* Product Image - Clickeable */}
            <Link href={`/${locale}/admin/producto/${product.id}`} className="block">
                <div className="relative overflow-hidden bg-gray-50">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Badge de Oferta */}
                    {product.isOnOffer && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                            OFERTA
                        </div>
                    )}
                </div>
            </Link>

            {/* Product Info */}
            <div className="p-4 space-y-4">
                {/* Product Name - Clickeable */}
                <Link href={`/${locale}/admin/producto/${product.id}`}>
                    <h3 className="text-base lg:text-lg font-bold text-gray-900 line-clamp-2 min-h-[3rem] flex items-center justify-center text-center hover:text-barfer-green transition-colors cursor-pointer">
                        {product.name}
                    </h3>
                </Link>

                {/* Price */}
                <div className="flex flex-col items-center justify-center space-y-1">
                    {product.isOnOffer && product.originalPrice && product.offerPrice ? (
                        <>
                            {/* Precio original tachado */}
                            <span className="text-sm text-gray-500 line-through">
                                ${product.originalPrice}
                            </span>
                            {/* Precio de oferta destacado */}
                            <span className="text-lg font-bold text-red-500">
                                ${product.offerPrice}
                            </span>
                        </>
                    ) : (
                        /* Precio normal */
                        <span className="text-lg font-bold text-barfer-orange">
                            ${product.priceRange}
                        </span>
                    )}
                </div>

                {/* Cart Status */}
                {cartQuantity > 0 && (
                    <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md border border-green-200">
                        ✓ En carrito: {cartQuantity} unidad{cartQuantity !== 1 ? 'es' : ''}
                    </div>
                )}

                {/* Quantity Counter */}
                <div className="flex items-center justify-between gap-3">
                    <div className={`flex items-center border rounded-lg ${cartQuantity > 0 ? 'border-green-300 bg-green-50' : 'border-gray-300'}`}>
                        <button
                            onClick={decrementQuantity}
                            disabled={localQuantity <= 1}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 py-2 min-w-[3rem] text-center font-medium">
                            {localQuantity}
                        </span>
                        <button
                            onClick={incrementQuantity}
                            className="p-2 hover:bg-gray-100 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={localQuantity <= cartQuantity}
                        className="flex-1 bg-barfer-green hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                    >
                        {cartQuantity > 0 
                            ? (localQuantity > cartQuantity ? `Agregar ${localQuantity - cartQuantity} más` : 'Ya agregado')
                            : 'Agregar'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
