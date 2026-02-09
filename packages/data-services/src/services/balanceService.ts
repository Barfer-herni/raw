'use server'

import 'server-only';
import { getCollection } from '@repo/database';
import { database } from '@repo/database';

export interface BalanceMonthlyData {
    mes: string;
    // Entradas Totales
    entradasTotales: number;
    // Salidas - Desglose por tipo y empresa
    salidas: number;
    salidasPorcentaje: number;
    // Gastos Ordinarios
    gastosOrdinariosBarfer: number;
    gastosOrdinariosSLR: number;
    gastosOrdinariosTotal: number;
    // Gastos Extraordinarios
    gastosExtraordinariosBarfer: number;
    gastosExtraordinariosSLR: number;
    gastosExtraordinariosTotal: number;
    // Resultados - Dos cuentas diferentes
    resultadoSinExtraordinarios: number; // Entradas - Gastos Ordinarios
    resultadoConExtraordinarios: number; // Entradas - (Gastos Ordinarios + Gastos Extraordinarios)
    porcentajeSinExtraordinarios: number;
    porcentajeConExtraordinarios: number;
    // Precio por KG
    precioPorKg: number;
}

/**
 * Obtiene datos de balance mensual combinando entradas (órdenes) y salidas
 */
export async function getBalanceMonthly(
    startDate?: Date,
    endDate?: Date
): Promise<{ success: boolean; data?: BalanceMonthlyData[]; error?: string }> {
    try {
        const ordersCollection = await getCollection('orders');

        const ordersPipeline: any[] = [];

        // Convertimos createdAt a tipo Date si es un string para que funcionen los operadores de fecha
        ordersPipeline.push({
            $addFields: {
                createdAtDate: { $toDate: '$createdAt' }
            }
        });

        // Aplicamos el filtro sobre la fecha convertida y el estado
        const ordersMatch: any = { status: 'confirmed' };

        let start = startDate;
        let end = endDate;

        if (!start && !end) {
            // Si no se especifica fecha, mostrar los últimos 3 años para asegurar datos
            const currentYear = new Date().getFullYear();
            start = new Date(currentYear - 2, 0, 1); // Dos años atrás
            end = new Date(currentYear, 11, 31, 23, 59, 59); // Año actual
        }

        ordersMatch.createdAtDate = {};
        if (start) ordersMatch.createdAtDate.$gte = start;
        if (end) ordersMatch.createdAtDate.$lte = end;

        ordersPipeline.push({ $match: ordersMatch });

        ordersPipeline.push(
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAtDate' },
                        month: { $month: '$createdAtDate' }
                    },
                    totalEntradas: { $sum: '$total' },
                    totalOrdenes: { $sum: 1 },
                    totalItems: { $sum: { $size: { $ifNull: ['$items', []] } } }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        );

        const ordersResult = await ordersCollection.aggregate(ordersPipeline, {
            allowDiskUse: true
        }).toArray();

        const salidasCollection = await getCollection('salidas');
        const salidasQuery: any = {};
        if (startDate || endDate) {
            salidasQuery.fechaFactura = {};
            if (startDate) salidasQuery.fechaFactura.$gte = startDate;
            if (endDate) salidasQuery.fechaFactura.$lte = endDate;
        } else {
            const currentYear = new Date().getFullYear();
            const yearStartDate = new Date(currentYear - 2, 0, 1);
            const yearEndDate = new Date(currentYear, 11, 31, 23, 59, 59);
            salidasQuery.fechaFactura = { $gte: yearStartDate, $lte: yearEndDate };
        }

        const salidasResult = await salidasCollection.find(salidasQuery).toArray();

        // Procesar salidas por mes con desglose
        const salidasByMonth = new Map<string, {
            total: number;
            ordinariosBarfer: number;
            ordinariosSLR: number;
            extraordinariosBarfer: number;
            extraordinariosSLR: number;
        }>();

        for (const salida of salidasResult) {
            const fecha = new Date(salida.fechaFactura);
            const monthKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            const marca = salida.marca?.toLowerCase() || 'barfer';
            const isBarfer = marca === 'barfer';
            const isSLR = marca === 'slr';

            const current = salidasByMonth.get(monthKey) || {
                total: 0,
                ordinariosBarfer: 0,
                ordinariosSLR: 0,
                extraordinariosBarfer: 0,
                extraordinariosSLR: 0
            };

            current.total += salida.monto || 0;

            if (salida.tipo === 'ORDINARIO') {
                if (isBarfer) {
                    current.ordinariosBarfer += salida.monto || 0;
                } else if (isSLR) {
                    current.ordinariosSLR += salida.monto || 0;
                } else {
                    current.ordinariosBarfer += salida.monto || 0;
                }
            } else if (salida.tipo === 'EXTRAORDINARIO') {
                if (isBarfer) {
                    current.extraordinariosBarfer += salida.monto || 0;
                } else if (isSLR) {
                    current.extraordinariosSLR += salida.monto || 0;
                } else {
                    current.extraordinariosBarfer += salida.monto || 0;
                }
            }

            salidasByMonth.set(monthKey, current);
        }

        // Combinar datos y calcular métricas
        const allMonths = new Set<string>();
        ordersResult.forEach(orderData => {
            allMonths.add(`${orderData._id.year}-${String(orderData._id.month).padStart(2, '0')}`);
        });
        salidasByMonth.forEach((_, monthKey) => {
            allMonths.add(monthKey);
        });

        const sortedMonths = Array.from(allMonths).sort();
        const balanceData: BalanceMonthlyData[] = [];

        for (const monthKey of sortedMonths) {
            const orderData = ordersResult.find(od => `${od._id.year}-${String(od._id.month).padStart(2, '0')}` === monthKey) || {
                totalEntradas: 0,
                totalOrdenes: 0,
                totalItems: 0
            };

            const salidasData = salidasByMonth.get(monthKey) || {
                total: 0,
                ordinariosBarfer: 0,
                ordinariosSLR: 0,
                extraordinariosBarfer: 0,
                extraordinariosSLR: 0
            };

            const totalEntradas = orderData.totalEntradas;

            // Estimación simple del peso basada en órdenes promedio
            const estimatedWeight = orderData.totalItems * 8; // Estimación de 8kg promedio por item

            // Cálculo de los dos resultados diferentes
            const resultadoSinExtraordinarios = totalEntradas - salidasData.ordinariosBarfer - salidasData.ordinariosSLR;
            const resultadoConExtraordinarios = totalEntradas - salidasData.total;
            const precioPorKg = estimatedWeight > 0 ? totalEntradas / estimatedWeight : 0;

            balanceData.push({
                mes: monthKey,
                // Entradas Totales
                entradasTotales: totalEntradas,
                // Salidas - Desglose por tipo y empresa
                salidas: salidasData.total,
                salidasPorcentaje: totalEntradas > 0 ? (salidasData.total / totalEntradas) * 100 : 0,
                // Gastos Ordinarios
                gastosOrdinariosBarfer: salidasData.ordinariosBarfer,
                gastosOrdinariosSLR: salidasData.ordinariosSLR,
                gastosOrdinariosTotal: salidasData.ordinariosBarfer + salidasData.ordinariosSLR,
                // Gastos Extraordinarios
                gastosExtraordinariosBarfer: salidasData.extraordinariosBarfer,
                gastosExtraordinariosSLR: salidasData.extraordinariosSLR,
                gastosExtraordinariosTotal: salidasData.extraordinariosBarfer + salidasData.extraordinariosSLR,
                // Resultados - Dos cuentas diferentes
                resultadoSinExtraordinarios: resultadoSinExtraordinarios,
                resultadoConExtraordinarios: resultadoConExtraordinarios,
                porcentajeSinExtraordinarios: totalEntradas > 0 ? (resultadoSinExtraordinarios / totalEntradas) * 100 : 0,
                porcentajeConExtraordinarios: totalEntradas > 0 ? (resultadoConExtraordinarios / totalEntradas) * 100 : 0,
                // Precio por KG
                precioPorKg: precioPorKg
            });
        }

        return { success: true, data: balanceData };

    } catch (error) {
        console.error('Error obteniendo balance mensual:', error);
        console.error('Error details:', {
            message: (error as Error).message,
            stack: (error as Error).stack
        });
        return { success: false, error: `Error interno del servidor: ${(error as Error).message}` };
    }
}

/**
 * Helper function to extract weight from product option name
 */
function getWeightFromOption(productName: string, optionName: string): number {
    const lowerProductName = productName.toLowerCase();

    if (lowerProductName.includes('big dog')) {
        return 15;
    }
    if (lowerProductName.includes('complemento')) {
        return 0;
    }
    const match = optionName.match(/(\d+(?:\.\d+)?)\s*KG/i);
    if (match && match[1]) {
        return parseFloat(match[1]);
    }
    return 0;
}

