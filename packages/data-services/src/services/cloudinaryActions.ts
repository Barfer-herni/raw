'use server'

import { 
    uploadImageToCloudinary as uploadImageService,
    deleteImageFromCloudinary as deleteImageService
} from './cloudinaryService';
import { validateImageFile as validateImageFileService } from '../utils/cloudinaryUtils';

/**
 * Server Action: Subir imagen a Cloudinary
 */
export async function uploadImageAction(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'productos';
        
        console.log(`📤 [Upload] Iniciando subida de imagen: ${file?.name} (${file ? (file.size / 1024 / 1024).toFixed(2) : 0}MB)`);
        
        if (!file) {
            console.error('❌ [Upload] No se proporcionó archivo');
            return {
                success: false,
                message: 'No se proporcionó ningún archivo',
                error: 'NO_FILE_PROVIDED'
            };
        }

        // Validar archivo
        const validation = validateImageFileService(file);
        if (!validation.isValid) {
            console.error('❌ [Upload] Archivo no válido:', validation.message);
            return {
                success: false,
                message: validation.message || 'Archivo no válido',
                error: 'INVALID_FILE'
            };
        }

        console.log('✅ [Upload] Archivo validado correctamente, procediendo a subir...');
        const result = await uploadImageService(file, folder);
        
        if (result.success) {
            console.log('✅ [Upload] Imagen subida exitosamente:', result.url);
        } else {
            console.error('❌ [Upload] Error en el servicio:', result.message);
        }
        
        return result;
    } catch (error) {
        console.error('❌ [Upload] Error en uploadImageAction:', error);
        return {
            success: false,
            message: 'Error interno del servidor al subir imagen',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Server Action: Eliminar imagen de Cloudinary
 */
export async function deleteImageAction(publicId: string) {
    try {
        if (!publicId) {
            return {
                success: false,
                message: 'ID público de la imagen es requerido',
                error: 'PUBLIC_ID_REQUIRED'
            };
        }

        const result = await deleteImageService(publicId);
        return result;
    } catch (error) {
        console.error('Error en deleteImageAction:', error);
        return {
            success: false,
            message: 'Error interno del servidor al eliminar imagen',
            error: 'SERVER_ERROR'
        };
    }
}

// La validación de archivos se exporta desde cloudinaryService.ts
// para evitar duplicación de exports
