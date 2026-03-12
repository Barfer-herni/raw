'use server'

import { v2 as cloudinary } from 'cloudinary';

// Servicio para manejar subida de imágenes a Cloudinary usando signed uploads
// Nota: Este servicio requiere CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export interface CloudinaryUploadResult {
    success: boolean;
    url?: string;
    publicId?: string;
    message?: string;
    error?: string;
}

/**
 * Subir imagen a Cloudinary usando signed uploads
 * @param file - Archivo de imagen
 * @param folder - Carpeta en Cloudinary (opcional)
 */
export async function uploadImageToCloudinary(
    file: File,
    folder: string = 'productos'
): Promise<CloudinaryUploadResult> {
    try {
        // Verificar configuración
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
            !process.env.CLOUDINARY_API_KEY || 
            !process.env.CLOUDINARY_API_SECRET) {
            return {
                success: false,
                message: 'Configuración de Cloudinary incompleta',
                error: 'CLOUDINARY_CONFIG_MISSING'
            };
        }

        // Convertir File a Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Subir usando Cloudinary SDK con signed upload
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'auto',
                    transformation: [
                        { quality: 'auto' },
                        { fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            ).end(buffer);
        });

        const result = uploadResult as any;

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id
        };

    } catch (error) {
        console.error('Error al subir imagen a Cloudinary:', error);
        return {
            success: false,
            message: 'Error interno del servidor al subir imagen',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Eliminar imagen de Cloudinary usando signed API
 * @param publicId - ID público de la imagen en Cloudinary
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<CloudinaryUploadResult> {
    try {
        // Verificar configuración
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
            !process.env.CLOUDINARY_API_KEY || 
            !process.env.CLOUDINARY_API_SECRET) {
            return {
                success: false,
                message: 'Configuración de Cloudinary incompleta para eliminación',
                error: 'CLOUDINARY_CONFIG_MISSING'
            };
        }

        // Eliminar usando Cloudinary SDK
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            return {
                success: true,
                message: 'Imagen eliminada exitosamente'
            };
        } else {
            return {
                success: false,
                message: 'No se pudo eliminar la imagen',
                error: 'CLOUDINARY_DELETE_FAILED'
            };
        }

    } catch (error) {
        console.error('Error al eliminar imagen de Cloudinary:', error);
        return {
            success: false,
            message: 'Error interno del servidor al eliminar imagen',
            error: 'SERVER_ERROR'
        };
    }
}

// Las funciones de utilidad se han movido a utils/cloudinaryUtils.ts
// para evitar conflictos con Server Actions
