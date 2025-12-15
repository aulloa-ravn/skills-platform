import { hashPassword, comparePassword } from './password.util';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password using bcrypt with salt round 10', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
      // Bcrypt hashes start with $2b$ or $2a$ for bcrypt
      expect(hashed).toMatch(/^\$2[aby]\$/);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'samePassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'correctPassword';
      const hashed = await hashPassword(password);
      const result = await comparePassword(password, hashed);

      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const correctPassword = 'correctPassword';
      const wrongPassword = 'wrongPassword';
      const hashed = await hashPassword(correctPassword);
      const result = await comparePassword(wrongPassword, hashed);

      expect(result).toBe(false);
    });

    it('should return false for empty password against hash', async () => {
      const password = 'validPassword';
      const hashed = await hashPassword(password);
      const result = await comparePassword('', hashed);

      expect(result).toBe(false);
    });
  });
});
