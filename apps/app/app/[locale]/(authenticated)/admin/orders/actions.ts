'use server';

import { revalidatePath } from 'next/cache';
import { getAllOrders, updateOrder, deleteOrder, createOrder } from '@repo/data-services/src/services/barfer';
import { requireAdmin } from '@repo/auth/server-permissions';
import type { Order } from '@repo/data-services/src/types/barfer';

/**
 * Obtiene todas las órdenes (solo para admins)
 */
export async function getAllOrdersAction() {
    try {
        await requireAdmin();

        const orders = await getAllOrders({
            sorting: [{ id: 'createdAt', desc: true }],
            limit: 1000 // Límite para evitar problemas de rendimiento
        });

        return {
            success: true,
            orders
        };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al obtener las órdenes',
            orders: []
        };
    }
}

/**
 * Actualiza una orden (solo para admins)
 */
export async function updateOrderAction(orderId: string, data: Partial<Order>) {
    try {
        await requireAdmin();

        await updateOrder(orderId, data);
        revalidatePath('/admin/orders');

        return {
            success: true,
            message: 'Orden actualizada exitosamente'
        };
    } catch (error) {
        console.error('Error updating order:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al actualizar la orden'
        };
    }
}

/**
 * Elimina una orden (solo para admins)
 */
export async function deleteOrderAction(orderId: string) {
    try {
        await requireAdmin();

        const result = await deleteOrder(orderId);

        if (!result.success) {
            return {
                success: false,
                message: result.error || 'Error al eliminar la orden'
            };
        }

        revalidatePath('/admin/orders');

        return {
            success: true,
            message: 'Orden eliminada exitosamente'
        };
    } catch (error) {
        console.error('Error deleting order:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al eliminar la orden'
        };
    }
}

/**
 * Duplica una orden existente (solo para admins)
 */
export async function duplicateOrderAction(orderId: string) {
    try {
        await requireAdmin();

        // Obtener la orden original
        const orders = await getAllOrders({
            sorting: [{ id: 'createdAt', desc: true }],
            limit: 1000
        });

        const originalOrder = orders.find(order => order._id === orderId);

        if (!originalOrder) {
            return {
                success: false,
                message: 'Orden no encontrada'
            };
        }

        // Crear una copia de la orden sin el _id y actualizando timestamps
        const { _id, createdAt, updatedAt, ...orderData } = originalOrder;

        // Crear la nueva orden duplicada con valores por defecto para campos opcionales
        const newOrderData = {
            ...orderData,
            status: 'pending' as const, // Nueva orden empieza como pendiente
            notes: orderData.notes ? `[DUPLICADA] ${orderData.notes}` : '[DUPLICADA]',
            deliveryDay: new Date(), // Nueva fecha de entrega
            // Asegurar que deliveryArea existe o proporcionar valores por defecto
            deliveryArea: orderData.deliveryArea || {
                _id: '',
                description: 'Sin zona de entrega',
                coordinates: [],
                schedule: '09:00-18:00',
                orderCutOffHour: 12,
                enabled: true,
                sameDayDelivery: false,
                sameDayDeliveryDays: [],
                whatsappNumber: '',
                sheetName: '',
            },
        };

        const result = await createOrder(newOrderData as any);

        if (!result.success) {
            return {
                success: false,
                message: result.error || 'Error al duplicar la orden'
            };
        }

        revalidatePath('/admin/orders');

        return {
            success: true,
            message: 'Orden duplicada exitosamente',
            orderId: result.order?._id
        };
    } catch (error) {
        console.error('Error duplicating order:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al duplicar la orden'
        };
    }
}


/**
 * Crea una nueva orden manualmente (solo para admins)
 */
export async function createOrderAction(data: any) {
    try {
        await requireAdmin();

        // Asegurar campos mínimos requeridos que podrían faltar en la creación manual
        const orderData = {
            ...data,
            deliveryArea: data.deliveryArea || {
                _id: 'manual',
                description: 'Venta Manual',
                coordinates: [],
                schedule: '09:00-18:00',
                orderCutOffHour: 12,
                enabled: true,
                sameDayDelivery: false,
                sameDayDeliveryDays: [],
                whatsappNumber: '',
                sheetName: '',
            },
            deliveryDay: data.deliveryDay || new Date(),
        };

        const result = await createOrder(orderData);

        if (!result.success) {
            return {
                success: false,
                message: result.error || 'Error al crear la orden'
            };
        }

        revalidatePath('/admin/orders');

        return {
            success: true,
            message: 'Orden creada exitosamente',
            order: result.order
        };
    } catch (error) {
        console.error('Error creating order:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al crear la orden'
        };
    }
}
