'use server'

import { getCollection, ObjectId } from '@repo/database';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export interface User {
    _id?: ObjectId;
    id?: string;
    name: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    address?: {
        street: string;
        apartment?: string;
        city: string;
        province: string;
        postalCode: string;
        notes?: string;
    };
    role: 'user' | 'admin';
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface RegisterData {
    name: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface UpdateProfileData {
    name?: string;
    lastName?: string;
    phone?: string;
    address?: {
        street: string;
        apartment?: string;
        city: string;
        province: string;
        postalCode: string;
        notes?: string;
    };
}

/**
 * Registrar un nuevo usuario
 */
export async function registerUser(data: RegisterData) {
    try {
        const usersCollection = await getCollection('users');

        // Verificar si ya existe un usuario con ese email
        const existingUser = await usersCollection.findOne({ email: data.email });

        if (existingUser) {
            return {
                success: false,
                message: 'Ya existe un usuario con este email',
                error: 'EMAIL_ALREADY_EXISTS'
            };
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(data.password, 12);

        // Crear el nuevo usuario
        const newUser: Omit<User, '_id' | 'id'> = {
            name: data.name,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
            phone: data.phone,
            role: 'user',
            permissions: [
                'account:view_own',
                'account:edit_own',
                'products:view',
                'products:purchase',
                'cart:view',
                'cart:checkout',
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await usersCollection.insertOne(newUser);

        // Retornar usuario sin contraseña
        return {
            success: true,
            user: {
                id: result.insertedId.toString(),
                name: newUser.name,
                lastName: newUser.lastName,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                permissions: newUser.permissions,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt,
            }
        };
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return {
            success: false,
            message: 'Error interno del servidor al registrar el usuario',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Iniciar sesión
 */
export async function loginUser(data: LoginData) {
    try {
        const usersCollection = await getCollection('users');
        const gestorUsersCollection = await getCollection('users_gestor');

        // Buscar usuario por email en ambas tablas
        const [regularUser, gestorUser] = await Promise.all([
            usersCollection.findOne({ email: data.email }),
            gestorUsersCollection.findOne({ email: data.email })
        ]);

        const user = regularUser || gestorUser;

        if (!user) {
            return {
                success: false,
                message: 'Credenciales inválidas',
                error: 'INVALID_CREDENTIALS'
            };
        }

        // Comparar contraseña hasheada
        const passwordMatch = await bcrypt.compare(data.password, user.password);

        if (!passwordMatch) {
            return {
                success: false,
                message: 'Credenciales inválidas',
                error: 'INVALID_CREDENTIALS'
            };
        }

        // Crear la sesión del usuario
        // Asegurar que siempre haya permisos por defecto para usuarios normales
        const defaultPermissions = ['account:view_own', 'account:edit_own'];
        const userPermissions = Array.isArray(user.permissions) && user.permissions.length > 0
            ? user.permissions
            : defaultPermissions;

        const userData = {
            id: user._id.toString(),
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
            permissions: userPermissions,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        // La sesión se creará después del login exitoso

        // Retornar éxito con datos del usuario (sin contraseña)
        return {
            success: true,
            user: userData
        };
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Obtener usuario por ID
 */
export async function getUserById(userId: string) {
    try {
        const usersCollection = await getCollection('users');
        const gestorUsersCollection = await getCollection('users_gestor');

        const [regularUser, gestorUser] = await Promise.all([
            usersCollection.findOne({ _id: new ObjectId(userId) }),
            gestorUsersCollection.findOne({ _id: new ObjectId(userId) })
        ]);

        const user = regularUser || gestorUser;

        if (!user) {
            return null;
        }

        // Asegurar que siempre haya permisos por defecto para usuarios normales
        const defaultPermissions = ['account:view_own', 'account:edit_own'];
        const userPermissions = Array.isArray(user.permissions) && user.permissions.length > 0
            ? user.permissions
            : defaultPermissions;


        console.log("user : ", user)
        // Retornar usuario sin contraseña
        return {
            id: user._id.toString(),
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
            permissions: userPermissions,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isGestorUser: !!user.isGestorUser
        };
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        return null;
    }
}

/**
 * Actualizar perfil de usuario
 */
export async function updateUserProfile(userId: string, data: UpdateProfileData) {
    try {
        const usersCollection = await getCollection('users');
        const gestorUsersCollection = await getCollection('users_gestor');

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (data.name) updateData.name = data.name;
        if (data.lastName) updateData.lastName = data.lastName;
        if (data.phone) updateData.phone = data.phone;
        if (data.address) updateData.address = data.address;

        console.log('--- DATABASE UPDATE START ---');
        console.log('User ID:', userId);
        console.log('Update Data:', JSON.stringify(updateData, null, 2));

        // Find which collection the user belongs to
        const [regularUser, gestorUser] = await Promise.all([
            usersCollection.findOne({ _id: new ObjectId(userId) }),
            gestorUsersCollection.findOne({ _id: new ObjectId(userId) })
        ]);

        let result;
        let collectionType = '';

        if (regularUser) {
            collectionType = 'users';
            console.log('User found in "users" collection');
            result = await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $set: updateData }
            );
        } else if (gestorUser) {
            collectionType = 'users_gestor';
            console.log('User found in "users_gestor" collection');
            result = await gestorUsersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $set: updateData }
            );
        } else {
            console.log('User NOT FOUND in any collection');
            return {
                success: false,
                message: 'Usuario no encontrado',
                error: 'USER_NOT_FOUND'
            };
        }

        console.log(`Update result for ${collectionType}:`, {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            acknowledged: result.acknowledged
        });
        console.log('--- DATABASE UPDATE END ---');

        if (result.matchedCount === 0) {
            return {
                success: false,
                message: 'No se pudo actualizar el perfil',
                error: 'UPDATE_FAILED'
            };
        }

        // Obtener el usuario actualizado
        const updatedUser = await getUserById(userId);

        return {
            success: true,
            user: updatedUser
        };
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Cambiar contraseña
 */
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
        const usersCollection = await getCollection('users');

        // Obtener el usuario
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return {
                success: false,
                message: 'Usuario no encontrado',
                error: 'USER_NOT_FOUND'
            };
        }

        // Verificar contraseña actual
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);

        if (!passwordMatch) {
            return {
                success: false,
                message: 'La contraseña actual no es correcta',
                error: 'INVALID_CURRENT_PASSWORD'
            };
        }

        // Hash de la nueva contraseña
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Actualizar contraseña
        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    password: hashedNewPassword,
                    updatedAt: new Date()
                }
            }
        );

        return {
            success: true,
            message: 'Contraseña actualizada exitosamente'
        };
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Obtener usuario actual desde la sesión/cookie
 */
export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const userSession = cookieStore.get('auth-token');

        if (!userSession) {
            return null;
        }

        // Parsear la sesión (asumiendo que contiene el ID del usuario)
        let sessionData;
        try {
            sessionData = JSON.parse(userSession.value);
        } catch {
            return null;
        }

        if (!sessionData.userId) {
            return null;
        }

        // Obtener el usuario de la base de datos (buscar en ambas tablas)
        const usersCollection = await getCollection('users');
        const gestorUsersCollection = await getCollection('users_gestor');

        const [regularUser, gestorUser] = await Promise.all([
            usersCollection.findOne({ _id: new ObjectId(sessionData.userId) }),
            gestorUsersCollection.findOne({ _id: new ObjectId(sessionData.userId) })
        ]);

        const user = regularUser || gestorUser;

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
            address: user.address,
            role: user.role,
            permissions: userPermissions,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        return null;
    }
}

/**
 * Crear sesión de usuario (guardar en cookie)
 */
export async function createUserSession(user: any) {
    try {
        const cookieStore = await cookies();
        // Asegurar que siempre haya permisos por defecto para usuarios normales
        const defaultPermissions = ['account:view_own', 'account:edit_own'];
        const userPermissions = Array.isArray(user.permissions) && user.permissions.length > 0
            ? user.permissions
            : defaultPermissions;

        const sessionData = {
            id: user.id,
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: userPermissions
        };

        cookieStore.set('auth-token', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 días
        });

        return { success: true };
    } catch (error) {
        console.error('Error al crear sesión:', error);
        return { success: false };
    }
}

/**
 * Eliminar sesión de usuario (logout)
 */
export async function clearUserSession() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('auth-token');
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar sesión:', error);
        return { success: false };
    }
}

