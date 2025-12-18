'use client';

import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Pencil, Save, Trash2, X, Copy, Plus } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@repo/design-system/components/ui/table';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';

import { shouldHighlightRow, getDateCellBackgroundColor, getStatusCellBackgroundColor } from '../helpers';
import { STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS, ORDER_TYPE_OPTIONS } from '../constants';
import type { DataTableProps } from '../types';

interface OrdersTableProps<TData extends { _id: string }, TValue> extends DataTableProps<TData, TValue> {
    editingRowId: string | null;
    editValues: any;
    loading: boolean;
    products: any[];
    canEdit?: boolean;
    canDelete?: boolean;
    onEditClick: (row: any) => void;
    onCancel: () => void;
    onSave: (row: any) => void;
    onDelete: (row: any) => void;
    onDuplicate: (row: any) => void;
    onEditValueChange: (field: string, value: any) => void;
    onPaginationChange: (pageIndex: number, pageSize: number) => void;
    onSortingChange: (sorting: any) => void;
}

export function OrdersTable<TData extends { _id: string }, TValue>({
    columns,
    data,
    pageCount,
    total,
    pagination,
    sorting,
    editingRowId,
    editValues,
    loading,
    products,
    canEdit = false,
    canDelete = false,
    onEditClick,
    onCancel,
    onSave,
    onDelete,
    onDuplicate,
    onEditValueChange,
    onPaginationChange,
    onSortingChange,
}: OrdersTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: {
            sorting,
            pagination,
        },
        getRowId: (row) => row._id,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onPaginationChange: (updater) => {
            const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
            onPaginationChange(newPagination.pageIndex, newPagination.pageSize);
        },
        onSortingChange: (updater) => {
            const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
            onSortingChange(newSorting);
        },
    });

    // Función para renderizar celdas editables
    const renderEditableCell = (columnId: string, original: any, editValues: any, onChange: any, products: any[]) => {
        // Normalizar columnId para manejar variaciones
        const normalizedId = columnId.replace(/_/g, '.');
        
        switch (normalizedId) {
            case 'orderType':
                return (
                    <Select
                        value={editValues.orderType}
                        onValueChange={(value) => onChange('orderType', value)}
                    >
                        <SelectTrigger className="h-6 text-[10px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ORDER_TYPE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-[10px]">
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'user.name':
                return (
                    <div className="space-y-0.5">
                        <Input
                            value={editValues.userName}
                            onChange={(e) => onChange('userName', e.target.value)}
                            placeholder="Nombre"
                            className="h-6 text-[10px] p-1"
                        />
                        <Input
                            value={editValues.userEmail}
                            onChange={(e) => onChange('userEmail', e.target.value)}
                            placeholder="Email"
                            className="h-6 text-[10px] p-1"
                        />
                    </div>
                );

            case 'address.address':
                return (
                    <div className="space-y-0.5">
                        <Input
                            value={editValues.address}
                            onChange={(e) => onChange('address', e.target.value)}
                            placeholder="Dirección"
                            className="h-6 text-[10px] p-1"
                        />
                        <Input
                            value={editValues.city}
                            onChange={(e) => onChange('city', e.target.value)}
                            placeholder="Ciudad"
                            className="h-6 text-[10px] p-1"
                        />
                    </div>
                );

            case 'address.phone':
                return (
                    <Input
                        value={editValues.userPhone}
                        onChange={(e) => onChange('userPhone', e.target.value)}
                        placeholder="Teléfono"
                        className="h-6 text-[10px] p-1"
                    />
                );

            case 'items':
                return (
                    <div className="space-y-0.5 min-w-[200px]">
                        {editValues.selectedProducts?.map((product: any, idx: number) => (
                            <div key={idx} className="flex gap-0.5 items-center">
                                <Select
                                    value={product.productId || undefined}
                                    onValueChange={(value) => {
                                        const newProducts = [...editValues.selectedProducts];
                                        const selectedProduct = products.find(p => p._id === value);
                                        newProducts[idx] = {
                                            ...newProducts[idx],
                                            productId: value,
                                            price: selectedProduct?.precioMinorista || 0
                                        };
                                        onChange('selectedProducts', newProducts);
                                    }}
                                >
                                    <SelectTrigger className="h-6 text-[10px] flex-1 p-1">
                                        <SelectValue placeholder="Producto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.filter(p => p._id && p._id.trim() !== '').map((p) => (
                                            <SelectItem key={p._id} value={p._id || 'unknown'} className="text-[10px]">
                                                {p.titulo}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    min="1"
                                    value={product.quantity}
                                    onChange={(e) => {
                                        const newProducts = [...editValues.selectedProducts];
                                        newProducts[idx].quantity = parseInt(e.target.value) || 1;
                                        onChange('selectedProducts', newProducts);
                                    }}
                                    className="h-6 text-[10px] w-12 p-1"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        const newProducts = editValues.selectedProducts.filter((_: any, i: number) => i !== idx);
                                        onChange('selectedProducts', newProducts);
                                    }}
                                    className="h-6 w-6 p-0"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                const newProducts = [...(editValues.selectedProducts || []), { productId: products[0]?._id || '', quantity: 1, price: 0 }];
                                onChange('selectedProducts', newProducts);
                            }}
                            className="h-6 text-[10px] w-full p-1"
                        >
                            <Plus className="h-3 w-3 mr-0.5" />
                            +
                        </Button>
                    </div>
                );

            case 'paymentMethod':
                return (
                    <Select
                        value={editValues.paymentMethod || 'Efectivo'}
                        onValueChange={(value) => onChange('paymentMethod', value)}
                    >
                        <SelectTrigger className="h-6 text-[10px] p-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PAYMENT_METHOD_OPTIONS.filter(opt => opt.value !== '').map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-[10px]">
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'status':
                return (
                    <Select
                        value={editValues.status}
                        onValueChange={(value) => onChange('status', value)}
                    >
                        <SelectTrigger className="h-6 text-[10px] p-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-[10px]">
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'total':
                return (
                    <div className="space-y-0.5">
                        <Input
                            type="number"
                            value={editValues.shippingPrice}
                            onChange={(e) => onChange('shippingPrice', parseFloat(e.target.value) || 0)}
                            placeholder="Envío"
                            className="h-6 text-[10px] p-1"
                        />
                        <Input
                            type="number"
                            value={editValues.total}
                            onChange={(e) => onChange('total', parseFloat(e.target.value) || 0)}
                            placeholder="Total"
                            className="h-6 text-[10px] p-1 font-semibold"
                        />
                    </div>
                );

            case 'notes':
                return (
                    <Textarea
                        value={editValues.notes}
                        onChange={(e) => onChange('notes', e.target.value)}
                        placeholder="Notas"
                        className="text-[10px] min-h-[50px] p-1"
                    />
                );

            case 'createdAt':
                // La fecha no es editable
                return <div className="text-[10px]">{original.createdAt ? new Date(original.createdAt).toLocaleDateString() : 'N/A'}</div>;

            default:
                // Para cualquier columna no reconocida, intentar mostrar el valor actual
                console.log('Columna no reconocida:', normalizedId, 'ColumnId original:', columnId);
                
                // Intentar extraer el valor del original usando el columnId
                const keys = normalizedId.split('.');
                let value = original;
                for (const key of keys) {
                    if (value && typeof value === 'object') {
                        value = value[key];
                    }
                }
                
                return (
                    <div className="text-[10px] text-muted-foreground italic">
                        {typeof value === 'string' || typeof value === 'number' ? value : '-'}
                    </div>
                );
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table className="w-full">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-xs">
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className="cursor-pointer select-none"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {{
                                                    asc: ' 🔼',
                                                    desc: ' 🔽',
                                                }[header.column.getIsSorted() as string] ?? null}
                                            </div>
                                        )}
                                    </TableHead>
                                ))}
                                <TableHead className="text-xs text-center">Acciones</TableHead>
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => {
                                const highlight = shouldHighlightRow(row);
                                const rowClass = 
                                    highlight === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                                    highlight === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' : '';

                                const isEditing = editingRowId === row.id;

                                return (
                                    <TableRow key={row.id} className={rowClass}>
                                        {row.getVisibleCells().map((cell) => {
                                            const dateBgColor = cell.column.id === 'createdAt'
                                                ? getDateCellBackgroundColor((row.original as any).createdAt)
                                                : '';

                                            const statusBgColor = cell.column.id === 'status'
                                                ? getStatusCellBackgroundColor((row.original as any).status)
                                                : '';

                                            // Renderizar campo editable si estamos editando esta fila
                                            if (isEditing) {
                                                // Intentar obtener el accessorKey o usar el id de la columna
                                                const columnIdentifier = (cell.column.columnDef as any).accessorKey || cell.column.id;
                                                
                                                return (
                                                    <TableCell
                                                        key={cell.id}
                                                        className={`${dateBgColor} ${statusBgColor} p-1`}
                                                    >
                                                        {renderEditableCell(columnIdentifier, row.original, editValues, onEditValueChange, products)}
                                                    </TableCell>
                                                );
                                            }

                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    className={`${dateBgColor} ${statusBgColor}`}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell className="text-center">
                                            {editingRowId === row.id ? (
                                                <div className="flex gap-1 justify-center">
                                                    {canEdit && (
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => onSave(row)}
                                                            disabled={loading}
                                                            className="h-7 w-7 p-0"
                                                        >
                                                            <Save className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={onCancel}
                                                        disabled={loading}
                                                        className="h-7 w-7 p-0"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-1 justify-center">
                                                    {canEdit && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => onEditClick(row)}
                                                            className="h-7 w-7 p-0"
                                                        >
                                                            <Pencil className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onDuplicate(row)}
                                                        disabled={loading}
                                                        className="h-7 w-7 p-0 border-blue-500 text-blue-600"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                    {canDelete && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => onDelete(row)}
                                                            disabled={loading}
                                                            className="h-7 w-7 p-0"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                    No se encontraron órdenes.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Mostrando {table.getRowModel().rows.length} de {total} órdenes.
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </Button>
                    <div className="text-sm">
                        Página {pagination.pageIndex + 1} de {pageCount}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        </div>
    );
}

