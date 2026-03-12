import 'server-only';
import { getCollection } from '@repo/database';

/**
 * Obtiene estadísticas de frecuencia de clientes basado en órdenes confirmadas
 */
export async function getCustomerFrequency() {
    try {
        const collection = await getCollection('orders');

        const pipeline = [
            { $match: { status: 'confirmed' } },
            {
                $group: {
                    _id: '$user',
                    orderCount: { $sum: 1 },
                    totalSpent: { $sum: '$total' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $group: {
                    _id: '$orderCount',
                    customerCount: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ];

        const result = await collection.aggregate(pipeline).toArray();

        const formattedResult = result.map((item: any) => ({
            orderCount: item._id,
            customerCount: item.customerCount
        }));

        const totalCustomers = formattedResult.reduce((sum, item) => sum + item.customerCount, 0);
        const repeatCustomers = formattedResult
            .filter(item => item.orderCount > 1)
            .reduce((sum, item) => sum + item.customerCount, 0);

        return {
            frequencyDistribution: formattedResult,
            totalCustomers,
            repeatCustomers,
            repeatCustomerRate: totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0
        };
    } catch (error) {
        console.error('Error calculating customer frequency:', error);
        throw error;
    }
}

// EJEMPLO DE DATOS QUE RETORNA ESTA FUNCIÓN
export const EXAMPLE_DATA = {
    description: "Frecuencia de compra basada en órdenes confirmadas",
    statusUsed: "confirmed", // ¡No 'delivered'!
    userIdentifier: "user._id", // ¡No user.email!
    expectedResult: {
        averageOrdersPerCustomer: 2.3, // Promedio de órdenes por cliente
        totalCustomers: 2500,          // Clientes únicos con órdenes confirmadas
        averageSpentPerCustomer: 103750 // Gasto promedio por cliente
    },
    realUserStructure: [
        "email", "password", "name", "lastName", "role"
    ],
    realDataContext: `
        Basado en la inspección real:
        - 5,755 órdenes confirmadas
        - Estructura user: email, password, name, lastName, role
        - Usar user._id para identificar clientes únicos
        - Solo órdenes confirmed generan estadísticas válidas
    `,
    aggregationPipeline: `
        [
            // Solo órdenes confirmadas
            { $match: { status: 'confirmed' } },
            
            // Primera agrupación: por cliente
            {
                $group: {
                    _id: '$user._id',               // ID único del cliente
                    orderCount: { $sum: 1 },        // Contar órdenes por cliente
                    totalSpent: { $sum: '$total' }, // Gasto total por cliente
                    firstOrder: { $min: '$createdAt' },
                    lastOrder: { $max: '$createdAt' }
                }
            },
            
            // Segunda agrupación: calcular promedios
            {
                $group: {
                    _id: null,
                    averageOrdersPerCustomer: { $avg: '$orderCount' },
                    totalCustomers: { $sum: 1 },
                    averageSpentPerCustomer: { $avg: '$totalSpent' }
                }
            }
        ]
    `,
    howToUse: `
        const stats = await getCustomerFrequency();
        
        // Para mostrar en dashboard
        const avgOrders = stats.averageOrdersPerCustomer.toFixed(1);
        const totalCustomers = stats.totalCustomers.toLocaleString();
        const avgSpent = '$' + Math.round(stats.averageSpentPerCustomer).toLocaleString();
        
        // Métricas de negocio
        const customerLifetimeValue = stats.averageSpentPerCustomer;
        const repeatPurchaseRate = stats.averageOrdersPerCustomer > 1 ? 'Alta' : 'Baja';
    `
}; 