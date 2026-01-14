import Link from 'next/link';
import type { ReactNode } from 'react';
import Image from 'next/image';
import logo from '@/public/barfer.png';
import { getDictionary } from '@repo/internationalization';

type AuthLayoutProps = {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
};

const AuthLayout = async ({ children, params }: AuthLayoutProps) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const title = dictionary.app.auth.layout.title;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-4">
      {/* Background Gradient & Pattern */}
      <div className="absolute w-full h-full left-0 top-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-black z-0 pointer-events-none" />

      {/* Decorative circles - Positioned to frame the center content */}
      <div className="absolute -left-20 -top-20 w-96 h-96 bg-barfer-green/10 rounded-full filter blur-3xl opacity-30 animate-pulse-slow pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-barfer-orange/10 rounded-full filter blur-3xl opacity-25 animate-pulse-slow pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-barfer-green/5 rounded-full filter blur-[100px] opacity-20 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
            <Image src={logo} alt="Raw and Fun" width={48} height={48} className="drop-shadow-lg" />
            <span className="font-bold text-3xl text-gray-900 dark:text-white tracking-tight">Raw and Fun</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-2xl p-8 sm:p-10 ring-1 ring-black/5 dark:ring-white/10">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>

          {children}
        </div>

        {/* Footer links or copyright could go here */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Raw and Fun. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
