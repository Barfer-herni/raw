import 'server-only';
import { getCollection, ObjectId } from '@repo/database';
import type { Order } from '../../types/barfer';

export async function getOrder(id: string): Promise<Order | null> {
    try {
        const collection = await getCollection('orders');
        const order = await collection.findOne({ _id: new ObjectId(id) });

        if (!order) return null;

        return {
            ...order,
            _id: order._id.toString(),
        } as unknown as Order;
    } catch (error) {
        console.error('Error fetching order:', error);
        return null;
    }
}
