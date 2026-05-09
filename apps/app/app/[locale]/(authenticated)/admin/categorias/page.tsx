'use client';

import { useState, useEffect } from 'react';
import {
    getAllCategoriesAction,
    createCategoryAction,
    updateCategoryAction,
    deleteCategoryAction,
    checkAdminRoleAction,
    type ProductCategory,
    type CreateProductCategory
} from '@repo/data-services/src/actions';
import { 
    Plus, 
    Pencil, 
    Trash2, 
    Search, 
    MoreHorizontal,
    LayoutGrid,
    List as ListIcon,
    AlertCircle,
    CheckCircle2,
    Tags
} from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogDescription
} from '@repo/design-system/components/ui/dialog';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@repo/design-system/components/ui/table';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@repo/design-system/components/ui/dropdown-menu';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/design-system/components/ui/card';
import { useToast } from '@repo/design-system/hooks/use-toast';

export default function CategoriasAdminPage() {
    const { toast } = useToast();
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    
    // Modal states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);
    
    // Form state
    const [formState, setFormState] = useState<CreateProductCategory>({
        name: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const adminCheck = await checkAdminRoleAction();
            setIsAdmin(adminCheck.isAdmin);

            if (!adminCheck.isAdmin) {
                setIsLoading(false);
                return;
            }

            const result = await getAllCategoriesAction(true); // Include inactive
            if (result.success && result.categories) {
                setCategories(result.categories);
            }
        } catch (error) {
            console.error('Error cargando categorías:', error);
            toast({
                title: 'Error',
                description: 'Error al cargar las categorías',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreateDialog = () => {
        setEditingCategory(null);
        setFormState({ name: '', description: '' });
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (category: ProductCategory) => {
        setEditingCategory(category);
        setFormState({ 
            name: category.name, 
            description: category.description || '' 
        });
        setIsDialogOpen(true);
    };

    const handleOpenDeleteDialog = (category: ProductCategory) => {
        setCategoryToDelete(category);
        setIsDeleteConfirmOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.name) {
            toast({
                title: 'Validación',
                description: 'El nombre es obligatorio',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            let result;
            if (editingCategory) {
                result = await updateCategoryAction(editingCategory._id!, formState);
            } else {
                result = await createCategoryAction(formState);
            }

            if (result.success) {
                toast({
                    title: editingCategory ? 'Categoría actualizada' : 'Categoría creada',
                    description: `La categoría se ha ${editingCategory ? 'actualizado' : 'creado'} correctamente.`
                });
                setIsDialogOpen(false);
                loadData();
            } else {
                toast({
                    title: 'Error',
                    description: result.message || 'Error al guardar la categoría',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Error guardando categoría:', error);
            toast({
                title: 'Error',
                description: 'Ocurrió un error inesperado',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        setIsSubmitting(true);
        try {
            const result = await deleteCategoryAction(categoryToDelete._id!);
            if (result.success) {
                toast({
                    title: 'Categoría eliminada',
                    description: 'La categoría ha sido eliminada correctamente.'
                });
                setIsDeleteConfirmOpen(false);
                loadData();
            } else {
                toast({
                    title: 'Error',
                    description: result.message || 'Error al eliminar la categoría',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Error eliminando categoría:', error);
            toast({
                title: 'Error',
                description: 'Ocurrió un error inesperado',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
            setCategoryToDelete(null);
        }
    };

    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-barfer-green"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
                <p className="text-gray-600">No tienes permisos para gestionar categorías.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 md:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 font-poppins flex items-center gap-2">
                        <Tags className="h-10 w-10 text-barfer-green" />
                        Categorías
                    </h1>
                    <p className="text-gray-500 mt-2 font-nunito">
                        Administra las categorías de productos disponibles en la tienda.
                    </p>
                </div>
                <Button 
                    onClick={handleOpenCreateDialog}
                    className="bg-barfer-green hover:bg-green-700 text-white rounded-xl px-6 h-12 text-lg shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="mr-2 h-5 w-5" /> Nueva Categoría
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar categorías..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-200 rounded-xl focus:ring-barfer-green"
                    />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                    <Button
                        variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                        className={viewMode === 'table' ? 'bg-white shadow-sm' : ''}
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={viewMode === 'grid' ? 'bg-white shadow-sm' : ''}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="font-bold py-4">Nombre</TableHead>
                                <TableHead className="font-bold">Descripción</TableHead>
                                <TableHead className="font-bold">Estado</TableHead>
                                <TableHead className="text-right font-bold pr-8">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((category) => (
                                    <TableRow key={category._id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell className="font-medium py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                                                    <Tags className="h-4 w-4 text-barfer-green" />
                                                </div>
                                                {category.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-md truncate text-gray-500">
                                            {category.description || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {category.isActive ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">
                                                    Activo
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-400">
                                                    Inactivo
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl border-gray-100 shadow-xl">
                                                    <DropdownMenuItem 
                                                        onClick={() => handleOpenEditDialog(category)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => handleOpenDeleteDialog(category)}
                                                        className="text-red-600 cursor-pointer"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                                        No se encontraron categorías.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCategories.map((category) => (
                        <Card key={category._id} className="group hover:shadow-xl transition-all duration-300 border-gray-100 rounded-2xl overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center mb-2">
                                        <Tags className="h-5 w-5 text-barfer-green" />
                                    </div>
                                    {category.isActive ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-gray-300" />
                                    )}
                                </div>
                                <CardTitle className="text-xl group-hover:text-barfer-green transition-colors">{category.name}</CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                    {category.description || 'Sin descripción'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-end gap-2 pt-4">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-lg border-gray-200"
                                    onClick={() => handleOpenEditDialog(category)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-lg border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => handleOpenDeleteDialog(category)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Form Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                        </DialogTitle>
                        <DialogDescription>
                            Completa los datos para {editingCategory ? 'actualizar' : 'crear'} la categoría.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Nombre</label>
                            <Input
                                placeholder="Ej: Snacks, Alimento Húmedo..."
                                value={formState.name}
                                onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                                className="rounded-xl border-gray-200 focus:ring-barfer-green"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Descripción (opcional)</label>
                            <textarea
                                placeholder="Breve descripción de la categoría..."
                                value={formState.description}
                                onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full min-h-[100px] p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-barfer-green outline-none transition-all"
                            />
                        </div>
                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setIsDialogOpen(false)}
                                className="rounded-xl"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-barfer-green hover:bg-green-700 text-white rounded-xl px-8 shadow-lg transition-all"
                            >
                                {isSubmitting ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-3xl">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-center text-xl font-bold">¿Eliminar categoría?</DialogTitle>
                        <DialogDescription className="text-center">
                            Esta acción desactivará la categoría <strong>{categoryToDelete?.name}</strong>. 
                            No se puede eliminar si hay productos activos usándola.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            className="flex-1 rounded-xl"
                            onClick={() => setIsDeleteConfirmOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="button" 
                            disabled={isSubmitting}
                            variant="destructive"
                            className="flex-1 rounded-xl shadow-lg shadow-red-100"
                            onClick={handleDelete}
                        >
                            {isSubmitting ? 'Eliminando...' : 'Sí, eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
