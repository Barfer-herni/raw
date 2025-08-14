import { Sidebar } from '@/components/sidebar';
import { env } from '@/env';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { cn } from '@repo/design-system/lib/utils';
import { JsonLd } from '@repo/seo/json-ld';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Balancer from 'react-wrap-balancer';

const protocol = env.VERCEL_PROJECT_PRODUCTION_URL?.startsWith('https')
  ? 'https'
  : 'http';
const url = new URL(`${protocol}://${env.VERCEL_PROJECT_PRODUCTION_URL}`);

type BlogPostProperties = {
  params: Promise<{ slug: string; locale: string }>;
};

// Dummy components temporales
const DummyBody = () => (
  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
    <p className="text-gray-500">Contenido del blog - Pendiente de implementación</p>
  </div>
);

const DummyTableOfContents = () => (
  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
    <p className="text-gray-500">Tabla de contenidos - Pendiente de implementación</p>
  </div>
);

const DummyCodeBlock = () => (
  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
    <p className="text-gray-500">Bloque de código - Pendiente de implementación</p>
  </div>
);

const BlogPost = async ({ params }: BlogPostProperties) => {
  const { slug } = await params;

  // Datos dummy para demostración
  const dummyPage = {
    _title: "Título del Post",
    description: "Descripción del post pendiente de implementación",
    date: new Date().toISOString(),
    readingTime: "5",
  };

  return (
    <>
      <JsonLd
        code={{
          '@type': 'BlogPosting',
          '@context': 'https://schema.org',
          datePublished: dummyPage.date,
          description: dummyPage.description,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': new URL(`/blog/${slug}`, url).toString(),
          },
          headline: dummyPage._title,
          dateModified: dummyPage.date,
          isAccessibleForFree: true,
        }}
      />
      <div className="container py-16">
        <Link
          className="mb-4 inline-flex items-center gap-1 text-muted-foreground text-sm focus:underline focus:outline-none"
          href="/blog"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Blog
        </Link>
        <div className="mt-16 flex flex-col items-start gap-8 sm:flex-row">
          <div className="sm:flex-1">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h1 className="scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl">
                <Balancer>{dummyPage._title}</Balancer>
              </h1>
              <p className="leading-7 [&:not(:first-child)]:mt-6">
                <Balancer>{dummyPage.description}</Balancer>
              </p>
              <div className="my-16 h-64 w-full rounded-xl bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Imagen del post - Pendiente de implementación</p>
              </div>
              <div className="mx-auto max-w-prose">
                <DummyBody />
                <DummyCodeBlock />
              </div>
            </div>
          </div>
          <div className="sticky top-24 hidden shrink-0 md:block">
            <Sidebar
              toc={<DummyTableOfContents />}
              readingTime={`${dummyPage.readingTime} min read`}
              date={new Date(dummyPage.date)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;
