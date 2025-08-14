/**
 * Utilidades de Cloudinary que pueden ejecutarse en cliente o servidor
 */

/**
 * Generar URL de Cloudinary con transformaciones
 * @param publicId - ID público de la imagen
 * @param transformations - Transformaciones a aplicar
 */
export function generateCloudinaryUrl(
    publicId: string, 
    transformations?: string
): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) {
        return '';
    }

    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload/`;
    const transformationString = transformations ? `${transformations}/` : '';
    
    return `${baseUrl}${transformationString}${publicId}`;
}

/**
 * Validar archivo de imagen
 * @param file - Archivo a validar
 */
export function validateImageFile(file: File): { isValid: boolean; message?: string } {
    // Verificar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            message: 'Tipo de archivo no válido. Solo se permiten JPEG, PNG y WebP.'
        };
    }

    // Verificar tamaño (máximo 8MB)
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (file.size > maxSize) {
        return {
            isValid: false,
            message: 'El archivo es demasiado grande. Máximo 8MB.'
        };
    }

    return { isValid: true };
}
