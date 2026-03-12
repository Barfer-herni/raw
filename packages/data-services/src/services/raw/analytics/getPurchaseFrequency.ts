import 'server-only';
import { getCollection } from '@repo/database';

/**
 * Calcula la frecuencia de compra promedio en días.
 * @param startDate - Fecha de inicio para el cálculo.
 * @param endDate - Fecha de fin para el cálculo.
 */
export async function getPurchaseFrequency(startDate?: Date, endDate?: Date) {
    try {
        const collection = await getCollection('orders');

        const matchCondition: any = {};

        if (startDate || endDate) {
            matchCondition.createdAt = {};
            if (startDate) matchCondition.createdAt.$gte = startDate;
            if (endDate) matchCondition.createdAt.$lte = endDate;
        }

        const pipeline: any[] = [];
        if (Object.keys(matchCondition).length > 0) {
            pipeline.push({ $match: matchCondition });
        }
        pipeline.push(
            { $sort: { 'address.address': 1, 'address.zipCode': 1, createdAt: 1 } },
            {
                $group: {
                    _id: {
                        address: '$address.address',
                        zipCode: '$address.zipCode'
                    },
                    orderDates: { $push: '$createdAt' }
                }
            },
            {
                $match: {
                    'orderDates.1': { $exists: true }
                }
            },
            {
                $addFields: {
                    dateDiffs: {
                        $map: {
                            input: { $range: [0, { $subtract: [{ $size: '$orderDates' }, 1] }] },
                            as: 'i',
                            in: {
                                $dateDiff: {
                                    startDate: { $arrayElemAt: ['$orderDates', '$$i'] },
                                    endDate: { $arrayElemAt: ['$orderDates', { $add: ['$$i', 1] }] },
                                    unit: 'day'
                                }
                            }
                        }
                    }
                }
            },
            { $unwind: '$dateDiffs' },
            {
                $match: {
                    dateDiffs: { $gt: 0 } // Excluir recompras en el mismo día
                }
            },
            {
                $group: {
                    _id: null,
                    avgFrequencyDays: { $avg: '$dateDiffs' }
                }
            }
        );

        const result = await collection.aggregate(pipeline).toArray();

        if (result.length > 0 && result[0].avgFrequencyDays !== null) {
            return {
                avgFrequencyDays: Math.round(result[0].avgFrequencyDays)
            };
        }

        return { avgFrequencyDays: 0 };

    } catch (error) {
        console.error('Error fetching purchase frequency:', error);
        throw error;
    }
} 