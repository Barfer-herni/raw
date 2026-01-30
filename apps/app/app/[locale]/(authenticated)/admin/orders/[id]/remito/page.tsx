'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@repo/design-system/components/ui/button';
import { Printer } from 'lucide-react';

interface RemitoPageProps {
    params: Promise<{
        id: string;
        locale: string;
    }>;
}

export default function RemitoPage(props: RemitoPageProps) {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadOrder() {
            const params = await props.params;
            const response = await fetch(`/api/orders/${params.id}`);
            if (response.ok) {
                const data = await response.json();
                setOrder(data);
            }
            setLoading(false);
        }
        loadOrder();
    }, [props.params]);

    if (loading) {
        return <div className="p-8">Cargando...</div>;
    }

    if (!order) {
        return <div className="p-8">Orden no encontrada</div>;
    }

    const { user, address, items, deliveryDay, createdAt, paymentMethod, notes } = order;
    const date = deliveryDay ? new Date(deliveryDay) : new Date(createdAt);

    return (
        <div className="bg-white min-h-screen p-8 text-black print:p-0">
            {/* Print Button - Hidden when printing */}
            <div className="mb-8 print:hidden flex justify-end">
                <Button
                    onClick={() => {
                        window.print();
                    }}
                    className="gap-2"
                >
                    <Printer className="w-4 h-4" />
                    Imprimir / Descargar PDF
                </Button>
            </div>

            <div className="max-w-3xl mx-auto border p-8 print:border-0 print:p-0" id="print-area">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 border-b pb-4">
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-bold mb-2">BARFER</h1>
                        <p className="text-sm text-gray-500">Alimento Natural para Mascotas</p>
                        <p className="text-sm text-gray-500">Instagram: @barfer.ar</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-semibold text-gray-800">REMITO</h2>
                        <p className="text-sm mt-2">
                            <span className="font-semibold">N° Orden:</span> {order._id?.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-sm">
                            <span className="font-semibold">Fecha de Entrega:</span> {format(date, 'dd/MM/yyyy', { locale: es })}
                        </p>
                    </div>
                </div>

                {/* Cliente */}
                <div className="mb-8 grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">Cliente</h3>
                        <p className="font-medium text-lg">{user.name} {user.lastName}</p>
                        {user.email && <p className="text-sm text-gray-600">{user.email}</p>}
                        {address?.phone && <p className="text-sm text-gray-600">Tel: {address.phone}</p>}
                    </div>
                    <div className="text-right">
                        <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">Dirección de Entrega</h3>
                        <p className="font-medium">{address?.address}</p>
                        <p className="text-sm text-gray-600">
                            {address?.city}
                        </p>
                        {address?.floorNumber && (
                            <p className="text-sm text-gray-600">Piso: {address.floorNumber}</p>
                        )}
                    </div>
                </div>

                {/* Items */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-2 px-1 w-16">Cant.</th>
                            <th className="text-left py-2 px-1">Descripción</th>
                            {/* Ocultar precios si se prefiere solo remito de entrega, pero para mayoristas suele ser útil */}
                            <th className="text-right py-2 px-1 w-32">Precio Unit.</th>
                            <th className="text-right py-2 px-1 w-32">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: any, index: number) => {
                            const option = item.options?.[0] as any;
                            const quantity = option?.quantity || 1;
                            const price = option?.price || item.price || 0;
                            const total = price * quantity;

                            return (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="py-2 px-1">{quantity}</td>
                                    <td className="py-2 px-1">
                                        <span className="font-medium">{item.name}</span>
                                    </td>
                                    <td className="text-right py-2 px-1">${price.toFixed(0)}</td>
                                    <td className="text-right py-2 px-1 font-medium">${total.toFixed(0)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3} className="text-right py-4 px-1 font-semibold text-gray-600">Subtotal</td>
                            <td className="text-right py-4 px-1 font-bold">${(order.subTotal || 0).toFixed(0)}</td>
                        </tr>
                        {order.shippingPrice > 0 && (
                            <tr>
                                <td colSpan={3} className="text-right py-2 px-1 font-semibold text-gray-600">Envío</td>
                                <td className="text-right py-2 px-1 font-bold">${(order.shippingPrice || 0).toFixed(0)}</td>
                            </tr>
                        )}
                        <tr className="border-t-2 border-gray-800 text-lg">
                            <td colSpan={3} className="text-right py-4 px-1 font-bold">Total</td>
                            <td className="text-right py-4 px-1 font-bold">${(order.total || 0).toFixed(0)}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer Info */}
                <div className="grid grid-cols-2 gap-8 border-t pt-8">
                    <div>
                        <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">Notas</h3>
                        <p className="text-sm bg-gray-50 p-2 rounded border">
                            {notes || "Sin notas adicionales."}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">Forma de Pago</h3>
                        <p className="text-sm font-medium">
                            {paymentMethod}
                        </p>
                    </div>
                </div>

                <div className="mt-16 text-center text-xs text-gray-400">
                    <p>Documento no válido como factura.</p>
                </div>
            </div>

            {/* Print Styles Override to hide everything else */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; size: auto; }
                    body { visibility: hidden; background: white; }
                    #print-area { 
                        visibility: visible; 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        padding: 20px;
                        margin: 0;
                        border: none;
                    }
                    #print-area * { visibility: visible; }
                }
            `}} />

        </div>
    );
}
