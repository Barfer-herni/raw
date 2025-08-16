// ==========================================
// SERVICIOS DEL SISTEMA (PostgreSQL/Prisma)
// ==========================================

// Auth Service (MongoDB) - prefixed with 'mongo'
export {
    registerUser as mongoRegisterUser,
    loginUser as mongoLoginUser,
    getUserById as mongoGetUserById,
    updateUserProfile as mongoUpdateUserProfile,
    changePassword as mongoChangePassword,
    getCurrentUser as mongoGetCurrentUser,
    createUserSession,
    clearUserSession,
    loginWithSession as mongoLoginWithSession,
    signOut as mongoSignOut,
    createUser as mongoCreateUser,
    getAllUsers as mongoGetAllUsers,
    updateUser as mongoUpdateUser,
    deleteUser as mongoDeleteUser,
    // Types from authService
    type User as MongoUser,
    type RegisterData as MongoRegisterData,
    type LoginData as MongoLoginData,
    type UpdateProfileData as MongoUpdateProfileData
} from './authService';

// User Service (PostgreSQL/Prisma) - main user service
export {
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    verifyUserCredentials,
    changePassword
} from './userService';

export * from './dataService';
export * from './imageService';
export * from './uploadR2Image';
export * from './templateService';
export * from './pricesService';
export * from './salidasService';
export * from './salidasAnalyticsService';
export { getSalidasDetailsByCategory } from './salidasService';
export * from './balanceService';
export * from './categoriasService';
export * from './metodosPagoService';

// Nuevos servicios para productos
export * from './productosService';
export * from './categoriasProductosService';
export * from './cloudinaryService';
export * from './authHelpers';

// Server Actions para componentes cliente
export * from './productosActions';
export * from './categoriasActions';
export * from './cloudinaryActions';
export * from './authActions';

// ==========================================
// SERVICIOS DE BARFER E-COMMERCE (MongoDB)
// ==========================================
export * from './mongoService';

// Servicio de Envía para opciones de envío
export * from './enviaService';

// Exportar servicios de Barfer - Solo Analytics que se usan
export {
    // Analytics (desde barfer/analytics/)
    getOrdersByDay,
    getRevenueByDay,
    getAverageOrderValue,
    getCustomerFrequency,
    getCustomerInsights,
    getProductSales,
    getPaymentMethodStats,
    getPaymentsByTimePeriod,
    getProductsByTimePeriod,
    getOrdersByMonth,
    getCategorySales,
    // Client Management (desde barfer/analytics/)
    getClientCategorization,
    getClientsByCategory,
    getClientsByCategoryPaginated,
    getClientGeneralStats,
    type ClientGeneralStats,
    getClientCategoriesStats,
    type ClientCategoriesStats,
    getClientsPaginated,
    getClientsPaginatedWithStatus,
    type ClientForTable,
    type ClientForTableWithStatus,
    type PaginatedClientsResponse,
    type PaginatedClientsWithStatusResponse,
    type ClientsPaginationOptions,
    getPurchaseFrequency,
    // WhatsApp Contact Management
    markWhatsAppContacted,
    getWhatsAppContactStatus,
} from './barfer';
