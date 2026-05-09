/**
 * Exports safe for client components (no server-only dependencies)
 * Use this in frontend components instead of the main index
 */

// Client-safe actions
export { getProductsForHomeAction } from './services/raw/products';
export { getAllCategoriesAction } from './services/raw/categories/categoriesActions';
export { getShippingOptionsAction } from './actions/enviaActions';

// Types (always safe for client)
export type { Product } from './types/barfer';
export type { ProductCategory } from './services/raw/categories/categoriesService';
export type { EnviaShippingOption, EnviaShippingRateResponse } from './types/envia';

// Utility functions (no server dependencies)
export { validateImageFile, generateCloudinaryUrl, compressImage } from './utils/cloudinaryUtils';
