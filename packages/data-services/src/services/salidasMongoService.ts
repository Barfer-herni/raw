import { getCollection, ObjectId } from '@repo/database';
import { canViewSalidaCategory } from '@repo/auth/server-permissions';

// Types for MongoDB Salidas
export interface SalidaMongo {
    _id?: ObjectId | string;
    fecha: Date;
    fechaFactura: Date;
    detalle: string;
    tipo: 'ORDINARIO' | 'EXTRAORDINARIO';
    marca?: string | null;
    monto: number;
    tipoRegistro: 'BLANCO' | 'NEGRO';
    categoriaId: string | ObjectId;
    metodoPagoId: string | ObjectId;
    proveedorId?: string | ObjectId | null;
    fechaPago?: Date | null;
    comprobanteNumber?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SalidaMongoData extends Omit<SalidaMongo, '_id'> {
    _id: string;
    categoria?: {
        _id: string;
        nombre: string;
    };
    metodoPago?: {
        _id: string;
        nombre: string;
    };
    proveedor?: {
        _id: string;
        nombre: string;
        detalle?: string;
        registro: 'BLANCO' | 'NEGRO';
    };
}

export interface CreateSalidaMongoInput {
    fechaFactura: Date;
    detalle: string;
    categoriaId: string;
    tipo: 'ORDINARIO' | 'EXTRAORDINARIO';
    marca?: string;
    monto: number;
    metodoPagoId: string;
    tipoRegistro: 'BLANCO' | 'NEGRO';
    proveedorId?: string;
    fechaPago?: Date;
    comprobanteNumber?: string;
}

export interface UpdateSalidaMongoInput extends Partial<CreateSalidaMongoInput> { }

export interface CreateProveedorMongoInput {
    nombre: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    cuit?: string;
    categoriaProveedorId?: string;
    isActive?: boolean;
}

export interface UpdateProveedorMongoInput extends Partial<CreateProveedorMongoInput> { }

export interface CreateCategoriaProveedorMongoInput {
    nombre: string;
    descripcion?: string;
}

export interface UpdateCategoriaProveedorMongoInput extends Partial<CreateCategoriaProveedorMongoInput> { }

// --- CRUD Salidas ---

export async function getAllSalidasMongo(): Promise<{ success: boolean; salidas?: SalidaMongoData[]; error?: string }> {
    try {
        console.log("ESTOY EJECUTANDO")
        const collection = await getCollection('salidas');
        const catCollection = await getCollection('categorias_salidas');
        const mpCollection = await getCollection('metodos_pago');
        const provCollection = await getCollection('proveedores');

        const rawSalidas = await collection.find({}).sort({ fechaFactura: -1 }).toArray();
        const categorias = await catCollection.find({}).toArray();
        const metodosPago = await mpCollection.find({}).toArray();
        const proveedores = await provCollection.find({}).toArray();

        console.log("rawSalidas", rawSalidas);
        console.log("categorias", categorias);
        console.log("metodosPago", metodosPago);
        console.log("proveedores", proveedores);

        const catMap = new Map(categorias.map(c => [c._id.toString(), c]));
        const mpMap = new Map(metodosPago.map(m => [m._id.toString(), m]));
        const provMap = new Map(proveedores.map(p => [p._id.toString(), p]));

        const salidas: SalidaMongoData[] = rawSalidas.map(s => ({
            ...s,
            _id: s._id.toString(),
            categoria: catMap.has(s.categoriaId?.toString())
                ? { _id: s.categoriaId.toString(), nombre: catMap.get(s.categoriaId.toString())?.nombre || '' }
                : undefined,
            metodoPago: mpMap.has(s.metodoPagoId?.toString())
                ? { _id: s.metodoPagoId.toString(), nombre: mpMap.get(s.metodoPagoId.toString())?.nombre || '' }
                : undefined,
            proveedor: s.proveedorId && provMap.has(s.proveedorId.toString())
                ? {
                    _id: s.proveedorId.toString(),
                    nombre: provMap.get(s.proveedorId.toString())?.nombre || '',
                    detalle: provMap.get(s.proveedorId.toString())?.detalle,
                    registro: provMap.get(s.proveedorId.toString())?.registro || 'BLANCO'
                }
                : undefined
        })) as unknown as SalidaMongoData[];


        console.log("salidas", salidas);

        return { success: true, salidas };
    } catch (error) {
        console.error('Error in getAllSalidasMongo:', error);
        return { success: false, error: 'Error al obtener salidas' };
    }
}

export async function getAllSalidasWithPermissionFilterMongo(): Promise<{ success: boolean; salidas?: SalidaMongoData[]; error?: string }> {
    try {
        const result = await getAllSalidasMongo();
        if (!result.success || !result.salidas) return result;

        const filteredSalidas = [];
        for (const salida of result.salidas) {
            const catName = salida.categoria?.nombre || 'Sin Categoría';
            if (await canViewSalidaCategory(catName)) {
                filteredSalidas.push(salida);
            }
        }

        return { success: true, salidas: filteredSalidas };
    } catch (error) {
        console.error('Error in getAllSalidasWithPermissionFilterMongo:', error);
        return { success: false, error: 'Error al filtrar salidas' };
    }
}

export async function getSalidasPaginatedMongo({ pageIndex = 0, pageSize = 50, filters = {} }: any): Promise<{ success: boolean; salidas?: SalidaMongoData[]; total?: number; pageCount?: number; error?: string }> {
    try {
        const collection = await getCollection('salidas');
        const catCollection = await getCollection('categorias_salidas');
        const mpCollection = await getCollection('metodos_pago');
        const provCollection = await getCollection('proveedores');

        const query: any = {};

        if (filters.searchTerm) {
            query.detalle = { $regex: filters.searchTerm, $options: 'i' };
        }
        if (filters.categoriaId) query.categoriaId = filters.categoriaId;
        if (filters.tipo) query.tipo = filters.tipo;
        if (filters.tipoRegistro) query.tipoRegistro = filters.tipoRegistro;
        if (filters.fechaDesde || filters.fechaHasta) {
            query.fechaFactura = {};
            if (filters.fechaDesde) query.fechaFactura.$gte = new Date(filters.fechaDesde);
            if (filters.fechaHasta) query.fechaFactura.$lte = new Date(filters.fechaHasta);
        }

        const total = await collection.countDocuments(query);
        const rawSalidas = await collection.find(query)
            .sort({ fechaFactura: -1 })
            .skip(pageIndex * pageSize)
            .limit(pageSize)
            .toArray();

        const categorias = await catCollection.find({}).toArray();
        const metodosPago = await mpCollection.find({}).toArray();
        const proveedores = await provCollection.find({}).toArray();

        const catMap = new Map(categorias.map(c => [c._id.toString(), c]));
        const mpMap = new Map(metodosPago.map(m => [m._id.toString(), m]));
        const provMap = new Map(proveedores.map(p => [p._id.toString(), p]));

        const salidas: SalidaMongoData[] = rawSalidas.map(s => ({
            ...s,
            _id: s._id.toString(),
            categoria: catMap.has(s.categoriaId?.toString())
                ? { _id: s.categoriaId.toString(), nombre: catMap.get(s.categoriaId.toString())?.nombre || '' }
                : undefined,
            metodoPago: mpMap.has(s.metodoPagoId?.toString())
                ? { _id: s.metodoPagoId.toString(), nombre: mpMap.get(s.metodoPagoId.toString())?.nombre || '' }
                : undefined,
            proveedor: s.proveedorId && provMap.has(s.proveedorId.toString())
                ? {
                    _id: s.proveedorId.toString(),
                    nombre: provMap.get(s.proveedorId.toString())?.nombre || '',
                    detalle: provMap.get(s.proveedorId.toString())?.detalle,
                    registro: provMap.get(s.proveedorId.toString())?.registro || 'BLANCO'
                }
                : undefined
        })) as unknown as SalidaMongoData[];

        return { success: true, salidas, total, pageCount: Math.ceil(total / pageSize) };
    } catch (error) {
        console.error('Error in getSalidasPaginatedMongo:', error);
        return { success: false, error: 'Error al obtener salidas paginadas' };
    }
}

export async function createSalidaMongo(data: CreateSalidaMongoInput): Promise<{ success: boolean; salida?: any; error?: string }> {
    try {
        const collection = await getCollection('salidas');
        const doc = {
            ...data,
            fecha: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await collection.insertOne(doc);
        return { success: true, salida: { ...doc, _id: result.insertedId.toString() } };
    } catch (error) {
        console.error('Error in createSalidaMongo:', error);
        return { success: false, error: 'Error al crear salida' };
    }
}

export async function updateSalidaMongo(id: string, data: UpdateSalidaMongoInput): Promise<{ success: boolean; salida?: any; error?: string }> {
    try {
        const collection = await getCollection('salidas');
        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        return { success: true, salida: result };
    } catch (error) {
        console.error('Error in updateSalidaMongo:', error);
        return { success: false, error: 'Error al actualizar salida' };
    }
}

export async function deleteSalidaMongo(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const collection = await getCollection('salidas');
        await collection.deleteOne({ _id: new ObjectId(id) });
        return { success: true };
    } catch (error) {
        console.error('Error in deleteSalidaMongo:', error);
        return { success: false, error: 'Error al eliminar salida' };
    }
}

export async function getSalidasByDateRangeMongo(startDate: Date, endDate: Date): Promise<{ success: boolean; salidas?: any[]; error?: string }> {
    try {
        const collection = await getCollection('salidas');
        const salidas = await collection.find({
            fechaFactura: { $gte: startDate, $lte: endDate }
        }).sort({ fechaFactura: -1 }).toArray();
        return { success: true, salidas };
    } catch (error) {
        console.error('Error in getSalidasByDateRangeMongo:', error);
        return { success: false, error: 'Error al obtener salidas por fecha' };
    }
}

export async function getSalidasByCategoryMongo(categoria: string): Promise<{ success: boolean; salidas?: any[]; error?: string }> {
    try {
        const collection = await getCollection('salidas');
        const catCollection = await getCollection('categorias_salidas');
        const catDoc = await catCollection.findOne({ nombre: categoria });
        if (!catDoc) return { success: true, salidas: [] };

        const salidas = await collection.find({ categoriaId: catDoc._id.toString() }).toArray();
        return { success: true, salidas };
    } catch (error) {
        console.error('Error in getSalidasByCategoryMongo:', error);
        return { success: false, error: 'Error al obtener salidas por categoría' };
    }
}

// --- Categorías ---

export async function getAllCategoriasMongo(): Promise<{ success: boolean; categorias?: any[]; error?: string }> {
    try {
        const collection = await getCollection('categorias_salidas');
        const rawCategorias = await collection.find({}).sort({ nombre: 1 }).toArray();
        const categorias = rawCategorias.map(c => ({ ...c, _id: c._id.toString() }));
        return { success: true, categorias };
    } catch (error) {
        console.error('Error in getAllCategoriasMongo:', error);
        return { success: false, error: 'Error al obtener categorías' };
    }
}

export async function createCategoriaMongo(data: { nombre: string }) {
    try {
        const collection = await getCollection('categorias_salidas');
        const result = await collection.insertOne({ ...data, createdAt: new Date() });
        return { success: true, categoria: { ...data, _id: result.insertedId.toString() } };
    } catch (error) {
        console.error('Error in createCategoriaMongo:', error);
        return { success: false, error: 'Error al crear categoría' };
    }
}

export async function deleteCategoriaMongo(id: string) {
    try {
        const collection = await getCollection('categorias_salidas');
        await collection.deleteOne({ _id: new ObjectId(id) });
        return { success: true };
    } catch (error) {
        console.error('Error in deleteCategoriaMongo:', error);
        return { success: false, error: 'Error al eliminar categoría' };
    }
}

export async function initializeCategoriasMongo(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const collection = await getCollection('categorias_salidas');
        const count = await collection.countDocuments();
        if (count > 0) return { success: true, message: 'Categorías ya inicializadas' };

        const defaults = [
            { nombre: 'Materia Prima' },
            { nombre: 'Logística' },
            { nombre: 'Personal' },
            { nombre: 'Marketing' },
            { nombre: 'Servicios' },
            { nombre: 'Impuestos' },
        ];
        await collection.insertMany(defaults.map(d => ({ ...d, createdAt: new Date() })));
        return { success: true };
    } catch (error) {
        console.error('Error in initializeCategoriasMongo:', error);
        return { success: false, error: 'Error al inicializar categorías' };
    }
}

