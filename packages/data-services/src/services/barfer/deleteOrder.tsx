import 'server-only';
import { getCollection, ObjectId } from '@repo/database';
import type { Order } from '../../types/barfer';

export async function deleteOrder(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const collection = await getCollection('orders');

        // Verificar que la orden existe antes de eliminarla
        const existingOrder = await collection.findOne({ _id: new ObjectId(id) });
        if (!existingOrder) {
            return { success: false, error: 'Order not found' };
        }

        // Eliminar la orden
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return { success: false, error: 'Failed to delete order' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting order:', error);
        return { success: false, error: 'Internal server error' };
    }
}