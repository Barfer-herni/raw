'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@repo/design-system/components/ui/dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Calendar } from '@repo/design-system/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/design-system/components/ui/popover';
import { cn } from '@repo/design-system/lib/utils';

import { STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS, ORDER_TYPE_OPTIONS } from '../constants';
import { createOrderAction } from '../actions';
import type { AdminProduct } from '@repo/data-services/src/actions';

interface ManualOrderModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: AdminProduct[];
    onSuccess: () => void;
}

export function ManualOrderModal({ open, onOpenChange, products, onSuccess }: ManualOrderModalProps) {
    const [isPending, startTransition] = useTransition();
    const [editValues, setEditValues] = useState({
        status: 'pending',
        paymentMethod: 'Transferencia',
        orderType: 'minorista',
        userName: '',
        userLastName: '',
        userEmail: '',
        userPhone: '',
        address: '',
        city: '',
        province: 'Buenos Aires',
        postalCode: '',
        floor: '',
        notes: '',
        subTotal: 0,
        shippingPrice: 0,
        total: 0,
        deliveryDay: new Date(),
        selectedProducts: [] as { productId: string; quantity: number; price: number }[],
    });

    const handleValueChange = (field: string, value: any) => {
        setEditValues((prev) => {
            let processedValue = value;
            if (field === 'shippingPrice') {
                processedValue = parseFloat(value) || 0;
            }

            const newValues = { ...prev, [field]: processedValue };

            if (field === 'orderType') {
                const updatedProducts = newValues.selectedProducts.map((p) => {
                    const product = products.find((prod) => prod._id === p.productId);
                    const price = value === 'mayorista' ? (product?.precioMayorista || 0) : (product?.precioMinorista || 0);
                    return {
                        ...p,
                        price: price,
                    };
                });
                newValues.selectedProducts = updatedProducts;
                const newSubTotal = updatedProducts.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
                newValues.subTotal = newSubTotal;
                newValues.total = newSubTotal + newValues.shippingPrice;
            }

            if (field === 'selectedProducts') {
                const newSubTotal = value.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 0), 0);
                newValues.subTotal = newSubTotal;
                newValues.total = newSubTotal + newValues.shippingPrice;
            }

            if (field === 'shippingPrice') {
                newValues.total = newValues.subTotal + processedValue;
            }

            return newValues;
        });
    };

    const addProduct = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const validProducts = products.filter(p => p._id && p._id.trim() !== '');
        const firstProduct = validProducts[0];
        if (!firstProduct) return;
        const price = editValues.orderType === 'mayorista' ? (firstProduct.precioMayorista || 0) : (firstProduct.precioMinorista || 0);
        handleValueChange('selectedProducts', [
            ...editValues.selectedProducts,
            { productId: firstProduct._id || '', quantity: 1, price },
        ]);
    };

    const removeProduct = (index: number) => {
        const newProducts = editValues.selectedProducts.filter((_, i) => i !== index);
        handleValueChange('selectedProducts', newProducts);
    };

    const updateProduct = (index: number, field: string, value: any) => {
        const newProducts = [...editValues.selectedProducts];
        const item = { ...newProducts[index] };

        if (field === 'productId') {
            const product = products.find((p) => p._id === value);
            item.productId = value;
            item.price = editValues.orderType === 'mayorista' ? (product?.precioMayorista || 0) : (product?.precioMinorista || 0);
        } else if (field === 'quantity') {
            item.quantity = parseInt(value) || 1;
        }

        newProducts[index] = item;
        handleValueChange('selectedProducts', newProducts);
    };

    const handleSave = () => {
        startTransition(async () => {
            try {
                const updatedItems = editValues.selectedProducts
                    .filter((p) => p.productId && p.quantity > 0)
                    .map((productItem) => {
                        const selectedProduct = products.find((p) => p._id === productItem.productId);
                        return {
                            id: productItem.productId,
                            name: selectedProduct?.titulo || 'Producto no encontrado',
                            description: selectedProduct?.descripcion || '',
                            images: selectedProduct?.imagenes || [],
                            options: [
                                {
                                    name: selectedProduct?.titulo || 'Producto',
                                    price: productItem.price,
                                    quantity: productItem.quantity,
                                },
                            ],
                            price: productItem.price * productItem.quantity,
                            salesCount: 0,
                            discountApllied: 0,
                        };
                    });

                const orderData = {
                    status: editValues.status,
                    paymentMethod: editValues.paymentMethod,
                    orderType: editValues.orderType,
                    notes: editValues.notes,
                    total: editValues.total,
                    subTotal: editValues.subTotal,
                    shippingPrice: editValues.shippingPrice,
                    deliveryDay: editValues.deliveryDay ? format(editValues.deliveryDay, 'yyyy-MM-dd') : undefined,
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
                        province: editValues.province,
                    },
                    items: updatedItems,
                };

                const result = await createOrderAction(orderData);
                if (result.success) {
                    onSuccess();
                    onOpenChange(false);
                } else {
                    alert(result.message || 'Error al crear la orden');
                }
            } catch (error) {
                alert('Error al procesar la orden');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nueva Orden Manual</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Sección Usuario y Entrega */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input
                                    value={editValues.userName}
                                    onChange={(e) => handleValueChange('userName', e.target.value)}
                                    placeholder="Nombre"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Apellido</Label>
                                <Input
                                    value={editValues.userLastName}
                                    onChange={(e) => handleValueChange('userLastName', e.target.value)}
                                    placeholder="Apellido"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                value={editValues.userEmail}
                                onChange={(e) => handleValueChange('userEmail', e.target.value)}
                                placeholder="email@ejemplo.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <Input
                                value={editValues.userPhone}
                                onChange={(e) => handleValueChange('userPhone', e.target.value)}
                                placeholder="Teléfono"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Dirección</Label>
                            <Input
                                value={editValues.address}
                                onChange={(e) => handleValueChange('address', e.target.value)}
                                placeholder="Dirección completa"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ciudad</Label>
                                <Input
                                    value={editValues.city}
                                    onChange={(e) => handleValueChange('city', e.target.value)}
                                    placeholder="Ciudad"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de Entrega</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !editValues.deliveryDay && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editValues.deliveryDay ? format(editValues.deliveryDay, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={editValues.deliveryDay}
                                            onSelect={(date) => handleValueChange('deliveryDay', date || new Date())}
                                            initialFocus
                                            locale={es}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    {/* Detalles de la Orden */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Orden</Label>
                                <Select
                                    value={editValues.orderType}
                                    onValueChange={(v) => handleValueChange('orderType', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ORDER_TYPE_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Método de Pago</Label>
                                <Select
                                    value={editValues.paymentMethod}
                                    onValueChange={(v) => handleValueChange('paymentMethod', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_METHOD_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Productos</Label>
                            <div className="border rounded-md p-3 space-y-3">
                                {editValues.selectedProducts.map((p, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <Select
                                            value={p.productId}
                                            onValueChange={(v) => updateProduct(idx, 'productId', v)}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map((prod) => (
                                                    <SelectItem key={prod._id} value={prod._id || ''}>
                                                        {prod.titulo}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="number"
                                            className="w-20"
                                            value={p.quantity}
                                            onChange={(e) => updateProduct(idx, 'quantity', e.target.value)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive h-8 w-8"
                                            onClick={() => removeProduct(idx)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs"
                                    onClick={(e) => addProduct(e)}
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Agregar Item (+)
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Envío ($)</Label>
                                <Input
                                    type="number"
                                    value={editValues.shippingPrice}
                                    onChange={(e) => handleValueChange('shippingPrice', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-blue-600">Total Final</Label>
                                <div className="h-10 flex items-center px-3 border rounded-md bg-blue-50 font-bold text-blue-700">
                                    ${editValues.total.toFixed(0)}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Notas</Label>
                            <Textarea
                                value={editValues.notes}
                                onChange={(e) => handleValueChange('notes', e.target.value)}
                                className="h-20"
                                placeholder="Notas internas o del cliente..."
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isPending || editValues.selectedProducts.length === 0}>
                        {isPending ? "Guardando..." : "Crear Orden"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
