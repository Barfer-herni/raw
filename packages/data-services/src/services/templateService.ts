'use server';

import { revalidatePath } from 'next/cache';
import { database } from '@repo/database';
import type {
    EmailTemplateData,
    WhatsAppTemplateData,
    CreateEmailTemplateData,
    CreateWhatsAppTemplateData,
    UpdateEmailTemplateData,
    UpdateWhatsAppTemplateData
} from '../types/template';

// ==========================================
// EMAIL TEMPLATES
// ==========================================

/**
 * Obtener todos los templates de email del usuario
 */
export async function getEmailTemplates(userId: string): Promise<EmailTemplateData[]> {
    try {
        const templates = await database.emailTemplate.findMany({
            where: {
                OR: [
                    { createdBy: userId },
                    { isDefault: true }
                ]
            },
            orderBy: [
                { isDefault: 'desc' }, // Templates por defecto primero
                { createdAt: 'desc' }
            ]
        });

        return templates as EmailTemplateData[];
    } catch (error) {
        console.error('Error al obtener templates de email:', error);
        throw new Error('No se pudieron obtener los templates de email');
    }
}

/**
 * Crear un nuevo template de email
 */
export async function createEmailTemplate(
    userId: string,
    data: CreateEmailTemplateData
): Promise<EmailTemplateData> {
    try {
        const template = await database.emailTemplate.create({
            data: {
                ...data,
                createdBy: userId,
                isDefault: data.isDefault || false
            }
        });

        revalidatePath('/admin/clients/email');
        return template as EmailTemplateData;
    } catch (error) {
        console.error('Error al crear template de email:', error);
        throw new Error('No se pudo crear el template de email');
    }
}

/**
 * Actualizar un template de email
 */
export async function updateEmailTemplate(
    templateId: string,
    userId: string,
    data: UpdateEmailTemplateData
): Promise<EmailTemplateData> {
    try {
        // Verificar que el usuario pueda editar este template
        const existingTemplate = await database.emailTemplate.findFirst({
            where: {
                id: templateId,
                createdBy: userId // Solo puede editar sus propios templates
            }
        });

        if (!existingTemplate) {
            throw new Error('Template no encontrado o sin permisos para editarlo');
        }

        const template = await database.emailTemplate.update({
            where: { id: templateId },
            data
        });

        revalidatePath('/admin/clients/email');
        return template as EmailTemplateData;
    } catch (error) {
        console.error('Error al actualizar template de email:', error);
        throw new Error('No se pudo actualizar el template de email');
    }
}

/**
 * Eliminar un template de email
 */
export async function deleteEmailTemplate(templateId: string, userId: string): Promise<void> {
    try {
        // Verificar que el template existe
        const existingTemplate = await database.emailTemplate.findFirst({
            where: {
                id: templateId
            }
        });

        if (!existingTemplate) {
            throw new Error('Template no encontrado');
        }

        await database.emailTemplate.delete({
            where: { id: templateId }
        });

        revalidatePath('/admin/clients/email');
    } catch (error) {
        console.error('Error al eliminar template de email:', error);
        throw new Error('No se pudo eliminar el template de email');
    }
}

// ==========================================
// WHATSAPP TEMPLATES
// ==========================================

/**
 * Obtener todos los templates de WhatsApp del usuario
 */
export async function getWhatsAppTemplates(userId: string): Promise<WhatsAppTemplateData[]> {
    try {
        const templates = await database.whatsAppTemplate.findMany({
            where: {
                OR: [
                    { createdBy: userId },
                    { isDefault: true }
                ]
            },
            orderBy: [
                { isDefault: 'desc' }, // Templates por defecto primero
                { createdAt: 'desc' }
            ]
        });

        return templates as WhatsAppTemplateData[];
    } catch (error) {
        console.error('Error al obtener templates de WhatsApp:', error);
        throw new Error('No se pudieron obtener los templates de WhatsApp');
    }
}

/**
 * Crear un nuevo template de WhatsApp
 */
export async function createWhatsAppTemplate(
    userId: string,
    data: CreateWhatsAppTemplateData
): Promise<WhatsAppTemplateData> {
    try {
        const template = await database.whatsAppTemplate.create({
            data: {
                ...data,
                createdBy: userId,
                isDefault: data.isDefault || false
            }
        });

        revalidatePath('/admin/clients/whatsapp');
        return template as WhatsAppTemplateData;
    } catch (error) {
        console.error('Error al crear template de WhatsApp:', error);
        throw new Error('No se pudo crear el template de WhatsApp');
    }
}

/**
 * Actualizar un template de WhatsApp
 */
export async function updateWhatsAppTemplate(
    templateId: string,
    userId: string,
    data: UpdateWhatsAppTemplateData
): Promise<WhatsAppTemplateData> {
    try {
        // Verificar que el usuario pueda editar este template
        const existingTemplate = await database.whatsAppTemplate.findFirst({
            where: {
                id: templateId,
                createdBy: userId // Solo puede editar sus propios templates
            }
        });

        if (!existingTemplate) {
            throw new Error('Template no encontrado o sin permisos para editarlo');
        }

        const template = await database.whatsAppTemplate.update({
            where: { id: templateId },
            data
        });

        revalidatePath('/admin/clients/whatsapp');
        return template as WhatsAppTemplateData;
    } catch (error) {
        console.error('Error al actualizar template de WhatsApp:', error);
        throw new Error('No se pudo actualizar el template de WhatsApp');
    }
}

/**
 * Eliminar un template de WhatsApp
 */
export async function deleteWhatsAppTemplate(templateId: string, userId: string): Promise<void> {
    try {
        // Verificar que el template existe
        const existingTemplate = await database.whatsAppTemplate.findFirst({
            where: {
                id: templateId
            }
        });

        if (!existingTemplate) {
            throw new Error('Template no encontrado');
        }

        await database.whatsAppTemplate.delete({
            where: { id: templateId }
        });

        revalidatePath('/admin/clients/whatsapp');
    } catch (error) {
        console.error('Error al eliminar template de WhatsApp:', error);
        throw new Error('No se pudo eliminar el template de WhatsApp');
    }
} 