'use client';

import { useState, useEffect } from 'react';
import { getProductsForHomeAction, getAllCategoriesAction, type ProductCategory } from '@repo/data-services/src/client-safe';
import { useCart, type Product } from '../components/cart-context';
import { ProductCard } from './components/product-card';
import { CartNotification } from '../components/cart-notification';
import { ScrollReveal } from '../components/scroll-reveal';
import emailjs from '@emailjs/browser';
import { env } from '@/env';


// Usando Product del CartContext que ya incluye stock

interface CartItem extends Product {
    quantity: number;
}

// Imágenes del carrusel de perros
const CAROUSEL_IMAGES = [
    {
        id: 1,
        src: '/home1.jpeg',
        alt: 'Imagen de mascota feliz',
        title: 'Mascotas Felices',
        objectPosition: 'center 30%'
    },
    {
        id: 2,
        src: '/home2.jpeg',
        alt: 'Imagen de mascota jugando',
        title: 'Juguetes Divertidos',
        objectPosition: 'center 80%'
    },
    {
        id: 3,
        src: '/home3.jpeg',
        alt: 'Imagen de mascota descansando',
        title: 'Descanso Tranquilo',
        objectPosition: 'center 50%'
    },
    {
        id: 4,
        src: '/home4.jpeg',
        alt: 'Imagen de mascota en el parque',
        title: 'Aventuras al Aire Libre',
        objectPosition: 'center 35%'
    },
    {
        id: 5,
        src: '/home5.jpeg',
        alt: 'Imagen de mascota activa',
        title: 'Actividad y Ejercicio',
        objectPosition: 'center 35%'
    },
    {
        id: 6,
        src: '/home6.jpeg',
        alt: 'Imagen de mascota saludable',
        title: 'Salud y Bienestar',
        objectPosition: 'center 40%'
    },
    {
        id: 7,
        src: '/home7.jpeg',
        alt: 'Imagen de mascota contenta',
        title: 'Felicidad Completa',
        objectPosition: 'center 70%'
    }
];

// Fotos de animales con productos de RAW
const ANIMAL_PRODUCT_PHOTOS = [
    {
        id: 1,
        src: '/amigos/1.jpeg',
        alt: 'Mascota feliz con productos RAW',
        animal: '',
        product: 'Productos Premium'
    },
    {
        id: 2,
        src: '/amigos/2.jpeg',
        alt: 'Mascota disfrutando snacks naturales',
        animal: '',
        product: 'Snacks Naturales'
    },
    {
        id: 3,
        src: '/amigos/3.jpeg',
        alt: 'Mascota saludable con productos RAW',
        animal: '',
        product: 'Alimentación Natural'
    },
    {
        id: 4,
        src: '/amigos/4.jpeg',
        alt: 'Mascota contenta con productos premium',
        animal: '',
        product: 'Productos Premium'
    },
    {
        id: 5,
        src: '/amigos/5.jpeg',
        alt: 'Mascota disfrutando snacks saludables',
        animal: '',
        product: 'Snacks Saludables'
    }
];

// Datos de los beneficios
const BENEFITS_DATA = [
    {
        id: 1,
        title: 'Salud Dental',
        icon: '🦷',
        details: [
            'Estimulación cognitiva y mental',
            'Reducción de ansiedad y estrés',
            'Prevención de problemas de comportamiento',
            'Mejora del estado de ánimo',
            'Fortalecimiento del vínculo emocional'
        ]
    },
    {
        id: 2,
        title: 'Relajación',
        icon: '😌',
        details: [
            'Camas ortopédicas con memoria viscoelástica',
            'Ambientes tranquilos y confortables',
            'Reducción del estrés ambiental',
            'Mejora de la calidad del sueño',
            'Espacios seguros y acogedores'
        ]
    },
    {
        id: 3,
        title: 'Entretenimiento',
        icon: '🎾',
        details: [
            'Juguetes interactivos y educativos',
            'Actividades físicas y mentales',
            'Prevención del aburrimiento',
            'Estimulación de instintos naturales',
            'Fomento de la socialización'
        ]
    },
    {
        id: 4,
        title: '100% Natural',
        icon: '🌿',
        details: [
            'Ingredientes orgánicos certificados',
            'Materiales biodegradables',
            'Sin químicos ni conservantes artificiales',
            'Producción sostenible y responsable',
            'Seguro para mascotas y medio ambiente'
        ]
    }
];

