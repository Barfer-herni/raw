'use server';

import { revalidatePath } from 'next/cache';
import {
    changePassword as changePasswordService,
} from '@repo/auth/server';
import { 
    getAllCategorias 
} from '@repo/data-services';
// Importar directamente desde el archivo del servicio
import { createGestorUser, updateGestorUser, deleteGestorUser } from '@repo/data-services/src/services/gestorUsersService';
// Importar funciones de MongoDB para actualizar perfil de usuario
import { updateUserProfile } from '@repo/data-services/src/services/authService';
import { z } from 'zod';
import type { UserRole } from '@repo/database';
import { hasPermission } from '@repo/auth/server-permissions';
import { getCurrentUser } from '@repo/auth/server';
import { database } from '@repo/database';

// Esquema para la actualización del perfil
const profileSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'El apellido es requerido'),
    email: z.string().email('Email inválido'),
});

// Esquema para el cambio de contraseña
const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

// Esquema para crear/actualizar usuario
const userSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'El apellido es requerido'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
    role: z.enum(['admin', 'user']),
    permissions: z.array(z.string()),
});

export async function updateProfile(userId: string, formData: FormData) {
    try {
        // Verificar que el usuario esté autenticado y editando su propio perfil
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.id !== userId) {
            return { success: false, message: 'Solo puedes editar tu propio perfil.' };
        }

        const data = Object.fromEntries(formData.entries());
        const validated = profileSchema.safeParse(data);

        if (!validated.success) {
            return { success: false, message: validated.error.errors[0].message };
        }

        // Actualizar perfil usando el servicio de MongoDB
        const result = await updateUserProfile(userId, validated.data);

        if (!result.success) {
            return { success: false, message: result.message || 'Error al actualizar el perfil' };
        }

        revalidatePath('/admin/account');
        return { success: true, message: 'Perfil actualizado exitosamente' };
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        return { success: false, message: 'Error al actualizar el perfil' };
    }
}

export async function changePassword(userId: string, formData: FormData) {
    try {
        if (!await hasPermission('account:change_password')) {
            return { success: false, message: 'No tienes permisos para cambiar la contraseña.' };
        }

        const data = Object.fromEntries(formData.entries());
        const validated = passwordSchema.safeParse(data);

        if (!validated.success) {
            return { success: false, message: validated.error.errors[0].message };
        }

        const result = await changePasswordService(
            userId,
            validated.data.currentPassword,
            validated.data.newPassword
        );

        if (!result.success) {
            return { success: false, message: result.message || 'Error al cambiar la contraseña' };
        }

        revalidatePath('/admin/account');
        return { success: true, message: 'Contraseña actualizada exitosamente' };

    } catch (error) {
        return { success: false, message: 'Error al cambiar la contraseña' };
    }
}

export async function createUser(formData: FormData) {
    try {
        if (!await hasPermission('account:manage_users')) {
            return { success: false, message: 'No tienes permisos para crear usuarios.' };
        }

        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return { success: false, message: 'No se pudo obtener el usuario actual.' };
        }

        const data = {
            name: formData.get('name'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            permissions: JSON.parse(formData.get('permissions') as string || '[]'),
        };

        const validated = userSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, message: validated.error.errors[0].message };
        }
        if (!validated.data.password) {
            return { success: false, message: "La contraseña es requerida para nuevos usuarios." };
        }

        // Crear usuario en la tabla users_gestor (usuarios creados por admin)
        const result = await createGestorUser({ 
            ...validated.data, 
            role: validated.data.role as UserRole, 
            password: validated.data.password,
            createdBy: currentUser.id
        });

        if (!result.success) {
            return { success: false, message: result.message || 'Error al crear el usuario de gestión' };
        }

        revalidatePath('/admin/account');
        return { success: true, message: 'Usuario de gestión creado exitosamente' };

    } catch (error) {
        console.error('Error al crear usuario de gestión:', error);
        return { success: false, message: 'Error al crear el usuario de gestión' };
    }
}

