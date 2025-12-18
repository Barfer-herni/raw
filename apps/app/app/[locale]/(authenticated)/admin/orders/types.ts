import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table';

export interface DataTableProps<TData extends { _id: string }, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
    total: number;
    pagination: PaginationState;
    sorting: SortingState;
    canEdit?: boolean;
    canDelete?: boolean;
}

export interface EditValues {
    status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
    paymentMethod: string;
    orderType: 'minorista' | 'mayorista';
    userName: string;
    userLastName: string;
    userEmail: string;
    userPhone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    floor: string;
    notes: string;
    subTotal: number;
    shippingPrice: number;
    total: number;
    selectedProducts: Array<{ productId: string; quantity: number; price: number }>;
}

export interface CreateFormData {
    userName: string;
    userLastName: string;
    userEmail: string;
    userPhone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    floor: string;
    status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
    paymentMethod: string;
    orderType: 'minorista' | 'mayorista';
    notes: string;
    deliveryDay: string;
    subTotal: number;
    shippingPrice: number;
    total: number;
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
}

