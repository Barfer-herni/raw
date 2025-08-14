// Importar el cliente de Prisma según la estructura del proyecto
// Nota: Este import debería ajustarse a la estructura específica del proyecto
import { PrismaClient } from '@repo/database';

// PrismaClient es adjuntado al objeto global en desarrollo para prevenir
// múltiples instancias del cliente Prisma creadas durante hot reloading
declare global {
    var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = db;
} 