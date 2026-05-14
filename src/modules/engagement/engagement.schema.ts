import { z } from 'zod';

export const commentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment content is required').max(1000, 'Comment is too long'),
    parentId: z.string().uuid('Invalid parent ID format').optional(),
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment content is required').max(1000, 'Comment is too long'),
  }),
});

export const clapSchema = z.object({
  body: z.object({
    count: z.number().int().min(1).max(50).optional().default(1),
  }),
});
