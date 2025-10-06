'use client';

import { useState, useEffect } from 'react';
import { 
    createProductAction, 
    getAllProductsAction, 
    getAllCategoriesAction, 
    createCategoryAction,
    uploadImageAction,
    validateImageFile,
    compressImage,
    checkAdminRoleAction,
    updateProductAction,
    deleteProductAction,
    type AdminProduct, 
    type CreateAdminProduct, 
    type ProductCategory, 
    type CreateProductCategory
} from '@repo/data-services/src/actions';

export default function ProductosAdminPage() {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showProductForm, setShowProductForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    // Estados del formulario de producto
    const [productForm, setProductForm] = useState<CreateAdminProduct>({
        titulo: '',
        descripcion: '',
        precioMinorista: 0,
        precioMayorista: undefined,
        stock: 0,
        imagenes: [],
        categoria: '',
        precioOferta: undefined,
        dimensiones: {
            alto: undefined,
            ancho: undefined,
            profundidad: undefined,
            peso: undefined
        }
    });

    // Estados del formulario de categoría
    const [categoryForm, setCategoryForm] = useState<CreateProductCategory>({
        name: '',
        description: ''
    });

    // Cargar datos iniciales
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Verificar si el usuario es administrador
            const adminCheck = await checkAdminRoleAction();
            setIsAdmin(adminCheck.isAdmin);
            setCurrentUser(adminCheck.user);

            if (!adminCheck.isAdmin) {
                setIsLoading(false);
                return;
            }

            const [productsResult, categoriesResult] = await Promise.all([
                getAllProductsAction(true), // Incluir todos los productos para admin
                getAllCategoriesAction()
            ]);
            
            if (productsResult.success && productsResult.products) {
                setProducts(productsResult.products);
            }
            
            if (categoriesResult.success && categoriesResult.categories) {
                setCategories(categoriesResult.categories);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const newFiles: File[] = [];
        const newPreviews: string[] = [];

        // Procesar cada archivo
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Validar archivo
            const validation = validateImageFile(file);
            if (!validation.isValid) {
                alert(`Error en ${file.name}: ${validation.message}`);
                continue;
            }

            newFiles.push(file);
            // Crear preview local usando URL.createObjectURL
            const previewUrl = URL.createObjectURL(file);
            newPreviews.push(previewUrl);
        }

        if (newFiles.length > 0) {
            // Agregar archivos a los existentes
            setSelectedImageFiles(prev => [...prev, ...newFiles]);
            setProductForm(prev => ({ 
                ...prev, 
                imagenes: [...(prev.imagenes || []), ...newPreviews] 
            }));
        }
    };

    const removeImage = (index: number) => {
        // Limpiar URL de preview si es una URL blob
        const imageToRemove = productForm.imagenes?.[index];
        if (imageToRemove && imageToRemove.startsWith('blob:')) {
            URL.revokeObjectURL(imageToRemove);
        }

        // Remover de los archivos seleccionados
        setSelectedImageFiles(prev => prev.filter((_, i) => i !== index));
        
        // Remover de las URLs de preview
        setProductForm(prev => ({
            ...prev,
            imagenes: prev.imagenes?.filter((_, i) => i !== index) || []
        }));
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productForm.titulo || !productForm.categoria) {
            alert('Título y categoría son obligatorios');
            return;
        }

        setIsSubmitting(true);
        try {
            let finalProductForm = { ...productForm };

            // Si hay imágenes seleccionadas, subirlas a Cloudinary primero
            if (selectedImageFiles.length > 0) {
                setUploadingImage(true);
                try {
                    const uploadedUrls: string[] = [];
                    
                    // Subir cada imagen con compresión automática
                    for (const file of selectedImageFiles) {
                        console.log(`📸 Procesando imagen: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
                        
                        // Comprimir imagen antes de subir si es muy grande
                        let processedFile = file;
                        if (file.size > 2 * 1024 * 1024) { // Si es mayor a 2MB
                            console.log('🔄 Comprimiendo imagen...');
                            try {
                                processedFile = await compressImage(file, 0.8, 1920, 1080);
                                console.log(`✅ Imagen comprimida: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
                            } catch (compressionError) {
                                console.warn('⚠️ Error al comprimir, usando archivo original:', compressionError);
                            }
                        }
                        
                        const formData = new FormData();
                        formData.append('file', processedFile);
                        formData.append('folder', 'productos');
                        
                        const uploadResult = await uploadImageAction(formData);
                        if (uploadResult.success && uploadResult.url) {
                            uploadedUrls.push(uploadResult.url);
                            console.log(`✅ Imagen subida exitosamente: ${uploadResult.url}`);
                        } else {
                            console.error(`❌ Error al subir ${file.name}:`, uploadResult.message);
                            alert(`Error al subir ${file.name}: ${uploadResult.message}`);
                            return;
                        }
                    }
                    
                    finalProductForm.imagenes = uploadedUrls;
                    
                    // Limpiar las URLs de preview locales
                    productForm.imagenes?.forEach(imageUrl => {
                        if (imageUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(imageUrl);
                        }
                    });
                } catch (error) {
                    console.error('Error subiendo imágenes:', error);
                    alert('Error al subir imágenes');
                    return;
                } finally {
                    setUploadingImage(false);
                }
            }

            const result = await createProductAction(finalProductForm);
            if (result.success) {
                alert('Producto creado exitosamente');
                setShowProductForm(false);
                resetProductForm();
                loadData();
            } else {
                alert(result.message || 'Error al crear producto');
            }
        } catch (error) {
            console.error('Error creando producto:', error);
            alert('Error al crear producto');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryForm.name) {
            alert('El nombre de la categoría es obligatorio');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createCategoryAction(categoryForm);
            if (result.success) {
                alert('Categoría creada exitosamente');
                setShowCategoryForm(false);
                setCategoryForm({ name: '', description: '' });
                loadData();
            } else {
                alert(result.message || 'Error al crear categoría');
            }
        } catch (error) {
            console.error('Error creando categoría:', error);
            alert('Error al crear categoría');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetProductForm = () => {
        // Limpiar URLs de preview si existen
        productForm.imagenes?.forEach(imageUrl => {
            if (imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrl);
            }
        });
        
        setProductForm({
            titulo: '',
            descripcion: '',
            precioMinorista: 0,
            precioMayorista: undefined,
            stock: 0,
            imagenes: [],
            categoria: '',
            precioOferta: undefined,
            dimensiones: {
                alto: undefined,
                ancho: undefined,
                profundidad: undefined,
                peso: undefined
            }
        });
        setEditingProduct(null);
        setSelectedImageFiles([]);
    };

    const handleEditProduct = (product: AdminProduct) => {
        // Limpiar cualquier archivo seleccionado previamente
        setSelectedImageFiles([]);
        
        setEditingProduct(product);
        setProductForm({
            titulo: product.titulo,
            descripcion: product.descripcion || '',
            precioMinorista: product.precioMinorista,
            precioMayorista: product.precioMayorista,
            stock: product.stock,
            imagenes: product.imagenes || [],
            categoria: product.categoria,
            precioOferta: product.precioOferta,
            dimensiones: product.dimensiones || {
                alto: undefined,
                ancho: undefined,
                profundidad: undefined,
                peso: undefined
            }
        });
        setShowProductForm(true);
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct || !productForm.titulo || !productForm.categoria) {
            alert('Título y categoría son obligatorios');
            return;
        }

        setIsSubmitting(true);
        try {
            let finalProductForm = { ...productForm };

            // Si hay nuevas imágenes seleccionadas, subirlas a Cloudinary
            if (selectedImageFiles.length > 0) {
                setUploadingImage(true);
                try {
                    const uploadedUrls: string[] = [];
                    
                    // Subir cada nueva imagen
                    for (const file of selectedImageFiles) {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('folder', 'productos');
                        
                        const uploadResult = await uploadImageAction(formData);
                        if (uploadResult.success && uploadResult.url) {
                            uploadedUrls.push(uploadResult.url);
                        } else {
                            alert(`Error al subir ${file.name}: ${uploadResult.message}`);
                            return;
                        }
                    }
                    
                    // Combinar imágenes existentes con las nuevas
                    const existingImages = productForm.imagenes?.filter(url => !url.startsWith('blob:')) || [];
                    finalProductForm.imagenes = [...existingImages, ...uploadedUrls];
                    
                    // Limpiar las URLs de preview locales
                    productForm.imagenes?.forEach(imageUrl => {
                        if (imageUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(imageUrl);
                        }
                    });
                } catch (error) {
                    console.error('Error subiendo imágenes:', error);
                    alert('Error al subir imágenes');
                    return;
                } finally {
                    setUploadingImage(false);
                }
            }

            const result = await updateProductAction(editingProduct._id!, finalProductForm);
            if (result.success) {
                alert('Producto actualizado exitosamente');
                setShowProductForm(false);
                resetProductForm();
                loadData();
            } else {
                alert(result.message || 'Error al actualizar producto');
            }
        } catch (error) {
            console.error('Error actualizando producto:', error);
            alert('Error al actualizar producto');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!window.confirm('⚠️ ¿Estás seguro de que quieres eliminar este producto?\n\n🚨 ATENCIÓN: Esta acción eliminará el producto COMPLETAMENTE de la base de datos y NO se puede deshacer.')) {
            return;
        }

        try {
            const result = await deleteProductAction(productId);
            if (result.success) {
                alert('✅ Producto eliminado exitosamente');
                loadData(); // Recargar la lista para reflejar los cambios
            } else {
                alert('❌ ' + (result.message || 'Error al eliminar producto'));
                console.error('Error al eliminar producto:', result);
            }
        } catch (error) {
            console.error('Error eliminando producto:', error);
            alert('❌ Error al eliminar producto. Revisa la consola para más detalles.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-barfer-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-barfer-green mx-auto mb-4"></div>
                    <p className="text-gray-600 font-nunito">Cargando productos...</p>
                </div>
            </div>
        );
    }

    // Verificar permisos de administrador
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-barfer-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-6">
                        <svg className="w-24 h-24 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 font-poppins mb-4">
                        Acceso Denegado
                    </h1>
                    <p className="text-gray-600 font-nunito mb-6">
                        No tienes permisos para acceder a la gestión de productos.
                    </p>
                    <a
                        href="/admin"
                        className="bg-barfer-orange hover:bg-orange-600 text-barfer-white px-6 py-3 rounded-2xl font-semibold transition-colors shadow-md hover:shadow-lg transform hover:scale-105 font-nunito"
                    >
                        Volver al Panel
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-barfer-white to-orange-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 font-poppins mb-2">
                        Gestión de Productos
                    </h1>
                    <p className="text-gray-600 font-nunito">
                        Administra el catálogo de productos de la tienda
                    </p>
                </div>

                {/* Botones de acción */}
                <div className="mb-6 flex gap-4 flex-wrap">
                    <button
                        onClick={() => setShowProductForm(true)}
                        className="bg-barfer-green hover:bg-green-600 text-barfer-white px-6 py-3 rounded-2xl font-semibold transition-colors shadow-md hover:shadow-lg transform hover:scale-105 font-nunito"
                    >
                        + Agregar Producto
                    </button>
                    <button
                        onClick={() => setShowCategoryForm(true)}
                        className="bg-barfer-orange hover:bg-orange-600 text-barfer-white px-6 py-3 rounded-2xl font-semibold transition-colors shadow-md hover:shadow-lg transform hover:scale-105 font-nunito"
                    >
                        + Nueva Categoría
                    </button>
                </div>

                {/* Lista de productos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product._id} className="bg-barfer-white rounded-2xl shadow-lg border-2 border-barfer-green p-4 hover:shadow-xl transition-all transform hover:scale-105">
                            {product.imagenes && product.imagenes.length > 0 ? (
                                <img
                                    src={product.imagenes[0]}
                                    alt={product.titulo}
                                    className="w-full h-48 object-cover rounded-xl mb-4"
                                    loading="lazy"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                        console.warn('⚠️ Error cargando imagen:', product.imagenes?.[0]);
                                        
                                        // Intentar una sola recarga con cache-busting
                                        if (!e.currentTarget.dataset.retried) {
                                            console.log('🔄 Reintentando carga de imagen...');
                                            e.currentTarget.dataset.retried = 'true';
                                            const imgElement = e.currentTarget as HTMLImageElement;
                                            setTimeout(() => {
                                                if (imgElement && imgElement.parentNode) {
                                                    imgElement.src = (product.imagenes?.[0] || '') + '?t=' + Date.now();
                                                }
                                            }, 500);
                                            return;
                                        }
                                        
                                        // Si falló el retry, mostrar placeholder simple
                                        console.error('❌ No se pudo cargar la imagen:', product.imagenes?.[0]);
                                        
                                        const placeholder = document.createElement('div');
                                        placeholder.className = 'w-full h-48 bg-gray-100 border-2 border-gray-200 rounded-xl mb-4 flex items-center justify-center';
                                        placeholder.innerHTML = `
                                            <div class="text-center p-4">
                                                <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p class="text-xs text-gray-600 font-medium">Imagen no disponible</p>
                                                <button class="mt-2 px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors" onclick="location.reload()">
                                                    Recargar
                                                </button>
                                            </div>
                                        `;
                                        
                                        const originalImg = e.currentTarget as HTMLImageElement;
                                        if (originalImg.parentNode) {
                                            originalImg.parentNode.replaceChild(placeholder, originalImg);
                                        }
                                    }}
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <h3 className="font-bold text-lg mb-2 font-poppins">{product.titulo}</h3>
                            {product.descripcion && (
                                <p className="text-gray-600 text-sm mb-3 font-nunito">{product.descripcion}</p>
                            )}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Precio Minorista:</span>
                                    <span className="font-semibold text-barfer-green">${product.precioMinorista}</span>
                                </div>
                                {product.precioMayorista && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Precio Mayorista:</span>
                                        <span className="font-semibold text-blue-600">${product.precioMayorista}</span>
                                    </div>
                                )}
                                {product.precioOferta && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Oferta:</span>
                                        <span className="font-semibold text-red-500">${product.precioOferta}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Stock:</span>
                                    <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {product.stock}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button 
                                    onClick={() => handleEditProduct(product)}
                                    className="flex-1 bg-barfer-green hover:bg-green-600 text-white py-2 rounded-xl text-sm font-medium transition-colors font-nunito"
                                >
                                    Editar
                                </button>
                                <button 
                                    onClick={() => handleDeleteProduct(product._id!)}
                                    className="flex-1 bg-barfer-orange hover:bg-orange-600 text-white py-2 rounded-xl text-sm font-medium transition-colors font-nunito"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal Formulario de Producto */}
                {showProductForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-barfer-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold font-poppins">
                                        {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowProductForm(false);
                                            resetProductForm();
                                        }}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={editingProduct ? handleUpdateProduct : handleProductSubmit} className="space-y-4">
                                    {/* Título */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Título *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={productForm.titulo}
                                            onChange={(e) => setProductForm(prev => ({ ...prev, titulo: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                            placeholder="Nombre del producto"
                                        />
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={productForm.descripcion}
                                            onChange={(e) => setProductForm(prev => ({ ...prev, descripcion: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                            placeholder="Descripción del producto"
                                        />
                                    </div>

                                    {/* Precios */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Precio Minorista *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={productForm.precioMinorista}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, precioMinorista: parseFloat(e.target.value) || 0 }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Precio Mayorista (opcional)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={productForm.precioMayorista || ''}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, precioMayorista: e.target.value ? parseFloat(e.target.value) : undefined }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                                placeholder="Precio para mayoristas (opcional)"
                                            />
                                        </div>
                                    </div>

                                    {/* Precio de Oferta */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Precio de Oferta (opcional)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={productForm.precioOferta || ''}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, precioOferta: e.target.value ? parseFloat(e.target.value) : undefined }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-orange focus:border-barfer-orange"
                                                placeholder="Precio con descuento (opcional)"
                                            />
                                        </div>
                                    </div>

                                    {/* Stock y Categoría */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Stock *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                value={productForm.stock}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Categoría *
                                            </label>
                                            <select
                                                required
                                                value={productForm.categoria}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, categoria: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                            >
                                                <option value="">Seleccionar categoría</option>
                                                {categories.map((category) => (
                                                    <option key={category._id} value={category._id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Imágenes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Imágenes (puedes seleccionar múltiples)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                        />
                                        {uploadingImage && (
                                            <p className="text-sm text-blue-600 mt-2">Subiendo imágenes...</p>
                                        )}
                                        {selectedImageFiles.length > 0 && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                📁 {selectedImageFiles.length} imagen{selectedImageFiles.length !== 1 ? 'es' : ''} seleccionada{selectedImageFiles.length !== 1 ? 's' : ''}
                                                <br />
                                                <span className="text-xs text-gray-500">
                                                    Se subirán cuando {editingProduct ? 'actualices' : 'crees'} el producto
                                                </span>
                                            </p>
                                        )}
                                        
                                        {/* Preview de imágenes */}
                                        {productForm.imagenes && productForm.imagenes.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Imágenes:</p>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {productForm.imagenes.map((imageUrl, index) => (
                                                        <div key={index} className="relative group">
                                                            <img
                                                                src={imageUrl}
                                                                alt={`Preview ${index + 1}`}
                                                                className="w-full h-24 object-cover rounded-lg border"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Dimensiones */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-4">
                                            Dimensiones del Paquete
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={productForm.dimensiones?.profundidad || ''}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        dimensiones: {
                                                            ...prev.dimensiones,
                                                            profundidad: parseFloat(e.target.value) || undefined
                                                        }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green text-sm"
                                                />
                                                <label className="block text-xs text-gray-500 mt-1 text-center">Largo (cm)</label>
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={productForm.dimensiones?.ancho || ''}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        dimensiones: {
                                                            ...prev.dimensiones,
                                                            ancho: parseFloat(e.target.value) || undefined
                                                        }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green text-sm"
                                                />
                                                <label className="block text-xs text-gray-500 mt-1 text-center">Ancho (cm)</label>
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={productForm.dimensiones?.alto || ''}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        dimensiones: {
                                                            ...prev.dimensiones,
                                                            alto: parseFloat(e.target.value) || undefined
                                                        }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green text-sm"
                                                />
                                                <label className="block text-xs text-gray-500 mt-1 text-center">Alto (cm)</label>
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={productForm.dimensiones?.peso || ''}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        dimensiones: {
                                                            ...prev.dimensiones,
                                                            peso: parseFloat(e.target.value) || undefined
                                                        }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green text-sm"
                                                />
                                                <label className="block text-xs text-gray-500 mt-1 text-center">Peso (kg)</label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowProductForm(false);
                                                resetProductForm();
                                            }}
                                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl font-semibold transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || uploadingImage}
                                            className="flex-1 bg-barfer-green hover:bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-2xl font-semibold transition-colors"
                                        >
                                            {isSubmitting 
                                                ? (editingProduct ? 'Actualizando...' : 'Creando...') 
                                                : (editingProduct ? 'Actualizar Producto' : 'Crear Producto')
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Formulario de Categoría */}
                {showCategoryForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-barfer-white rounded-2xl shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold font-poppins">Nueva Categoría</h2>
                                    <button
                                        onClick={() => setShowCategoryForm(false)}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={handleCategorySubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={categoryForm.name}
                                            onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                            placeholder="Nombre de la categoría"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={categoryForm.description}
                                            onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                            placeholder="Descripción de la categoría"
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowCategoryForm(false)}
                                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl font-semibold transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 bg-barfer-orange hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 rounded-2xl font-semibold transition-colors"
                                        >
                                            {isSubmitting ? 'Creando...' : 'Crear Categoría'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
