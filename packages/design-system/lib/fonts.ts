import { cn } from '@repo/design-system/lib/utils';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

// Fuentes base (Geist)
export const fonts = cn(
  GeistSans.variable,
  GeistMono.variable,
  'touch-manipulation font-sans antialiased'
);

// Las fuentes de Google se configuran en cada aplicación individual
// que necesite Next.js para evitar problemas de dependencias
