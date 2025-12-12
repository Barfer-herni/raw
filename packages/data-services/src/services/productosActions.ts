'use server'

import { 
    createProduct as createProductService, 
    getAllProducts as getAllProductsService,
    updateProduct as updateProductService,
    deleteProduct as deleteProductService,
    getProductById as getProductByIdService,
    searchProducts as searchProductsService
} from './productosService';
import { requireAdminRole } from './authHelpers';
import type { CreateAdminProduct, AdminProduct } from '../types/barfer';

/**
 * Server Action: Crear un nuevo producto
 */
export async function createProductAction(productData: CreateAdminProduct) {
    try {
        // Verificar permisos de administrador
        const adminCheck = await requireAdminRole();
        if (!adminCheck.success) {
            return {
                success: false,
                message: 'Acceso denegado',
                error: adminCheck.error
            };
        }

        // Validar datos requeridos
        if (!productData.titulo || !productData.categoria) {
            return {
                success: false,
                message: 'Título y categoría son obligatorios',
                error: 'VALIDATION_ERROR'
            };
        }

        const result = await createProductService(productData, adminCheck.user.id);
        
        // Serializar explícitamente el resultado para Next.js
        if (result.success && result.product) {
            return {
                ...result,
                product: JSON.parse(JSON.stringify(result.product))
            };
        }
        
        return result;
    } catch (error) {
        console.error('Error en createProductAction:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Server Action: Obtener todos los productos
 */
export async function getAllProductsAction(includeInactive = false): Promise<{ success: boolean; products?: AdminProduct[]; message?: string; error?: string }> {
    try {
        // Verificar permisos de administrador para ver productos inactivos
        if (includeInactive) {
            const adminCheck = await requireAdminRole();
            if (!adminCheck.success) {
                return {
                    success: false,
                    message: 'Acceso denegado para ver productos inactivos',
                    error: adminCheck.error
                };
            }
        }

        const products = await getAllProductsService(includeInactive);

        console.log('🔍 Products:', products);
        // Serializar explícitamente para Next.js
        return {
            success: true,
            products: JSON.parse(JSON.stringify(products))
        };
    } catch (error) {
        console.error('Error en getAllProductsAction:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Server Action: Obtener un producto por ID
 */
export async function getProductByIdAction(productId: string): Promise<{ success: boolean; product?: AdminProduct; message?: string; error?: string }> {
    try {
        const product = await getProductByIdService(productId);
        
        if (!product) {
            return {
                success: false,
                message: 'Producto no encontrado',
                error: 'PRODUCT_NOT_FOUND'
            };
        }

        // Serializar explícitamente para Next.js
        return {
            success: true,
            product: JSON.parse(JSON.stringify(product))
        };
    } catch (error) {
        console.error('Error en getProductByIdAction:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Server Action: Actualizar un producto
 */
export async function updateProductAction(productId: string, updateData: Partial<CreateAdminProduct>) {
    try {
        // Verificar permisos de administrador
        const adminCheck = await requireAdminRole();
        if (!adminCheck.success) {
            return {
                success: false,
                message: 'Acceso denegado',
                error: adminCheck.error
            };
        }

        const result = await updateProductService(productId, updateData);
        
        // Serializar explícitamente el resultado para Next.js
        if (result.success && result.product) {
            return {
                ...result,
                product: JSON.parse(JSON.stringify(result.product))
            };
        }
        
        return result;
    } catch (error) {
        console.error('Error en updateProductAction:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Server Action: Eliminar un producto (soft delete)
 */
export async function deleteProductAction(productId: string) {
    try {
        // Verificar permisos de administrador
        const adminCheck = await requireAdminRole();
        if (!adminCheck.success) {
            return {
                success: false,
                message: 'Acceso denegado',
                error: adminCheck.error
            };
        }

        const result = await deleteProductService(productId);
        
        // Serializar explícitamente para Next.js
        return JSON.parse(JSON.stringify(result));
    } catch (error) {
        console.error('Error en deleteProductAction:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Server Action: Buscar productos
 */
export async function searchProductsAction(searchTerm: string): Promise<{ success: boolean; products?: AdminProduct[]; message?: string; error?: string }> {
    try {
        const products = await searchProductsService(searchTerm);
        return {
            success: true,
            products
        };
    } catch (error) {
        console.error('Error en searchProductsAction:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Server Action: Obtener productos para mostrar en la página de inicio
 * Transforma los datos de AdminProduct al formato esperado por la UI
 */
export async function getProductsForHomeAction(): Promise<{ success: boolean; products?: any[]; message?: string; error?: string }> {
    try {
        const result = await getAllProductsService(false); // Solo productos activos
        
        // Transformar los datos al formato esperado por la página de inicio
        const transformedProducts = result.map(product => {
            
            // Precio normal (solo minorista)
            const normalPrice = product.precioMinorista?.toString() || 'Consultar precio';
            
            // Detectar si tiene oferta
            const hasOffer = !!product.precioOferta;
            
            // Precio de oferta
            const offerPrice = hasOffer && product.precioOferta ? product.precioOferta.toString() : null;
            
            const transformedProduct = {
                id: product._id,
                name: product.titulo,
                description: product.descripcion,
                priceRange: normalPrice,
                category: product.categoria,
                image: (product.imagenes && product.imagenes.length > 0) 
                    ? product.imagenes[0] 
                    : 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
                stock: product.stock || 0,
                // Campos para ofertas (simplificado)
                isOnOffer: hasOffer,
                originalPrice: hasOffer ? normalPrice : undefined,
                offerPrice: hasOffer ? offerPrice : undefined,
                // Campos para envío
                weight: product.dimensiones?.peso || 0.5, // Usar peso del producto en gramos o 500g por defecto
                dimensions: product.dimensiones ? {
                    alto: product.dimensiones.alto,
                    ancho: product.dimensiones.ancho,
                    profundidad: product.dimensiones.profundidad,
                    peso: product.dimensiones.peso || 0.5 // Incluir peso en las dimensiones
                } : undefined
            };
            return transformedProduct;
        });

        return {
            success: true,
            products: transformedProducts
        };
    } catch (error) {
        console.error('Error en getProductsForHomeAction:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}
