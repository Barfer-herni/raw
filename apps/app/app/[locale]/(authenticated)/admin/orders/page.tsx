'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/design-system/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@repo/design-system/components/ui/alert-dialog';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { Package, Search, Edit, Trash2, Calendar, DollarSign, User, MapPin, Filter, Plus, Check, X, Table, Download, Copy } from 'lucide-react';
import { getAllOrdersAction, updateOrderAction, deleteOrderAction } from './actions';
import { createOrderAction } from '../checkout/actions';
import { getAllProductsAction, type AdminProduct } from '@repo/data-services/src/actions';
import type { Order } from '@repo/data-services/src/types/barfer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function OrdersAdminPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [orderTypeFilter, setOrderTypeFilter] = useState<string>('all');
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [deleteOrderDialog, setDeleteOrderDialog] = useState<{ open: boolean; order: Order | null }>({ 
        open: false, 
        order: null 
    });
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    // Estados del formulario de edición inline
    const [inlineEditForm, setInlineEditForm] = useState({
        status: '',
        paymentMethod: '',
        orderType: '' as 'minorista' | 'mayorista',
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
        selectedProducts: [] as { productId: string; quantity: number; price: number }[],
    });

    // Estados del formulario de edición (modal)
    const [editForm, setEditForm] = useState({
        status: '',
        paymentMethod: '',
        orderType: '' as 'minorista' | 'mayorista',
        notes: '',
    });

    // Estados del formulario de creación
    const [createForm, setCreateForm] = useState({
        // Cliente
        userName: '',
        userLastName: '',
        userEmail: '',
        userPhone: '',
        // Dirección
        address: '',
        city: '',
        province: '',
        postalCode: '',
        floor: '',
        // Orden
        status: 'pending' as 'pending' | 'confirmed' | 'delivered' | 'cancelled',
        paymentMethod: 'Efectivo',
        orderType: 'minorista' as 'minorista' | 'mayorista',
        notes: '',
        deliveryDay: '',
        // Precios
        subTotal: 0,
        shippingPrice: 0,
        total: 0,
        // Items
        items: [{
            productId: '',
            quantity: 1,
            price: 0
        }]
    });

    // Cargar órdenes al montar el componente
    useEffect(() => {
        loadOrders();
    }, []);

    // Filtrar órdenes cuando cambian los filtros
    useEffect(() => {
        filterOrders();
    }, [orders, searchQuery, statusFilter, orderTypeFilter]);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const [ordersResult, productsResult] = await Promise.all([
                getAllOrdersAction(),
                getAllProductsAction(true) // Incluir productos inactivos para admin
            ]);

            if (ordersResult.success && ordersResult.orders) {
                setOrders(ordersResult.orders);
            } else {
                toast({
                    title: 'Error',
                    description: ordersResult.message || 'Error al cargar las órdenes',
                    variant: 'destructive',
                });
            }

            if (productsResult.success && productsResult.products) {
                setProducts(productsResult.products);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error al cargar los datos',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        // Filtrar por búsqueda
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(order => 
                order._id.toLowerCase().includes(query) ||
                order.user.name.toLowerCase().includes(query) ||
                order.user.email.toLowerCase().includes(query) ||
                order.address.address.toLowerCase().includes(query) ||
                order.paymentMethod.toLowerCase().includes(query)
            );
        }

        // Filtrar por estado
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Filtrar por tipo de orden
        if (orderTypeFilter !== 'all') {
            filtered = filtered.filter(order => order.orderType === orderTypeFilter);
        }

        setFilteredOrders(filtered);
    };

    const handleEditOrder = (order: Order) => {
        setEditingOrder(order);
        setEditForm({
            status: order.status,
            paymentMethod: order.paymentMethod,
            orderType: order.orderType,
            notes: order.notes || '',
        });
        setIsEditDialogOpen(true);
    };

    const handleInlineEdit = (order: Order) => {
        setEditingRowId(order._id);
        setInlineEditForm({
            status: order.status,
            paymentMethod: order.paymentMethod,
            orderType: order.orderType,
            userName: order.user.name,
            userLastName: order.user.lastName || '',
            userEmail: order.user.email,
            userPhone: order.user.phoneNumber || order.address?.phone || '',
            address: order.address?.address || '',
            city: order.address?.city || '',
            province: '',
            postalCode: '',
            floor: order.address?.floorNumber || '',
            notes: order.notes || '',
            subTotal: order.subTotal,
            shippingPrice: order.shippingPrice,
            total: order.total,
            selectedProducts: order.items?.map(item => ({
                productId: item.id || '',
                quantity: (item.options?.[0] as any)?.quantity || 1,
                price: item.options?.[0]?.price || item.price
            })) || [],
        });
    };

    const handleCancelInlineEdit = () => {
        setEditingRowId(null);
        setInlineEditForm({
            status: '',
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

    const addProductToOrder = () => {
        const newProducts = [...inlineEditForm.selectedProducts, {
            productId: '',
            quantity: 1,
            price: 0
        }];
        
        // Recalcular totales
        const newSubTotal = newProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newTotal = newSubTotal + inlineEditForm.shippingPrice;
        
        setInlineEditForm({
            ...inlineEditForm,
            selectedProducts: newProducts,
            subTotal: newSubTotal,
            total: newTotal
        });
    };

    const removeProductFromOrder = (index: number) => {
        const newProducts = inlineEditForm.selectedProducts.filter((_, i) => i !== index);
        
        // Recalcular totales
        const newSubTotal = newProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newTotal = newSubTotal + inlineEditForm.shippingPrice;
        
        setInlineEditForm({
            ...inlineEditForm,
            selectedProducts: newProducts,
            subTotal: newSubTotal,
            total: newTotal
        });
    };

    const updateProductInOrder = (index: number, field: 'productId' | 'quantity' | 'price', value: any) => {
        const newProducts = [...inlineEditForm.selectedProducts];
        newProducts[index] = { ...newProducts[index], [field]: value };
        
        // Si se cambia el producto, actualizar el precio automáticamente según el tipo de orden
        if (field === 'productId' && value) {
            const selectedProduct = products.find(p => p._id === value);
            if (selectedProduct) {
                // Usar precio mayorista si es orden mayorista y existe, sino usar minorista
                const price = (inlineEditForm.orderType === 'mayorista' && selectedProduct.precioMayorista) 
                    ? selectedProduct.precioMayorista 
                    : selectedProduct.precioMinorista;
                newProducts[index].price = price;
            }
        }
        
        // Recalcular totales automáticamente
        const newSubTotal = newProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newTotal = newSubTotal + inlineEditForm.shippingPrice;
        
        setInlineEditForm({
            ...inlineEditForm,
            selectedProducts: newProducts,
            subTotal: newSubTotal,
            total: newTotal
        });
    };

    const handleSaveInlineEdit = (orderId: string) => {
        startTransition(async () => {
            // Preparar los items actualizados
            const updatedItems = inlineEditForm.selectedProducts.map(productItem => {
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

            const result = await updateOrderAction(orderId, {
                status: inlineEditForm.status as 'pending' | 'confirmed' | 'delivered' | 'cancelled',
                paymentMethod: inlineEditForm.paymentMethod,
                orderType: inlineEditForm.orderType,
                notes: inlineEditForm.notes,
                items: updatedItems as any,
                total: inlineEditForm.total,
                subTotal: inlineEditForm.subTotal,
                shippingPrice: inlineEditForm.shippingPrice,
            });

            if (result.success) {
                toast({
                    title: 'Éxito',
                    description: 'Orden actualizada correctamente',
                });
                setEditingRowId(null);
                loadOrders();
            } else {
                toast({
                    title: 'Error',
                    description: result.message || 'Error al actualizar la orden',
                    variant: 'destructive',
                });
            }
        });
    };

    const handleSaveOrder = () => {
        if (!editingOrder) return;

        startTransition(async () => {
            const result = await updateOrderAction(editingOrder._id, {
                ...editForm,
                status: editForm.status as 'pending' | 'confirmed' | 'delivered' | 'cancelled'
            });

            if (result.success) {
                toast({
                    title: 'Éxito',
                    description: 'Orden actualizada correctamente',
                });
                setIsEditDialogOpen(false);
                loadOrders();
            } else {
                toast({
                    title: 'Error',
                    description: result.message || 'Error al actualizar la orden',
                    variant: 'destructive',
                });
            }
        });
    };

    const handleDeleteOrder = (order: Order) => {
        setDeleteOrderDialog({ open: true, order });
    };

    const confirmDeleteOrder = () => {
        if (!deleteOrderDialog.order) return;

        startTransition(async () => {
            if (!deleteOrderDialog.order) return; // Verificación adicional para TypeScript
            const result = await deleteOrderAction(deleteOrderDialog.order._id);

            if (result.success) {
                toast({
                    title: 'Éxito',
                    description: 'Orden eliminada correctamente',
                });
                setDeleteOrderDialog({ open: false, order: null });
                loadOrders();
            } else {
                toast({
                    title: 'Error',
                    description: result.message || 'Error al eliminar la orden',
                    variant: 'destructive',
                });
            }
        });
    };

    const handleCreateOrder = () => {
        const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        setCreateForm({
            userName: '',
            userLastName: '',
            userEmail: '',
            userPhone: '',
            address: '',
            city: '',
            province: '',
            postalCode: '',
            floor: '',
            status: 'pending',
            paymentMethod: 'Efectivo',
            orderType: 'minorista',
            notes: '',
            deliveryDay: today,
            subTotal: 0,
            shippingPrice: 0,
            total: 0,
            items: [{
                productId: '',
                quantity: 1,
                price: 0
            }]
        });
        setIsCreateDialogOpen(true);
    };

    const handleSaveNewOrder = () => {
        startTransition(async () => {
            // Validar campos requeridos
            if (!createForm.userName || !createForm.userEmail || !createForm.address || !createForm.city) {
                toast({
                    title: 'Error',
                    description: 'Por favor completa los campos requeridos (nombre, email, dirección, ciudad)',
                    variant: 'destructive',
                });
                return;
            }

            // Validar que al menos un producto esté seleccionado
            const validItems = createForm.items.filter(item => item.productId && item.quantity > 0);
            if (validItems.length === 0) {
                toast({
                    title: 'Error',
                    description: 'Por favor selecciona al menos un producto válido',
                    variant: 'destructive',
                });
                return;
            }

            // Preparar items (solo los válidos)
            const orderItems = validItems.map(item => {
                const selectedProduct = products.find(p => p._id === item.productId);
                return {
                    id: item.productId,
                    name: selectedProduct?.titulo || 'Producto no encontrado',
                    description: selectedProduct?.descripcion || '',
                    images: selectedProduct?.imagenes || [],
                    options: [{
                        name: selectedProduct?.titulo || 'Producto',
                        price: item.price,
                        quantity: item.quantity
                    }],
                    price: item.price * item.quantity,
                    salesCount: 0,
                    discountApllied: 0
                };
            });

            const orderData = {
                total: createForm.total,
                subTotal: createForm.subTotal,
                shippingPrice: createForm.shippingPrice,
                notes: createForm.notes,
                paymentMethod: createForm.paymentMethod,
                orderType: createForm.orderType,
                address: {
                    address: createForm.address,
                    city: createForm.city,
                    phone: createForm.userPhone,
                    floorNumber: createForm.floor,
                    departmentNumber: '',
                },
                user: {
                    name: createForm.userName,
                    lastName: createForm.userLastName,
                    email: createForm.userEmail,
                },
                items: orderItems,
                deliveryDay: new Date(createForm.deliveryDay),
            };

            const result = await createOrderAction(orderData);

            if (result.success) {
                toast({
                    title: 'Éxito',
                    description: 'Orden creada correctamente',
                });
                setIsCreateDialogOpen(false);
                loadOrders();
            } else {
                toast({
                    title: 'Error',
                    description: result.message || 'Error al crear la orden',
                    variant: 'destructive',
                });
            }
        });
    };

    const addItem = () => {
        setCreateForm({
            ...createForm,
            items: [...createForm.items, { productId: '', quantity: 1, price: 0 }]
        });
    };

    const removeItem = (index: number) => {
        const newItems = createForm.items.filter((_, i) => i !== index);
        setCreateForm({ ...createForm, items: newItems });
    };

    const updateItem = (index: number, field: 'productId' | 'quantity' | 'price', value: any) => {
        const newItems = [...createForm.items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        // Si se cambia el producto, actualizar el precio automáticamente según el tipo de orden
        if (field === 'productId' && value) {
            const selectedProduct = products.find(p => p._id === value);
            if (selectedProduct) {
                // Usar precio mayorista si es orden mayorista y existe, sino usar minorista
                const price = (createForm.orderType === 'mayorista' && selectedProduct.precioMayorista) 
                    ? selectedProduct.precioMayorista 
                    : selectedProduct.precioMinorista;
                newItems[index].price = price;
            }
        }
        
        setCreateForm({ ...createForm, items: newItems });
        
        // Recalcular totales automáticamente
        const newSubTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newTotal = newSubTotal + createForm.shippingPrice;
        setCreateForm(prev => ({ ...prev, subTotal: newSubTotal, total: newTotal }));
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
            pending: { variant: 'secondary', label: 'Pendiente' },
            confirmed: { variant: 'default', label: 'Confirmada' },
            delivered: { variant: 'outline', label: 'Entregada' },
            cancelled: { variant: 'destructive', label: 'Cancelada' },
        };

        const config = variants[status] || { variant: 'outline', label: status };
        
        // Para confirmada, mostrar solo texto sin badge
        if (status === 'confirmed') {
            return <span className="font-semibold text-white">{config.label}</span>;
        }
        
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd-MMM", { locale: es });
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const handleDuplicateOrder = (order: Order) => {
        const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        
        // Preparar los items del pedido original
        const duplicatedItems = order.items?.map(item => ({
            productId: item.id || '',
            quantity: (item.options?.[0] as any)?.quantity || 1,
            price: item.options?.[0]?.price || item.price
        })) || [{
            productId: '',
            quantity: 1,
            price: 0
        }];

        setCreateForm({
            // Datos del cliente
            userName: order.user.name,
            userLastName: order.user.lastName || '',
            userEmail: order.user.email,
            userPhone: order.user.phoneNumber || order.address?.phone || '',
            // Dirección
            address: order.address?.address || '',
            city: order.address?.city || '',
            province: '',
            postalCode: '',
            floor: order.address?.floorNumber || '',
            // Orden
            status: 'pending',
            paymentMethod: order.paymentMethod,
            orderType: order.orderType,
            notes: 'DUPLICADO',
            deliveryDay: today,
            // Precios
            subTotal: order.subTotal,
            shippingPrice: order.shippingPrice,
            total: order.total,
            // Items
            items: duplicatedItems
        });
        
        setIsCreateDialogOpen(true);
        
        toast({
            title: 'Pedido duplicado',
            description: 'Los datos del pedido se han copiado al formulario de creación',
        });
    };

    const generateRemitoPDF = () => {
        // Crear el contenido HTML para el PDF
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Remito - Pedido Mayorista</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                        color: #2563eb;
                    }
                    .header p {
                        margin: 5px 0;
                        color: #666;
                    }
                    .section {
                        margin-bottom: 25px;
                    }
                    .section h2 {
                        background-color: #f3f4f6;
                        padding: 10px;
                        margin: 0 0 15px 0;
                        border-left: 4px solid #2563eb;
                        font-size: 16px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                    }
                    .info-item {
                        margin-bottom: 10px;
                    }
                    .info-label {
                        font-weight: bold;
                        color: #555;
                    }
                    .products-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                    }
                    .products-table th,
                    .products-table td {
                        border: 1px solid #ddd;
                        padding: 12px;
                        text-align: left;
                    }
                    .products-table th {
                        background-color: #f8fafc;
                        font-weight: bold;
                        color: #374151;
                    }
                    .products-table tr:nth-child(even) {
                        background-color: #f9fafb;
                    }
                    .totals {
                        background-color: #f8fafc;
                        padding: 20px;
                        border-radius: 8px;
                        margin-top: 20px;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        padding: 5px 0;
                    }
                    .total-final {
                        border-top: 2px solid #333;
                        padding-top: 10px;
                        font-size: 18px;
                        font-weight: bold;
                        color: #2563eb;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>REMITO - PEDIDO MAYORISTA</h1>
                    <p>Fecha: ${new Date().toLocaleDateString('es-AR')}</p>
                </div>

                <div class="section">
                    <h2>PRODUCTOS SOLICITADOS</h2>
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${createForm.items
                                .filter(item => item.productId && item.quantity > 0)
                                .map(item => {
                                    const product = products.find(p => p._id === item.productId);
                                    const subtotal = item.price * item.quantity;
                                    return `
                                        <tr>
                                            <td>${product?.titulo || 'Producto no encontrado'}</td>
                                            <td>${item.quantity}</td>
                                            <td>${formatCurrency(item.price)}</td>
                                            <td>${formatCurrency(subtotal)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(createForm.subTotal)}</span>
                    </div>
                    <div class="total-row">
                        <span>Costo de Envío:</span>
                        <span>${formatCurrency(createForm.shippingPrice)}</span>
                    </div>
                    <div class="total-row total-final">
                        <span>TOTAL:</span>
                        <span>${formatCurrency(createForm.total)}</span>
                    </div>
                </div>

                ${createForm.notes ? `
                    <div class="section">
                        <h2>NOTAS DEL CLIENTE</h2>
                        <p>${createForm.notes}</p>
                    </div>
                ` : ''}

                <div class="footer">
                    <p>Remito generado el ${new Date().toLocaleString('es-AR')}</p>
                    <p>Sistema de Gestión de Pedidos</p>
                </div>
            </body>
            </html>
        `;

        // Crear y descargar el PDF
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Table className="h-12 w-12 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Cargando órdenes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-8 px-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Table className="h-6 w-6" />
                                Gestión de Órdenes
                            </CardTitle>
                            <CardDescription>
                                Administra todas las órdenes del sistema
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreateOrder} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Crear Orden
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filtros y búsqueda */}
                    <div className="space-y-4 mb-6">
                        {/* Búsqueda */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por ID, cliente, email, dirección..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Filtros */}
                        <div className="flex gap-4 flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                                <Label className="mb-2 flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    Estado
                                </Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="pending">Pendiente</SelectItem>
                                        <SelectItem value="confirmed">Confirmada</SelectItem>
                                        <SelectItem value="delivered">Entregada</SelectItem>
                                        <SelectItem value="cancelled">Cancelada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <Label className="mb-2">Tipo de Orden</Label>
                                <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="minorista">Minorista</SelectItem>
                                        <SelectItem value="mayorista">Mayorista</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Contador de resultados */}
                        <div className="text-sm text-muted-foreground">
                            Mostrando {filteredOrders.length} de {orders.length} órdenes
                        </div>
                    </div>

                    {/* Tabla de órdenes */}
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full border-collapse text-sm table-fixed">
                            <thead>
                                <tr className="bg-muted/50">
                                    <th className="text-left px-1.5 py-0.5 font-semibold border-b border-r text-xs whitespace-nowrap w-[90px]">Tipo Orden</th>
                                    <th className="text-left px-1.5 py-0.5 font-semibold border-b border-r text-xs whitespace-nowrap w-[70px]">Fecha</th>
                                    <th className="text-left px-1.5 py-0.5 font-semibold border-b border-r text-xs w-[150px]">Cliente</th>
                                    <th className="text-left px-1.5 py-0.5 font-semibold border-b border-r text-xs w-[180px]">Dirección</th>
                                    <th className="text-left px-1.5 py-0.5 font-semibold border-b border-r text-xs whitespace-nowrap w-[110px]">Teléfono</th>
                                    <th className="text-left px-1.5 py-0.5 font-semibold border-b border-r text-xs w-[180px]">Productos</th>
                                    <th className="text-left px-1.5 py-0.5 font-semibold border-b border-r text-xs whitespace-nowrap w-[100px]">Medio de Pago</th>
                                    <th className="text-left px-1.5 py-0.5 font-semibold border-b border-r text-xs w-[150px]">Notas del Cliente</th>
                                    <th className="text-left px-1.5 py-0.5 font-semibold border-b border-r text-xs whitespace-nowrap w-[85px]">Estado</th>
                                    <th className="text-left px-1.5 py-0.5 font-semibold border-b border-r text-xs whitespace-nowrap w-[80px]">Total</th>
                                    <th className="text-right px-1.5 py-0.5 font-semibold border-b text-xs whitespace-nowrap w-[70px]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="text-center p-8 text-muted-foreground border">
                                            No se encontraron órdenes
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order._id} className={`hover:bg-muted/50 transition-colors ${editingRowId === order._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} style={editingRowId === order._id ? { height: 'auto', maxHeight: 'none' } : undefined}>
                                            {/* Tipo Orden */}
                                            <td className={`px-1.5 py-0.5 border-b border-r whitespace-nowrap align-top ${order.orderType === 'mayorista' ? 'bg-red-300 dark:bg-red-700' : ''}`}>
                                                {editingRowId === order._id ? (
                                                    <Select
                                                        value={inlineEditForm.orderType}
                                                        onValueChange={(value: 'minorista' | 'mayorista') => 
                                                            setInlineEditForm({ ...inlineEditForm, orderType: value })
                                                        }
                                                    >
                                                        <SelectTrigger className="h-6 text-[10px] w-[90px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="minorista" className="text-[10px]">Minorista</SelectItem>
                                                            <SelectItem value="mayorista" className="text-[10px]">Mayorista</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                        {order.orderType === 'minorista' ? 'Minorista' : 'Mayorista'}
                                                    </Badge>
                                                )}
                                            </td>
                                            
                                            {/* Fecha */}
                                            <td className="px-1.5 py-0.5 text-xs border-b border-r whitespace-nowrap align-top">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            
                                            {/* Cliente */}
                                            <td className="px-2 py-0.5 border-b border-r align-top">
                                                {editingRowId === order._id ? (
                                                    <div className="space-y-0.5">
                                                        <Input
                                                            value={inlineEditForm.userName}
                                                            onChange={(e) => setInlineEditForm({ ...inlineEditForm, userName: e.target.value })}
                                                            className="h-6 text-[10px]"
                                                            placeholder="Nombre"
                                                        />
                                                        <Input
                                                            value={inlineEditForm.userEmail}
                                                            onChange={(e) => setInlineEditForm({ ...inlineEditForm, userEmail: e.target.value })}
                                                            className="h-6 text-[10px]"
                                                            placeholder="Email"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="font-medium text-[11px] whitespace-nowrap truncate">
                                                            {order.user.name} {order.user.lastName || ''}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground truncate">
                                                            {order.user.email}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            
                                            {/* Dirección */}
                                            <td className="px-2 py-0.5 border-b border-r align-top">
                                                {editingRowId === order._id ? (
                                                    <div className="space-y-0.5">
                                                        <Input
                                                            value={inlineEditForm.address}
                                                            onChange={(e) => setInlineEditForm({ ...inlineEditForm, address: e.target.value })}
                                                            className="h-6 text-[10px]"
                                                            placeholder="Dirección"
                                                        />
                                                        <Input
                                                            value={inlineEditForm.city}
                                                            onChange={(e) => setInlineEditForm({ ...inlineEditForm, city: e.target.value })}
                                                            className="h-6 text-[10px]"
                                                            placeholder="Ciudad"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="text-[11px] truncate" title={order.address?.address}>
                                                            {order.address?.address}
                                                        </div>
                                                        {order.address?.city && (
                                                            <div className="text-[10px] text-muted-foreground truncate">
                                                                {order.address.city}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            
                                            {/* Teléfono */}
                                            <td className="px-2 py-0.5 border-b border-r text-[11px] whitespace-nowrap align-top">
                                                {editingRowId === order._id ? (
                                                    <Input
                                                        value={inlineEditForm.userPhone}
                                                        onChange={(e) => setInlineEditForm({ ...inlineEditForm, userPhone: e.target.value })}
                                                        className="h-6 text-[10px] w-[120px]"
                                                        placeholder="Teléfono"
                                                    />
                                                ) : (
                                                    order.address?.phone || order.user.phoneNumber || 'N/A'
                                                )}
                                            </td>
                                            
                                            {/* Productos */}
                                            <td className="px-2 py-0.5 border-b border-r align-top">
                                                {editingRowId === order._id ? (
                                                    <div className="space-y-0.5 min-w-[200px]">
                                                        {inlineEditForm.selectedProducts.map((product, idx) => (
                                                            <div key={idx} className="flex gap-1 items-center">
                                                                <Select
                                                                    value={product.productId}
                                                                    onValueChange={(value) => updateProductInOrder(idx, 'productId', value)}
                                                                >
                                                                    <SelectTrigger className="h-6 text-[10px] flex-1">
                                                                        <SelectValue placeholder="Producto" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {products.map((p) => (
                                                                            <SelectItem key={p._id || ''} value={p._id || ''} className="text-[10px]">
                                                                                <div className="flex flex-col">
                                                                                    <span>{p.titulo}</span>
                                                                                    <span className="text-[9px] text-gray-500">
                                                                                        Min: ${p.precioMinorista}{p.precioMayorista ? ` | May: $${p.precioMayorista}` : ''}
                                                                                    </span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={product.quantity}
                                                                    onChange={(e) => updateProductInOrder(idx, 'quantity', parseInt(e.target.value) || 1)}
                                                                    className="h-6 text-[10px] w-[45px]"
                                                                    placeholder="Qty"
                                                                />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeProductFromOrder(idx)}
                                                                    className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={addProductToOrder}
                                                            className="h-6 text-[10px] w-full"
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" />
                                                            + Producto
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="text-[11px]">
                                                        {order.items?.slice(0, 2).map((item, idx) => (
                                                            <div key={idx} className="truncate" title={item.name}>
                                                                • {item.name} (x{(item.options?.[0] as any)?.quantity || 1})
                                                            </div>
                                                        ))}
                                                        {order.items?.length > 2 && (
                                                            <div className="text-[10px] text-muted-foreground">
                                                                +{order.items.length - 2} más
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            
                                            {/* Medio de Pago */}
                                            <td className="px-1.5 py-0.5 border-b border-r align-top">
                                                {editingRowId === order._id ? (
                                                    <Select
                                                        value={inlineEditForm.paymentMethod}
                                                        onValueChange={(value) => setInlineEditForm({ ...inlineEditForm, paymentMethod: value })}
                                                    >
                                                        <SelectTrigger className="h-6 text-[10px] w-[100px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Efectivo" className="text-[10px]">Efectivo</SelectItem>
                                                            <SelectItem value="Transferencia" className="text-[10px]">Transferencia</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span className="text-[10px] bg-muted px-1 py-0 rounded whitespace-nowrap inline-block">
                                                        {order.paymentMethod}
                                                    </span>
                                                )}
                                            </td>
                                            
                                            {/* Notas del Cliente */}
                                            <td className="px-1.5 py-0.5 border-b border-r align-top">
                                                {editingRowId === order._id ? (
                                                    <Input
                                                        value={inlineEditForm.notes}
                                                        onChange={(e) => setInlineEditForm({ ...inlineEditForm, notes: e.target.value })}
                                                        className="h-6 text-[10px] w-[140px]"
                                                        placeholder="Notas del cliente"
                                                    />
                                                ) : (
                                                    <div className="text-[10px] max-w-[140px]">
                                                        {order.notes ? (
                                                            <span className="bg-blue-50 dark:bg-blue-900/20 px-1 py-0 rounded text-blue-700 dark:text-blue-300 break-words">
                                                                {order.notes}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground italic">Sin notas</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            
                                            {/* Estado */}
                                            <td className={`px-1.5 py-0.5 border-b border-r align-top ${order.status === 'confirmed' ? 'bg-green-700 dark:bg-green-800' : ''}`}>
                                                {editingRowId === order._id ? (
                                                    <Select
                                                        value={inlineEditForm.status}
                                                        onValueChange={(value) => setInlineEditForm({ ...inlineEditForm, status: value })}
                                                    >
                                                        <SelectTrigger className="h-6 text-[10px] w-[90px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending" className="text-[10px]">Pendiente</SelectItem>
                                                            <SelectItem value="confirmed" className="text-[10px]">Confirmada</SelectItem>
                                                            <SelectItem value="delivered" className="text-[10px]">Entregada</SelectItem>
                                                            <SelectItem value="cancelled" className="text-[10px]">Cancelada</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    getStatusBadge(order.status)
                                                )}
                                            </td>
                                            
                                            {/* Total */}
                                            <td className="px-1.5 py-0.5 font-semibold border-b border-r text-[11px] whitespace-nowrap align-top">
                                                {editingRowId === order._id ? (
                                                    <div className="space-y-0.5">
                                                        <div className="text-[9px] text-muted-foreground">
                                                            Sub: {formatCurrency(inlineEditForm.subTotal)}
                                                        </div>
                                                        <Input
                                                            type="number"
                                                            value={inlineEditForm.shippingPrice}
                                                            onChange={(e) => {
                                                                const shipping = parseFloat(e.target.value) || 0;
                                                                setInlineEditForm({ 
                                                                    ...inlineEditForm, 
                                                                    shippingPrice: shipping,
                                                                    total: inlineEditForm.subTotal + shipping
                                                                });
                                                            }}
                                                            className="h-5 text-[9px] w-[85px]"
                                                            placeholder="Envío"
                                                        />
                                                        <div className="text-[10px] font-bold text-green-600">
                                                            Total: {formatCurrency(inlineEditForm.total)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="text-[10px] text-muted-foreground">
                                                            {formatCurrency(order.shippingPrice)}
                                                        </div>
                                                        <div>
                                                            {formatCurrency(order.total)}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            
                                            {/* Acciones */}
                                            <td className="px-1 py-0.5 border-b align-top">
                                                <div className="flex gap-0.5 justify-end">
                                                    {editingRowId === order._id ? (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleSaveInlineEdit(order._id)}
                                                                disabled={isPending}
                                                                className="h-6 w-6 p-0 text-green-600"
                                                            >
                                                                <Check className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleCancelInlineEdit}
                                                                disabled={isPending}
                                                                className="h-6 w-6 p-0 text-red-600"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleInlineEdit(order)}
                                                                disabled={isPending}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDuplicateOrder(order)}
                                                                disabled={isPending}
                                                                className="h-6 w-6 p-0"
                                                                title="Duplicar pedido"
                                                            >
                                                                <Copy className="h-3 w-3 text-blue-600" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDeleteOrder(order)}
                                                                disabled={isPending}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <Trash2 className="h-3 w-3 text-destructive" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog de edición */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Orden</DialogTitle>
                        <DialogDescription>
                            Modifica los detalles de la orden #{editingOrder?._id.substring(0, 8)}
                        </DialogDescription>
                    </DialogHeader>

                    {editingOrder && (
                        <div className="space-y-4">
                            {/* Información del cliente */}
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Cliente
                                </h4>
                                <div className="text-sm space-y-1">
                                    <p><strong>Nombre:</strong> {editingOrder.user.name} {editingOrder.user.lastName || ''}</p>
                                    <p><strong>Email:</strong> {editingOrder.user.email}</p>
                                    <p><strong>Teléfono:</strong> {editingOrder.user.phoneNumber || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Dirección */}
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Dirección de Entrega
                                </h4>
                                <p className="text-sm">{editingOrder.address.address}</p>
                                {editingOrder.address.reference && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Referencia: {editingOrder.address.reference}
                                    </p>
                                )}
                            </div>

                            {/* Items */}
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Productos ({editingOrder.items.length})
                                </h4>
                                <div className="space-y-2">
                                    {editingOrder.items.map((item, index) => (
                                        <div key={index} className="text-sm flex justify-between">
                                            <span>{item.name}</span>
                                            <span className="font-semibold">{formatCurrency(item.price)}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal:</span>
                                            <span>{formatCurrency(editingOrder.subTotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Envío:</span>
                                            <span>{formatCurrency(editingOrder.shippingPrice)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold">
                                            <span>Total:</span>
                                            <span>{formatCurrency(editingOrder.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Campos editables */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="status">Estado</Label>
                                    <Select
                                        value={editForm.status}
                                        onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pendiente</SelectItem>
                                            <SelectItem value="confirmed">Confirmada</SelectItem>
                                            <SelectItem value="delivered">Entregada</SelectItem>
                                            <SelectItem value="cancelled">Cancelada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="orderType">Tipo de Orden</Label>
                                    <Select
                                        value={editForm.orderType}
                                        onValueChange={(value: 'minorista' | 'mayorista') => 
                                            setEditForm({ ...editForm, orderType: value })
                                        }
                                    >
                                        <SelectTrigger id="orderType">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="minorista">Minorista</SelectItem>
                                            <SelectItem value="mayorista">Mayorista</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="paymentMethod">Método de Pago</Label>
                                    <Select
                                        value={editForm.paymentMethod}
                                        onValueChange={(value) => setEditForm({ ...editForm, paymentMethod: value })}
                                    >
                                        <SelectTrigger id="paymentMethod">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Efectivo">Efectivo</SelectItem>
                                            <SelectItem value="Transferencia">Transferencia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="notes">Notas del Cliente</Label>
                                    <Input
                                        id="notes"
                                        value={editForm.notes}
                                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                        placeholder="Notas del cliente..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveOrder} disabled={isPending}>
                            {isPending ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmación de eliminación */}
            <AlertDialog open={deleteOrderDialog.open} onOpenChange={(open) => setDeleteOrderDialog({ open, order: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente la orden
                            {deleteOrderDialog.order && (
                                <span className="font-semibold block mt-2">
                                    #{deleteOrderDialog.order._id.substring(0, 8)}... - {deleteOrderDialog.order.user.name}
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteOrder}
                            disabled={isPending}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isPending ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog de creación de orden */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Orden</DialogTitle>
                        <DialogDescription>
                            Completa los datos para crear una orden manualmente
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Datos del Cliente */}
                        <div className="p-4 bg-muted rounded-lg space-y-4">
                            <h4 className="font-semibold flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Datos del Cliente
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="userName">Nombre *</Label>
                                    <Input
                                        id="userName"
                                        value={createForm.userName}
                                        onChange={(e) => setCreateForm({ ...createForm, userName: e.target.value })}
                                        placeholder="Juan"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="userLastName">Apellido</Label>
                                    <Input
                                        id="userLastName"
                                        value={createForm.userLastName}
                                        onChange={(e) => setCreateForm({ ...createForm, userLastName: e.target.value })}
                                        placeholder="Pérez"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="userEmail">Email *</Label>
                                    <Input
                                        id="userEmail"
                                        type="email"
                                        value={createForm.userEmail}
                                        onChange={(e) => setCreateForm({ ...createForm, userEmail: e.target.value })}
                                        placeholder="juan@email.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="userPhone">Teléfono</Label>
                                    <Input
                                        id="userPhone"
                                        value={createForm.userPhone}
                                        onChange={(e) => setCreateForm({ ...createForm, userPhone: e.target.value })}
                                        placeholder="+54 11 1234-5678"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dirección */}
                        <div className="p-4 bg-muted rounded-lg space-y-4">
                            <h4 className="font-semibold flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Dirección de Entrega
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label htmlFor="address">Dirección *</Label>
                                    <Input
                                        id="address"
                                        value={createForm.address}
                                        onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                                        placeholder="Calle Falsa 123"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="city">Ciudad *</Label>
                                    <Input
                                        id="city"
                                        value={createForm.city}
                                        onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                                        placeholder="Buenos Aires"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="province">Provincia</Label>
                                    <Input
                                        id="province"
                                        value={createForm.province}
                                        onChange={(e) => setCreateForm({ ...createForm, province: e.target.value })}
                                        placeholder="Buenos Aires"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="postalCode">Código Postal</Label>
                                    <Input
                                        id="postalCode"
                                        value={createForm.postalCode}
                                        onChange={(e) => setCreateForm({ ...createForm, postalCode: e.target.value })}
                                        placeholder="1234"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="floor">Piso/Depto</Label>
                                    <Input
                                        id="floor"
                                        value={createForm.floor}
                                        onChange={(e) => setCreateForm({ ...createForm, floor: e.target.value })}
                                        placeholder="5B"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Productos */}
                        <div className="p-4 bg-muted rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Productos
                                </h4>
                                <Button onClick={addItem} variant="outline" size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Agregar Producto
                                </Button>
                            </div>
                            {createForm.items.map((item, index) => (
                                <div key={index} className="p-3 bg-background rounded border space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Producto {index + 1}</span>
                                        {createForm.items.length > 1 && (
                                            <Button
                                                onClick={() => removeItem(index)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <Label>Producto</Label>
                                            <Select
                                                value={item.productId}
                                                onValueChange={(value) => updateItem(index, 'productId', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar producto" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map((product) => (
                                                        <SelectItem key={product._id || ''} value={product._id || ''}>
                                                            <div className="flex flex-col">
                                                                <span>{product.titulo}</span>
                                                                <span className="text-xs text-gray-500">
                                                                    Min: ${product.precioMinorista}{product.precioMayorista ? ` | May: $${product.precioMayorista}` : ''}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Cantidad</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>Precio Unitario</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.price}
                                                onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <Label>Subtotal</Label>
                                            <Input
                                                value={formatCurrency(item.price * item.quantity)}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Detalles de la Orden */}
                        <div className="p-4 bg-muted rounded-lg space-y-4">
                            <h4 className="font-semibold flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Detalles de la Orden
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="status">Estado</Label>
                                    <Select
                                        value={createForm.status}
                                        onValueChange={(value: any) => setCreateForm({ ...createForm, status: value })}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pendiente</SelectItem>
                                            <SelectItem value="confirmed">Confirmada</SelectItem>
                                            <SelectItem value="delivered">Entregada</SelectItem>
                                            <SelectItem value="cancelled">Cancelada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="orderType">Tipo de Orden</Label>
                                    <Select
                                        value={createForm.orderType}
                                        onValueChange={(value: 'minorista' | 'mayorista') => setCreateForm({ ...createForm, orderType: value })}
                                    >
                                        <SelectTrigger id="orderType">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="minorista">Minorista</SelectItem>
                                            <SelectItem value="mayorista">Mayorista</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="paymentMethod">Método de Pago</Label>
                                    <Select
                                        value={createForm.paymentMethod}
                                        onValueChange={(value) => setCreateForm({ ...createForm, paymentMethod: value })}
                                    >
                                        <SelectTrigger id="paymentMethod">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Efectivo">Efectivo</SelectItem>
                                            <SelectItem value="Transferencia">Transferencia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="shippingPrice">Costo de Envío</Label>
                                    <Input
                                        id="shippingPrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={createForm.shippingPrice}
                                        onChange={(e) => {
                                            const shipping = parseFloat(e.target.value) || 0;
                                            setCreateForm({
                                                ...createForm,
                                                shippingPrice: shipping,
                                                total: createForm.subTotal + shipping
                                            });
                                        }}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="deliveryDay">Fecha de Entrega</Label>
                                    <Input
                                        id="deliveryDay"
                                        type="date"
                                        value={createForm.deliveryDay}
                                        onChange={(e) => setCreateForm({ ...createForm, deliveryDay: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="notes">Notas del Cliente</Label>
                                    <Input
                                        id="notes"
                                        value={createForm.notes}
                                        onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                                        placeholder="Notas adicionales del cliente..."
                                    />
                                </div>
                            </div>

                            {/* Totales */}
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold">{formatCurrency(createForm.subTotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Envío:</span>
                                    <span className="font-semibold">{formatCurrency(createForm.shippingPrice)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total:</span>
                                    <span>{formatCurrency(createForm.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <div className="flex justify-between w-full">
                            <Button
                                variant="outline"
                                onClick={generateRemitoPDF}
                                disabled={isPending || createForm.items.filter(item => item.productId && item.quantity > 0).length === 0}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Descargar Remito PDF
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateDialogOpen(false)}
                                    disabled={isPending}
                                >
                                    Cancelar
                                </Button>
                                <Button onClick={handleSaveNewOrder} disabled={isPending}>
                                    {isPending ? 'Creando...' : 'Crear Orden'}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

