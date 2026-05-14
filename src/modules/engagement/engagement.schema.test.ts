import { commentSchema, clapSchema } from './engagement.schema';

describe('Engagement Schema Validation', () => {
  describe('commentSchema', () => {
    it('should validate a correct comment', () => {
      const validData = {
        body: {
          content: 'This is a test comment',
        },
      };
      expect(commentSchema.safeParse(validData).success).toBe(true);
    });

    it('should fail if content is too long', () => {
      const invalidData = {
        body: {
          content: 'a'.repeat(1001),
        },
      };
      expect(commentSchema.safeParse(invalidData).success).toBe(false);
    });

    it('should validate parentId as UUID', () => {
      const invalidData = {
        body: {
          content: 'Reply',
          parentId: 'invalid-uuid',
        },
      };
      expect(commentSchema.safeParse(invalidData).success).toBe(false);
    });
  });

  describe('clapSchema', () => {
    it('should validate clap count within range', () => {
      const validData = { body: { count: 25 } };
      expect(clapSchema.safeParse(validData).success).toBe(true);
    });

    it('should fail if clap count exceeds 50', () => {
      const invalidData = { body: { count: 51 } };
      expect(clapSchema.safeParse(invalidData).success).toBe(false);
    });

    it('should fail if clap count is negative', () => {
      const invalidData = { body: { count: -1 } };
      expect(clapSchema.safeParse(invalidData).success).toBe(false);
    });
  });
});
