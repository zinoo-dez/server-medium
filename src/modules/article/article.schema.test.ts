import { articleSchema, searchQuerySchema } from './article.schema';
import { ArticleStatus } from '@prisma/client';

describe('Article Schema Validation', () => {
  describe('articleSchema', () => {
    it('should validate a correct article input', () => {
      const validData = {
        body: {
          title: 'My First Article',
          content: { blocks: [] },
          status: ArticleStatus.PUBLISHED,
        },
      };
      expect(articleSchema.safeParse(validData).success).toBe(true);
    });

    it('should fail if title is missing', () => {
      const invalidData = {
        body: {
          content: { blocks: [] },
        },
      };
      expect(articleSchema.safeParse(invalidData).success).toBe(false);
    });

    it('should fail if status is invalid', () => {
      const invalidData = {
        body: {
          title: 'Title',
          status: 'INVALID_STATUS',
        },
      };
      expect(articleSchema.safeParse(invalidData).success).toBe(false);
    });
  });

  describe('searchQuerySchema', () => {
    it('should validate a correct search query', () => {
      const validData = {
        query: {
          q: 'test',
        },
      };
      expect(searchQuerySchema.safeParse(validData).success).toBe(true);
    });

    it('should fail if search query is empty', () => {
      const invalidData = {
        query: {
          q: '',
        },
      };
      expect(searchQuerySchema.safeParse(invalidData).success).toBe(false);
    });
  });
});
