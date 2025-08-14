import { cn } from '@repo/design-system/lib/utils';
import { getDictionary } from '@repo/internationalization';
import type { Blog, WithContext } from '@repo/seo/json-ld';
import { JsonLd } from '@repo/seo/json-ld';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';

type BlogProps = {
  params: Promise<{
    locale: string;
  }>;
};

const DummyBlogPosts = () => {
  const posts = [
    {
      _slug: 'post-1',
      _title: 'Post 1',
      description: 'Descripción del post 1 - Pendiente de implementación',
      date: new Date().toISOString(),
    },
    {
      _slug: 'post-2',
      _title: 'Post 2',
      description: 'Descripción del post 2 - Pendiente de implementación',
      date: new Date().toISOString(),
    }
  ];

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {posts.map((post) => (
        <article key={post._slug} className="group relative">
          <div className="h-64 w-full rounded-xl bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">Imagen del post - Pendiente de implementación</p>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-semibold tracking-tight">
              <Link href={`/blog/${post._slug}`} className="hover:underline">
                {post._title}
              </Link>
            </h2>
            <p className="mt-2 text-muted-foreground">{post.description}</p>
            <time className="mt-4 block text-sm text-muted-foreground">
              {new Date(post.date).toLocaleDateString()}
            </time>
          </div>
        </article>
      ))}
    </div>
  );
};

const Blog = async ({ params }: BlogProps) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <>
      <JsonLd
        code={{
          '@type': 'Blog',
          '@context': 'https://schema.org',
          description: 'Blog - Pendiente de implementación',
          name: 'Blog',
        }}
      />
      <div className="container py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {dictionary.web.blog.meta.title}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {dictionary.web.blog.meta.description}
          </p>
          <div className="mt-16">
            <DummyBlogPosts />
          </div>
        </div>
      </div>
    </>
  );
};

export const generateMetadata = async ({
  params,
}: BlogProps): Promise<Metadata> => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return createMetadata(dictionary.web.blog.meta);
};

export default Blog;
