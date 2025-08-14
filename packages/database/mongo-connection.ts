import 'server-only';
import { MongoClient, ObjectId } from 'mongodb';
import type { Db } from 'mongodb';
import { keys } from './keys';

// Export ObjectId for use in other packages
export { ObjectId };

let client: MongoClient | null = null;
let db: Db | null = null;

const getMongoUrl = (): string => {
    const env = keys();
    return env.MONGODB_URL || '';
};

export async function connectToMongoDB(): Promise<Db> {
    if (db) {
        return db;
    }

    try {
        const mongoUrl = getMongoUrl();

        if (!mongoUrl) {
            throw new Error('MONGODB_URL is not configured');
        }

        client = new MongoClient(mongoUrl);
        await client.connect();

        // Extraer el nombre de la base de datos de la URL
        const dbName = mongoUrl.split('/').pop()?.split('?')[0] || 'barfer';
        db = client.db(dbName);

        return db;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

export async function getMongoDatabase(): Promise<Db> {
    return await connectToMongoDB();
}

export async function closeMongoConnection(): Promise<void> {
    if (client) {
        await client.close();
        client = null;
        db = null;
        console.log('MongoDB connection closed');
    }
}

// Función helper para obtener una colección
export async function getCollection(collectionName: string) {
    const database = await getMongoDatabase();
    return database.collection(collectionName);
}

// Manejar el cierre de la aplicación
process.on('SIGINT', async () => {
    await closeMongoConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closeMongoConnection();
    process.exit(0);
}); 