import { z } from 'zod';
import { ArticleStatus } from '@prisma/client';

export const articleSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    content: z.any().optional(), // Editor.js JSON format
    excerpt: z.string().max(300).optional(),
    tags: z.array(z.string()).optional(),
    status: z.nativeEnum(ArticleStatus).optional(),
  }),
});

export const articleQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    tag: z.string().optional(),
    author: z.string().optional(),
    status: z.nativeEnum(ArticleStatus).optional(),
    sort: z.enum(['newest', 'oldest', 'popular']).optional(),
  }),
});

export const searchQuerySchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required'),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
