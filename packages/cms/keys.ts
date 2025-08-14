import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      // No BASEHUB_TOKEN required anymore
    },
    runtimeEnv: {
      // No BASEHUB_TOKEN required anymore
    },
  });
