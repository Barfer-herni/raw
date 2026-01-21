#!/usr/bin/env tsx

import { getCollection, closeMongoConnection } from '../packages/database/mongo-connection.js';

/**
 * Script para agregar permisos de productos y carrito a usuarios existentes
 * Este script actualiza todos los usuarios con role 'user' para que puedan:
 * - Ver productos
 * - Comprar productos
 * - Ver el carrito
 * - Hacer checkout
 */

async function addProductPermissions() {
    console.log('🚀 Iniciando actualización de permisos de productos y carrito...');

    try {
        // Obtener la colección de usuarios
        const usersCollection = await getCollection('users');

        // Permisos que deben tener todos los usuarios comunes
        const requiredPermissions = [
            'account:view_own',
            'account:edit_own',
            'products:view',
            'products:purchase',
            'cart:view',
            'cart:checkout',
        ];

        // Obtener todos los usuarios con role 'user'
        const users = await usersCollection.find({ role: 'user' }).toArray();
        console.log(`📋 Encontrados ${users.length} usuarios para actualizar`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const user of users) {
            const currentPermissions = Array.isArray(user.permissions) ? user.permissions : [];
            
            // Verificar si el usuario ya tiene todos los permisos
            const missingPermissions = requiredPermissions.filter(
                permission => !currentPermissions.includes(permission)
            );

            if (missingPermissions.length > 0) {
                // Agregar los permisos faltantes
                const updatedPermissions = [...currentPermissions, ...missingPermissions];

                await usersCollection.updateOne(
                    { _id: user._id },
                    { 
                        $set: { 
                            permissions: updatedPermissions,
                            updatedAt: new Date()
                        } 
                    }
                );

                updatedCount++;
                console.log(`✅ Actualizado usuario: ${user.name} ${user.lastName}`);
                console.log(`   Permisos agregados: ${missingPermissions.join(', ')}`);
            } else {
                skippedCount++;
                console.log(`⏭️  Saltado usuario: ${user.name} ${user.lastName} (ya tiene todos los permisos)`);
            }
        }

        console.log('\n🎉 Actualización completada exitosamente');
        console.log(`📊 Resumen:`);
        console.log(`   • Usuarios actualizados: ${updatedCount}`);
        console.log(`   • Usuarios saltados: ${skippedCount}`);
        console.log(`   • Total procesados: ${users.length}`);

        console.log('\n📝 Permisos agregados:');
        console.log('   • products:view - Ver productos');
        console.log('   • products:purchase - Comprar productos');
        console.log('   • cart:view - Ver el carrito');
        console.log('   • cart:checkout - Hacer checkout');

        console.log('\n✨ Los usuarios ahora pueden:');
        console.log('   • Navegar y ver productos en /admin/productos');
        console.log('   • Ver detalles de productos en /admin/producto/[id]');
        console.log('   • Agregar productos al carrito');
        console.log('   • Proceder al checkout en /admin/checkout');

    } catch (error) {
        console.error('❌ Error durante la actualización:', error);
        throw error;
    } finally {
        // Cerrar la conexión a MongoDB
        await closeMongoConnection();
    }
}

// Ejecutar el script
if (require.main === module) {
    addProductPermissions()
        .then(() => {
            console.log('\n✅ Script completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

export { addProductPermissions };
