import path from 'path';
import fs from 'fs/promises';

// Types for our CMS content
export interface Image {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  blurDataURL?: string;
}

export interface Author {
  _title: string;
  avatar?: Image;
  xUrl?: string;
}

export interface Category {
  _title: string;
}

export interface PostMeta {
  _slug: string;
  _title: string;
  authors?: Author[];
  categories?: Category[];
  date?: string;
  description?: string;
  image?: Image;
}

export interface Post extends PostMeta {
  body: {
    plainText?: string;
    json?: {
      content?: any;
      toc?: any;
    };
    readingTime?: number;
  };
}

export interface LegalPostMeta {
  _slug: string;
  _title: string;
  description?: string;
}

export interface LegalPost extends LegalPostMeta {
  body: {
    plainText?: string;
    json?: {
      content?: any;
      toc?: any;
    };
    readingTime?: number;
  };
}

// Helper function to load content from JSON files
async function loadContent<T>(contentType: string): Promise<T[]> {
  try {
    // In a real implementation, this would load from a database or API
    // For now, we'll simulate it with a file
    const contentDir = path.join(process.cwd(), 'content', contentType);

    try {
      await fs.access(contentDir);
    } catch (error) {
      // Directory doesn't exist, create it with empty data
      await fs.mkdir(contentDir, { recursive: true });
      await fs.writeFile(
        path.join(contentDir, 'index.json'),
        JSON.stringify([])
      );
      return [];
    }

    const filePath = path.join(contentDir, 'index.json');
    const rawData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawData) as T[];
  } catch (error) {
    console.error(`Error loading ${contentType}:`, error);
    return [];
  }
}

// Blog content functions
export const blog = {
  getPosts: async (): Promise<PostMeta[]> => {
    return loadContent<PostMeta>('blog');
  },

  getLatestPost: async (): Promise<Post | null> => {
    const posts = await loadContent<Post>('blog');
    if (posts.length === 0) return null;

    // Sort by date and return the most recent
    return posts.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })[0];
  },

  getPost: async (slug: string): Promise<Post | null> => {
    const posts = await loadContent<Post>('blog');
    return posts.find(post => post._slug === slug) || null;
  }
};

// Legal content functions
export const legal = {
  getPosts: async (): Promise<LegalPost[]> => {
    return loadContent<LegalPost>('legal');
  },

  getLatestPost: async (): Promise<LegalPost | null> => {
    const posts = await loadContent<LegalPost>('legal');
    if (posts.length === 0) return null;

    // Return the first one (in a real system, you'd sort by date)
    return posts[0];
  },

  getPost: async (slug: string): Promise<LegalPost | null> => {
    const posts = await loadContent<LegalPost>('legal');
    return posts.find(post => post._slug === slug) || null;
  }
};
