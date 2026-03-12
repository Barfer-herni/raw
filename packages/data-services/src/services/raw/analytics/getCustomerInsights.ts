import 'server-only';
import { getCollection } from '@repo/database';

/**
 * Obtiene insights completos de clientes: gasto promedio por compra y frecuencia promedio
 * Basado en TODAS las órdenes (pending + confirmed)
 */
export async function getCustomerInsights(startDate?: Date, endDate?: Date) {
    try {
        const collection = await getCollection('orders');

        // Pipeline para calcular todas las métricas en una sola consulta
        const pipeline: any[] = [];

        if (startDate || endDate) {
            const matchCondition: any = {};
            matchCondition.createdAt = {};
            if (startDate) matchCondition.createdAt.$gte = startDate;
            if (endDate) matchCondition.createdAt.$lte = endDate;
            pipeline.push({ $match: matchCondition });
        }

        pipeline.push(
            {
                $group: {
                    _id: '$user',
                    orderCount: { $sum: 1 },
                    totalSpent: { $sum: '$total' },
                    averageOrderValue: { $avg: '$total' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCustomers: { $sum: 1 },
                    totalOrders: { $sum: '$orderCount' },
                    averageOrdersPerCustomer: { $avg: '$orderCount' },
                    totalRevenue: { $sum: '$totalSpent' },
                    averageSpentPerCustomer: { $avg: '$totalSpent' },
                    averageOrderValue: { $avg: '$averageOrderValue' },
                    customersWithMultipleOrders: {
                        $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] }
                    }
                }
            }
        );

        const result = await collection.aggregate(pipeline).toArray();

        if (result.length === 0) {
            return {
                averageOrderValue: 0,
                averageOrdersPerCustomer: 0,
                totalCustomers: 0,
                totalOrders: 0,
                totalRevenue: 0,
                averageSpentPerCustomer: 0,
                repeatCustomerRate: 0
            };
        }

        const data = result[0];
        const repeatCustomerRate = data.totalCustomers > 0
            ? (data.customersWithMultipleOrders / data.totalCustomers) * 100
            : 0;

        return {
            averageOrderValue: Math.round(data.averageOrderValue),
            averageOrdersPerCustomer: Number(data.averageOrdersPerCustomer.toFixed(1)),
            totalCustomers: data.totalCustomers,
            totalOrders: data.totalOrders,
            totalRevenue: data.totalRevenue,
            averageSpentPerCustomer: Math.round(data.averageSpentPerCustomer),
            repeatCustomerRate: Number(repeatCustomerRate.toFixed(1)),
            customersWithMultipleOrders: data.customersWithMultipleOrders
        };
    } catch (error) {
        console.error('Error calculating customer insights:', error);
        throw error;
    }
} 