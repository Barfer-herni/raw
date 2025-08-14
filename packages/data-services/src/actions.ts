// Índice específico para Server Actions (safe para componentes cliente)

// Server Actions para productos
export * from './services/productosActions';
export * from './services/categoriasActions';
export * from './services/cloudinaryActions';
export * from './services/authActions';

// Tipos necesarios
export type { AdminProduct, CreateAdminProduct } from './types/barfer';
export type { ProductCategory, CreateProductCategory } from './services/categoriasProductosService';

// Funciones de utilidad que no requieren servidor
export { validateImageFile, generateCloudinaryUrl, compressImage } from './utils/cloudinaryUtils';