// Productos reales para mascotas con imágenes
const SAMPLE_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Comida Premium para Perros Adultos',
        description: 'Alimento balanceado con proteínas de alta calidad, vitaminas y minerales esenciales',
        priceRange: '3000 - 4000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
        stock: 50,
        // Producto en oferta
        isOnOffer: true,
        originalPrice: '3000 - 4000',
        offerPrice: '2400 - 3200'
    },
    {
        id: '2',
        name: 'Comida para Gatos Sensibles',
        description: 'Alimento hipoalergénico para gatos con estómagos sensibles',
        priceRange: '3500 - 4500',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop',
        stock: 40
    },
    {
        id: '3',
        name: 'Juguete Interactivo para Perros',
        description: 'Juguete que estimula la mente y reduce la ansiedad por separación',
        priceRange: '2000 - 3000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
        stock: 30,
        // Producto en oferta
        isOnOffer: true,
        originalPrice: '2000 - 3000',
        offerPrice: '1500 - 2200'
    },
    {
        id: '4',
        name: 'Cama Ortopédica para Mascotas',
        description: 'Cama con memoria viscoelástica para perros y gatos de todas las edades',
        priceRange: '8000 - 12000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop',
        stock: 25
    },
    {
        id: '5',
        name: 'Shampoo Hipoalergénico',
        description: 'Shampoo sin perfumes para mascotas con piel sensible',
        priceRange: '1500 - 2500',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop',
        stock: 60,
        // Producto en oferta
        isOnOffer: true,
        originalPrice: '1500 - 2500',
        offerPrice: '1200 - 2000'
    },
    {
        id: '6',
        name: 'Collar LED con GPS',
        description: 'Collar inteligente con rastreo GPS y luces LED para visibilidad nocturna',
        priceRange: '15000 - 20000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
        stock: 15,
        // Producto en oferta
        isOnOffer: true,
        originalPrice: '15000 - 20000',
        offerPrice: '12000 - 16000'
    },
    {
        id: '7',
        name: 'Comida Húmeda para Perros',
        description: 'Alimento húmedo premium en lata con carne real y vegetales',
        priceRange: '1000 - 2000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
        stock: 80
    },
    {
        id: '8',
        name: 'Rascador para Gatos Premium',
        description: 'Rascador de múltiples niveles con sisal natural y plataforma superior',
        priceRange: '7000 - 10000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop',
        stock: 20
    },
    {
        id: '9',
        name: 'Vitaminas para Mascotas',
        description: 'Suplemento vitamínico completo para perros y gatos de todas las edades',
        priceRange: '2500 - 3500',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
        stock: 45
    },
    {
        id: '10',
        name: 'Transportín Seguro',
        description: 'Transportín de plástico resistente con ventilación y cierre seguro',
        priceRange: '4000 - 6000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop',
        stock: 35
    },
    {
        id: '11',
        name: 'Cepillo Deslanador',
        description: 'Cepillo profesional para eliminar pelo muerto y nudos',
        priceRange: '2000 - 3000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop',
        stock: 55
    },
    {
        id: '12',
        name: 'Comida para Aves Exóticas',
        description: 'Mezcla de semillas premium para loros, canarios y aves exóticas',
        priceRange: '1500 - 2500',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
        stock: 70
    },
    {
        id: '13',
        name: 'Juguete para Gatos con Hierba Gatera',
        description: 'Juguete interactivo con hierba gatera natural para estimular el juego',
        priceRange: '1000 - 2000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop',
        stock: 65
    },
    {
        id: '14',
        name: 'Cama para Mascotas Pequeñas',
        description: 'Cama suave y acogedora para perros y gatos de razas pequeñas',
        priceRange: '4000 - 6000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop',
        stock: 30
    },
    {
        id: '15',
        name: 'Kit de Limpieza Dental',
        description: 'Kit completo para el cuidado dental de tu mascota',
        priceRange: '3000 - 4000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop',
        stock: 40
    }
];

