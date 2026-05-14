import { registerSchema, loginSchema } from './auth.schema';

describe('Auth Schema Validation', () => {
  describe('registerSchema', () => {
    it('should validate a correct registration input', () => {
      const validData = {
        body: {
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123',
          displayName: 'John Doe',
        },
      };
      expect(registerSchema.safeParse(validData).success).toBe(true);
    });

    it('should fail if username is too short', () => {
      const invalidData = {
        body: {
          username: 'jo',
          email: 'john@example.com',
          password: 'password123',
          displayName: 'John Doe',
        },
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Username must be at least 3 characters');
      }
    });

    it('should fail if email is invalid', () => {
      const invalidData = {
        body: {
          username: 'johndoe',
          email: 'invalid-email',
          password: 'password123',
          displayName: 'John Doe',
        },
      };
      expect(registerSchema.safeParse(invalidData).success).toBe(false);
    });

    it('should fail if password is too short', () => {
      const invalidData = {
        body: {
          username: 'johndoe',
          email: 'john@example.com',
          password: '123',
          displayName: 'John Doe',
        },
      };
      expect(registerSchema.safeParse(invalidData).success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate a correct login input', () => {
      const validData = {
        body: {
          email: 'john@example.com',
          password: 'password123',
        },
      };
      expect(loginSchema.safeParse(validData).success).toBe(true);
    });

    it('should fail if email is missing', () => {
      const invalidData = {
        body: {
          password: 'password123',
        },
      };
      expect(loginSchema.safeParse(invalidData).success).toBe(false);
    });
  });
});
