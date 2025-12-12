/**
 * Exports safe for client components (no server-only dependencies)
 * Use this in frontend components instead of the main index
 */

// Client-safe actions
export { getProductsForHomeAction } from './services/productosActions';
export { getShippingOptionsAction } from './actions/enviaActions';

// Types (always safe for client)
export type { Product } from './types/barfer';
export type { EnviaShippingOption, EnviaShippingRateResponse } from './types/envia';

// Utility functions (no server dependencies)
export { validateImageFile, generateCloudinaryUrl, compressImage } from './utils/cloudinaryUtils';
