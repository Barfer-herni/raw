'use server'

import { getCollection } from '@repo/database';

export async function diagnosticSalida() {
    try {
        // 1. Verificar la salida
        const salidasCollection = await getCollection('salidas');
        const salida = await salidasCollection.findOne({ detalle: 'TEST' });

        // 2. Verificar categorías
        const categoriasCollection = await getCollection('categorias_salidas');
        const categorias = await categoriasCollection.find({}).toArray();

        // 3. Verificar métodos de pago
        const metodosCollection = await getCollection('metodos_pago');
        const metodos = await metodosCollection.find({}).toArray();

        // 4. Verificar coincidencias
        if (salida) {
            const categoriaMatch = categorias.find(c => c._id.toString() === salida.categoriaId?.toString());
            const metodoMatch = metodos.find(m => m._id.toString() === salida.metodoPagoId?.toString());
        }
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}
