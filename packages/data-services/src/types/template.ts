/**
 * Template de email data returned from the database
 */
export interface EmailTemplateData {
    id: string;
    name: string;
    subject: string;
    content: string;
    description?: string;
    isDefault: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Template de WhatsApp data returned from the database
 */
export interface WhatsAppTemplateData {
    id: string;
    name: string;
    content: string;
    description?: string;
    isDefault: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Datos para crear un template de email
 */
export interface CreateEmailTemplateData {
    name: string;
    subject: string;
    content: string;
    description?: string;
    isDefault?: boolean;
}

/**
 * Datos para crear un template de WhatsApp
 */
export interface CreateWhatsAppTemplateData {
    name: string;
    content: string;
    description?: string;
    isDefault?: boolean;
}

/**
 * Datos para actualizar un template de email
 */
export interface UpdateEmailTemplateData {
    name?: string;
    subject?: string;
    content?: string;
    description?: string;
    isDefault?: boolean;
}

/**
 * Datos para actualizar un template de WhatsApp
 */
export interface UpdateWhatsAppTemplateData {
    name?: string;
    content?: string;
    description?: string;
    isDefault?: boolean;
} 