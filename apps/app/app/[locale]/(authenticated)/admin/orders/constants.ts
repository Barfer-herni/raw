import type { Order } from '@repo/data-services/src/types/barfer';

// Traducciones de estado
export const STATUS_TRANSLATIONS: Record<Order['status'], string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

// Traducciones de métodos de pago
export const PAYMENT_METHOD_TRANSLATIONS: Record<string, string> = {
    Efectivo: 'Efectivo',
    Transferencia: 'Transferencia',
    'Tarjeta de Crédito': 'Tarjeta de Crédito',
    'Tarjeta de Débito': 'Tarjeta de Débito',
    'Mercado Pago': 'Mercado Pago',
};

// Opciones de estado
export const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' },
];

// Opciones de método de pago
export const PAYMENT_METHOD_OPTIONS = [
    { value: 'Efectivo', label: 'Efectivo' },
    { value: 'Transferencia', label: 'Transferencia' },
    { value: 'Tarjeta de Crédito', label: 'Tarjeta de Crédito' },
    { value: 'Tarjeta de Débito', label: 'Tarjeta de Débito' },
    { value: 'Mercado Pago', label: 'Mercado Pago' },
];

// Opciones de tipo de cliente
export const ORDER_TYPE_OPTIONS = [
    { value: 'minorista', label: 'Minorista' },
    { value: 'mayorista', label: 'Mayorista' },
];

// Colores por día de la semana
export const DAY_COLORS = {
    0: 'bg-gray-100', // Domingo
    1: 'bg-green-100', // Lunes
    2: 'bg-red-100', // Martes
    3: 'bg-yellow-100', // Miércoles
    4: 'bg-yellow-600', // Jueves
    5: 'bg-purple-100', // Viernes
    6: 'bg-blue-100', // Sábado
};

