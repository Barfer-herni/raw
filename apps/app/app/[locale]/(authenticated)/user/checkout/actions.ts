'use server';

import { createOrder } from '@repo/data-services/src/services/barfer';

interface CreateOrderInput {
    total: number;
    subTotal: number;
    shippingPrice: number;
    notes?: string;
    paymentMethod: string;
    orderType: 'minorista' | 'mayorista';
    address: {
        address: string;
        city: string;
        phone: string;
        betweenStreets?: string;
        floorNumber?: string;
        departmentNumber?: string;
    };
    user: {
        name: string;
        lastName: string;
        email: string;
    };
    items: Array<{
        id: string;
        name: string;
        description?: string;
        images?: string[];
        options: Array<{
            name: string;
            price: number;
            quantity: number;
        }>;
        price: number;
        salesCount?: number;
        discountApllied?: number;
    }>;
    deliveryArea?: {
        _id: string;
        description: string;
        coordinates: number[][];
        schedule: string;
        orderCutOffHour: number;
        enabled: boolean;
        sameDayDelivery: boolean;
        sameDayDeliveryDays: string[];
        whatsappNumber: string;
        sheetName: string;
    };
    coupon?: {
        code: string;
        discount: number;
        type: 'percentage' | 'fixed';
    };
    deliveryDay?: string | Date;
}

export async function createOrderAction(orderData: CreateOrderInput) {
    try {
        // Valores por defecto para deliveryArea si no se proporciona
        const defaultDeliveryArea = {
            _id: 'default',
            description: 'Envío estándar',
            coordinates: [[0, 0]],
            schedule: 'L-V 9:00-18:00',
            orderCutOffHour: 18,
            enabled: true,
            sameDayDelivery: false,
            sameDayDeliveryDays: [],
            whatsappNumber: '5491128678999',
            sheetName: 'Órdenes',
        };

        // Preparar los datos de la orden
        const orderToCreate = {
            ...orderData,
            status: 'pending' as const,
            deliveryArea: orderData.deliveryArea || defaultDeliveryArea,
            deliveryDay: orderData.deliveryDay || new Date(),
            paymentMethod: orderData.paymentMethod || 'Efectivo',
        };

        // Crear la orden en la base de datos
        const result = await createOrder(orderToCreate);

        if (!result.success) {
            return {
                success: false,
                message: result.error || 'Error al crear la orden',
            };
        }

        return {
            success: true,
            order: result.order,
            message: 'Orden creada exitosamente',
        };
    } catch (error) {
        console.error('Error en createOrderAction:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido al crear la orden',
        };
    }
}

