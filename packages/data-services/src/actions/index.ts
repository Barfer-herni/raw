export { checkAdminRoleAction } from '../services/auth/authActions';
export { uploadImageAction, deleteImageAction } from '../services/storage/cloudinaryActions';
export {
    createProductAction,
    getAllProductsAction,
    getProductByIdAction,
    updateProductAction,
    deleteProductAction,
    searchProductsAction,
    getProductsForHomeAction
} from '../services/raw/products/productosActions';
export {
    createCategoryAction,
    getAllCategoriesAction,
    getCategoryByIdAction,
    updateCategoryAction,
    deleteCategoryAction
} from '../services/raw/products/categoriesActions';
export {
    getShippingOptionsAction
} from './enviaActions';

// Re-exports from actions.ts for compatibility
export * from '../services/raw/products';
export * from '../services/storage';
export type { AdminProduct, CreateAdminProduct } from '../types/barfer';
export type { ProductCategory, CreateProductCategory } from '../services/raw/products/categoriesService';
export { validateImageFile, generateCloudinaryUrl, compressImage } from '../utils/cloudinaryUtils';
