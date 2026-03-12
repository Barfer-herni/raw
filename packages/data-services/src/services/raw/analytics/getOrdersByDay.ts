import 'server-only';
import { getCollection } from '@repo/database';

/**
 * Obtiene estadísticas de órdenes agrupadas por día
 * 
 * Raw MongoDB result:
 * {
 *   "_id": { "year": 2024, "month": 9, "day": 8 },
 *   "count": 20,
 *   "totalAmount": 918242.9
 * }
 * 
 * Formatted result:
 * {
 *   "date": "2024-09-08",
 *   "orders": 20,
 *   "revenue": 918242.9
 * }
 */
export async function getOrdersByDay(startDate?: Date, endDate?: Date) {
    try {
        const collection = await getCollection('orders');
        const pipeline: any[] = [];

        const matchCondition: any = {};
        if (startDate || endDate) {
            matchCondition.createdAt = {};
            if (startDate) matchCondition.createdAt.$gte = startDate;
            if (endDate) matchCondition.createdAt.$lte = endDate;
        }

        if (Object.keys(matchCondition).length > 0) {
            pipeline.push({ $match: matchCondition });
        }

        pipeline.push(
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$total' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        );

        const result = await collection.aggregate(pipeline).toArray();

        const formattedResult = result.map((item: any) => ({
            date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
            orders: item.count,
            revenue: item.totalAmount
        }));

        return formattedResult;
    } catch (error) {
        console.error('Error fetching orders by day:', error);
        throw error;
    }
}