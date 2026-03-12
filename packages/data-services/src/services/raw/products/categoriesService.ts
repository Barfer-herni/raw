'use server'

import { getCollection, ObjectId } from '@repo/database';

export interface ProductCategory {
    _id?: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductCategory {
    name: string;
    description?: string;
}

/**
 * Inicializar categorías por defecto
 */
export async function initializeDefaultCategories(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const categoriesCollection = await getCollection('categorias');
        
        // Verificar si ya existe la categoría "raw"
        const existingRaw = await categoriesCollection.findOne({ name: 'raw' });
        
        if (!existingRaw) {
            const rawCategory: Omit<ProductCategory, '_id'> = {
                name: 'raw',
                description: 'Categoría por defecto para productos sin categoría específica',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await categoriesCollection.insertOne(rawCategory);
        }

        return {
            success: true,
            message: 'Categorías por defecto inicializadas'
        };

    } catch (error) {
        console.error('Error inicializando categorías por defecto:', error);
        return {
            success: false,
            message: 'Error inicializando categorías por defecto',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Crear una nueva categoría de producto
 */
export async function createProductCategory(categoryData: CreateProductCategory): Promise<{ success: boolean; category?: ProductCategory; message?: string; error?: string }> {
    try {
        const categoriesCollection = await getCollection('categorias');
        
        // Verificar si ya existe una categoría con ese nombre
        const existingCategory = await categoriesCollection.findOne({ name: categoryData.name });
        
        if (existingCategory) {
            return {
                success: false,
                message: 'Ya existe una categoría con este nombre',
                error: 'CATEGORY_ALREADY_EXISTS'
            };
        }

        const newCategory: Omit<ProductCategory, '_id'> = {
            name: categoryData.name,
            description: categoryData.description,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const result = await categoriesCollection.insertOne(newCategory);

        const createdCategory: ProductCategory = {
            _id: result.insertedId.toString(),
            ...newCategory
        };

        return {
            success: true,
            category: createdCategory
        };
    } catch (error) {
        console.error('Error al crear categoría:', error);
        return {
            success: false,
            message: 'Error interno del servidor al crear la categoría',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Obtener todas las categorías
 */
export async function getAllProductCategories(includeInactive = false): Promise<ProductCategory[]> {
    try {
        // Inicializar categorías por defecto si es necesario
        await initializeDefaultCategories();
        
        const categoriesCollection = await getCollection('categorias');
        
        const filter = includeInactive ? {} : { isActive: true };
        const categories = await categoriesCollection.find(filter).sort({ name: 1 }).toArray();

        return categories.map(category => ({
            _id: category._id.toString(),
            name: category.name,
            description: category.description,
            isActive: category.isActive,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        }));
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        return [];
    }
}

/**
 * Obtener una categoría por ID
 */
export async function getProductCategoryById(categoryId: string): Promise<ProductCategory | null> {
    try {
        const categoriesCollection = await getCollection('categorias');
        const category = await categoriesCollection.findOne({ _id: new ObjectId(categoryId) });

        if (!category) {
            return null;
        }

        return {
            _id: category._id.toString(),
            name: category.name,
            description: category.description,
            isActive: category.isActive,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        };
    } catch (error) {
        console.error('Error al obtener categoría por ID:', error);
        return null;
    }
}

/**
 * Actualizar una categoría
 */
export async function updateProductCategory(categoryId: string, updateData: Partial<CreateProductCategory>): Promise<{ success: boolean; category?: ProductCategory; message?: string; error?: string }> {
    try {
        const categoriesCollection = await getCollection('categorias');

        // Si se actualiza el nombre, verificar que no existe otra categoría con ese nombre
        if (updateData.name) {
            const existingCategory = await categoriesCollection.findOne({ 
                name: updateData.name,
                _id: { $ne: new ObjectId(categoryId) }
            });
            
            if (existingCategory) {
                return {
                    success: false,
                    message: 'Ya existe una categoría con este nombre',
                    error: 'CATEGORY_ALREADY_EXISTS'
                };
            }
        }

        const updateFields = {
            ...updateData,
            updatedAt: new Date().toISOString(),
        };

        const result = await categoriesCollection.updateOne(
            { _id: new ObjectId(categoryId) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return {
                success: false,
                message: 'Categoría no encontrada',
                error: 'CATEGORY_NOT_FOUND'
            };
        }

        const updatedCategory = await getProductCategoryById(categoryId);

        return {
            success: true,
            category: updatedCategory!
        };
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        return {
            success: false,
            message: 'Error interno del servidor al actualizar la categoría',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Eliminar una categoría (soft delete)
 */
export async function deleteProductCategory(categoryId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const categoriesCollection = await getCollection('categorias');
        const productsCollection = await getCollection('productos');

        // Verificar si hay productos usando esta categoría
        const productsUsingCategory = await productsCollection.countDocuments({ 
            categoria: categoryId,
            isActive: true 
        });

        if (productsUsingCategory > 0) {
            return {
                success: false,
                message: `No se puede eliminar la categoría porque tiene ${productsUsingCategory} producto(s) asociado(s)`,
                error: 'CATEGORY_IN_USE'
            };
        }

        const result = await categoriesCollection.updateOne(
            { _id: new ObjectId(categoryId) },
            { 
                $set: { 
                    isActive: false,
                    updatedAt: new Date().toISOString()
                }
            }
        );

        if (result.matchedCount === 0) {
            return {
                success: false,
                message: 'Categoría no encontrada',
                error: 'CATEGORY_NOT_FOUND'
            };
        }

        return {
            success: true,
            message: 'Categoría eliminada exitosamente'
        };
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        return {
            success: false,
            message: 'Error interno del servidor al eliminar la categoría',
            error: 'SERVER_ERROR'
        };
    }
}
