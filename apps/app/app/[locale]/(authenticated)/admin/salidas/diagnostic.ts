'use server'

import { getCollection } from '@repo/database';

export async function diagnosticSalida() {
    console.log('=== DIAGNÓSTICO DE SALIDA ===\n');

    try {
        // 1. Verificar la salida
        const salidasCollection = await getCollection('salidas');
        const salida = await salidasCollection.findOne({ detalle: 'TEST' });
        console.log('1. Salida encontrada:', salida ? 'SÍ' : 'NO');
        if (salida) {
            console.log('   - _id:', salida._id);
            console.log('   - categoriaId:', salida.categoriaId, '(tipo:', typeof salida.categoriaId, ')');
            console.log('   - metodoPagoId:', salida.metodoPagoId, '(tipo:', typeof salida.metodoPagoId, ')');
        }

        // 2. Verificar categorías
        const categoriasCollection = await getCollection('categorias_salidas');
        const categorias = await categoriasCollection.find({}).toArray();
        console.log('\n2. Categorías en categorias_salidas:', categorias.length);
        categorias.forEach(cat => {
            console.log('   - _id:', cat._id.toString(), '| nombre:', cat.nombre);
        });

        // 3. Verificar métodos de pago
        const metodosCollection = await getCollection('metodos_pago');
        const metodos = await metodosCollection.find({}).toArray();
        console.log('\n3. Métodos de pago:', metodos.length);
        metodos.forEach(mp => {
            console.log('   - _id:', mp._id.toString(), '| nombre:', mp.nombre);
        });

        // 4. Verificar coincidencias
        if (salida) {
            const categoriaMatch = categorias.find(c => c._id.toString() === salida.categoriaId?.toString());
            const metodoMatch = metodos.find(m => m._id.toString() === salida.metodoPagoId?.toString());

            console.log('\n4. Coincidencias:');
            console.log('   - Categoría encontrada:', categoriaMatch ? `SÍ (${categoriaMatch.nombre})` : 'NO');
            console.log('   - Método de pago encontrado:', metodoMatch ? `SÍ (${metodoMatch.nombre})` : 'NO');
        }

        return { success: true };
    } catch (error) {
        console.error('Error en diagnóstico:', error);
        return { success: false, error };
    }
}
