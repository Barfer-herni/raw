export interface User {
    id: string;
    name: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: UserAddress;
    role: 'user' | 'admin';
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface UserAddress {
    street: string;
    apartment?: string;
    city: string;
    province: string;
    postalCode: string;
    notes?: string;
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
    address?: UserAddress;
}

export interface UserFormData {
    name: string;
    lastName: string;
    email: string;
    password?: string;
    phone?: string;
}

// Compatibilidad con código existente
export interface UserData extends User {}

export interface AuthResponse {
    success: boolean;
    user?: User;
    message?: string;
    error?: string;
}