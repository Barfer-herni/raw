import 'server-only';
import { getCollection } from '@repo/database';

/**
 * Obtiene estadísticas de métodos de pago basado en órdenes confirmadas
 */
export async function getPaymentMethodStats(startDate?: Date, endDate?: Date, paymentMethodFilter?: string) {
    try {
        const collection = await getCollection('orders');

        const pipeline: any[] = [];
        const matchCondition: any = {};

        // Agregar filtro de fechas si se proporciona
        if (startDate || endDate) {
            matchCondition.createdAt = {};
            if (startDate) matchCondition.createdAt.$gte = startDate;
            if (endDate) matchCondition.createdAt.$lte = endDate;
        }

        // Agregar filtro de método de pago si se proporciona
        if (paymentMethodFilter && paymentMethodFilter !== 'all') {
            // Usamos regex para ser más flexibles con los nombres (ej. "Tarjeta de Crédito", "Tarjeta")
            matchCondition.paymentMethod = { $regex: new RegExp(paymentMethodFilter, 'i') };
        }

        if (Object.keys(matchCondition).length > 0) {
            pipeline.push({ $match: matchCondition });
        }

        pipeline.push(
            {
                $group: {
                    _id: '$paymentMethod',
                    totalCount: { $sum: 1 },
                    totalRevenue: { $sum: '$total' },
                    confirmedCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    },
                    confirmedRevenue: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, '$total', 0] }
                    },
                    pendingCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    pendingRevenue: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$total', 0] }
                    }
                }
            },
            { $sort: { totalCount: -1 } }
        );

        const result = await collection.aggregate(pipeline).toArray();

        const total = result.reduce((sum, item) => sum + item.totalCount, 0);
        const totalRevenue = result.reduce((sum, item) => sum + item.totalRevenue, 0);
        const totalConfirmed = result.reduce((sum, item) => sum + item.confirmedCount, 0);
        const totalConfirmedRevenue = result.reduce((sum, item) => sum + item.confirmedRevenue, 0);
        const totalPending = result.reduce((sum, item) => sum + item.pendingCount, 0);
        const totalPendingRevenue = result.reduce((sum, item) => sum + item.pendingRevenue, 0);

        const formattedResult = result.map((item: any) => ({
            paymentMethod: item._id,
            // Totales (confirmed + pending)
            totalCount: item.totalCount,
            totalRevenue: item.totalRevenue,
            totalPercentage: total > 0 ? (item.totalCount / total) * 100 : 0,
            // Solo confirmed
            confirmedCount: item.confirmedCount,
            confirmedRevenue: item.confirmedRevenue,
            confirmedPercentage: totalConfirmed > 0 ? (item.confirmedCount / totalConfirmed) * 100 : 0,
            // Solo pending
            pendingCount: item.pendingCount,
            pendingRevenue: item.pendingRevenue,
            pendingPercentage: totalPending > 0 ? (item.pendingCount / totalPending) * 100 : 0,
            // Para compatibilidad con el componente existente
            count: item.totalCount,
            percentage: total > 0 ? (item.totalCount / total) * 100 : 0,
            revenuePercentage: totalRevenue > 0 ? (item.totalRevenue / totalRevenue) * 100 : 0
        }));

        return {
            paymentMethods: formattedResult,
            totalOrders: total,
            totalRevenue,
            totalConfirmedOrders: totalConfirmed,
            totalConfirmedRevenue,
            totalPendingOrders: totalPending,
            totalPendingRevenue
        };
    } catch (error) {
        console.error('Error fetching payment method stats:', error);
        throw error;
    }
} 