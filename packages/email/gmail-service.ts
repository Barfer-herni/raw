import nodemailer from 'nodemailer';

interface EmailConfig {
  gmail_user: string;
  gmail_password: string; // App Password de Gmail
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

class GmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!this.config.gmail_user || !this.config.gmail_password) {
      console.warn('Gmail credentials not provided. Email functionality disabled.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.config.gmail_user,
          pass: this.config.gmail_password, // App Password
        },
      });

      console.log('✅ Gmail service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gmail service:', error);
    }
  }

  async sendEmail({ to, subject, html, replyTo }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'Gmail service not initialized. Check your credentials.',
      };
    }

    try {
      const mailOptions = {
        from: `"Tu Sitio Web" <${this.config.gmail_user}>`,
        to,
        subject,
        html,
        replyTo,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', result.messageId);

      return { success: true };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Template simple para el formulario de contacto
  generateContactEmailHTML(name: string, email: string, message: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nuevo mensaje de contacto</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f4f4f4; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { background: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; }
            .message { background: #f9f9f9; padding: 15px; border-left: 4px solid #007cba; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📧 Nuevo mensaje desde tu sitio web</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Nombre:</div>
                <div>${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div>${email}</div>
              </div>
              <div class="field">
                <div class="label">Mensaje:</div>
                <div class="message">${message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

// Configuración desde variables de entorno
const gmailConfig: EmailConfig = {
  gmail_user: process.env.GMAIL_USER || '',
  gmail_password: process.env.GMAIL_APP_PASSWORD || '',
};

// Instancia singleton
export const gmailService = new GmailService(gmailConfig);

export default GmailService;
