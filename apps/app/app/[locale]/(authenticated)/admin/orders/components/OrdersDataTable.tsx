'use client';

import { useState, useCallback, useTransition, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { updateOrderAction, deleteOrderAction } from '../actions';
import { getAllProductsAction, type AdminProduct } from '@repo/data-services/src/actions';
import { DateRangeFilter } from './DateRangeFilter';
import { OrderTypeFilter } from './OrderTypeFilter';
import { Search } from 'lucide-react';

import type { DataTableProps, EditValues } from '../types';
import { OrdersTable } from './OrdersTable';

export function OrdersDataTable<TData extends { _id: string }, TValue>({
    columns,
    data,
    pageCount,
    total,
    pagination,
    sorting,
    canEdit = false,
    canDelete = false,
}: DataTableProps<TData, TValue>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Estado local
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<EditValues>({
        status: 'pending',
        paymentMethod: '',
        orderType: 'minorista',
        userName: '',
        userLastName: '',
        userEmail: '',
        userPhone: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        floor: '',
        notes: '',
        subTotal: 0,
        shippingPrice: 0,
        total: 0,
        selectedProducts: [],
    });
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
    const [isPending, startTransition] = useTransition();

    // Cargar productos al montar
    useEffect(() => {
        const loadProducts = async () => {
            const result = await getAllProductsAction(true);
            if (result.success && result.products) {
                setProducts(result.products);
            }
        };
        loadProducts();
    }, []);

    // Funciones de navegación
    const navigateToSearch = useCallback((value: string) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams);
            params.set('page', '1');
            if (value) {
                params.set('search', value);
            } else {
                params.delete('search');
            }
            router.push(`${pathname}?${params.toString()}`);
        });
    }, [pathname, router, searchParams]);

    const navigateToPagination = useCallback((pageIndex: number, pageSize: number) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams);
            params.set('page', (pageIndex + 1).toString());
            params.set('pageSize', pageSize.toString());
            router.push(`${pathname}?${params.toString()}`);
        });
    }, [pathname, router, searchParams]);

    const navigateToSorting = useCallback((newSorting: any) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams);
            if (newSorting.length > 0) {
                params.set('sort', `${newSorting[0].id}.${newSorting[0].desc ? 'desc' : 'asc'}`);
            } else {
                params.delete('sort');
            }
            router.push(`${pathname}?${params.toString()}`);
        });
    }, [pathname, router, searchParams]);

    // Función para manejar cambios en el filtro de búsqueda
    const handleSearchChange = useCallback((value: string) => {
        setSearchInput(value);
        if (value.trim() === '') {
            navigateToSearch('');
        }
    }, [navigateToSearch]);

    // Función para manejar la búsqueda cuando se presiona Enter
    const handleSearchSubmit = useCallback((value: string) => {
        navigateToSearch(value);
    }, [navigateToSearch]);

    // Función para manejar la tecla Enter en el input
    const handleSearchKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearchSubmit(searchInput);
        }
    }, [searchInput, handleSearchSubmit]);

    const handleEditClick = async (row: any) => {
        const order = row.original;
        setEditingRowId(row.id);
        
        // Inicializar valores de edición con los datos actuales
        setEditValues({
            status: order.status || 'pending',
            paymentMethod: order.paymentMethod || 'Efectivo',
            orderType: order.orderType || 'minorista',
            userName: order.user?.name || '',
            userLastName: order.user?.lastName || '',
            userEmail: order.user?.email || '',
            userPhone: order.address?.phone || order.user?.phoneNumber || '',
            address: order.address?.address || '',
            city: order.address?.city || '',
            province: order.address?.province || '',
            postalCode: order.address?.postalCode || '',
            floor: order.address?.floorNumber || '',
            notes: order.notes || '',
            subTotal: order.subTotal || 0,
            shippingPrice: order.shippingPrice || 0,
            total: order.total || 0,
            selectedProducts: order.items?.map((item: any) => ({
                productId: item.id || '',
                quantity: item.options?.[0]?.quantity || 1,
                price: item.options?.[0]?.price || item.price || 0,
            })) || [],
        });
    };

    const handleCancel = () => {
        setEditingRowId(null);
        setEditValues({
            status: 'pending',
            paymentMethod: '',
            orderType: 'minorista',
            userName: '',
            userLastName: '',
            userEmail: '',
            userPhone: '',
            address: '',
            city: '',
            province: '',
            postalCode: '',
            floor: '',
            notes: '',
            subTotal: 0,
            shippingPrice: 0,
            total: 0,
            selectedProducts: [],
        });
    };

    const handleEditValueChange = (field: string, value: any) => {
        setEditValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async (row: any) => {
        setLoading(true);
        try {
            // Preparar los items actualizados
            const updatedItems = editValues.selectedProducts
                .filter(p => p.productId && p.quantity > 0)
                .map(productItem => {
                    const selectedProduct = products.find(p => p._id === productItem.productId);
                    return {
                        id: productItem.productId,
                        name: selectedProduct?.titulo || 'Producto no encontrado',
                        description: selectedProduct?.descripcion || '',
                        images: selectedProduct?.imagenes || [],
                        options: [{
                            name: selectedProduct?.titulo || 'Producto',
                            price: productItem.price,
                            quantity: productItem.quantity
                        }],
                        price: productItem.price * productItem.quantity,
                        salesCount: 0,
                        discountApllied: 0
                    };
                });

            // Preparar datos de actualización
            const updateData = {
                status: editValues.status,
                paymentMethod: editValues.paymentMethod,
                orderType: editValues.orderType,
                notes: editValues.notes,
                total: editValues.total,
                subTotal: editValues.subTotal,
                shippingPrice: editValues.shippingPrice,
                user: {
                    name: editValues.userName,
                    lastName: editValues.userLastName,
                    email: editValues.userEmail,
                },
                address: {
                    address: editValues.address,
                    city: editValues.city,
                    phone: editValues.userPhone,
                    floorNumber: editValues.floor,
                },
                items: updatedItems,
            };

            const result = await updateOrderAction(row.id, updateData as any);
            
            if (!result.success) {
                throw new Error(result.message || 'Error al guardar');
            }

            handleCancel();
            router.refresh();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Error al guardar los cambios');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (row: any) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta orden? Esta acción no se puede deshacer.')) {
            return;
        }

        setLoading(true);
        try {
            const result = await deleteOrderAction(row.id);
            if (!result.success) throw new Error(result.message || 'Error al eliminar');
            router.refresh();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Error al eliminar la orden');
        } finally {
            setLoading(false);
        }
    };

    const handleDuplicate = async (row: any) => {
        alert('Función de duplicación no implementada. Agrega la lógica según tus necesidades.');
    };

    return (
        <div>
            <div className="flex flex-col gap-4 py-4">
                {/* Filtros de búsqueda */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="relative w-full sm:w-80 lg:w-96">
                        <Input
                            placeholder="Buscar órdenes (presiona Enter)..."
                            value={searchInput}
                            onChange={(event) => handleSearchChange(event.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className="pr-10"
                            disabled={isPending}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSearchSubmit(searchInput)}
                            disabled={isPending}
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <DateRangeFilter />
                        <OrderTypeFilter />
                    </div>
                </div>
            </div>

            <OrdersTable
                columns={columns}
                data={data}
                pageCount={pageCount}
                total={total}
                pagination={pagination}
                sorting={sorting}
                editingRowId={editingRowId}
                editValues={editValues}
                loading={loading}
                products={products}
                canEdit={canEdit}
                canDelete={canDelete}
                onEditClick={handleEditClick}
                onCancel={handleCancel}
                onSave={handleSave}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onEditValueChange={handleEditValueChange}
                onPaginationChange={navigateToPagination}
                onSortingChange={navigateToSorting}
            />
        </div>
    );
}

