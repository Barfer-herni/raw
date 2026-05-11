import 'server-only';
import { getOrder } from './getOrder';
import { createOrder } from './createOrder';
import type { Order } from '../../../types/barfer';

/**
 * Duplica una orden existente por su ID
 * @param orderId ID de la orden a duplicar
 * @returns Resultado de la creación de la nueva orden
 */
export async function duplicateOrder(orderId: string): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
        // Obtener la orden original
        const originalOrder = await getOrder(orderId);

        if (!originalOrder) {
            return {
                success: false,
                error: 'Orden no encontrada'
            };
        }

        // Crear una copia de la orden sin el _id y actualizando timestamps
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, createdAt, updatedAt, ...orderData } = originalOrder;

        // Crear la nueva orden duplicada con valores por defecto
        const newOrderData = {
            ...orderData,
            status: 'pending' as const, // Nueva orden empieza como pendiente
            notes: orderData.notes ? `[DUPLICADA] ${orderData.notes}` : '[DUPLICADA]',
            deliveryDay: new Date(), // Nueva fecha de entrega (hoy por defecto)
            // Asegurar que deliveryArea existe o proporcionar valores por defecto
            deliveryArea: orderData.deliveryArea || {
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
        };




        // Usar createOrder para validar y guardar la nueva orden
        return await createOrder(newOrderData as any);
    } catch (error) {
        console.error('Error duplicating order service:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error interno al duplicar la orden'
        };
    }
}