// Preguntas frecuentes
const FAQ_DATA = [
    {
        id: 1,
        question: '¿Cómo conservarlos?',
        answer: 'Para una mayor duración se deben conservar en su envase cerrado en un lugar fresco, seco y sin humedad.'
    },
    {
        id: 2,
        question: '¿Cuánto demora el envío?',
        answer: 'Dependerá de la opción de envío seleccionada.'
    },
    {
        id: 3,
        question: '¿Son aptos para perros y gatos?',
        answer: 'Los treats sí son aptos para ambos, pero los mordedores son únicamente para perros debido a su tamaño y dureza.'
    },
    {
        id: 4,
        question: '¿Hacen ventas mayoristas?',
        answer: 'Para ventas mayoristas comunicarse al: 11 2867-8999'
    },
    {
        id: 5,
        question: '¿Son 100% naturales?',
        answer: 'Sí, los productos son solo sometidos a un proceso de deshidratación, no tienen ningún tipo de químicos, conservantes o saborizantes.'
    }
];

// Componente Carrusel de Amigos
function FriendCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Configuración para diferentes pantallas
    const getVisibleCount = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 1024) return 3; // Desktop: 3 fotos
            if (window.innerWidth >= 768) return 2;  // Tablet: 2 fotos
            return 1; // Mobile: 1 foto
        }
        return 3; // Default
    };

    const [visibleCount, setVisibleCount] = useState(3);

    // Actualizar el número de fotos visibles en resize
    useEffect(() => {
        const handleResize = () => {
            setVisibleCount(getVisibleCount());
        };

        handleResize(); // Set initial value
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-desplazamiento
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const maxIndex = ANIMAL_PRODUCT_PHOTOS.length - visibleCount;
                return prevIndex >= maxIndex ? 0 : prevIndex + 1;
            });
        }, 3000); // Cambia cada 3 segundos

        return () => clearInterval(interval);
    }, [visibleCount]);

    const nextSlide = () => {
        const maxIndex = ANIMAL_PRODUCT_PHOTOS.length - visibleCount;
        setCurrentIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
    };

    const prevSlide = () => {
        const maxIndex = ANIMAL_PRODUCT_PHOTOS.length - visibleCount;
        setCurrentIndex((prevIndex) => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
    };

    return (
        <div className="relative max-w-6xl mx-auto">
            {/* Contenedor del carrusel */}
            <div className="overflow-hidden rounded-xl">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                        transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
                        width: `${(ANIMAL_PRODUCT_PHOTOS.length / visibleCount) * 100}%`
                    }}
                >
                    {ANIMAL_PRODUCT_PHOTOS.map((photo) => (
                        <div
                            key={photo.id}
                            className="flex-shrink-0 px-2"
                            style={{ width: `${100 / ANIMAL_PRODUCT_PHOTOS.length}%` }}
                        >
                            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                <img
                                    src={photo.src}
                                    alt={photo.alt}
                                    className="w-full h-48 md:h-56 lg:h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <p className="text-white text-sm md:text-base font-medium truncate">
                                            {photo.animal}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Botones de navegación */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-barfer-orange p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
                aria-label="Foto anterior"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-barfer-orange p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
                aria-label="Siguiente foto"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Indicadores */}
            <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: Math.ceil(ANIMAL_PRODUCT_PHOTOS.length / visibleCount) }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                            ? 'bg-barfer-orange scale-125'
                            : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                        aria-label={`Ir a grupo ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

export default function AdminPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
    const [currentClientPhotoIndex, setCurrentClientPhotoIndex] = useState(0);
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    // Contact form state
    const [contactForm, setContactForm] = useState({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: ''
    });
    const [isSubmittingContact, setIsSubmittingContact] = useState(false);
    const [contactStatus, setContactStatus] = useState<{
        type: 'success' | 'error' | '';
        message: string;
    }>({ type: '', message: '' });


    // Notification state
    const [notification, setNotification] = useState<{
        isVisible: boolean;
        productName: string;
        quantity: number;
    }>({
        isVisible: false,
        productName: '',
        quantity: 0
    });

    const { addToCart } = useCart();

    const handleAddToCart = (product: Product, quantity: number) => {
        addToCart(product, quantity);
        setNotification({
            isVisible: true,
            productName: product.name,
            quantity
        });
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isVisible: false }));
    };

    // Contact form handlers
    const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setContactForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación básica
        if (!contactForm.nombre || !contactForm.email || !contactForm.mensaje) {
            setContactStatus({
                type: 'error',
                message: 'Por favor completa todos los campos obligatorios.'
            });
            return;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactForm.email)) {
            setContactStatus({
                type: 'error',
                message: 'Por favor ingresa un email válido.'
            });
            return;
        }

        setIsSubmittingContact(true);
        setContactStatus({ type: '', message: '' });

        try {
            // Configuración EmailJS desde variables de entorno
            const serviceId = env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_ysko2ec';
            const templateId = env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
            const publicKey = env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

            // Verificar que las variables estén configuradas
            if (!templateId || !publicKey) {
                console.error('❌ EmailJS no configurado completamente:', {
                    serviceId: serviceId ? 'OK' : 'MISSING',
                    templateId: templateId ? 'OK' : 'MISSING',
                    publicKey: publicKey ? 'OK' : 'MISSING'
                });
                setContactStatus({
                    type: 'error',
                    message: 'EmailJS no está configurado. Revisa las variables de entorno.'
                });
                return;
            }

            // Log para debugging
            console.log('📧 Enviando email con EmailJS:', {
                serviceId: serviceId.slice(0, 10) + '...',
                templateId: templateId.slice(0, 10) + '...',
                publicKey: publicKey.slice(0, 10) + '...',
                datos: {
                    nombre: contactForm.nombre,
                    email: contactForm.email,
                    asunto: contactForm.asunto,
                    mensaje: contactForm.mensaje.substring(0, 50) + '...'
                }
            });

            // Inicializar EmailJS
            emailjs.init(publicKey);

            // Preparar parámetros del template
            const templateParams = {
                from_name: contactForm.nombre,
                from_email: contactForm.email,
                subject: contactForm.asunto || 'Consulta desde Admin',
                message: contactForm.mensaje,
                to_email: 'nicolascaliari28@gmail.com',
                reply_to: contactForm.email
            };

            // Enviar email
            const response = await emailjs.send(serviceId, templateId, templateParams);

            console.log('✅ Email enviado exitosamente:', response.status, response.text);

            setContactStatus({
                type: 'success',
                message: '¡Mensaje enviado exitosamente! Te responderemos pronto.'
            });

            // Limpiar formulario
            setContactForm({
                nombre: '',
                email: '',
                asunto: '',
                mensaje: ''
            });

        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
            setContactStatus({
                type: 'error',
                message: 'Error al enviar el mensaje. Por favor intenta nuevamente.'
            });
        } finally {
            setIsSubmittingContact(false);
        }
    };

    // Cargar productos reales desde la base de datos
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const result = await getAllCategoriesAction(false); // solo activas
                if (result.success && result.categories) {
                    setCategories(result.categories);
                }
            } catch (error) {
                console.error('Error loading categories:', error);
            } finally {
                setIsLoadingCategories(false);
            }
        };

        loadCategories();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoadingProducts(true);
            try {
                console.log('🏠 Cargando productos para el home...');

                // TEMPORAL: Mostrar productos de ejemplo con ofertas para demostración
                // Cambia esta línea para usar productos reales cuando tengas algunos en la DB
                const useExampleProducts = false; // Ahora usando productos de DB

                if (useExampleProducts) {
                    console.log('🏷️ Usando productos de ejemplo con ofertas');
                    setProducts(selectedCategory ? [] : SAMPLE_PRODUCTS);
                    setIsLoadingProducts(false);
                    return;
                }

                // Pasamos la categoría seleccionada al backend
                const result = await getProductsForHomeAction('minorista', selectedCategory || undefined);
                if (result.success && result.products && result.products.length > 0) {
                    console.log('📦 Productos cargados desde la base de datos:', result.products.length);
                    // Usar productos de la base de datos si existen
                    setProducts(result.products);
                } else {
                    console.error('Error cargando productos o no hay productos:', result?.message);
                    console.log('🏷️ Usando productos de ejemplo como fallback o lista vacía si hay filtro');
                    // Fallback a productos de ejemplo si falla la carga o no hay productos, vacío si hay categoría
                    setProducts(selectedCategory ? [] : SAMPLE_PRODUCTS);
                }
            } catch (error) {
                console.error('Error cargando productos:', error);
                console.log('🏷️ Usando productos de ejemplo por error o vacío si hay filtro');
                // Fallback a productos de ejemplo si falla la carga, vacío si hay categoría
                setProducts(selectedCategory ? [] : SAMPLE_PRODUCTS);
            } finally {
                setIsLoadingProducts(false);
            }
        };

        loadProducts();
    }, [selectedCategory]); // Re-fetch products when selectedCategory changes

    // Auto-play del carrusel principal
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentCarouselIndex((prevIndex) =>
                (prevIndex + 1) % CAROUSEL_IMAGES.length
            );
        }, 5000); // Cambia cada 5 segundos

        return () => clearInterval(interval);
    }, []);

    // Auto-play del carrusel de animales con productos
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentClientPhotoIndex((prevIndex) =>
                (prevIndex + 1) % ANIMAL_PRODUCT_PHOTOS.length
            );
        }, 3000); // Cambia cada 3 segundos

        return () => clearInterval(interval);
    }, []);

    const goToSlide = (index: number) => {
        setCurrentCarouselIndex(index);
    };

    const nextSlide = () => {
        setCurrentCarouselIndex((prevIndex) =>
            (prevIndex + 1) % CAROUSEL_IMAGES.length
        );
    };

    const prevSlide = () => {
        setCurrentCarouselIndex((prevIndex) =>
            prevIndex === 0 ? CAROUSEL_IMAGES.length - 1 : prevIndex - 1
        );
    };

    const goToClientPhoto = (index: number) => {
        setCurrentClientPhotoIndex(index);
    };

    const nextClientPhoto = () => {
        setCurrentClientPhotoIndex((prevIndex) =>
            (prevIndex + 1) % ANIMAL_PRODUCT_PHOTOS.length
        );
    };

    const prevClientPhoto = () => {
        setCurrentClientPhotoIndex((prevIndex) =>
            prevIndex === 0 ? ANIMAL_PRODUCT_PHOTOS.length - 1 : prevIndex - 1
        );
    };

    const toggleFAQ = (faqId: number) => {
        setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-barfer-white to-orange-50 w-full">
            {/* Contenido principal */}
            <div className="w-full">
                {/* Carrusel de Fotos de Perros */}
                <div className="mb-8">
                    <div className="relative overflow-hidden rounded-xl shadow-2xl">
                        {/* Imágenes del carrusel */}
                        <div className="relative h-[450px] md:h-[500px] lg:h-[550px]">
                            {CAROUSEL_IMAGES.map((image, index) => (
                                <div
                                    key={image.id}
                                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentCarouselIndex ? 'opacity-100' : 'opacity-0'
                                        }`}
                                >
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        className="w-full h-full object-cover"
                                        style={{ objectPosition: image.objectPosition }}
                                    />
                                    {/* Overlay con título */}
                                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
                                        <div className="p-8 text-white">
                                            <h2 className="text-4xl font-bold mb-2 font-poppins">{image.title}</h2>
                                            <p className="text-xl opacity-90 font-nunito">Descubre productos increíbles para tu mascota</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>



                        {/* Indicadores de puntos */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                            {CAROUSEL_IMAGES.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all ${index === currentCarouselIndex
                                        ? 'bg-white scale-125'
                                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Info boxes below carousel */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <div className="flex-1 bg-gradient-to-r from-barfer-green to-green-600 text-white p-4 rounded-xl shadow-lg">
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-2xl">🚚</span>
                                <span className="font-semibold font-poppins text-center">Envíos a todo el país</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-gradient-to-r from-barfer-orange to-orange-600 text-white p-4 rounded-xl shadow-lg">
                            <div className="flex items-center justify-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold font-poppins text-center">Mínimo de compra: $15.000</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Productos */}
                <ScrollReveal>
                    <div className="container mx-auto px-4 mb-12 mt-12">
                        {/* Filtros por categoría */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 font-poppins text-center">
                                Nuestros Productos
                            </h3>

                            {isLoadingCategories ? (
                                <div className="flex justify-center flex-wrap gap-2">
                                    {[1, 2, 3, 4].map((n) => (
                                        <div key={`sk-cat-${n}`} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex overflow-x-auto pb-4 justify-start md:justify-center gap-2 hide-scrollbar">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all shadow-sm
                                            ${selectedCategory === null
                                                ? 'bg-barfer-orange text-white shadow-md transform scale-105'
                                                : 'bg-white text-gray-700 border border-gray-200 hover:border-barfer-orange hover:text-barfer-orange'
                                            }`}
                                    >
                                        Todos
                                    </button>

                                    {categories.map((category) => (
                                        <button
                                            key={category._id}
                                            onClick={() => setSelectedCategory(category._id || null)}
                                            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all shadow-sm
                                                ${selectedCategory === category._id
                                                    ? 'bg-barfer-orange text-white shadow-md transform scale-105'
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-barfer-orange hover:text-barfer-orange'
                                                }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Grilla de Productos */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-12">
                            {isLoadingProducts ? (
                                // Skeleton loading para productos
                                Array.from({ length: 8 }).map((_, index) => (
                                    <div key={index} className="p-4 animate-pulse">
                                        <div className="mb-4">
                                            <div className="bg-gray-300 w-full h-64 lg:h-80 rounded-lg"></div>
                                        </div>
                                        <div className="bg-gray-300 h-6 rounded mb-2"></div>
                                        <div className="bg-gray-300 h-4 rounded mb-2"></div>
                                        <div className="bg-gray-300 h-5 rounded w-20 mb-4"></div>
                                        <div className="bg-gray-300 h-10 rounded"></div>
                                    </div>
                                ))
                            ) : products.length > 0 ? (
                                products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))
                            ) : (
                                // Mensaje cuando no hay productos
                                <div className="col-span-full text-center py-12">
                                    <div className="text-gray-500 dark:text-gray-400">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21h6" />
                                        </svg>
                                        <p className="text-lg font-medium mb-2">No hay productos disponibles</p>
                                        <p className="text-sm mb-4">Los productos aparecerán aquí una vez que sean agregados por el administrador.</p>
                                        {selectedCategory && (
                                            <button
                                                onClick={() => setSelectedCategory(null)}
                                                className="text-barfer-green font-semibold hover:underline"
                                            >
                                                Ver todos los productos
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollReveal>

                {/* Sección de BENEFICIOS */}
                <ScrollReveal delay={200}>
                    <div className="mb-12">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-barfer-green to-barfer-orange font-poppins mb-2">
                                ✨ BENEFICIOS ✨
                            </h2>
                            <p className="text-gray-600 text-lg">Todo lo que tu mascota necesita para ser feliz</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {BENEFITS_DATA.map((benefit) => (
                                <div
                                    key={benefit.id}
                                    className="border-2 border-barfer-green rounded-2xl overflow-hidden hover:shadow-xl transition-all bg-barfer-white"
                                >
                                    {/* Header del beneficio */}
                                    <div className="p-6 bg-gradient-to-r from-green-50 to-orange-50 hover:from-green-100 hover:to-orange-100">
                                        <div className="flex items-center gap-3 justify-center">
                                            <span className="text-3xl">{benefit.icon}</span>
                                            <h3 className="text-xl font-semibold text-gray-900 text-center">
                                                {benefit.title}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>

                {/* Sección USTEDES - Animales con Productos */}
                <ScrollReveal delay={400}>
                    <div className="mb-12">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-barfer-orange to-barfer-green font-poppins mb-2">
                                🐾 NUESTROS AMIGOS 🐾
                            </h2>
                            <p className="text-gray-600 text-lg">Fotos de nuestros clientes felices</p>
                        </div>

                        {/* Carrusel de fotos de clientes */}
                        <FriendCarousel />
                    </div>
                </ScrollReveal>

                {/* Sección de Preguntas Frecuentes */}
                <ScrollReveal delay={600}>
                    <div className="mb-12">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-barfer-green to-barfer-orange font-poppins mb-2">
                                ❓ PREGUNTAS FRECUENTES ❓
                            </h2>
                        </div>

                        <div className="w-full space-y-6">
                            {FAQ_DATA.map((faq) => (
                                <div
                                    key={faq.id}
                                    className="border-2 border-barfer-green rounded-2xl overflow-hidden hover:shadow-xl transition-all bg-barfer-white"
                                >
                                    {/* Pregunta */}
                                    <div
                                        className="p-6 cursor-pointer bg-gradient-to-r from-green-50 to-orange-50 hover:from-green-100 hover:to-orange-100"
                                        onClick={() => toggleFAQ(faq.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900 pr-4 leading-tight">
                                                {faq.question}
                                            </h3>
                                            <button className="text-barfer-orange hover:text-orange-600 transition-colors flex-shrink-0">
                                                <svg
                                                    className={`w-6 h-6 transform transition-transform ${expandedFAQ === faq.id ? 'rotate-45' : 'rotate-0'
                                                        }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Respuesta expandible */}
                                    {expandedFAQ === faq.id && (
                                        <div className="p-6 bg-barfer-white border-t border-barfer-green">
                                            <p className="text-gray-700 leading-relaxed text-base">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                    </div>
                </ScrollReveal>

                {/* Formulario de Contacto - Movido aquí después de FAQ */}
                <ScrollReveal delay={800}>
                    <div className="mb-12">
                        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 border-2 border-barfer-green">
                            <h3 className="text-3xl font-bold text-center text-barfer-orange mb-6 font-poppins">
                                ¿Tenes alguna consulta?
                            </h3>
                            <p className="text-center text-gray-600 mb-8">
                                Estamos aquí para ayudarte. Envíanos tu mensaje y te responderemos lo antes posible.
                            </p>
                            <form onSubmit={handleContactSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={contactForm.nombre}
                                        onChange={handleContactInputChange}
                                        placeholder="Tu nombre *"
                                        required
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-barfer-green focus:bg-green-50 transition-all shadow-md hover:shadow-lg"
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        value={contactForm.email}
                                        onChange={handleContactInputChange}
                                        placeholder="Tu email *"
                                        required
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-barfer-green focus:bg-green-50 transition-all shadow-md hover:shadow-lg"
                                    />
                                </div>
                                <input
                                    type="text"
                                    name="asunto"
                                    value={contactForm.asunto}
                                    onChange={handleContactInputChange}
                                    placeholder="Asunto (opcional)"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-barfer-green focus:bg-green-50 transition-all shadow-md hover:shadow-lg"
                                />
                                <textarea
                                    name="mensaje"
                                    value={contactForm.mensaje}
                                    onChange={handleContactInputChange}
                                    placeholder="Tu mensaje *"
                                    rows={4}
                                    required
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-barfer-green focus:bg-green-50 transition-all shadow-md hover:shadow-lg resize-none"
                                ></textarea>

                                {/* Mensaje de estado */}
                                {contactStatus.type && (
                                    <div
                                        className={`p-4 rounded-xl text-center ${contactStatus.type === 'success'
                                            ? 'bg-green-100 text-green-800 border border-green-300'
                                            : 'bg-red-100 text-red-800 border border-red-300'
                                            }`}
                                    >
                                        {contactStatus.message}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmittingContact}
                                    className="w-full bg-barfer-orange hover:bg-orange-600 text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-nunito disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isSubmittingContact ? 'Enviando...' : 'Enviar Mensaje'}
                                </button>
                            </form>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Footer */}
                <footer className="bg-gray-900 dark:bg-black text-white mt-16">
                    <div className="w-full px-6 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Información de la empresa */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-barfer-green">Raw and Fun</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    Los mejores snacks para la salud y felicidad de tu peludo
                                </p>
                                <div className="flex space-x-4">
                                    {/* Solo Instagram */}
                                    <a href="https://www.instagram.com/rw.fun/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-barfer-orange transition-colors">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Contacto */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-barfer-orange font-poppins">Contacto</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5 text-barfer-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <a href="mailto:rawfun.info@gmail.com" className="text-gray-300 hover:text-white transition-colors">
                                            rawfun.info@gmail.com
                                        </a>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5 text-barfer-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <a href="tel:+5411128678999" className="text-gray-300 hover:text-white transition-colors">
                                            +54 11-2867-8999
                                        </a>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5 text-barfer-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-gray-300">
                                            Buenos Aires, Argentina
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5 text-barfer-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-gray-300">
                                            Lun - Vie: 9:00 - 18:00
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                                <p className="text-gray-400">
                                    © 2025 Raw and Fun. Todos los derechos reservados.
                                </p>
                                <div className="flex space-x-6 text-sm">
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        Política de Privacidad
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        Términos de Servicio
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        Contacto
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Cart Notification */}
            <CartNotification
                isVisible={notification.isVisible}
                productName={notification.productName}
                quantity={notification.quantity}
                onClose={closeNotification}
            />
        </div>
    );
} 