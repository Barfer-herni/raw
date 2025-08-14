'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../../../components/cart-context';
import { getProductByIdAction } from '@repo/data-services/src/actions';
import type { AdminProduct } from '@repo/data-services/src/types/barfer';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart, cart } = useCart();
    
    const [product, setProduct] = useState<AdminProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [notification, setNotification] = useState<{
        isVisible: boolean;
        message: string;
    }>({
        isVisible: false,
        message: ''
    });

    const productId = params.id as string;
    const locale = params.locale as string;
    
    // Debug: verificar parámetros
    console.log('ProductDetailPage Debug:', {
        productId,
        locale,
        params
    });

    // Obtener la cantidad actual de este producto en el carrito
    const cartItem = cart.find(item => item.id === productId);
    const cartQuantity = cartItem ? cartItem.quantity : 0;

    useEffect(() => {
        const loadProduct = async () => {
            if (!productId) return;

            setIsLoading(true);
            try {
                const result = await getProductByIdAction(productId);
                if (result.success && result.product) {
                    setProduct(result.product);
                } else {
                    setError(result.message || 'Producto no encontrado');
                }
            } catch (error) {
                console.error('Error cargando producto:', error);
                setError('Error al cargar el producto');
            } finally {
                setIsLoading(false);
            }
        };

        loadProduct();
    }, [productId]);

    const handleAddToCart = () => {
        if (!product) return;

        const productForCart = {
            id: product._id!,
            name: product.titulo,
            description: product.descripcion || '',
            priceRange: product.precioMayorista && product.precioMayorista > 0 
                ? `${product.precioMayorista} - ${product.precioMinorista}`
                : product.precioMinorista.toString(),
            category: product.categoria,
            image: (product.imagenes && product.imagenes.length > 0) 
                ? product.imagenes[0] 
                : 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop'
        };

        addToCart(productForCart, quantity);
        
        setNotification({
            isVisible: true,
            message: `¡Agregado! ${quantity} x ${product.titulo}`
        });

        // Ocultar notificación después de 3 segundos
        setTimeout(() => {
            setNotification({ isVisible: false, message: '' });
        }, 3000);
    };

    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const goBack = () => {
        router.push(`/${locale}/admin`);
    };

    const nextImage = () => {
        if (product?.imagenes && product.imagenes.length > 1) {
            setCurrentImageIndex((prev) => 
                prev === product.imagenes!.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevImage = () => {
        if (product?.imagenes && product.imagenes.length > 1) {
            setCurrentImageIndex((prev) => 
                prev === 0 ? product.imagenes!.length - 1 : prev - 1
            );
        }
    };

    const goToImage = (index: number) => {
        setCurrentImageIndex(index);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-barfer-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-barfer-green mx-auto mb-4"></div>
                    <p className="text-gray-600 font-nunito">Cargando producto...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-barfer-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-6">
                        <svg className="w-24 h-24 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 font-poppins mb-4">
                        Producto no encontrado
                    </h1>
                    <p className="text-gray-600 font-nunito mb-6">
                        {error || 'El producto que buscas no existe'}
                    </p>
                    <button
                        onClick={goBack}
                        className="bg-barfer-orange hover:bg-orange-600 text-barfer-white px-6 py-3 rounded-2xl font-semibold transition-colors shadow-md hover:shadow-lg transform hover:scale-105 font-nunito"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-barfer-white to-orange-50">
            {/* Header con botón de regreso */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <button
                        onClick={goBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-barfer-green transition-colors font-nunito"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver al inicio
                    </button>
                </div>
            </div>

            <div className="w-full min-h-screen px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[calc(100vh-8rem)]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-full">
                        {/* Carrusel de imágenes del producto */}
                        <div className="relative flex items-center justify-center p-8">
                            <div className="w-[28rem] h-[28rem] bg-gray-100 rounded-2xl overflow-hidden shadow-lg relative">
                                {product.imagenes && product.imagenes.length > 0 ? (
                                    <>
                                        <img
                                            src={product.imagenes[currentImageIndex]}
                                            alt={`${product.titulo} - Imagen ${currentImageIndex + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        
                                        {/* Controles del carrusel (solo si hay más de 1 imagen) */}
                                        {product.imagenes.length > 1 && (
                                            <>
                                                {/* Botón anterior */}
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                
                                                {/* Botón siguiente */}
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                                
                                                {/* Indicadores de puntos */}
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                                    {product.imagenes.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => goToImage(index)}
                                                            className={`w-3 h-3 rounded-full transition-all ${
                                                                index === currentImageIndex
                                                                    ? 'bg-white scale-125'
                                                                    : 'bg-white/50 hover:bg-white/75'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                
                                                {/* Contador de imágenes */}
                                                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                                    {currentImageIndex + 1} / {product.imagenes.length}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <img
                                        src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=600&fit=crop"
                                        alt={product.titulo}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                            
                            {/* Miniaturas (si hay más de 1 imagen) */}
                            {product.imagenes && product.imagenes.length > 1 && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                                    {product.imagenes.map((imageUrl, index) => (
                                        <button
                                            key={index}
                                            onClick={() => goToImage(index)}
                                            className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                                                index === currentImageIndex
                                                    ? 'border-barfer-orange scale-110'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            <img
                                                src={imageUrl}
                                                alt={`Miniatura ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Información del producto */}
                        <div className="p-8 flex flex-col justify-between">
                            <div>
                                {/* Título */}
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-poppins mb-4">
                                    {product.titulo}
                                </h1>

                                {/* Precios */}
                                <div className="mb-6">
                                    {product.precioMayorista && product.precioMayorista > 0 ? (
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl font-bold text-barfer-orange">
                                                ${product.precioMayorista}
                                            </span>
                                            <span className="text-xl text-gray-500 line-through">
                                                ${product.precioMinorista}
                                            </span>
                                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-lg text-sm font-semibold">
                                                ¡Oferta!
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-3xl font-bold text-barfer-orange">
                                            ${product.precioMinorista}
                                        </span>
                                    )}
                                </div>

                                {/* Descripción */}
                                {product.descripcion && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">
                                            Descripción
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed font-nunito">
                                            {product.descripcion}
                                        </p>
                                    </div>
                                )}

                                {/* Stock */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600">Stock disponible:</span>
                                        <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.stock} unidades
                                        </span>
                                    </div>
                                </div>

                                {/* Dimensiones */}
                                {product.dimensiones && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">
                                            Dimensiones del paquete
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            {product.dimensiones.profundidad && (
                                                <div>
                                                    <span className="text-gray-600">Largo:</span>
                                                    <span className="ml-1 font-medium">{product.dimensiones.profundidad} cm</span>
                                                </div>
                                            )}
                                            {product.dimensiones.ancho && (
                                                <div>
                                                    <span className="text-gray-600">Ancho:</span>
                                                    <span className="ml-1 font-medium">{product.dimensiones.ancho} cm</span>
                                                </div>
                                            )}
                                            {product.dimensiones.alto && (
                                                <div>
                                                    <span className="text-gray-600">Alto:</span>
                                                    <span className="ml-1 font-medium">{product.dimensiones.alto} cm</span>
                                                </div>
                                            )}
                                            {product.dimensiones.peso && (
                                                <div>
                                                    <span className="text-gray-600">Peso:</span>
                                                    <span className="ml-1 font-medium">{product.dimensiones.peso} kg</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sección de compra */}
                            <div className="border-t pt-6">
                                {/* Indicador de carrito */}
                                {cartQuantity > 0 && (
                                    <div className="mb-4 text-sm text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                                        ✓ Ya tienes {cartQuantity} unidad{cartQuantity !== 1 ? 'es' : ''} en el carrito
                                    </div>
                                )}

                                {/* Contador de cantidad */}
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-lg font-semibold text-gray-900">Cantidad:</span>
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={decrementQuantity}
                                            disabled={quantity <= 1}
                                            className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Minus className="h-5 w-5" />
                                        </button>
                                        <span className="px-6 py-3 min-w-[4rem] text-center font-bold text-lg">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={incrementQuantity}
                                            disabled={quantity >= product.stock}
                                            className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Botón agregar al carrito */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0}
                                    className="w-full bg-barfer-green hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                                >
                                    {product.stock <= 0 
                                        ? 'Sin stock' 
                                        : `Agregar ${quantity} al carrito`
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notificación */}
            {notification.isVisible && (
                <div className="fixed bottom-4 right-4 z-50">
                    <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-semibold">{notification.message}</span>
                        <button 
                            onClick={() => setNotification({ isVisible: false, message: '' })}
                            className="ml-auto text-white/80 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
