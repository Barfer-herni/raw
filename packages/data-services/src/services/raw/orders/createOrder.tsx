import 'server-only';
import { getCollection, ObjectId } from '@repo/database';
import { z } from 'zod';
import { format } from 'date-fns';
import type { Order } from '../../../types/barfer';

const createOrderSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'delivered', 'cancelled']).default('pending'),
    total: z.coerce.number({ invalid_type_error: "El total debe ser un número" }).positive("El total debe ser mayor a 0"),
    subTotal: z.coerce.number({ invalid_type_error: "El subtotal debe ser un número" }).min(0, "El subtotal no puede ser negativo").optional().default(0),
    shippingPrice: z.coerce.number({ invalid_type_error: "El costo de envío debe ser un número" }).min(0, "El costo de envío no puede ser negativo").optional().default(0),
    notes: z.string().optional(),
    notesOwn: z.string().optional(),
    paymentMethod: z.string({ required_error: "El método de pago es requerido" }),
    orderType: z.enum(['minorista', 'mayorista']).default('minorista'),
    address: z.object({
        address: z.string({ required_error: "La dirección es requerida" }).min(1, "La dirección es requerida"),
        city: z.string({ required_error: "La ciudad es requerida" }).min(1, "La ciudad es requerida"),
        phone: z.string({ required_error: "El teléfono es requerido" }).min(1, "El teléfono es requerido"),
        betweenStreets: z.string().optional(),
        floorNumber: z.string().optional(),
        departmentNumber: z.string().optional(),
    }),
    user: z.object({
        name: z.string({ required_error: "El nombre es requerido" }).min(1, "El nombre es requerido"),
        lastName: z.string().optional().or(z.literal('')),
        email: z.string().optional().or(z.literal('')),
    }),
    items: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
        options: z.array(z.object({
            name: z.string(),
            price: z.coerce.number().min(0, "El precio de la opción no puede ser negativo"),
            quantity: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
        })),
        price: z.coerce.number().min(0, "El precio del producto no puede ser negativo"),
        salesCount: z.number().optional(),
        discountApllied: z.number().optional(),
    })).min(1, "La orden debe tener al menos un producto"),
    deliveryArea: z.object({
        _id: z.string(),
        description: z.string(),
        coordinates: z.array(z.array(z.number())),
        schedule: z.string(),
        orderCutOffHour: z.number(),
        enabled: z.boolean(),
        sameDayDelivery: z.boolean(),
        sameDayDeliveryDays: z.array(z.string()),
        whatsappNumber: z.string(),
        sheetName: z.string(),
    }),
    coupon: z.object({
        code: z.string(),
        discount: z.number(),
        type: z.enum(['percentage', 'fixed']),
    }).optional(),
    deliveryDay: z.union([z.string(), z.date()]),
});

// Función para normalizar el formato de fecha deliveryDay a UTC 00:00:00
function normalizeDeliveryDay(dateInput: string | Date | { $date: string }): Date {
    if (!dateInput) return new Date();

    let date: Date;

    // Si es un objeto con $date, extraer el string y parsear
    if (typeof dateInput === 'object' && '$date' in dateInput) {
        date = new Date(dateInput.$date);
    }
    // Si es un objeto Date, usar directamente
    else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        // Si es string formato YYYY-MM-DD, parsear como UTC para evitar problemas de zona horaria
        if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
            const [year, month, day] = dateInput.split('-').map(Number);
            return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        }
        // Si es otro tipo de string, parsear normal
        date = new Date(dateInput);
    }

    // Validar que la fecha sea válida
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
    }

    // Crear fecha en UTC 00:00:00
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));

    return utcDate;
}

export async function createOrder(data: z.infer<typeof createOrderSchema>): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
        // Validar los datos de entrada
        const parsed = createOrderSchema.safeParse(data);
        if (!parsed.success) {
            const errorMessages = parsed.error.errors.map(e => e.message).join(' | ');
            return { success: false, error: `Revisa los datos: ${errorMessages}` };
        }
        const validatedData = parsed.data;

        // Validar precios y disponibilidad mayorista si corresponde
        if (validatedData.orderType === 'mayorista') {
            const productsCollection = await getCollection('productos');
            const productIds = validatedData.items.map(item => new ObjectId(item.id));
            const products = await productsCollection.find({ _id: { $in: productIds } }).toArray();

            for (const item of validatedData.items) {
                const product = products.find(p => p._id.toString() === item.id);
                if (!product) {
                    return { success: false, error: `Producto no encontrado: ${item.name}` };
                }

                // Verificar que tenga precio mayorista o sea solo mayorista
                const hasWholesalePrice = product.precioMayorista && product.precioMayorista > 0;
                if (!hasWholesalePrice && !product.soloMayorista) {
                    return { success: false, error: `El producto ${item.name} no está disponible para venta mayorista` };
                }

                // Verificar que el precio enviado coincida con el precio mayorista actual (snapshot)
                // Usamos el precio del primer option para validar el precio unitario
                const sentUnitPrice = item.options[0]?.price;
                const actualWholesalePrice = product.precioMayorista || 0;

                if (sentUnitPrice !== actualWholesalePrice) {
                    console.warn(`Price discrepancy for ${item.name}: sent ${sentUnitPrice}, expected ${actualWholesalePrice}`);
                    // Podríamos forzar el precio correcto aquí o rechazar la orden
                    // Por ahora permitimos discrepancias si son manuales dsd admin, pero es bueno registrarlo
                }
            }
        }

        const collection = await getCollection('orders');

        // Normalizar el formato de deliveryDay si está presente
        if (validatedData.deliveryDay) {
            validatedData.deliveryDay = normalizeDeliveryDay(validatedData.deliveryDay);
        }

        // Crear la nueva orden con timestamps
        const newOrder = {
            ...validatedData,
            createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
            updatedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        };

        // Insertar la orden en la base de datos
        const result = await collection.insertOne(newOrder);

        if (!result.insertedId) {
            return { success: false, error: 'Failed to create order' };
        }

        // Obtener la orden creada
        const createdOrder = await collection.findOne({ _id: result.insertedId });

        if (!createdOrder) {
            return { success: false, error: 'Order created but not found' };
        }

        // Convertir ObjectId a string para la respuesta
        const orderWithStringId = {
            ...createdOrder,
            _id: createdOrder._id.toString(),
        } as Order;

        return { success: true, order: orderWithStringId };
    } catch (error) {
        console.error('Error creating order:', error);
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors.map(e => e.message).join(' | ');
            return { success: false, error: `Revisa los datos: ${errorMessages}` };
        }
        return { success: false, error: error instanceof Error ? error.message : 'Error interno del servidor' };
    }
}
