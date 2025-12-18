import { getAllOrders } from '@repo/data-services/src/services/barfer';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { columns } from './components/columns';
import { OrdersDataTable } from './components/OrdersDataTable';

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const { page, pageSize, search, sort, from, to, orderType } = params || {
        page: '1',
        pageSize: '50',
        search: '',
        sort: 'createdAt.desc',
        from: '',
        to: '',
        orderType: '',
    };

    const currentPage = Number(page) || 1;
    const currentPageSize = Number(pageSize) || 50;
    const currentSearch = (search as string) || '';
    const currentSort = (sort as string) || 'createdAt.desc';
    const [sortId, sortOrder] = currentSort.split('.');

    // Convertir cadenas vacías a undefined para que los filtros funcionen correctamente
    const fromDate = (from as string) && (from as string).trim() !== '' ? (from as string) : undefined;
    const toDate = (to as string) && (to as string).trim() !== '' ? (to as string) : undefined;
    const currentOrderType = (orderType as string) && (orderType as string).trim() !== '' && (orderType as string) !== 'all' ? (orderType as string) : undefined;

    const pagination: PaginationState = {
        pageIndex: currentPage - 1,
        pageSize: currentPageSize,
    };

    const sorting: SortingState = [
        {
            id: sortId,
            desc: sortOrder === 'desc',
        },
    ];

    // Obtener las órdenes con paginación y filtros
    const result = await getAllOrders({
        sorting,
        limit: currentPageSize * currentPage, // Multiplicar para obtener todos los registros hasta la página actual
        search: currentSearch,
        from: fromDate,
        to: toDate,
        orderType: currentOrderType,
    });

    const orders = result || [];
    const total = orders.length; // En una implementación real, obtendrías el total del servidor
    const pageCount = Math.ceil(total / currentPageSize);

    return (
        <div className="h-full w-full">
            <div className="mb-5 p-5">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Gestión de Órdenes</h1>
                        <p className="text-muted-foreground">
                            Una lista de todas las órdenes en el sistema.
                        </p>
                    </div>
                </div>
            </div>
            <div className="px-5">
                <OrdersDataTable
                    columns={columns}
                    data={orders}
                    pageCount={pageCount}
                    total={total}
                    pagination={pagination}
                    sorting={sorting}
                    canEdit={true}
                    canDelete={true}
                />
            </div>
        </div>
    );
}
