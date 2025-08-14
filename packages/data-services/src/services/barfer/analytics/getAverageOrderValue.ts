import 'server-only';
import { getCollection } from '@repo/database';

/**
 * Calcula el valor promedio de órdenes confirmadas
 */
export async function getAverageOrderValue() {
    try {
        const collection = await getCollection('orders');

        const pipeline = [
            { $match: { status: 'confirmed' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' },
                    totalOrders: { $sum: 1 }
                }
            }
        ];

        const result = await collection.aggregate(pipeline).toArray();

        if (result.length === 0) {
            return { averageOrderValue: 0, totalOrders: 0, totalRevenue: 0 };
        }

        const { totalRevenue, totalOrders } = result[0];
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
            averageOrderValue: Math.round(averageOrderValue),
            totalOrders,
            totalRevenue
        };
    } catch (error) {
        console.error('Error calculating average order value:', error);
        throw error;
    }
}

// EJEMPLO DE DATOS QUE RETORNA ESTA FUNCIÓN
export const EXAMPLE_DATA = {
    description: "Valor promedio de órdenes confirmadas",
    statusUsed: "confirmed", // ¡No 'delivered'!
    expectedResult: {
        averageValue: 45123.50, // Promedio basado en órdenes confirmadas
        totalOrders: 5755,      // Total de órdenes confirmadas
        totalRevenue: 259585192.5 // Revenue total de órdenes confirmadas
    },
    realDataContext: `
        Basado en la inspección real:
        - 5,755 órdenes con status 'confirmed'
        - Estas son las órdenes que generan revenue
        - Campo 'total' contiene el valor de cada orden
        - No existe status 'delivered' en la DB
    `,
    aggregationPipeline: `
        [
            // Solo órdenes confirmadas
            { $match: { status: 'confirmed' } },
            
            // Calcular promedios y totales
            {
                $group: {
                    _id: null,
                    averageValue: { $avg: '$total' },    // Promedio del campo 'total'
                    totalOrders: { $sum: 1 },            // Contar órdenes
                    totalRevenue: { $sum: '$total' }     // Suma total
                }
            }
        ]
    `,
    howToUse: `
        const stats = await getAverageOrderValue();
        
        console.log('Ticket promedio:', stats.averageValue);
        console.log('Total órdenes confirmadas:', stats.totalOrders);
        console.log('Revenue total:', stats.totalRevenue);
        
        // Para mostrar en UI
        const ticketPromedio = '$' + Math.round(stats.averageValue).toLocaleString();
        const conversion = ((stats.totalOrders / totalOrdersIncludingPending) * 100).toFixed(1) + '%';
    `
}; 