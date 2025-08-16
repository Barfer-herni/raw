import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      RESEND_FROM: z.string().min(1).email().optional(),
      RESEND_TOKEN: z.string().min(1).startsWith('re_').optional(),
      // Variables para Gmail (alternativa simple)
      GMAIL_USER: z.string().min(1).email().optional(),
      GMAIL_APP_PASSWORD: z.string().min(1).optional(),
    },
    runtimeEnv: {
      RESEND_FROM: process.env.RESEND_FROM,
      RESEND_TOKEN: process.env.RESEND_TOKEN,
      GMAIL_USER: process.env.GMAIL_USER,
      GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
    },
  });