// --- Métodos de Pago ---

export async function getAllMetodosPagoMongo(): Promise<{ success: boolean; metodosPago?: any[]; error?: string }> {
    try {
        const collection = await getCollection('metodos_pago');
        const rawMetodos = await collection.find({}).sort({ nombre: 1 }).toArray();
        const metodosPago = rawMetodos.map(m => ({ ...m, _id: m._id.toString() }));
        return { success: true, metodosPago };
    } catch (error) {
        console.error('Error in getAllMetodosPagoMongo:', error);
        return { success: false, error: 'Error al obtener métodos de pago' };
    }
}

export async function createMetodoPagoMongo(data: { nombre: string }) {
    try {
        const collection = await getCollection('metodos_pago');
        const result = await collection.insertOne({ ...data, createdAt: new Date() });
        return { success: true, metodoPago: { ...data, _id: result.insertedId.toString() } };
    } catch (error) {
        console.error('Error in createMetodoPagoMongo:', error);
        return { success: false, error: 'Error al crear método de pago' };
    }
}

export async function initializeMetodosPagoMongo(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const collection = await getCollection('metodos_pago');
        const count = await collection.countDocuments();
        if (count > 0) return { success: true, message: 'Métodos de pago ya inicializadas' };

        const defaults = [
            { nombre: 'Efectivo' },
            { nombre: 'Transferencia' },
            { nombre: 'Mercado Pago' },
            { nombre: 'Tarjeta de Crédito' },
        ];
        await collection.insertMany(defaults.map(d => ({ ...d, createdAt: new Date() })));
        return { success: true };
    } catch (error) {
        console.error('Error in initializeMetodosPagoMongo:', error);
        return { success: false, error: 'Error al inicializar métodos de pago' };
    }
}

