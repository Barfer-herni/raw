import { getCollection, ObjectId } from '@repo/database';
import bcrypt from 'bcryptjs';

export interface GestorUser {
    _id?: ObjectId;
    id?: string;
    name: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role: 'user' | 'admin';
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string; // ID del admin que lo creó
    isGestorUser: true; // Flag para identificar que es un usuario de gestión
}

export interface CreateGestorUserData {
    name: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'user' | 'admin';
    permissions?: string[];
    createdBy?: string;
}

/**
 * Crear un usuario de gestión (creado por admin)
 */
export async function createGestorUser(data: CreateGestorUserData) {
    try {
        const gestorUsersCollection = await getCollection('users_gestor');
        const regularUsersCollection = await getCollection('users');

        // Verificar si ya existe un usuario con ese email en ambas tablas
        const [existingGestorUser, existingRegularUser] = await Promise.all([
            gestorUsersCollection.findOne({ email: data.email }),
            regularUsersCollection.findOne({ email: data.email })
        ]);

        if (existingGestorUser || existingRegularUser) {
            return {
                success: false,
                message: 'Ya existe un usuario con este email',
                error: 'EMAIL_ALREADY_EXISTS'
            };
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(data.password, 12);

        // Asegurar permisos por defecto
        const permissionsWithDefault = new Set(data.permissions || []);
        permissionsWithDefault.add('account:view_own');
        permissionsWithDefault.add('account:edit_own');

        // Crear el nuevo usuario de gestión
        const newGestorUser: Omit<GestorUser, '_id' | 'id'> = {
            name: data.name,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
            phone: data.phone,
            role: data.role || 'user',
            permissions: Array.from(permissionsWithDefault),
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: data.createdBy,
            isGestorUser: true,
        };

        const result = await gestorUsersCollection.insertOne(newGestorUser);

        // Retornar usuario sin contraseña
        return {
            success: true,
            user: {
                id: result.insertedId.toString(),
                name: newGestorUser.name,
                lastName: newGestorUser.lastName,
                email: newGestorUser.email,
                phone: newGestorUser.phone,
                role: newGestorUser.role,
                permissions: newGestorUser.permissions,
                createdAt: newGestorUser.createdAt,
                updatedAt: newGestorUser.updatedAt,
                isGestorUser: true,
            }
        };
    } catch (error) {
        console.error('Error al crear usuario de gestión:', error);
        return {
            success: false,
            message: 'Error interno del servidor al crear el usuario de gestión',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Obtener todos los usuarios de gestión
 */
export async function getAllGestorUsers(excludeUserId?: string) {
    try {
        const gestorUsersCollection = await getCollection('users_gestor');
        
        const filter = excludeUserId ? { _id: { $ne: new ObjectId(excludeUserId) } } : {};
        const users = await gestorUsersCollection.find(filter).sort({ createdAt: -1 }).toArray();

        // Mapear para no incluir passwords
        const defaultPermissions = ['account:view_own', 'account:edit_own'];
        return users.map(user => ({
            id: user._id.toString(),
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            permissions: Array.isArray(user.permissions) && user.permissions.length > 0 
                ? user.permissions 
                : defaultPermissions,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isGestorUser: true,
        }));
    } catch (error) {
        console.error('Error al obtener usuarios de gestión:', error);
        return [];
    }
}

/**
 * Obtener un usuario de gestión por ID
 */
export async function getGestorUserById(userId: string) {
    try {
        const gestorUsersCollection = await getCollection('users_gestor');
        const user = await gestorUsersCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return null;
        }

        // Asegurar que siempre haya permisos por defecto para usuarios normales
        const defaultPermissions = ['account:view_own', 'account:edit_own'];
        const userPermissions = Array.isArray(user.permissions) && user.permissions.length > 0 
            ? user.permissions 
            : defaultPermissions;

        // Retornar usuario sin contraseña
        return {
            id: user._id.toString(),
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            permissions: userPermissions,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isGestorUser: true,
        };
    } catch (error) {
        console.error('Error al obtener usuario de gestión por ID:', error);
        return null;
    }
}

/**
 * Obtener un usuario de gestión por email
 */
export async function getGestorUserByEmail(email: string) {
    try {
        const gestorUsersCollection = await getCollection('users_gestor');
        const user = await gestorUsersCollection.findOne({ email });

        if (!user) {
            return null;
        }

        // Asegurar que siempre haya permisos por defecto para usuarios normales
        const defaultPermissions = ['account:view_own', 'account:edit_own'];
        const userPermissions = Array.isArray(user.permissions) && user.permissions.length > 0 
            ? user.permissions 
            : defaultPermissions;

        // Retornar usuario con contraseña (para autenticación)
        return {
            id: user._id.toString(),
            _id: user._id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            password: user.password, // Incluir password para verificación
            phone: user.phone,
            role: user.role,
            permissions: userPermissions,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isGestorUser: true,
        };
    } catch (error) {
        console.error('Error al obtener usuario de gestión por email:', error);
        return null;
    }
}

/**
 * Actualizar un usuario de gestión
 */
export async function updateGestorUser(userId: string, data: Partial<CreateGestorUserData>) {
    try {
        const gestorUsersCollection = await getCollection('users_gestor');

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (data.name) updateData.name = data.name;
        if (data.lastName) updateData.lastName = data.lastName;
        if (data.email) updateData.email = data.email;
        if (data.phone) updateData.phone = data.phone;
        if (data.role) updateData.role = data.role;
        if (data.permissions) updateData.permissions = data.permissions;
        
        // Si se proporciona una nueva contraseña, hashearla
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 12);
        }

        const result = await gestorUsersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return {
                success: false,
                message: 'Usuario de gestión no encontrado',
                error: 'USER_NOT_FOUND'
            };
        }

        return {
            success: true,
            message: 'Usuario de gestión actualizado exitosamente'
        };
    } catch (error) {
        console.error('Error al actualizar usuario de gestión:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Eliminar un usuario de gestión
 */
export async function deleteGestorUser(userId: string) {
    try {
        const gestorUsersCollection = await getCollection('users_gestor');

        const result = await gestorUsersCollection.deleteOne({ _id: new ObjectId(userId) });

        if (result.deletedCount === 0) {
            return {
                success: false,
                message: 'Usuario de gestión no encontrado',
                error: 'USER_NOT_FOUND'
            };
        }

        return {
            success: true,
            message: 'Usuario de gestión eliminado exitosamente'
        };
    } catch (error) {
        console.error('Error al eliminar usuario de gestión:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Obtener todos los usuarios (regulares + gestión) - útil para listados completos
 */
export async function getAllUsersIncludingGestor(excludeUserId?: string) {
    try {
        const [regularUsers, gestorUsers] = await Promise.all([
            (async () => {
                const usersCollection = await getCollection('users');
                const filter = excludeUserId ? { _id: { $ne: new ObjectId(excludeUserId) } } : {};
                return usersCollection.find(filter).sort({ createdAt: -1 }).toArray();
            })(),
            (async () => {
                const gestorUsersCollection = await getCollection('users_gestor');
                const filter = excludeUserId ? { _id: { $ne: new ObjectId(excludeUserId) } } : {};
                return gestorUsersCollection.find(filter).sort({ createdAt: -1 }).toArray();
            })()
        ]);

        const defaultPermissions = ['account:view_own', 'account:edit_own'];

        const allUsers = [
            ...regularUsers.map(user => ({
                id: user._id.toString(),
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                permissions: Array.isArray(user.permissions) && user.permissions.length > 0 
                    ? user.permissions 
                    : defaultPermissions,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                isGestorUser: false,
            })),
            ...gestorUsers.map(user => ({
                id: user._id.toString(),
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                permissions: Array.isArray(user.permissions) && user.permissions.length > 0 
                    ? user.permissions 
                    : defaultPermissions,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                isGestorUser: true,
            }))
        ];

        // Ordenar por fecha de creación
        allUsers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return allUsers;
    } catch (error) {
        console.error('Error al obtener todos los usuarios:', error);
        return [];
    }
}
