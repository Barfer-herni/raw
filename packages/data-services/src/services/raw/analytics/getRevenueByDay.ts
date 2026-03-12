import 'server-only';
import { getCollection } from '@repo/database';

/**
 * Obtiene estadísticas de ingresos agrupadas por día (solo órdenes confirmadas)
 * 
 * Raw MongoDB result:
 * {
 *   "_id": { "year": 2024, "month": 9, "day": 8 },
 *   "totalRevenue": 240443,
 *   "orderCount": 7
 * }
 * 
 * Formatted result:
 * {
 *   "date": "2024-09-08",
 *   "revenue": 240443,
 *   "orders": 7
 * }
 */
export async function getRevenueByDay(startDate?: Date, endDate?: Date) {
    try {
        const collection = await getCollection('orders');
        const pipeline: any[] = [];

        const matchCondition: any = { status: 'confirmed' };
        if (startDate || endDate) {
            matchCondition.createdAt = {};
            if (startDate) matchCondition.createdAt.$gte = startDate;
            if (endDate) matchCondition.createdAt.$lte = endDate;
        }

        pipeline.push({ $match: matchCondition });

        pipeline.push(
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    totalRevenue: { $sum: '$total' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        );

        const result = await collection.aggregate(pipeline).toArray();

        const formattedResult = result.map((item: any) => ({
            date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
            revenue: item.totalRevenue,
            orders: item.orderCount
        }));

        return formattedResult;
    } catch (error) {
        console.error('Error fetching revenue by day:', error);
        throw error;
    }
}