'use server';

import { env } from '@/env';
import resend from '@repo/email';
import { ContactTemplate } from '@repo/email/templates/contact';
import { parseError } from '@repo/observability/error';
import { createRateLimiter, slidingWindow } from '@repo/rate-limit';
import { headers } from 'next/headers';

export const contact = async (
  name: string,
  email: string,
  message: string
): Promise<{
  error?: string;
}> => {
  try {
    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      const rateLimiter = createRateLimiter({
        limiter: slidingWindow(1, '1d'),
      });

      const head = await headers();
      const ip = head.get('x-forwarded-for');

      const { success } = await rateLimiter.limit(`contact_form_${ip}`);

      if (!success) {
        throw new Error(
          'You have reached your request limit. Please try again later.'
        );
      }
    }

    if (!resend) {
      throw new Error('Resend is not configured');
    }

    if (!env.RESEND_FROM) {
      throw new Error('RESEND_FROM is not set');
    }

    await resend.emails.send({
      from: env.RESEND_FROM,
      to: 'your-email@example.com',
      subject: 'Contact form submission',
      replyTo: email,
      react: <ContactTemplate name={name} email={email} message={message} />,
    });

    return {};
  } catch (error) {
    const errorMessage = parseError(error);

    return { error: errorMessage };
  }
};

export async function contactForm(
  _: any,
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;
  const honeypot = formData.get('honeypot') as string;

  if (honeypot) {
    return { error: 'Spam detected', success: false };
  }

  if (!name || !email || !message) {
    return { error: 'Please fill out all fields.', success: false };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Please enter a valid email.', success: false };
  }

  try {
    // const resend = new Resend(env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'LupaPyme Contact <onboarding@resend.dev>',
    //   to: env.ADMIN_EMAIL,
    //   subject: `New message from ${name}`,
    //   reply_to: email,
    //   html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`,
    // });

    return { error: null, success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { error: 'Something went wrong. Please try again.', success: false };
  }
}
