import { keys as analytics } from '@repo/analytics/keys';
import { keys as auth } from '@repo/auth/keys';
import { keys as collaboration } from '@repo/collaboration/keys';
import { keys as database } from '@repo/database/keys';
import { keys as email } from '@repo/email/keys';
import { keys as flags } from '@repo/feature-flags/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as notifications } from '@repo/notifications/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as security } from '@repo/security/keys';
import { keys as webhooks } from '@repo/webhooks/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  extends: [
    auth(),
    analytics(),
    collaboration(),
    core(),
    database(),
    email(),
    flags(),
    notifications(),
    observability(),
    security(),
    webhooks(),
  ],
  server: {},
  client: {
    // Variables de EmailJS (lado del cliente)
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
  },
});
