// ==========================================
// AUTENTICACIÓN Y USUARIOS
// ==========================================
export * from './auth';

// ==========================================
// ALMACENAMIENTO (Imágenes, Cloudinary, R2)
// ==========================================
export * from './storage';

// ==========================================
// FINANZAS (Salidas, Saldos, Analytics)
// ==========================================
export * from './finances';

// ==========================================
// PAGOS (Métodos de pago)
// ==========================================
export * from './payments';

// ==========================================
// SISTEMA (Configuración global, Mongo)
// ==========================================
export * from './system';

// ==========================================
// PLANTILLAS (Email templates)
// ==========================================
export * from './templates';

// ==========================================
// RAW E-COMMERCE (MongoDB) - Productos, Órdenes, Clientes
// ==========================================
export * from './raw';

// ==========================================
// ENVÍO (Servicios de Envía)
// ==========================================
export * from './shipping';

// Explicitly export dataService and imageService
export * from './system/dataService';
export * from './storage/imageService';
