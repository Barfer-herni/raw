import '@repo/design-system/styles/globals.css';
import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '../../lib/fonts';
import { Toolbar } from '@repo/feature-flags/components/toolbar';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = createMetadata({
  title: 'Barfer',
  description: 'Los mejores snacks para tu peludo',
});

type RootLayoutProperties = {
  readonly children: ReactNode;
  readonly params: Promise<{
    locale: string;
  }>;
};

const RootLayout = async ({ children, params }: RootLayoutProperties) => {
  const { locale } = await params;

  return (
    <html lang={locale} className={fonts} suppressHydrationWarning>
      <body>
        <DesignSystemProvider>{children}</DesignSystemProvider>
        <Toolbar />
      </body>
    </html>
  );
};

export default RootLayout;
