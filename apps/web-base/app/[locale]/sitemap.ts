import { env } from '@/env';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_WEB_URL;

  // Rutas estáticas
  const routes = [
    '',
    '/blog',
    '/legal/privacy',
    '/legal/terms',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  // Posts dummy para el blog
  const blogPosts = [
    { _slug: 'post-1' },
    { _slug: 'post-2' }
  ].map((post) => ({
    url: `${baseUrl}/blog/${post._slug}`,
    lastModified: new Date().toISOString(),
  }));

  return [...routes, ...blogPosts];
}
