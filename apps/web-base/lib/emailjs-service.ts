import emailjs from '@emailjs/browser';

interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

interface ContactFormData {
  from_name: string;
  from_email: string;
  message: string;
  to_email?: string;
}

class EmailJSService {
  private config: EmailJSConfig;
  private isInitialized = false;

  constructor(config: EmailJSConfig) {
    this.config = config;
    this.init();
  }

  private init() {
    if (!this.config.serviceId || !this.config.templateId || !this.config.publicKey) {
      console.warn('EmailJS not configured. Please check your environment variables.');
      return;
    }

    try {
      emailjs.init(this.config.publicKey);
      this.isInitialized = true;
      console.log('✅ EmailJS initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize EmailJS:', error);
    }
  }

  async sendContactEmail(formData: ContactFormData): Promise<{ success: boolean; error?: string }> {
    console.log('🔍 DEBUG: Intentando enviar email...', {
      isInitialized: this.isInitialized,
      config: {
        serviceId: this.config.serviceId || 'NO CONFIGURADO',
        templateId: this.config.templateId || 'NO CONFIGURADO', 
        publicKey: this.config.publicKey ? 'CONFIGURADO' : 'NO CONFIGURADO'
      },
      formData: {
        from_name: formData.from_name,
        from_email: formData.from_email,
        message: formData.message.substring(0, 50) + '...'
      }
    });

    if (!this.isInitialized) {
      console.error('❌ EmailJS no inicializado');
      return {
        success: false,
        error: 'EmailJS no está configurado. Revisa las variables de entorno.',
      };
    }

    try {
      // Template parameters que EmailJS enviará al template
      const templateParams = {
        from_name: formData.from_name,
        from_email: formData.from_email,
        message: formData.message,
        to_email: formData.to_email || 'nicolascaliari28@gmail.com',
        reply_to: formData.from_email,
      };

      console.log('📧 Enviando email via EmailJS con params:', templateParams);
      
      const response = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams
      );

      console.log('✅ Email enviado exitosamente:', response.status, response.text);
      return { success: true };
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al enviar email',
      };
    }
  }
}

// Configuración desde variables de entorno (del lado del cliente)
const emailJSConfig: EmailJSConfig = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_ysko2ec', // Usar tu Service ID por defecto
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '', // Necesitas crear un template
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '', // Necesitas tu Public Key
};

// Log para debug (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  console.log('📧 EmailJS Config:', {
    serviceId: emailJSConfig.serviceId ? `${emailJSConfig.serviceId.slice(0, 10)}...` : 'NOT SET',
    templateId: emailJSConfig.templateId ? `${emailJSConfig.templateId.slice(0, 10)}...` : 'NOT SET',
    publicKey: emailJSConfig.publicKey ? `${emailJSConfig.publicKey.slice(0, 10)}...` : 'NOT SET',
  });
}

// Instancia singleton
export const emailJSService = new EmailJSService(emailJSConfig);

export default EmailJSService;
