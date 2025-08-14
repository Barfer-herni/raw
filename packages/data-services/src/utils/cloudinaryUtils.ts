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
 * Comprimir imagen usando Canvas API
 * @param file - Archivo de imagen original
 * @param quality - Calidad de compresión (0.1 - 1.0)
 * @param maxWidth - Ancho máximo en píxeles
 * @param maxHeight - Alto máximo en píxeles
 */
export function compressImage(
    file: File, 
    quality: number = 0.8, 
    maxWidth: number = 1920, 
    maxHeight: number = 1080
): Promise<File> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calcular nuevas dimensiones manteniendo aspect ratio
            let { width, height } = img;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            // Dibujar imagen redimensionada
            ctx?.drawImage(img, 0, 0, width, height);

            // Convertir a blob con compresión
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Error al comprimir la imagen'));
                    }
                },
                file.type,
                quality
            );
        };

        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.src = URL.createObjectURL(file);
    });
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

    // Verificar tamaño (máximo 15MB)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
        return {
            isValid: false,
            message: 'El archivo es demasiado grande. Máximo 15MB.'
        };
    }

    return { isValid: true };
}