// --- Proveedores ---

export async function getAllProveedoresMongo(): Promise<{ success: boolean; proveedores?: any[]; error?: string }> {
    try {
        const collection = await getCollection('proveedores');
        const rawProveedores = await collection.find({ isActive: true }).sort({ nombre: 1 }).toArray();
        const proveedores = rawProveedores.map(p => ({ ...p, _id: p._id.toString() }));
        return { success: true, proveedores };
    } catch (error) {
        console.error('Error in getAllProveedoresMongo:', error);
        return { success: false, error: 'Error al obtener proveedores' };
    }
}

export async function getAllProveedoresIncludingInactiveMongo(): Promise<{ success: boolean; proveedores?: any[]; error?: string }> {
    try {
        const collection = await getCollection('proveedores');
        const rawProveedores = await collection.find({}).sort({ nombre: 1 }).toArray();
        const proveedores = rawProveedores.map(p => ({ ...p, _id: p._id.toString() }));
        return { success: true, proveedores };
    } catch (error) {
        console.error('Error in getAllProveedoresIncludingInactiveMongo:', error);
        return { success: false, error: 'Error al obtener todos los proveedores' };
    }
}

export async function getProveedorByIdMongo(id: string): Promise<{ success: boolean; proveedor?: any; error?: string }> {
    try {
        const collection = await getCollection('proveedores');
        const rawProveedor = await collection.findOne({ _id: new ObjectId(id) });
        const proveedor = rawProveedor ? { ...rawProveedor, _id: rawProveedor._id.toString() } : null;
        return { success: true, proveedor };
    } catch (error) {
        console.error('Error in getProveedorByIdMongo:', error);
        return { success: false, error: 'Error al obtener proveedor' };
    }
}

