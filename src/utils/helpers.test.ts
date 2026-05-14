import { calculateReadingTime, generateSlug } from './helpers';

describe('Helper Functions', () => {
  describe('calculateReadingTime', () => {
    it('should return 1 for empty content', () => {
      expect(calculateReadingTime('')).toBe(1);
    });

    it('should return correct reading time for short text', () => {
      const content = 'This is a short test sentence.';
      expect(calculateReadingTime(content)).toBe(1);
    });

    it('should return correct reading time for long text', () => {
      // 200 words per minute
      const longText = 'word '.repeat(300);
      expect(calculateReadingTime(longText)).toBe(2);
    });
  });

  describe('generateSlug', () => {
    it('should format title correctly', () => {
      const slug = generateSlug('Hello World Test');
      expect(slug).toMatch(/^hello-world-test-[a-z0-9]{6}$/);
    });

    it('should handle special characters', () => {
      const slug = generateSlug('My @# Title!!!');
      expect(slug).toMatch(/^my-title-[a-z0-9]{6}$/);
    });
  });
});
