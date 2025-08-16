'use server';

import { gmailService } from '@repo/email';
import { parseError } from '@repo/observability/error';
import { createRateLimiter, slidingWindow } from '@repo/rate-limit';
import { headers } from 'next/headers';

export const contactWithGmail = async (
  name: string,
  email: string,
  message: string
): Promise<{
  error?: string;
}> => {
  try {
    // Rate limiting (opcional - comentado para simplificar)
    // if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    //   const rateLimiter = createRateLimiter({
    //     limiter: slidingWindow(1, '1d'),
    //   });

    //   const head = await headers();
    //   const ip = head.get('x-forwarded-for');

    //   const { success } = await rateLimiter.limit(`contact_form_${ip}`);

    //   if (!success) {
    //     throw new Error(
    //       'You have reached your request limit. Please try again later.'
    //     );
    //   }
    // }

    // Validaciones básicas
    if (!name || !email || !message) {
      throw new Error('Todos los campos son requeridos.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Por favor ingresa un email válido.');
    }

    // Generar HTML del email
    const emailHTML = gmailService.generateContactEmailHTML(name, email, message);

    // Enviar email usando Gmail
    const result = await gmailService.sendEmail({
      to: 'nicolascaliari28@gmail.com',
      subject: `Nuevo mensaje desde tu sitio web - ${name}`,
      html: emailHTML,
      replyTo: email,
    });

    if (!result.success) {
      throw new Error(result.error || 'Error al enviar el email');
    }

    console.log('✅ Email de contacto enviado exitosamente via Gmail');
    return {};
  } catch (error) {
    console.error('❌ Error en contacto Gmail:', error);
    const errorMessage = parseError(error);
    return { error: errorMessage };
  }
};

export async function contactFormGmail(
  _: any,
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;
  const honeypot = formData.get('honeypot') as string;

  // Honeypot anti-spam
  if (honeypot) {
    return { error: 'Spam detected', success: false };
  }

  if (!name || !email || !message) {
    return { error: 'Por favor llena todos los campos.', success: false };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Por favor ingresa un email válido.', success: false };
  }

  try {
    const result = await contactWithGmail(name, email, message);
    
    if (result.error) {
      return { error: result.error, success: false };
    }

    return { error: null, success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { error: 'Algo salió mal. Por favor intenta de nuevo.', success: false };
  }
}
