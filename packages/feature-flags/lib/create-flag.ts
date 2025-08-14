import { analytics } from '@repo/analytics/posthog/server';
import { flag } from 'flags/next';
import { getCurrentUser } from '@repo/auth/server';
export const createFlag = (key: string) =>
  flag({
    key,
    defaultValue: false,
    async decide() {
      const user = await getCurrentUser();

      if (!user) {
        return this.defaultValue as boolean;
      }

      const isEnabled = await analytics.isFeatureEnabled(key, user.id);

      return isEnabled ?? (this.defaultValue as boolean);
    },
  });
