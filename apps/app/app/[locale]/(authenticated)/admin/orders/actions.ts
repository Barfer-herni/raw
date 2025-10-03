'use server';

import { revalidatePath } from 'next/cache';
import { getAllOrders, updateOrder, deleteOrder } from '@repo/data-services/src/services/barfer';
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

