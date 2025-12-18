import { DAY_COLORS } from './constants';
import { format } from 'date-fns';

// Función para determinar el color de la fila
export const shouldHighlightRow = (row: any) => {
    const status = row.original.status?.toLowerCase();
    
    // Estados entregados/confirmados
    if (status === 'delivered') return 'green';
    if (status === 'confirmed') return 'blue';
    
    return null;
};

// Función para determinar el color de fondo de la celda de fecha
export const getDateCellBackgroundColor = (createdAt: string | Date) => {
    if (!createdAt) return '';
    
    const date = new Date(createdAt);
    const day = date.getDay();
    return DAY_COLORS[day as keyof typeof DAY_COLORS] || '';
};

// Función para determinar el color de fondo de la celda de estado
export const getStatusCellBackgroundColor = (status: string) => {
    if (status === 'confirmed') {
        return 'bg-green-600';
    }
    if (status === 'cancelled') {
        return 'bg-red-500';
    }
    return '';
};

// Función para formatear fechas de forma simple
export const formatDate = (dateString: string) => {
    try {
        return format(new Date(dateString), "dd-MMM", { locale: { code: 'es' } as any });
    } catch {
        return dateString;
    }
};

// Función para formatear moneda
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Función para validar items (eliminar vacíos o con cantidad 0)
export const filterValidItems = (items: any[]) => {
    if (!items) return [];
    return items.filter(item => 
        item.productId && 
        item.quantity > 0
    );
};

// Nombre del archivo de exportación
export const buildExportFileName = (from?: string, to?: string) => {
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    let fileName = `orders_${timestamp}`;
    if (from && to) {
        fileName = `orders_${from}_to_${to}_${timestamp}`;
    }
    return `${fileName}.xlsx`;
};

// Función para descargar archivos base64
export const downloadBase64File = (base64Data: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`;
    link.download = fileName;
    link.click();
};

