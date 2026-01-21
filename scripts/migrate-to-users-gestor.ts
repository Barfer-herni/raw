#!/usr/bin/env tsx

import { getCollection, closeMongoConnection } from '../packages/database/mongo-connection.js';

/**
 * Script para migrar usuarios de gestión de 'users' a 'users_gestor'
 * 
 * Este script identifica usuarios que fueron creados manualmente por el admin
 * y los mueve a la nueva tabla 'users_gestor'.
 * 
 * Criterios para identificar usuarios de gestión:
 * 1. Tienen role 'admin'
 * 2. Tienen permisos de gestión (analytics, clients, table, prices, balance, outputs)
 * 3. NO tienen permisos de productos/carrito (products:view, cart:checkout)
 */

async function migrateToUsersGestor() {
    console.log('🚀 Iniciando migración de usuarios de gestión...\n');

    try {
        const usersCollection = await getCollection('users');
        const gestorUsersCollection = await getCollection('users_gestor');

        // Permisos que indican que es un usuario de gestión (no cliente)
        const gestorPermissions = [
            'analytics:view',
            'clients:view',
            'table:view',
            'table:edit',
            'prices:view',
            'balance:view',
            'outputs:view',
            'outputs:create',
            'outputs:edit',
            'account:manage_users'
        ];

        // Permisos que indican que es un cliente (usuario que se registró)
        const clientPermissions = [
            'products:view',
            'products:purchase',
            'cart:view',
            'cart:checkout'
        ];

        // Obtener todos los usuarios
        const allUsers = await usersCollection.find({}).toArray();
        console.log(`📋 Total de usuarios encontrados: ${allUsers.length}\n`);

        let migratedCount = 0;
        let skippedCount = 0;
        const migratedUsers: any[] = [];

        for (const user of allUsers) {
            const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
            
            // Determinar si es un usuario de gestión
            const isAdmin = user.role === 'admin';
            const hasGestorPermissions = gestorPermissions.some(perm => userPermissions.includes(perm));
            const hasClientPermissions = clientPermissions.some(perm => userPermissions.includes(perm));
            
            // Es usuario de gestión si:
            // - Es admin, O
            // - Tiene permisos de gestión Y NO tiene permisos de cliente
            const isGestorUser = isAdmin || (hasGestorPermissions && !hasClientPermissions);

            if (isGestorUser) {
                console.log(`🔄 Migrando usuario de gestión: ${user.name} ${user.lastName} (${user.email})`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Permisos: ${userPermissions.length > 0 ? userPermissions.join(', ') : 'ninguno'}`);

                // Verificar si ya existe en users_gestor
                const existingGestorUser = await gestorUsersCollection.findOne({ email: user.email });
                
                if (existingGestorUser) {
                    console.log(`   ⚠️  Ya existe en users_gestor, saltando...`);
                    skippedCount++;
                    continue;
                }

                // Copiar usuario a users_gestor con flag adicional
                const gestorUser = {
                    ...user,
                    isGestorUser: true,
                    migratedAt: new Date(),
                    originalId: user._id.toString()
                };

                // Eliminar _id para que MongoDB genere uno nuevo
                delete gestorUser._id;

                // Insertar en users_gestor
                const result = await gestorUsersCollection.insertOne(gestorUser);
                
                // Eliminar de users
                await usersCollection.deleteOne({ _id: user._id });

                migratedCount++;
                migratedUsers.push({
                    name: `${user.name} ${user.lastName}`,
                    email: user.email,
                    role: user.role,
                    oldId: user._id.toString(),
                    newId: result.insertedId.toString()
                });

                console.log(`   ✅ Migrado exitosamente (nuevo ID: ${result.insertedId.toString()})\n`);
            } else {
                console.log(`⏭️  Usuario cliente (no migrar): ${user.name} ${user.lastName} (${user.email})`);
                console.log(`   Permisos: ${userPermissions.join(', ')}\n`);
                skippedCount++;
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('🎉 Migración completada exitosamente');
        console.log('='.repeat(80));
        console.log(`📊 Resumen:`);
        console.log(`   • Usuarios migrados a users_gestor: ${migratedCount}`);
        console.log(`   • Usuarios que permanecen en users: ${skippedCount}`);
        console.log(`   • Total procesados: ${allUsers.length}`);

        if (migratedCount > 0) {
            console.log('\n📝 Usuarios migrados:');
            migratedUsers.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.name} (${user.email})`);
                console.log(`      Role: ${user.role}`);
                console.log(`      ID anterior: ${user.oldId}`);
                console.log(`      ID nuevo: ${user.newId}`);
            });
        }

        console.log('\n✨ Estructura de tablas:');
        console.log('   • users - Usuarios que se registraron por su cuenta (clientes)');
        console.log('   • users_gestor - Usuarios creados manualmente por admin (staff/gestión)');

        console.log('\n⚠️  IMPORTANTE:');
        console.log('   • Los usuarios migrados ahora inician sesión normalmente');
        console.log('   • El sistema busca en ambas tablas al hacer login');
        console.log('   • Los nuevos usuarios creados por admin se guardarán en users_gestor');
        console.log('   • Los nuevos registros se guardarán en users');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw error;
    } finally {
        await closeMongoConnection();
    }
}

// Ejecutar el script
if (require.main === module) {
    migrateToUsersGestor()
        .then(() => {
            console.log('\n✅ Script completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Error fatal:', error);
            process.exit(1);
        });
}

export { migrateToUsersGestor };
