'use server'

import { 
    createProductCategory as createCategoryService,
    getAllProductCategories as getAllCategoriesService,
    updateProductCategory as updateCategoryService,
    deleteProductCategory as deleteCategoryService,
    getProductCategoryById as getCategoryByIdService
} from './categoriasProductosService';
import { requireAdminRole } from './authHelpers';
import type { CreateProductCategory, ProductCategory } from './categoriasProductosService';

/**
 * Server Action: Crear una nueva categoría
 */
export async function createCategoryAction(categoryData: CreateProductCategory) {
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
        if (!categoryData.name) {
            return {
                success: false,
                message: 'El nombre de la categoría es obligatorio',
                error: 'VALIDATION_ERROR'
            };
        }

        const result = await createCategoryService(categoryData);
        return result;
    } catch (error) {
        console.error('Error en createCategoryAction:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Server Action: Obtener todas las categorías
 */
export async function getAllCategoriesAction(includeInactive = false): Promise<{ success: boolean; categories?: ProductCategory[]; message?: string; error?: string }> {
    try {
        const categories = await getAllCategoriesService(includeInactive);
        return {
            success: true,
            categories
        };
    } catch (error) {
        console.error('Error en getAllCategoriesAction:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Server Action: Obtener una categoría por ID
 */
export async function getCategoryByIdAction(categoryId: string): Promise<{ success: boolean; category?: ProductCategory; message?: string; error?: string }> {
    try {
        const category = await getCategoryByIdService(categoryId);
        
        if (!category) {
            return {
                success: false,
                message: 'Categoría no encontrada',
                error: 'CATEGORY_NOT_FOUND'
            };
        }

        return {
            success: true,
            category
        };
    } catch (error) {
        console.error('Error en getCategoryByIdAction:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Server Action: Actualizar una categoría
 */
export async function updateCategoryAction(categoryId: string, updateData: Partial<CreateProductCategory>) {
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

        const result = await updateCategoryService(categoryId, updateData);
        return result;
    } catch (error) {
        console.error('Error en updateCategoryAction:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Server Action: Eliminar una categoría (soft delete)
 */
export async function deleteCategoryAction(categoryId: string) {
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

        const result = await deleteCategoryService(categoryId);
        return result;
    } catch (error) {
        console.error('Error en deleteCategoryAction:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}
