'use client';

import type { SalidaMongoData } from '@repo/data-services';
import type { TipoRegistro, TipoSalida } from '@repo/database';
import { Button } from '@repo/design-system/components/ui/button';
import { Calendar } from '@repo/design-system/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@repo/design-system/components/ui/select';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { toast } from '@repo/design-system/hooks/use-toast';
import { cn } from '@repo/design-system/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Check, Plus, Search, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    createCategoriaAction,
    createMetodoPagoAction,
    getAllCategoriasAction,
    getAllMetodosPagoAction,
    getAllProveedoresAction,
    testSearchProveedoresAction,
    updateSalidaAction,
} from '../actions';

interface EditSalidaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    salida: SalidaMongoData;
    onSalidaUpdated: () => void;
}

export function EditSalidaModal({
    open,
    onOpenChange,
    salida,
    onSalidaUpdated,
}: EditSalidaModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const _MARCAS_PREDEFINIDAS = ['BARFER'];

    // Estado del formulario inicializado con datos de la salida
    const [formData, setFormData] = useState({
        fechaFactura:
            salida.fechaFactura instanceof Date
                ? salida.fechaFactura
                : new Date(salida.fechaFactura),
        detalle: salida.detalle,
        categoriaId: salida.categoriaId?.toString() || '',
        tipo: salida.tipo,
        marca: salida.marca || 'SIN_MARCA',
        monto: salida.monto,
        metodoPagoId: salida.metodoPagoId?.toString() || '',
        tipoRegistro: salida.tipoRegistro,
        fechaPago: salida.fechaPago
            ? salida.fechaPago instanceof Date
                ? salida.fechaPago
                : new Date(salida.fechaPago)
            : null,
        comprobanteNumber: salida.comprobanteNumber || '',
        proveedorId: salida.proveedorId?.toString() || '',
    });

    // Estado para el monto formateado (display) - incluyendo decimales
    const [montoDisplay, setMontoDisplay] = useState(() => {
        if (salida.monto <= 0) {
            return '';
        }

        // Formatear el monto con decimales si los tiene
        const [integerPart, decimalPart] = salida.monto.toString().split('.');
        const formattedInteger = Number(integerPart).toLocaleString('es-AR');

        if (decimalPart) {
            // Limitar a 2 decimales
            const limitedDecimal = decimalPart.slice(0, 2);
            return `${formattedInteger},${limitedDecimal}`;
        }

        return formattedInteger;
    });

    // Estados para datos de BD
    const [categoriasDisponibles, setCategorias] = useState<
        Array<{ id: string; nombre: string }>
    >([]);
    const [metodosPagoDisponibles, setMetodosPago] = useState<
        Array<{ id: string; nombre: string }>
    >([]);
    const [_proveedoresDisponibles, setProveedores] = useState<
        Array<{
            id: string;
            nombre: string;
            detalle: string;
            categoriaId?: string;
            metodoPagoId?: string;
            registro: 'BLANCO' | 'NEGRO';
            categoria?: { _id: string; nombre: string };
            metodoPago?: { _id: string; nombre: string };
        }>
    >([]);

    // Estados para opciones personalizadas
    const [customCategoria, setCustomCategoria] = useState('');
    const [isAddingCategoria, setIsAddingCategoria] = useState(false);
    const [customMetodoPago, setCustomMetodoPago] = useState('');
    const [isAddingMetodoPago, setIsAddingMetodoPago] = useState(false);

    // Estados para búsqueda de proveedor
    const [proveedorSearchTerm, setProveedorSearchTerm] = useState('');
    const [proveedorSearchResults, setProveedorSearchResults] = useState<
        Array<{
            id: string;
            nombre: string;
            detalle: string;
            categoriaId?: string;
            metodoPagoId?: string;
            registro: 'BLANCO' | 'NEGRO';
            categoria?: { _id: string; nombre: string };
            metodoPago?: { _id: string; nombre: string };
        }>
    >([]);
    const [showProveedorResults, setShowProveedorResults] = useState(false);
    const [selectedProveedor, setSelectedProveedor] = useState<{
        id: string;
        nombre: string;
        detalle: string;
        categoriaId?: string;
        metodoPagoId?: string;
        registro: 'BLANCO' | 'NEGRO';
        categoria?: { _id: string; nombre: string };
        metodoPago?: { _id: string; nombre: string };
    } | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Cargar datos de la BD al abrir el modal y actualizar formulario cuando cambie la salida
    useEffect(() => {
        if (open) {
            loadData();
            // Actualizar datos del formulario con la salida actual
            setFormData({
                fechaFactura:
                    salida.fechaFactura instanceof Date
                        ? salida.fechaFactura
                        : new Date(salida.fechaFactura),
                detalle: salida.detalle,
                categoriaId: salida.categoriaId?.toString() || '',
                tipo: salida.tipo,
                marca: salida.marca || 'SIN_MARCA',
                monto: salida.monto,
                metodoPagoId: salida.metodoPagoId?.toString() || '',
                tipoRegistro: salida.tipoRegistro,
                fechaPago: salida.fechaPago
                    ? salida.fechaPago instanceof Date
                        ? salida.fechaPago
                        : new Date(salida.fechaPago)
                    : null,
                comprobanteNumber: salida.comprobanteNumber || '',
                proveedorId: salida.proveedorId?.toString() || '',
            });

            // Inicializar el proveedor seleccionado si existe
            if (salida.proveedor) {
                setSelectedProveedor({
                    id: salida.proveedor._id.toString(),
                    nombre: salida.proveedor.nombre,
                    detalle: salida.proveedor.detalle || '',
                    categoriaId: undefined,
                    metodoPagoId: undefined,
                    registro: salida.proveedor.registro,
                    categoria: undefined,
                    metodoPago: undefined,
                });
                setProveedorSearchTerm(salida.proveedor.nombre);
            } else {
                setSelectedProveedor(null);
                setProveedorSearchTerm('');
            }
        }
    }, [open, salida]);

    const loadData = async () => {
        try {
            const [categoriasResult, metodosPagoResult, proveedoresResult] =
                await Promise.all([
                    getAllCategoriasAction(),
                    getAllMetodosPagoAction(),
                    getAllProveedoresAction(),
                ]);

            if (categoriasResult.success && categoriasResult.categorias) {
                setCategorias(
                    categoriasResult.categorias.map((c) => ({
                        id: c._id.toString(),
                        nombre: c.nombre,
                    }))
                );
            }

            if (metodosPagoResult.success && metodosPagoResult.metodosPago) {
                // Filtrar solo EFECTIVO y TRANSFERENCIA
                const metodosFiltrados = metodosPagoResult.metodosPago
                    .filter(
                        (m) => m.nombre === 'EFECTIVO' || m.nombre === 'TRANSFERENCIA'
                    )
                    .map((m) => ({ id: m._id.toString(), nombre: m.nombre }));
                setMetodosPago(metodosFiltrados);
            }

            if (proveedoresResult.success && proveedoresResult.proveedores) {
                setProveedores(
                    proveedoresResult.proveedores.map((p) => ({
                        id: p._id.toString(),
                        nombre: p.nombre,
                        detalle: p.detalle,
                        categoriaId: p.categoriaId?.toString() || undefined,
                        metodoPagoId: p.metodoPagoId?.toString() || undefined,
                        registro: p.registro,
                        categoria: p.categoria ? { ...p.categoria, _id: p.categoria._id.toString() } : undefined,
                        metodoPago: p.metodoPago ? { ...p.metodoPago, _id: p.metodoPago._id.toString() } : undefined,
                    }))
                );
            }
        } catch (_error) { }
    };

    // Funciones para manejar opciones personalizadas
    const handleAddCategoria = async () => {
        if (customCategoria.trim()) {
            const result = await createCategoriaAction(customCategoria.trim());
            if (result.success && result.categoria) {
                const newCategoria = {
                    id: result.categoria._id.toString(),
                    nombre: result.categoria.nombre,
                };
                setCategorias([...categoriasDisponibles, newCategoria]);
                handleInputChange('categoriaId', newCategoria.id);
                setCustomCategoria('');
                setIsAddingCategoria(false);
            }
        }
    };

    const handleAddMetodoPago = async () => {
        if (customMetodoPago.trim()) {
            const result = await createMetodoPagoAction(customMetodoPago.trim());
            if (result.success && result.metodoPago) {
                const newMetodoPago = {
                    id: result.metodoPago._id.toString(),
                    nombre: result.metodoPago.nombre,
                };
                setMetodosPago([...metodosPagoDisponibles, newMetodoPago]);
                handleInputChange('metodoPagoId', newMetodoPago.id);
                setCustomMetodoPago('');
                setIsAddingMetodoPago(false);
            }
        }
    };

    // Funciones para búsqueda de proveedor
    const handleProveedorSearch = async (searchTerm: string) => {
        setProveedorSearchTerm(searchTerm);

        if (searchTerm.length < 2) {
            setProveedorSearchResults([]);
            setShowProveedorResults(false);
            return;
        }

        try {
            const result = await testSearchProveedoresAction(searchTerm);

            if (result.success && result.proveedores) {
                const formattedResults = result.proveedores.map((p) => ({
                    id: p._id.toString(),
                    nombre: p.nombre,
                    detalle: p.detalle,
                    categoriaId: p.categoriaId,
                    metodoPagoId: p.metodoPagoId,
                    registro: p.registro,
                    categoria: p.categoria ? { ...p.categoria, _id: p.categoria._id.toString() } : undefined,
                    metodoPago: p.metodoPago ? { ...p.metodoPago, _id: p.metodoPago._id.toString() } : undefined,
                }));
                setProveedorSearchResults(formattedResults);
                setShowProveedorResults(true);
            } else {
                setProveedorSearchResults([]);
                setShowProveedorResults(true);
            }
        } catch (_error) {
            setProveedorSearchResults([]);
            setShowProveedorResults(false);
        }
    };

    const handleProveedorSelect = (proveedor: typeof selectedProveedor) => {
        if (!proveedor) {
            return;
        }

        setSelectedProveedor(proveedor);
        setProveedorSearchTerm(proveedor.nombre);
        setShowProveedorResults(false);

        // Guardar el ID del proveedor
        handleInputChange('proveedorId', proveedor.id);

        // Autocompletar campos
        if (proveedor.categoriaId) {
            handleInputChange('categoriaId', proveedor.categoriaId);
        }
        if (proveedor.metodoPagoId) {
            handleInputChange('metodoPagoId', proveedor.metodoPagoId);
        }
        handleInputChange('tipoRegistro', proveedor.registro);
    };

    const clearProveedorSelection = () => {
        setSelectedProveedor(null);
        setProveedorSearchTerm('');
        setProveedorSearchResults([]);
        setShowProveedorResults(false);
        handleInputChange('proveedorId', '');
    };

    // Función para formatear el monto (formateo automático mientras escribes)
    const formatMontoDisplay = (value: string): string => {
        // Permitir números, coma y punto
        const cleaned = value.replace(/[^\d.,]/g, '');

        if (cleaned === '') {
            return '';
        }

        // Detectar si hay coma decimal
        const hasComma = cleaned.includes(',');
        let integerPart = cleaned;
        let decimalPart = '';

        if (hasComma) {
            const parts = cleaned.split(',');
            integerPart = parts[0] || '';
            decimalPart = parts.length > 1 ? parts[1] : ''; // Permitir escribir decimales libremente
        }

        // Formatear parte entera con puntos de miles automáticamente
        if (integerPart) {
            // Remover puntos existentes para recalcular
            const cleanInteger = integerPart.replace(/\./g, '');
            const numericValue = parseInt(cleanInteger, 10);

            if (!isNaN(numericValue) && numericValue > 0) {
                // Formatear con puntos de miles usando formato argentino
                const formattedInteger = numericValue.toLocaleString('es-AR').replace(/,/g, '.');

                // Si hay coma en el input original, mantenerla
                if (hasComma) {
                    return `${formattedInteger},${decimalPart}`;
                } else {
                    return formattedInteger;
                }
            }
        }

        return cleaned;
    };

    // Función para parsear el monto display a número (más inteligente)
    const parseMontoDisplay = (value: string): number => {
        if (!value || value.trim() === '') {
            return 0;
        }

        // Limpiar espacios
        const cleaned = value.trim();

        // Detectar si usa coma o punto como separador decimal
        const hasComma = cleaned.includes(',');
        const hasDot = cleaned.includes('.');

        let numericString = cleaned;

        if (hasComma && hasDot) {
            // Si tiene ambos, determinar cuál es el separador decimal
            const lastComma = cleaned.lastIndexOf(',');
            const lastDot = cleaned.lastIndexOf('.');

            if (lastComma > lastDot) {
                // La coma está después del punto, entonces coma es decimal
                numericString = cleaned.replace(/\./g, '').replace(',', '.');
            } else {
                // El punto está después de la coma, entonces punto es decimal
                numericString = cleaned.replace(/,/g, '').replace('.', '.');
            }
        } else if (hasComma) {
            // Solo coma: puede ser separador de miles o decimal
            const parts = cleaned.split(',');
            if (parts.length === 2 && parts[1].length <= 2) {
                // Probablemente coma decimal (ej: "123,45")
                numericString = cleaned.replace(',', '.');
            } else {
                // Probablemente separador de miles (ej: "1,234,567")
                numericString = cleaned.replace(/,/g, '');
            }
        } else if (hasDot) {
            // Solo punto: puede ser separador de miles o decimal
            const parts = cleaned.split('.');
            if (parts.length === 2 && parts[1].length <= 2) {
                // Probablemente punto decimal (ej: "123.45")
                numericString = cleaned;
            } else {
                // Probablemente separador de miles (ej: "1.234.567")
                numericString = cleaned.replace(/\./g, '');
            }
        }

        const parsed = Number.parseFloat(numericString);
        return Number.isNaN(parsed) ? 0 : parsed;
    };

    // Handler para cambio en el input de monto
    const handleMontoChange = (value: string) => {
        const formatted = formatMontoDisplay(value);
        setMontoDisplay(formatted);

        const numericValue = parseMontoDisplay(value);
        handleInputChange('monto', numericValue);
    };

    // Handler para cuando el usuario termine de escribir (onBlur)
    const handleMontoBlur = () => {
        const numericValue = parseMontoDisplay(montoDisplay);
        if (numericValue > 0) {
            // Formatear con puntos de miles y coma decimal
            const formatted = numericValue.toLocaleString('es-AR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).replace(/,/g, '.');
            setMontoDisplay(formatted);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.detalle.trim()) {
            newErrors.detalle = 'El detalle es requerido';
        }

        if (!String(formData.categoriaId).trim()) {
            newErrors.categoriaId = 'La categoría es requerida';
        }

        if (!String(formData.metodoPagoId).trim()) {
            newErrors.metodoPagoId = 'El método de pago es requerido';
        }

        if (formData.monto <= 0) {
            newErrors.monto = 'El monto debe ser mayor a 0';
        }

        if (!formData.fechaFactura) {
            newErrors.fechaFactura = 'La fecha de factura es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const result = await updateSalidaAction(salida._id, {
                fechaFactura: formData.fechaFactura,
                detalle: formData.detalle,
                categoriaId: String(formData.categoriaId),
                tipo: formData.tipo,
                marca: 'BARFER',
                monto: formData.monto,
                metodoPagoId: String(formData.metodoPagoId),
                tipoRegistro: formData.tipoRegistro, // Keep existing if present, but we are hiding UI? User said only remove extra "columns". The forms should match too. Let's keep what we have in DB but not allow edit? Or just force defaults. User said "Los campos que esten demas sacalos". I will assume they don't want to see or start worrying about them.
                // Actually, for UPDATE, we should probably preserve whatever is in the DB if we are not editing it. But here I am constructing the object from formData. 
                // Since I removed the inputs, formData will have the initial values from `useEffect` which loaded from `salida`. 
                // So if I keep `formData.tipoRegistro` here, it will use the value loaded from DB. That is correct behavior for hidden fields (preserve value).
                // Wait, if I remove the inputs, the user CANNOT change them.
                // The user said "Los campos que esten demas sacalos".
                // I'll keep passing the formData values (which come from existing salida) so we don't accidentally overwrite them with defaults if they had values.
                // EXCEPT for the ones that we effectively "removed" conceptually. 
                // Actually, for consistency with AddModal, I should probably also stop sending them if they are "extra". 
                // But `updateSalidaMongo` might need them or default them. 
                // Safest for EDIT is to pass what we have in formData, which comes from the original object.
                // BUT I am removing the inputs.
                // Let's look at `AddSalidaModal` again. There I forced 'BLANCO' etc. 
                // If I force 'BLANCO' here, I might change a historical record that was 'NEGRO'. 
                // That seems bad.
                // So for Edit, I should probably PRESERVE existing values.
                // `formData` is initialized from `salida`. So as long as I don't change `formData` via inputs, it holds the original values.
                // So I can just keep passing `formData.tipoRegistro`, etc. 
                // The issue is simply REMOVING THE UI.

                fechaPago: formData.fechaPago || undefined, // Keep using formData
                comprobanteNumber: formData.comprobanteNumber,
                proveedorId: formData.proveedorId || undefined,
            });

            if (result.success) {
                toast({
                    title: '¡Éxito!',
                    description: 'Salida actualizada correctamente',
                });

                // Resetear estados de campos personalizados
                setCustomCategoria('');
                setIsAddingCategoria(false);
                setCustomMetodoPago('');
                setIsAddingMetodoPago(false);
                setErrors({});

                onSalidaUpdated();
                onOpenChange(false);
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Error al actualizar la salida',
                    variant: 'destructive',
                });
            }
        } catch (_error) {
            toast({
                title: 'Error',
                description: 'Ocurrió un error inesperado',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Limpiar error del campo
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: '',
            }));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Editar Salida</DialogTitle>
                    <DialogDescription>
                        Modifica los datos de la salida de dinero.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Fila: Fecha de Factura y Fecha de Pago */}
                        <div className="grid gap-2">
                            <Label htmlFor="fechaFactura">Fecha *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'justify-start text-left font-normal',
                                            !formData.fechaFactura && 'text-muted-foreground',
                                            errors.fechaFactura && 'border-red-500'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.fechaFactura
                                            ? format(formData.fechaFactura, 'PPP', { locale: es })
                                            : 'Seleccionar fecha'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.fechaFactura}
                                        onSelect={(date) =>
                                            handleInputChange('fechaFactura', date)
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.fechaFactura && (
                                <span className="text-red-500 text-sm">
                                    {errors.fechaFactura}
                                </span>
                            )}
                        </div>

                        {/* Detalle */}
                        <div className="grid gap-2">
                            <Label htmlFor="detalle">Detalle *</Label>
                            <Textarea
                                id="detalle"
                                placeholder="Describe el motivo de la salida..."
                                value={formData.detalle}
                                onChange={(e) => handleInputChange('detalle', e.target.value)}
                                className={errors.detalle ? 'border-red-500' : ''}
                            />
                            {errors.detalle && (
                                <span className="text-red-500 text-sm">{errors.detalle}</span>
                            )}
                        </div>

                        {/* Fila: Categoría */}
                        <div className="grid gap-2">
                            <Label>Categoría *</Label>
                            {isAddingCategoria ? (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Nueva categoría..."
                                        value={customCategoria}
                                        onChange={(e) => setCustomCategoria(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddCategoria();
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleAddCategoria}
                                        className="px-2"
                                    >
                                        <Check className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsAddingCategoria(false)}
                                        className="px-2"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Select
                                        value={String(formData.categoriaId)}
                                        onValueChange={(value) => {
                                            if (value === 'ADD_NEW') {
                                                setIsAddingCategoria(true);
                                            } else {
                                                handleInputChange('categoriaId', value);
                                            }
                                        }}
                                    >
                                        <SelectTrigger
                                            className={errors.categoriaId ? 'border-red-500' : ''}
                                        >
                                            <SelectValue placeholder="Seleccionar categoría..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            {categoriasDisponibles.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.nombre}
                                                </SelectItem>
                                            ))}
                                            <SelectItem
                                                value="ADD_NEW"
                                                className="font-medium text-blue-600"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Plus className="h-3 w-3" />
                                                    Agregar nueva categoría
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {errors.categoriaId && (
                                <span className="text-red-500 text-sm">
                                    {errors.categoriaId}
                                </span>
                            )}
                        </div>

                        {/* Fila: Tipo y Monto */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Tipo de Salida *</Label>
                                <Select
                                    value={formData.tipo}
                                    onValueChange={(value: TipoSalida) =>
                                        handleInputChange('tipo', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ORDINARIO">Ordinario</SelectItem>
                                        <SelectItem value="EXTRAORDINARIO">
                                            Extraordinario
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="monto">Monto *</Label>
                                <div className="relative">
                                    <span className="-translate-y-1/2 absolute top-1/2 left-3 transform text-gray-500">
                                        $
                                    </span>
                                    <Input
                                        id="monto"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0"
                                        value={montoDisplay}
                                        onChange={(e) => handleMontoChange(e.target.value)}
                                        onBlur={handleMontoBlur}
                                        className={`pl-7 ${errors.monto ? 'border-red-500' : ''}`}
                                    />
                                </div>
                                {errors.monto && (
                                    <span className="text-red-500 text-sm">{errors.monto}</span>
                                )}
                                {montoDisplay && (
                                    <span className="text-gray-500 text-xs">
                                        Valor: ${montoDisplay}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Fila: Forma de Pago y Tipo de Registro */}
                        {/* Fila: Forma de Pago */}
                        <div className="grid gap-2">
                            <Label>Método de Pago *</Label>
                            {isAddingMetodoPago ? (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Nuevo método de pago..."
                                        value={customMetodoPago}
                                        onChange={(e) => setCustomMetodoPago(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddMetodoPago();
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleAddMetodoPago}
                                        className="px-2"
                                    >
                                        <Check className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsAddingMetodoPago(false)}
                                        className="px-2"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <Select
                                    value={String(formData.metodoPagoId)}
                                    onValueChange={(value) => {
                                        if (value === 'ADD_NEW') {
                                            setIsAddingMetodoPago(true);
                                        } else {
                                            handleInputChange('metodoPagoId', value);
                                        }
                                    }}
                                >
                                    <SelectTrigger
                                        className={errors.metodoPagoId ? 'border-red-500' : ''}
                                    >
                                        <SelectValue placeholder="Seleccionar método..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {metodosPagoDisponibles.map((metodo) => (
                                            <SelectItem key={metodo.id} value={metodo.id}>
                                                {metodo.nombre}
                                            </SelectItem>
                                        ))}
                                        <SelectItem
                                            value="ADD_NEW"
                                            className="font-medium text-blue-600"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Plus className="h-3 w-3" />
                                                Agregar método de pago
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                            {errors.metodoPagoId && (
                                <span className="text-red-500 text-sm">
                                    {errors.metodoPagoId}
                                </span>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Actualizando...' : 'Actualizar Salida'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
