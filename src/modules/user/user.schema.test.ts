import { updateProfileSchema, changePasswordSchema } from './user.schema';

describe('User Schema Validation', () => {
  describe('updateProfileSchema', () => {
    it('should validate a correct profile update', () => {
      const validData = {
        body: {
          displayName: 'Updated Name',
          bio: 'This is my new bio',
        },
      };
      expect(updateProfileSchema.safeParse(validData).success).toBe(true);
    });

    it('should allow optional fields', () => {
      const validData = { body: { displayName: 'Name' } };
      expect(updateProfileSchema.safeParse(validData).success).toBe(true);
    });

    it('should fail if bio is too long', () => {
      const invalidData = {
        body: {
          bio: 'a'.repeat(161),
        },
      };
      expect(updateProfileSchema.safeParse(invalidData).success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should fail if new password is too short', () => {
      const invalidData = {
        body: {
          oldPassword: 'current-password',
          newPassword: 'short',
        },
      };
      expect(changePasswordSchema.safeParse(invalidData).success).toBe(false);
    });
  });
});
