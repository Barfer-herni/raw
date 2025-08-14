import 'server-only';
import { PostHog } from 'posthog-node';
import { keys } from '../keys';

const { NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST } = keys();

// Usar valores predeterminados para entorno de desarrollo/build
const posthogKey = NEXT_PUBLIC_POSTHOG_KEY || 'phc_dummy_key_for_build';
const posthogHost = NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

export const analytics = new PostHog(posthogKey, {
  host: posthogHost,

  // Don't batch events and flush immediately - we're running in a serverless environment
  flushAt: 1,
  flushInterval: 0,
});
