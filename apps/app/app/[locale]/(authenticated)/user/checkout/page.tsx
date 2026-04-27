'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShippingOptions } from './components/shipping-options';
import type { EnviaShippingOption } from '@repo/data-services/src/client-safe';
import { useCart, type Product } from '../../components/cart-context';
import { createOrderAction } from './actions';
// Función para obtener datos del usuario desde el servidor
async function fetchUserData() {
    try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}


interface CartItem extends Product {
    quantity: number;
}

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as string;
    const [isProcessing, setIsProcessing] = useState(false);
    const { cart, clearCart, getTotalPrice: getCartTotalPrice } = useCart();
    const [isLoading, setIsLoading] = useState(true);
    const [selectedShipping, setSelectedShipping] = useState<EnviaShippingOption | null>(null);
    const [shippingVerified, setShippingVerified] = useState(false);
    const [showShippingOptions, setShowShippingOptions] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: ''
    });
    const [userData, setUserData] = useState({
        name: '',
        lastName: '',
        email: '',
        phone: '',
        address: {
            street: '',
            apartment: '',
            city: '',
            province: '',
            postalCode: '',
            notes: ''
        }
    });

    // Cargar carrito del localStorage y datos del usuario después del mount
    useEffect(() => {
        const loadData = async () => {
            console.log('🛒 Checkout: Iniciando carga de datos...');
            console.log('🛒 Checkout: localStorage disponible:', typeof window !== 'undefined' && window.localStorage);

            // Verificar que localStorage esté disponible
            if (typeof window === 'undefined' || !window.localStorage) {
                console.error('🛒 Checkout: localStorage no disponible');
                setIsLoading(false);
                return;
            }

            // Cargar datos del usuario
            const user = await fetchUserData();
            if (user) {
                setUserData({
                    name: user.name || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    address: user.address || {
                        street: '',
                        apartment: '',
                        city: '',
                        province: '',
                        postalCode: '',
                        notes: ''
                    }
                });

                // Inicializar dirección de envío con datos del usuario
                setShippingAddress({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    street: user.address?.street || '',
                    city: user.address?.city || '',
                    state: user.address?.province || '',
                    postalCode: user.address?.postalCode || ''
                });
            }

            setIsLoading(false);
            window.scrollTo(0, 0);
            console.log('🛒 Checkout: Carga de datos completada');
        };

        loadData();
    }, []);

    // Handler para actualizar la dirección de envío cuando cambian los campos del formulario
    const handleAddressChange = (field: string, value: string) => {
        console.log(`📝 [CHECKOUT] Actualizando campo de dirección: ${field} = ${value}`);
        setShippingAddress(prev => ({
            ...prev,
            [field]: value
        }));
        // Resetear verificación cuando cambia la dirección
        setShippingVerified(false);
        setShowShippingOptions(false);
        setSelectedShipping(null);
    };

    const handleUserDataChange = (field: string, value: string) => {
        console.log(`📝 [CHECKOUT] Actualizando dato de usuario: ${field} = ${value}`);
        setShippingAddress(prev => ({
            ...prev,
            [field]: value
        }));
        // Resetear verificación cuando cambian datos de usuario
        setShippingVerified(false);
        setShowShippingOptions(false);
    };

    // Función para verificar si la dirección está completa
    const isAddressComplete = () => {
        return !!(
            shippingAddress.name &&
            shippingAddress.email &&
            shippingAddress.phone &&
            shippingAddress.street &&
            shippingAddress.city &&
            shippingAddress.state &&
            shippingAddress.postalCode
        );
    };

    // Handler para calcular envío
    const handleCalculateShipping = () => {
        console.log('🔍 [CHECKOUT] Verificando dirección y calculando envío...');

        if (!isAddressComplete()) {
            alert('Por favor completa todos los campos obligatorios de la dirección antes de calcular el envío.');
            return;
        }

        console.log('✅ [CHECKOUT] Dirección completa. Mostrando opciones de envío...');
        setShowShippingOptions(true);
        setShippingVerified(false); // Se marcará como verificado cuando seleccione una opción
    };

    // Handler cuando se selecciona una opción de envío
    const handleShippingSelect = (option: EnviaShippingOption | null) => {
        console.log('📦 [CHECKOUT] Opción de envío seleccionada:', option);
        setSelectedShipping(option);
        if (option) {
            setShippingVerified(true);
        } else {
            setShippingVerified(false);
        }
    };

    const getTotalPrice = () => {
        return getCartTotalPrice();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // Obtener datos del formulario
            const formData = new FormData(e.target as HTMLFormElement);
            const customerData = {
                nombre: formData.get('nombre') as string,
                apellido: formData.get('apellido') as string,
                email: formData.get('email') as string,
                telefono: formData.get('telefono') as string,
                direccion: formData.get('direccion') as string,
                piso: formData.get('piso') as string,
                codigoPostal: formData.get('codigoPostal') as string,
                ciudad: formData.get('ciudad') as string,
                provincia: formData.get('provincia') as string,
                notas: formData.get('notas') as string
            };

            // Preparar los items para la orden
            const orderItems = cart.map(item => {
                let price = 0;

                // Calcular precio del item
                if (item.isOnOffer && item.offerPrice) {
                    if (item.offerPrice.includes(' - ')) {
                        const parts = item.offerPrice.split(' - ');
                        const min = parseInt(parts[0]) || 0;
                        const max = parseInt(parts[1]) || 0;
                        price = (min + max) / 2;
                    } else {
                        price = parseInt(item.offerPrice.replace(/[^0-9]/g, '')) || 0;
                    }
                } else if (item.priceRange) {
                    if (item.priceRange.includes(' - ')) {
                        const parts = item.priceRange.split(' - ');
                        const min = parseInt(parts[0]) || 0;
                        const max = parseInt(parts[1]) || 0;
                        price = (min + max) / 2;
                    } else {
                        price = parseInt(item.priceRange.replace(/[^0-9]/g, '')) || 0;
                    }
                }

                return {
                    id: item.id,
                    name: item.name,
                    description: item.description || '',
                    images: item.image ? [item.image] : [],
                    options: [{
                        name: item.category || 'Estándar',
                        price: price,
                        quantity: item.quantity
                    }],
                    price: price * item.quantity,
                    salesCount: 0,
                    discountApllied: 0
                };
            });

            const subTotal = getTotalPrice();
            const MIN_PURCHASE = 15000;

            if (subTotal < MIN_PURCHASE) {
                alert(`El monto mínimo de compra es de $${MIN_PURCHASE.toLocaleString()}. Tu subtotal actual es de $${subTotal.toLocaleString()}. Por favor, agrega más productos para continuar.`);
                setIsProcessing(false);
                return;
            }

            const shippingPrice = selectedShipping?.cost || 0;
            const total = subTotal + shippingPrice;

            // Crear la orden en la base de datos
            const orderData = {
                total,
                subTotal,
                shippingPrice,
                notes: customerData.notas || '',
                paymentMethod: 'Transferencia',
                orderType: 'minorista' as const,
                address: {
                    address: customerData.direccion,
                    city: customerData.ciudad,
                    phone: customerData.telefono,
                    floorNumber: customerData.piso || '',
                    departmentNumber: '',
                },
                user: {
                    name: customerData.nombre,
                    lastName: customerData.apellido,
                    email: customerData.email,
                },
                items: orderItems,
                deliveryDay: new Date(),
            };

            console.log('🛒 Checkout: Creando orden en la base de datos...', orderData);
            const result = await createOrderAction(orderData);

            if (!result.success) {
                console.error('🛒 Checkout: Error creando orden:', result.message);
                alert('Error al crear la orden. Por favor, inténtalo de nuevo.');
                setIsProcessing(false);
                return;
            }

            console.log('🛒 Checkout: Orden creada exitosamente:', result.order);

            // Crear mensaje para WhatsApp con información detallada de envío
            const productos = cart.map(item => {
                if (item.isOnOffer && item.offerPrice) {
                    return `• ${item.name} (x${item.quantity}) - $${item.offerPrice} 🏷️ OFERTA (antes $${item.originalPrice})`;
                } else {
                    return `• ${item.name} (x${item.quantity}) - $${item.priceRange}`;
                }
            }).join('\n');

            // Información de envío detallada
            const envioInfo = selectedShipping
                ? `� *ENVÍO SELECCIONADO:*
   Transportista: ${selectedShipping.carrier}
   Servicio: ${selectedShipping.service}
   Costo: ${selectedShipping.cost === 0 ? 'GRATIS ✨' : '$' + selectedShipping.cost.toFixed(0) + ' ' + selectedShipping.currency}
   Tiempo estimado: ${selectedShipping.delivery_estimate}${selectedShipping.delivery_time ? ` (${selectedShipping.delivery_time.min_days}-${selectedShipping.delivery_time.max_days} días)` : ''}
`
                : '🚚 *ENVÍO:* A coordinar\n';

            const mensaje = `¡Hola! Quiero finalizar mi pedido de Raw:

📦 *PRODUCTOS:*
${productos}

💰 *SUBTOTAL: $${subTotal.toFixed(0)}*
${envioInfo}
💰 *TOTAL FINAL: $${total.toFixed(0)}*

👤 *DATOS DEL CLIENTE:*
Nombre: ${customerData.nombre} ${customerData.apellido}
Email: ${customerData.email}
Teléfono: ${customerData.telefono}

🏠 *DIRECCIÓN DE ENTREGA:*
${customerData.direccion}${customerData.piso ? `, ${customerData.piso}` : ''}
${customerData.ciudad}, ${customerData.provincia}
CP: ${customerData.codigoPostal}

${customerData.notas ? `📝 *NOTAS:*\n${customerData.notas}` : ''}

¡Gracias!`;

            // Número de WhatsApp de Barfer
            const numeroWhatsApp = '5491144023100';
            const whatsappUrl = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

            // Limpiar carrito
            clearCart();
            // No reseteamos isProcessing para que no se muestre el mensaje de carrito vacío durante la redirección

            // Abrir WhatsApp usando redirección directa para evitar bloqueos de popups
            window.location.href = whatsappUrl;
        } catch (error) {
            console.error('🛒 Checkout: Error en el proceso de checkout:', error);
            alert('Error al procesar el pedido. Por favor, inténtalo de nuevo.');
            setIsProcessing(false);
        }
    };

    // Estado de carga
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-barfer-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-barfer-green mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
                </div>
            </div>
        );
    }

    // Carrito vacío
    if (cart.length === 0 && !isProcessing) {
        console.log('🛒 Checkout: Carrito detectado como vacío, mostrando mensaje de carrito vacío');
        console.log('🛒 Checkout: Estado actual del carrito:', cart);
        return (
            <div className="min-h-screen bg-gradient-to-br from-barfer-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Tu carrito está vacío
                    </h1>
                    <button
                        onClick={() => router.push(`/${locale}`)}
                        className="bg-barfer-orange hover:bg-orange-600 text-barfer-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                    >
                        Volver a la Tienda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-barfer-white to-orange-50">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push(`/${locale}`)}
                        className="flex items-center text-barfer-green hover:text-green-600 mb-4 font-medium"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver a la Tienda
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white font-poppins">
                        Finalizar Compra
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Completa los datos para procesar tu pedido
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulario de Checkout */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Información Personal */}
                            <div className="bg-barfer-white rounded-xl shadow-lg border-2 border-barfer-green p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins">
                                        Información Personal
                                    </h2>
                                    {userData.name && userData.email && userData.phone && (
                                        <span className="text-xs bg-green-100 text-barfer-green px-3 py-1 rounded-full font-medium">
                                            ✓ Auto-completado desde tu perfil
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            required
                                            defaultValue={userData.name}
                                            onChange={(e) => handleUserDataChange('name', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barfer-green focus:border-barfer-green bg-barfer-white text-gray-900"
                                            placeholder="Juan"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Apellido *
                                        </label>
                                        <input
                                            type="text"
                                            name="apellido"
                                            required
                                            defaultValue={userData.lastName}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barfer-green focus:border-barfer-green bg-barfer-white text-gray-900"
                                            placeholder="Pérez"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            defaultValue={userData.email}
                                            onChange={(e) => handleUserDataChange('email', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barfer-green focus:border-barfer-green bg-barfer-white text-gray-900"
                                            placeholder="juan@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Teléfono *
                                        </label>
                                        <input
                                            type="tel"
                                            name="telefono"
                                            required
                                            defaultValue={userData.phone}
                                            onChange={(e) => handleUserDataChange('phone', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barfer-green focus:border-barfer-green bg-barfer-white text-gray-900"
                                            placeholder="+54 11 1234-5678"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Información de Entrega - PRIMERO */}
                            <div className="bg-barfer-white rounded-xl shadow-lg border-2 border-barfer-green p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins">
                                        Dirección de Entrega
                                    </h2>
                                    {userData.address.street && userData.address.city && userData.address.province && userData.address.postalCode ? (
                                        <span className="text-xs bg-green-100 text-barfer-green px-3 py-1 rounded-full font-medium">
                                            ✓ Auto-completado desde tu perfil
                                        </span>
                                    ) : (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-3 py-1 rounded-full">
                                            ⚠ Completa tu dirección para ver opciones de envío
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Dirección *
                                        </label>
                                        <input
                                            type="text"
                                            name="direccion"
                                            required
                                            defaultValue={userData.address.street}
                                            onChange={(e) => handleAddressChange('street', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barfer-green focus:border-barfer-green bg-barfer-white text-gray-900"
                                            placeholder="Av. Corrientes 1234"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Piso (opc.)
                                            </label>
                                            <input
                                                type="text"
                                                name="piso"
                                                defaultValue={userData.address.apartment}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barfer-green focus:border-barfer-green bg-barfer-white text-gray-900"
                                                placeholder="5° B"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                CP *
                                            </label>
                                            <input
                                                type="text"
                                                name="codigoPostal"
                                                required
                                                defaultValue={userData.address.postalCode}
                                                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barfer-green focus:border-barfer-green bg-barfer-white text-gray-900"
                                                placeholder="1000"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Ciudad *
                                            </label>
                                            <input
                                                type="text"
                                                name="ciudad"
                                                required
                                                defaultValue={userData.address.city}
                                                onChange={(e) => handleAddressChange('city', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barfer-green focus:border-barfer-green bg-barfer-white text-gray-900"
                                                placeholder="Buenos Aires"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Provincia *
                                            </label>
                                            <select
                                                name="provincia"
                                                required
                                                defaultValue={userData.address.province}
                                                onChange={(e) => handleAddressChange('state', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barfer-green focus:border-barfer-green bg-barfer-white text-gray-900"
                                            >
                                                <option value="">Seleccionar provincia</option>
                                                <option value="Ciudad Autónoma de Buenos Aires">Ciudad Autónoma de Buenos Aires (CABA)</option>
                                                <option value="Buenos Aires">Buenos Aires</option>
                                                <option value="Catamarca">Catamarca</option>
                                                <option value="Chaco">Chaco</option>
                                                <option value="Chubut">Chubut</option>
                                                <option value="Córdoba">Córdoba</option>
                                                <option value="Corrientes">Corrientes</option>
                                                <option value="Entre Ríos">Entre Ríos</option>
                                                <option value="Formosa">Formosa</option>
                                                <option value="Jujuy">Jujuy</option>
                                                <option value="La Pampa">La Pampa</option>
                                                <option value="La Rioja">La Rioja</option>
                                                <option value="Mendoza">Mendoza</option>
                                                <option value="Misiones">Misiones</option>
                                                <option value="Neuquén">Neuquén</option>
                                                <option value="Río Negro">Río Negro</option>
                                                <option value="Salta">Salta</option>
                                                <option value="San Juan">San Juan</option>
                                                <option value="San Luis">San Luis</option>
                                                <option value="Santa Cruz">Santa Cruz</option>
                                                <option value="Santa Fe">Santa Fe</option>
                                                <option value="Santiago del Estero">Santiago del Estero</option>
                                                <option value="Tierra del Fuego">Tierra del Fuego</option>
                                                <option value="Tucumán">Tucumán</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Instrucciones de entrega (opcional)
                                        </label>
                                        <textarea
                                            name="notas"
                                            rows={4}
                                            defaultValue={userData.address.notes}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barfer-green focus:border-barfer-green bg-barfer-white text-gray-900 resize-none"
                                            placeholder="Ej: Timbre de la izquierda, entregar después de las 18hs, etc."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Botón para Calcular Envío */}
                            {!showShippingOptions && (
                                <div className="bg-barfer-white rounded-xl shadow-lg border-2 border-barfer-green p-6">
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            📦 Calcula tu Envío
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Una vez que completes tu dirección, haz clic aquí para ver las opciones de envío disponibles
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleCalculateShipping}
                                            disabled={!isAddressComplete()}
                                            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${isAddressComplete()
                                                ? 'bg-barfer-green hover:bg-green-600 text-white hover:shadow-xl transform hover:scale-105'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {isAddressComplete()
                                                ? '🚚 Calcular Opciones de Envío'
                                                : '⚠️ Completa la Dirección Primero'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Opciones de Envío - DESPUÉS de completar dirección y hacer clic en calcular */}
                            {cart.length > 0 && showShippingOptions && (
                                <ShippingOptions
                                    cartItems={cart.map(item => ({
                                        id: item.id,
                                        name: item.name,
                                        quantity: item.quantity,
                                        dimensions: item.dimensions // Pasar dimensiones reales del producto (incluye peso)
                                    }))}
                                    address={shippingAddress}
                                    onShippingSelect={handleShippingSelect}
                                    selectedOption={selectedShipping}
                                />
                            )}



                            {/* Botón de envío - Solo visible cuando se ha verificado el envío */}
                            {shippingVerified && selectedShipping && (
                                <div className="bg-barfer-white rounded-xl shadow-lg border-2 border-barfer-green p-6">
                                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-800 font-medium flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Envío verificado: {selectedShipping.carrier} - {selectedShipping.service}
                                        </p>
                                        <p className="text-green-700 text-sm mt-1 ml-7">
                                            Costo: ${selectedShipping.cost.toFixed(0)} {selectedShipping.currency} • {selectedShipping.delivery_estimate}
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full bg-barfer-orange hover:bg-orange-600 disabled:bg-gray-400 text-barfer-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 font-poppins"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Abriendo WhatsApp...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.109" />
                                                </svg>
                                                Finalizar por WhatsApp - $${(getTotalPrice() + (selectedShipping?.cost || 0)).toFixed(0)}
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Mensaje cuando aún no se ha verificado el envío */}
                            {!shippingVerified && (
                                <div className="bg-yellow-50 rounded-xl shadow-lg border-2 border-yellow-300 p-6">
                                    <div className="text-center">
                                        <svg className="w-12 h-12 mx-auto mb-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                                            ⚠️ Falta Verificar el Envío
                                        </h3>
                                        <p className="text-yellow-700 text-sm">
                                            Completa tu dirección y calcula las opciones de envío para continuar con tu pedido
                                        </p>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Resumen del Pedido */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sticky top-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Resumen del Pedido
                            </h2>
                            <div className="space-y-4 mb-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Cantidad: {item.quantity}
                                            </p>
                                            {item.isOnOffer && item.originalPrice && item.offerPrice ? (
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm text-gray-500 line-through font-medium">
                                                        ${item.originalPrice}
                                                    </p>
                                                    <p className="text-sm text-red-500 font-semibold">
                                                        ${item.offerPrice} 🏷️ OFERTA
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-barfer-orange font-semibold">
                                                    ${item.priceRange}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                ${(() => {
                                                    let price = 0;

                                                    // Si el producto está en oferta, usar precio de oferta
                                                    if (item.isOnOffer && item.offerPrice) {
                                                        if (item.offerPrice.includes(' - ')) {
                                                            const parts = item.offerPrice.split(' - ');
                                                            const min = parseInt(parts[0]) || 0;
                                                            const max = parseInt(parts[1]) || 0;
                                                            price = (min + max) / 2;
                                                        } else {
                                                            price = parseInt(item.offerPrice.replace(/[^0-9]/g, '')) || 0;
                                                        }
                                                    } else if (item.priceRange) {
                                                        // Usar precio normal
                                                        if (item.priceRange.includes(' - ')) {
                                                            const parts = item.priceRange.split(' - ');
                                                            const min = parseInt(parts[0]) || 0;
                                                            const max = parseInt(parts[1]) || 0;
                                                            price = (min + max) / 2;
                                                        } else {
                                                            price = parseInt(item.priceRange.replace(/[^0-9]/g, '')) || 0;
                                                        }
                                                    }
                                                    return (price * item.quantity).toFixed(0);
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        ${getTotalPrice().toFixed(0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">Envío:</span>
                                    <span className={`font-semibold ${selectedShipping?.cost === 0 || !selectedShipping ? 'text-green-600 dark:text-green-400' : 'text-barfer-orange'}`}>
                                        {selectedShipping ?
                                            (selectedShipping.cost === 0 ? 'Gratis' : `$${selectedShipping.cost.toFixed(0)}`)
                                            : 'Seleccionar envío'
                                        }
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">Total:</span>
                                        <span className="text-2xl font-bold text-barfer-green">
                                            ${(getTotalPrice() + (selectedShipping?.cost || 0)).toFixed(0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
