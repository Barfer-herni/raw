import { AnalyticsProvider } from '@repo/analytics';
import { AuthProvider } from '@repo/auth/provider';
import type { ThemeProviderProps } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { Toaster as RadixToaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';

type DesignSystemProviderProperties = ThemeProviderProps;

export const DesignSystemProvider = ({
  children,
  ...properties
}: DesignSystemProviderProperties) => (
  <ThemeProvider {...properties}>
    {/* <AuthProvider> */}
    {/* <AnalyticsProvider> */}
    <TooltipProvider>{children}</TooltipProvider>
    <Toaster />
    <RadixToaster />
    {/* </AnalyticsProvider> */}
    {/* </AuthProvider> */}
  </ThemeProvider>
);