export async function createProveedorMongo(data: any): Promise<{ success: boolean; proveedor?: any; error?: string }> {
    try {
        const collection = await getCollection('proveedores');
        const doc = { ...data, isActive: true, createdAt: new Date() };
        const result = await collection.insertOne(doc);
        return { success: true, proveedor: { ...doc, _id: result.insertedId.toString() } };
    } catch (error) {
        console.error('Error in createProveedorMongo:', error);
        return { success: false, error: 'Error al crear proveedor' };
    }
}

export async function updateProveedorMongo(id: string, data: any): Promise<{ success: boolean; proveedor?: any; error?: string }> {
    try {
        const collection = await getCollection('proveedores');
        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        const proveedor = result ? { ...result, _id: result._id.toString() } : null;
        return { success: true, proveedor };
    } catch (error) {
        console.error('Error in updateProveedorMongo:', error);
        return { success: false, error: 'Error al actualizar proveedor' };
    }
}

export async function deleteProveedorMongo(id: string) {
    try {
        const collection = await getCollection('proveedores');
        await collection.deleteOne({ _id: new ObjectId(id) });
        return { success: true };
    } catch (error) {
        console.error('Error in deleteProveedorMongo:', error);
        return { success: false, error: 'Error al eliminar proveedor' };
    }
}

