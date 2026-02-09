import { getCollection, ObjectId } from '@repo/database';

// --- Analytics Salidas MongoDB ---

export async function getSalidasStatsByMonthMongo(year: number, month: number): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
        console.log('getSalidasStatsByMonthMongo', year, month);
        const collection = await getCollection('salidas');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const pipeline = [
            {
                $match: {
                    fechaFactura: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSalidas: { $sum: 1 },
                    totalMonto: { $sum: '$monto' },
                    salidasOrdinarias: {
                        $sum: { $cond: [{ $eq: ['$tipo', 'ORDINARIO'] }, 1, 0] }
                    },
                    salidasExtraordinarias: {
                        $sum: { $cond: [{ $eq: ['$tipo', 'EXTRAORDINARIO'] }, 1, 0] }
                    },
                    montoOrdinario: {
                        $sum: { $cond: [{ $eq: ['$tipo', 'ORDINARIO'] }, '$monto', 0] }
                    },
                    montoExtraordinario: {
                        $sum: { $cond: [{ $eq: ['$tipo', 'EXTRAORDINARIO'] }, '$monto', 0] }
                    },
                    salidasBlancas: {
                        $sum: { $cond: [{ $eq: ['$tipoRegistro', 'BLANCO'] }, 1, 0] }
                    },
                    salidasNegras: {
                        $sum: { $cond: [{ $eq: ['$tipoRegistro', 'NEGRO'] }, 1, 0] }
                    },
                    montoBlanco: {
                        $sum: { $cond: [{ $eq: ['$tipoRegistro', 'BLANCO'] }, '$monto', 0] }
                    },
                    montoNegro: {
                        $sum: { $cond: [{ $eq: ['$tipoRegistro', 'NEGRO'] }, '$monto', 0] }
                    }
                }
            }
        ];

        const result = await collection.aggregate(pipeline).toArray();
        const stats = result[0] || {
            totalSalidas: 0,
            totalMonto: 0,
            salidasOrdinarias: 0,
            salidasExtraordinarias: 0,
            montoOrdinario: 0,
            montoExtraordinario: 0,
            salidasBlancas: 0,
            salidasNegras: 0,
            montoBlanco: 0,
            montoNegro: 0
        };

        return { success: true, stats };
    } catch (error) {
        console.error('Error in getSalidasStatsByMonthMongo:', error);
        return { success: false, error: 'Error al obtener estadísticas mensuales' };
    }
}

export async function getSalidasCategoryAnalyticsMongo(startDate?: Date, endDate?: Date): Promise<{ success: boolean; analytics?: any[]; error?: string }> {
    try {
        const collection = await getCollection('salidas');
        const query: any = {};
        if (startDate || endDate) {
            query.fechaFactura = {};
            if (startDate) query.fechaFactura.$gte = startDate;
            if (endDate) query.fechaFactura.$lte = endDate;
        }

        const pipeline = [
            { $match: query },
            {
                $group: {
                    _id: '$categoriaId',
                    amount: { $sum: '$monto' },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'categorias',
                    let: { catId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$catId' }] } } }
                    ],
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $project: {
                    id: '$_id',
                    name: '$category.nombre',
                    amount: 1,
                    count: 1
                }
            },
            { $sort: { amount: -1 } }
        ];

        const analytics = await collection.aggregate(pipeline).toArray();
        return { success: true, analytics };
    } catch (error) {
        console.error('Error in getSalidasCategoryAnalyticsMongo:', error);
        return { success: false, error: 'Error al obtener analíticas por categoría' };
    }
}

export async function getSalidasTypeAnalyticsMongo(startDate?: Date, endDate?: Date): Promise<{ success: boolean; analytics?: any[]; error?: string }> {
    try {
        const collection = await getCollection('salidas');
        const query: any = {};
        if (startDate || endDate) {
            query.fechaFactura = {};
            if (startDate) query.fechaFactura.$gte = startDate;
            if (endDate) query.fechaFactura.$lte = endDate;
        }

        const pipeline = [
            { $match: query },
            {
                $group: {
                    _id: '$tipo',
                    amount: { $sum: '$monto' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: '$_id',
                    amount: 1,
                    count: 1
                }
            }
        ];

        const analytics = await collection.aggregate(pipeline).toArray();
        return { success: true, analytics };
    } catch (error) {
        console.error('Error in getSalidasTypeAnalyticsMongo:', error);
        return { success: false, error: 'Error al obtener analíticas por tipo' };
    }
}

export async function getSalidasMonthlyAnalyticsMongo(categoriaId?: string, startDate?: Date, endDate?: Date): Promise<{ success: boolean; analytics?: any[]; error?: string }> {
    try {
        const collection = await getCollection('salidas');
        const query: any = {};
        if (categoriaId) query.categoriaId = categoriaId;
        if (startDate || endDate) {
            query.fechaFactura = {};
            if (startDate) query.fechaFactura.$gte = startDate;
            if (endDate) query.fechaFactura.$lte = endDate;
        }

        const pipeline = [
            { $match: query },
            {
                $group: {
                    _id: {
                        year: { $year: '$fechaFactura' },
                        month: { $month: '$fechaFactura' }
                    },
                    amount: { $sum: '$monto' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ];

        const result = await collection.aggregate(pipeline).toArray();
        const analytics = result.map(r => ({
            month: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
            amount: r.amount
        }));

        return { success: true, analytics };
    } catch (error) {
        console.error('Error in getSalidasMonthlyAnalyticsMongo:', error);
        return { success: false, error: 'Error al obtener analíticas mensuales' };
    }
}

export async function getSalidasOverviewAnalyticsMongo(startDate?: Date, endDate?: Date): Promise<{ success: boolean; overview?: any; error?: string }> {
    try {
        const collection = await getCollection('salidas');
        const query: any = {};
        if (startDate || endDate) {
            query.fechaFactura = {};
            if (startDate) query.fechaFactura.$gte = startDate;
            if (endDate) query.fechaFactura.$lte = endDate;
        }

        const pipeline = [
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$monto' },
                    totalCount: { $sum: 1 },
                    avgAmount: { $avg: '$monto' }
                }
            }
        ];

        const result = await collection.aggregate(pipeline).toArray();
        const overview = result[0] || { totalAmount: 0, totalCount: 0, avgAmount: 0 };

        return { success: true, overview };
    } catch (error) {
        console.error('Error in getSalidasOverviewAnalyticsMongo:', error);
        return { success: false, error: 'Error al obtener resumen de analíticas' };
    }
}
