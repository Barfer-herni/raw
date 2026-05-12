import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      // Secreto principal para firmar el JWT de sesión (HS256).
      // Debe ser >= 32 caracteres en producción. `JWT_SECRET` se mantiene
      // como fallback para no romper despliegues existentes durante la migración.
      SESSION_SECRET: z.string().min(32).optional(),
      JWT_SECRET: z.string().min(1).optional(),
      SESSION_EXPIRY_DAYS: z.string().transform(Number).optional(),
    },
    client: {
      NEXT_PUBLIC_AUTH_SIGN_IN_URL: z.string().min(1).startsWith('/').optional(),
      NEXT_PUBLIC_AUTH_SIGN_UP_URL: z.string().min(1).startsWith('/').optional(),
      NEXT_PUBLIC_AUTH_AFTER_SIGN_IN_URL: z.string().min(1).startsWith('/').optional(),
      NEXT_PUBLIC_AUTH_AFTER_SIGN_UP_URL: z.string().min(1).startsWith('/').optional(),
    },
    runtimeEnv: {
      SESSION_SECRET: process.env.SESSION_SECRET,
      JWT_SECRET: process.env.JWT_SECRET,
      SESSION_EXPIRY_DAYS: process.env.SESSION_EXPIRY_DAYS,
      NEXT_PUBLIC_AUTH_SIGN_IN_URL: process.env.NEXT_PUBLIC_AUTH_SIGN_IN_URL,
      NEXT_PUBLIC_AUTH_SIGN_UP_URL: process.env.NEXT_PUBLIC_AUTH_SIGN_UP_URL,
      NEXT_PUBLIC_AUTH_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_AUTH_AFTER_SIGN_IN_URL,
      NEXT_PUBLIC_AUTH_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_AUTH_AFTER_SIGN_UP_URL,
    },
  });
