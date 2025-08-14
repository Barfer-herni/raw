import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { locales } from '.';
import languine from './languine.json';

type RequestLike = {
  headers: { entries: () => Iterable<[string, string]> };
  nextUrl: URL;
};

const getLocale = (request: RequestLike) => {
  try {
    // Intenta obtener los headers y lenguajes
    const headers = Object.fromEntries(request.headers.entries());
    const languages = new Negotiator({ headers }).languages();

    // Si no hay lenguajes o están mal formateados, devolver el idioma por defecto
    if (!languages || languages.length === 0) {
      return languine.locale.source;
    }

    // Intenta hacer match
    return match(languages, languine.locale.targets, languine.locale.source);
  } catch (error) {
    // Si hay cualquier error, devolver el idioma por defecto
    console.error('Error detecting locale:', error);
    return languine.locale.source;
  }
};

export const internationalizationMiddleware = (request: RequestLike) => {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return;
  }

  // Obtener el locale (con manejo de errores)
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(request.nextUrl);
};

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
};
