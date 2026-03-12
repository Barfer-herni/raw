import {
  type NoseconeOptions,
  defaults,
  withVercelToolbar,
} from '@nosecone/next';
export { createMiddleware as noseconeMiddleware } from '@nosecone/next';

// Nosecone security headers configuration
// https://docs.arcjet.com/nosecone/quick-start
export const noseconeOptions: NoseconeOptions = {
  ...defaults,
  // Content Security Policy (CSP) is disabled by default because the values
  // depend on which Next Forge features are enabled. See
  // https://docs.next-forge.com/features/security/headers for guidance on how
  // to configure it.
  contentSecurityPolicy: false,
  // Disable Cross-Origin-Embedder-Policy to allow loading Cloudinary images
  crossOriginEmbedderPolicy: false,
  // Disable Cross-Origin-Opener-Policy to allow Google popup to communicate with the main window
  // This prevents the "white screen" issue after choosing a Google account
  crossOriginOpenerPolicy: false,
};

export const noseconeOptionsWithToolbar: NoseconeOptions =
  withVercelToolbar(noseconeOptions);
