export * from './data';
export * from './image';
export * from './user';
// Export barfer types with prefix to avoid conflicts
export {
    type User as BarferUser,
    type Product,
    type ProductOption,
    type Category,
    type Order,
    type OrderItem,
    type Address as BarferAddress,
    type DeliveryArea,
    type Coupon,
    type Ally,
    type BankInfo,
    type Event,
    type Discount,
    type DashboardStats,
    type OrderStatus,
    type ClientBehaviorCategory,
    type ClientSpendingCategory,
    type ClientCategorization,
    type ClientCategoryStats,
    type ClientAnalytics
} from './barfer';
export * from './template';
