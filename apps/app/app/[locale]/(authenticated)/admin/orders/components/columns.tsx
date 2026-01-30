'use client';

import { type ColumnDef, type CellContext } from '@tanstack/react-table';
import type { Order } from '@repo/data-services/src/types/barfer';
import { Badge } from '@repo/design-system/components/ui/badge';
import { STATUS_TRANSLATIONS, PAYMENT_METHOD_TRANSLATIONS, DAY_COLORS } from '../constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const columns: ColumnDef<Order>[] = [
    {
        accessorKey: 'orderType',
        header: 'Tipo',
        cell: ({ row }: CellContext<Order, unknown>) => {
            const orderType = row.getValue('orderType') as Order['orderType'];
            const isWholesale = orderType === 'mayorista';
            return (
                <Badge
                    variant={isWholesale ? 'destructive' : 'secondary'}
                    className="text-[10px] whitespace-nowrap py-0 px-1"
                >
                    {orderType === 'mayorista' ? 'May' : 'Min'}
                </Badge>
            );
        },
        size: 60,
    },
    {
        accessorKey: 'deliveryDay',
        header: 'Fecha',
        enableSorting: true,
        cell: ({ row }: CellContext<Order, unknown>) => {
            // Priorizamos deliveryDay, si no existe usamos createdAt
            // Nota: En la definición de tipo Order, deliveryDay puede ser string o Date
            const dateToUse = row.original.deliveryDay || row.original.createdAt;

            if (!dateToUse) {
                return <div className="w-full text-center text-[10px]">--</div>;
            }

            const date = new Date(dateToUse);
            const formatted = format(date, 'dd-MMM', { locale: es });

            // Colores por día de la semana
            const day = date.getDay();
            const bgColor = DAY_COLORS[day as keyof typeof DAY_COLORS] || '';

            return (
                <div className={`flex h-full w-full items-center justify-center text-center ${bgColor} rounded-sm px-1 py-0.5`}>
                    <span className="font-semibold text-[10px]">
                        {formatted}
                    </span>
                </div>
            );
        },
        size: 65,
    },
    {
        accessorKey: 'user.name',
        header: 'Cliente',
        cell: ({ row }: CellContext<Order, unknown>) => {
            const user = row.original.user;
            if (!user) return <div className="text-[10px]">N/A</div>;

            return (
                <div className="min-w-[100px] text-[10px] whitespace-normal break-words">
                    <div className="font-medium">{user.name} {user.lastName || ''}</div>
                    {user.email && (
                        <div className="text-[9px] text-muted-foreground truncate">
                            {user.email.split('@')[0]}@
                        </div>
                    )}
                </div>
            );
        },
        size: 100,
    },
    {
        accessorKey: 'address.address',
        header: 'Dirección',
        cell: ({ row }: CellContext<Order, unknown>) => {
            const address = row.original.address;
            if (!address) return <div className="text-[10px]">N/A</div>;

            return (
                <div className="min-w-[130px] text-[10px] whitespace-normal break-words">
                    <div className="truncate" title={address.address}>{address.address || 'N/A'}</div>
                    {address.city && (
                        <div className="text-[9px] text-muted-foreground">{address.city}</div>
                    )}
                </div>
            );
        },
        size: 130,
    },
    {
        accessorKey: 'address.phone',
        header: 'Tel',
        cell: ({ row }: CellContext<Order, unknown>) => {
            const address = row.original.address;
            const phone = address?.phone || row.original.user?.phoneNumber;
            return <div className="min-w-[85px] text-[10px] whitespace-nowrap">{phone || 'N/A'}</div>;
        },
        size: 85,
    },
    {
        accessorKey: 'items',
        header: 'Productos',
        enableSorting: false,
        cell: ({ row }: CellContext<Order, unknown>) => {
            const items = row.original.items;
            if (!items || items.length === 0) {
                return <div className="text-[10px]">Sin productos</div>;
            }

            return (
                <div className="min-w-[150px] text-[10px] whitespace-normal break-words">
                    {items.slice(0, 1).map((item, index) => {
                        const option = item.options?.[0] as any;
                        const quantity = option?.quantity || 1;

                        return (
                            <div key={`${item.id}-${index}`} className="truncate" title={item.name}>
                                • {item.name} (x{quantity})
                            </div>
                        );
                    })}
                    {items.length > 1 && (
                        <div className="text-[9px] text-muted-foreground">
                            +{items.length - 1} más
                        </div>
                    )}
                </div>
            );
        },
        size: 150,
    },
    {
        accessorKey: 'paymentMethod',
        header: 'Pago',
        cell: ({ row }: CellContext<Order, unknown>) => {
            const paymentMethod = row.original.paymentMethod || '';
            const translatedPaymentMethod = PAYMENT_METHOD_TRANSLATIONS[paymentMethod] || paymentMethod;
            return (
                <div className="min-w-[80px] text-[10px]">
                    <span className="bg-muted px-1 py-0.5 rounded text-[9px] whitespace-nowrap">
                        {translatedPaymentMethod}
                    </span>
                </div>
            );
        },
        size: 80,
    },
    {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }: CellContext<Order, unknown>) => {
            const status = row.getValue('status') as Order['status'];
            const translatedStatus = STATUS_TRANSLATIONS[status] || status || 'Sin estado';

            let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
            if (status === 'confirmed') variant = 'default';
            if (status === 'delivered') variant = 'outline';
            if (status === 'cancelled') variant = 'destructive';

            return (
                <div className="h-full flex items-center justify-center">
                    <Badge variant={variant} className="text-[9px] whitespace-nowrap py-0 px-1">
                        {translatedStatus}
                    </Badge>
                </div>
            );
        },
        size: 75,
    },
    {
        accessorKey: 'total',
        header: () => <div className="w-full text-center">Precios</div>,
        cell: ({ row }: CellContext<Order, unknown>) => {
            const order = row.original;
            const subTotal = order.subTotal || 0;
            const shippingPrice = order.shippingPrice || 0;
            const total = parseFloat(row.getValue('total') as string);

            const formatCurrency = (amount: number) => {
                return new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(amount);
            };

            return (
                <div className="min-w-[110px] text-[10px] space-y-0.5">
                    {/* Subtotal de productos */}
                    <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">
                        <span className="text-[8px] text-muted-foreground">Prod:</span>
                        <span className="font-medium">{formatCurrency(subTotal)}</span>
                    </div>

                    {/* Costo de envío */}
                    {shippingPrice > 0 && (
                        <div className="flex justify-between items-center bg-orange-50 dark:bg-orange-900/20 px-1 py-0.5 rounded">
                            <span className="text-[8px] text-muted-foreground">Envío:</span>
                            <span className="font-medium">{formatCurrency(shippingPrice)}</span>
                        </div>
                    )}

                    {/* Total final */}
                    <div className="flex justify-between items-center bg-green-100 dark:bg-green-900/30 px-1 py-0.5 rounded border border-green-300 dark:border-green-700">
                        <span className="text-[8px] font-semibold text-green-700 dark:text-green-400">TOTAL:</span>
                        <span className="font-bold text-green-700 dark:text-green-400">{formatCurrency(total)}</span>
                    </div>
                </div>
            );
        },
        size: 110,
    },
    {
        accessorKey: 'notes',
        header: 'Notas',
        cell: ({ row }: CellContext<Order, unknown>) => {
            const notes = row.original.notes || '';
            return (
                <div className="min-w-[120px] max-w-[150px] text-[10px] whitespace-normal break-words">
                    {notes ? (
                        <span className="bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded text-[9px]">
                            {notes.substring(0, 30)}{notes.length > 30 ? '...' : ''}
                        </span>
                    ) : (
                        <span className="text-muted-foreground italic text-[9px]">-</span>
                    )}
                </div>
            );
        },
        size: 120,
    },
];