export async function searchProveedoresMongo(searchTerm: string): Promise<{ success: boolean; proveedores?: any[]; error?: string }> {
    try {
        const collection = await getCollection('proveedores');
        const rawProveedores = await collection.find({
            nombre: { $regex: searchTerm, $options: 'i' },
            isActive: true
        }).toArray();
        const proveedores = rawProveedores.map(p => ({ ...p, _id: p._id.toString() }));
        return { success: true, proveedores };
    } catch (error) {
        console.error('Error in searchProveedoresMongo:', error);
        return { success: false, error: 'Error al buscar proveedores' };
    }
}

export async function testSearchProveedoresMongo(searchTerm: string): Promise<{ success: boolean; proveedores?: any[]; error?: string }> {
    return await searchProveedoresMongo(searchTerm);
}

// --- Categorías de Proveedores ---

export async function getAllCategoriasProveedoresMongo(): Promise<{ success: boolean; categorias?: any[]; error?: string }> {
    try {
        const collection = await getCollection('categorias_proveedores');
        const rawCategorias = await collection.find({}).sort({ nombre: 1 }).toArray();
        const categorias = rawCategorias.map(c => ({ ...c, _id: c._id.toString() }));
        return { success: true, categorias };
    } catch (error) {
        console.error('Error in getAllCategoriasProveedoresMongo:', error);
        return { success: false, error: 'Error al obtener categorías de proveedores' };
    }
}

export async function createCategoriaProveedorMongo(data: any) {
    try {
        const collection = await getCollection('categorias_proveedores');
        const result = await collection.insertOne({ ...data, createdAt: new Date() });
        return { success: true, categoria: { ...data, _id: result.insertedId.toString() } };
    } catch (error) {
        console.error('Error in createCategoriaProveedorMongo:', error);
        return { success: false, error: 'Error al crear categoría de proveedor' };
    }
}

export async function updateCategoriaProveedorMongo(id: string, data: any): Promise<{ success: boolean; categoria?: any; error?: string }> {
    try {
        const collection = await getCollection('categorias_proveedores');
        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        const categoria = result ? { ...result, _id: result._id.toString() } : null;
        return { success: true, categoria };
    } catch (error) {
        console.error('Error in updateCategoriaProveedorMongo:', error);
        return { success: false, error: 'Error al actualizar categoría de proveedor' };
    }
}

export async function deleteCategoriaProveedorMongo(id: string) {
    try {
        const collection = await getCollection('categorias_proveedores');
        await collection.deleteOne({ _id: new ObjectId(id) });
        return { success: true };
    } catch (error) {
        console.error('Error in deleteCategoriaProveedorMongo:', error);
        return { success: false, error: 'Error al eliminar categoría de proveedor' };
    }
}

export async function initializeCategoriasProveedoresMongo() {
    try {
        const collection = await getCollection('categorias_proveedores');
        const count = await collection.countDocuments();
        if (count > 0) return { success: true, message: 'Categorías de proveedores ya inicializadas' };

        const defaults = [
            { nombre: 'Materia Prima' },
            { nombre: 'Packaging' },
            { nombre: 'Servicios' },
            { nombre: 'Insumos' },
        ];
        await collection.insertMany(defaults.map(d => ({ ...d, createdAt: new Date() })));
        return { success: true };
    } catch (error) {
        console.error('Error in initializeCategoriasProveedoresMongo:', error);
        return { success: false, error: 'Error al inicializar categorías de proveedores' };
    }
}
