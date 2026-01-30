import { DAY_COLORS } from './constants';
import { format } from 'date-fns';

/* =========================
   HELPERS
========================= */

// Normaliza texto: minúsculas + sin tildes
const normalize = (text: string) =>
    text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

/* =========================
   ROW / CELL STYLES
========================= */

// Función para determinar el color de la fila
export const shouldHighlightRow = (row: any) => {
    const status = row.original.status?.toLowerCase();

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
    if (status === 'confirmed') return 'bg-green-600';
    if (status === 'cancelled') return 'bg-red-500';
    return '';
};

/* =========================
   FORMATTERS
========================= */

// Función para formatear fechas
export const formatDate = (dateString: string) => {
    try {
        return format(new Date(dateString), 'dd-MMM', { locale: { code: 'es' } as any });
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

/* =========================
   VALIDATIONS
========================= */

// Función para validar items
export const filterValidItems = (items: any[]) => {
    if (!items) return [];
    return items.filter(item => item.productId && item.quantity > 0);
};

/* =========================
   EXPORT
========================= */

// Nombre del archivo de exportación
export const buildExportFileName = (from?: string, to?: string) => {
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    let fileName = `orders_${timestamp}`;

    if (from && to) {
        fileName = `orders_${from}_to_${to}_${timestamp}`;
    }

    return `${fileName}.xlsx`;
};

// Descargar archivo base64
export const downloadBase64File = (base64Data: string, fileName: string) => {
    const link = document.createElement('a');
    link.href =
        `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`;
    link.download = fileName;
    link.click();
};

/* =========================
   PRODUCT SORT
========================= */

export const sortProducts = (products: any[]) => {
    return [...products].sort((a, b) => {
        const nameA = normalize(a.titulo || a.name || '');
        const nameB = normalize(b.titulo || b.name || '');

        const getPriority = (name: string) => {
            // 🐖 OREJAS
            if (name.includes('oreja') && (name.includes('2u') || name.includes('x2'))) return 1;
            if (name.includes('oreja') && name.includes('10')) return 2;
            if (name.includes('oreja') && name.includes('50')) return 3;
            if (name.includes('oreja') && name.includes('100')) return 4;

            // 🐄 TRAQUEAS
            if (name.includes('traquea') && name.includes('xl')) return 5;
            if (name.includes('traquea') && name.includes('mediana')) return 6;

            // 🐔 POLLO
            if (name.includes('pollo') && name.includes('40')) return 7;
            if (name.includes('pollo') && name.includes('100')) return 8;

            // 🧠 HIGADO
            if (name.includes('higado') && name.includes('40')) return 9;
            if (name.includes('higado') && name.includes('100')) return 10;

            // 🐾 GARRAS
            if (name.includes('garra')) return 11;

            // 🐟 CORNALITOS
            if (name.includes('cornalito') && name.includes('30')) return 12;

            return 100;
        };

        const priorityA = getPriority(nameA);
        const priorityB = getPriority(nameB);

        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        return nameA.localeCompare(nameB);
    });
};