export async function updateUser(userId: string, formData: FormData) {
    try {
        if (!await hasPermission('account:manage_users')) {
            return { success: false, message: 'No tienes permisos para actualizar usuarios.' };
        }

        const data = {
            name: formData.get('name'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            permissions: JSON.parse(formData.get('permissions') as string || '[]'),
        };

        const validated = userSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, message: validated.error.errors[0].message };
        }

        // Actualizar usuario en la tabla users_gestor
        const result = await updateGestorUser(userId, { 
            ...validated.data, 
            role: validated.data.role as UserRole 
        });

        if (!result.success) {
            return { success: false, message: result.message || 'Error al actualizar el usuario de gestión' };
        }

        revalidatePath('/admin/account');
        return { success: true, message: 'Usuario de gestión actualizado exitosamente' };

    } catch (error) {
        console.error('Error al actualizar usuario de gestión:', error);
        return { success: false, message: 'Error al actualizar el usuario de gestión' };
    }
}

export async function updateUserCategoryPermissions(userId: string, permissions: string[]) {
    try {
        if (!await hasPermission('account:manage_users')) {
            return { success: false, message: 'No tienes permisos para actualizar permisos de usuarios.' };
        }

        // Obtener usuario actual
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return { success: false, message: 'Usuario no autenticado.' };
        }

        // Verificar que no se está editando a sí mismo
        if (currentUser.id === userId) {
            return { success: false, message: 'No puedes modificar tus propios permisos de categorías.' };
        }

        // Actualizar SOLO los permisos del usuario sin tocar otros campos
        await database.user.update({
            where: { id: userId },
            data: {
                permissions: permissions
            }
        });

        revalidatePath('/admin/account');
        return { success: true, message: 'Permisos de categorías actualizados exitosamente' };

    } catch (error) {
        console.error('Error updating user category permissions:', error);
        return { success: false, message: 'Error al actualizar los permisos de categorías' };
    }
}

export async function getAvailableCategoriesAction() {
    try {
        const result = await getAllCategorias();

        if (result.success && result.categorias) {
            return {
                success: true,
                categories: result.categorias.map(cat => cat.nombre)
            };
        }

        return { success: false, categories: [] };
    } catch (error) {
        console.error('Error getting available categories:', error);
        return { success: false, categories: [] };
    }
}


export async function deleteUser(userId: string) {
    try {
        if (!await hasPermission('account:manage_users')) {
            return { success: false, message: 'No tienes permisos para eliminar usuarios.' };
        }

        // Eliminar usuario de la tabla users_gestor
        const result = await deleteGestorUser(userId);
        
        if (!result.success) {
            return { success: false, message: result.message || 'Error al eliminar el usuario de gestión' };
        }

        revalidatePath('/admin/account');
        return { success: true, message: 'Usuario de gestión eliminado exitosamente' };

    } catch (error) {
        console.error('Error al eliminar usuario de gestión:', error);
        return { success: false, message: 'Error al eliminar el usuario de gestión' };
    }
}

export async function updateDeliveryInfo(userId: string, formData: FormData) {
    try {
        // Verificar que el usuario esté autenticado y editando su propia información
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.id !== userId) {
            return { success: false, message: 'Solo puedes actualizar tu propia información.' };
        }

        const phone = formData.get('phone') as string;
        const street = formData.get('street') as string;
        const apartment = formData.get('apartment') as string;
        const city = formData.get('city') as string;
        const province = formData.get('province') as string;
        const postalCode = formData.get('postalCode') as string;
        const notes = formData.get('notes') as string;

        // Validación básica
        if (!phone || !street || !city || !province || !postalCode) {
            return { 
                success: false, 
                message: 'Por favor completa todos los campos obligatorios: teléfono, dirección, ciudad, provincia y código postal.' 
            };
        }

        const addressData = {
            street,
            apartment: apartment || '',
            city,
            province,
            postalCode,
            notes: notes || ''
        };

        const updateData = {
            phone,
            address: addressData
        };

        // Actualizar usando el servicio de MongoDB (busca en ambas tablas)
        const result = await updateUserProfile(userId, updateData);
        
        if (!result.success) {
            return { 
                success: false, 
                message: result.message || 'Error al actualizar la información de entrega' 
            };
        }

        revalidatePath('/admin/account');
        
        return { 
            success: true, 
            message: 'Información de entrega actualizada exitosamente' 
        };

    } catch (error) {
        console.error('Error updating delivery info:', error);
        return { 
            success: false, 
            message: 'Error al actualizar la información de entrega' 
        };
    }
} 