/**
 * Login completo con creación de sesión
 */
export async function loginWithSession(data: LoginData) {
    const loginResult = await loginUser(data);

    if (loginResult.success && loginResult.user) {
        await createUserSession(loginResult.user);
    }

    return loginResult;
}

/**
 * Cerrar sesión (alias para clearUserSession)
 */
export async function signOut() {
    return await clearUserSession();
}

/**
 * Crear un usuario (función admin)
 */
export async function createUser(data: RegisterData & { role?: 'user' | 'admin'; permissions?: string[] }) {
    try {
        const usersCollection = await getCollection('users');

        // Verificar si ya existe un usuario con ese email
        const existingUser = await usersCollection.findOne({ email: data.email });

        if (existingUser) {
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

        // Crear el nuevo usuario
        const newUser: Omit<User, '_id' | 'id'> = {
            name: data.name,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
            phone: data.phone,
            role: data.role || 'user',
            permissions: Array.from(permissionsWithDefault),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await usersCollection.insertOne(newUser);

        // Retornar usuario sin contraseña
        return {
            success: true,
            user: {
                id: result.insertedId.toString(),
                name: newUser.name,
                lastName: newUser.lastName,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                permissions: newUser.permissions,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt,
            }
        };
    } catch (error) {
        console.error('Error al crear usuario:', error);
        return {
            success: false,
            message: 'Error interno del servidor al crear el usuario',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Obtener todos los usuarios (función admin)
 */
export async function getAllUsers(excludeUserId?: string) {
    try {
        const usersCollection = await getCollection('users');

        const filter = excludeUserId ? { _id: { $ne: new ObjectId(excludeUserId) } } : {};
        const users = await usersCollection.find(filter).sort({ createdAt: -1 }).toArray();

        // Mapear para no incluir passwords
        const defaultPermissions = ['account:view_own', 'account:edit_own'];
        return users.map(user => ({
            id: user._id.toString(),
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
            permissions: Array.isArray(user.permissions) && user.permissions.length > 0
                ? user.permissions
                : defaultPermissions,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        throw new Error("No se pudieron obtener los usuarios");
    }
}

/**
 * Actualizar un usuario (función admin)
 */
export async function updateUser(userId: string, data: UpdateProfileData & { role?: 'user' | 'admin'; permissions?: string[]; password?: string }) {
    try {
        const usersCollection = await getCollection('users');

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (data.name) updateData.name = data.name;
        if (data.lastName) updateData.lastName = data.lastName;
        if (data.phone) updateData.phone = data.phone;
        if (data.address) updateData.address = data.address;
        if (data.role) updateData.role = data.role;
        if (data.permissions !== undefined) updateData.permissions = data.permissions;

        // Solo hashear la contraseña si se proporciona una nueva
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 12);
        }

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            throw new Error('Usuario no encontrado');
        }

        // Obtener el usuario actualizado
        const updatedUser = await getUserById(userId);
        return updatedUser;
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        throw new Error("No se pudo actualizar el usuario");
    }
}

/**
 * Eliminar un usuario (función admin)
 */
export async function deleteUser(userId: string) {
    try {
        const usersCollection = await getCollection('users');

        const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });

        if (result.deletedCount === 0) {
            throw new Error('Usuario no encontrado');
        }

        return { success: true };
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        throw new Error("No se pudo eliminar el usuario");
    }
}