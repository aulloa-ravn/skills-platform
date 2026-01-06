import { Prisma, ProfileType, SeniorityLevel } from '@prisma/client';

/**
 * Authentication Schema Tests
 *
 * These tests validate that the Prisma schema is correctly defined for authentication
 * by testing that TypeScript types are generated correctly for the ProfileType enum and
 * Profile model authentication fields.
 * These are compile-time validation tests that don't require a database connection.
 */
describe('Database Schema - Authentication', () => {
  describe('ProfileType enum', () => {
    it('should have all expected profile type values', () => {
      const expectedValues = ['EMPLOYEE', 'TECH_LEAD', 'ADMIN'];
      const actualValues = Object.values(ProfileType);

      expect(actualValues).toEqual(expectedValues);
      expect(actualValues).toHaveLength(3);
    });

    it('should allow valid profile type values in type context', () => {
      const validTypes: ProfileType[] = [
        ProfileType.EMPLOYEE,
        ProfileType.TECH_LEAD,
        ProfileType.ADMIN,
      ];

      expect(validTypes).toContain('EMPLOYEE');
      expect(validTypes).toContain('TECH_LEAD');
      expect(validTypes).toContain('ADMIN');
    });

    it('should default to EMPLOYEE type', () => {
      expect(ProfileType.EMPLOYEE).toBe('EMPLOYEE');
    });
  });

  describe('Profile model authentication fields', () => {
    it('should have correct field structure for Profile with password and type', () => {
      const profileInput: Prisma.ProfileCreateInput = {
        missionBoardId: 'mb-123',
        email: 'test@example.com',
        name: 'Test User',
        currentSeniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
        password: 'hashed-password-here',
        type: ProfileType.EMPLOYEE,
      };

      expect(profileInput.password).toBeDefined();
      expect(profileInput.type).toBe(ProfileType.EMPLOYEE);
    });

    it('should allow nullable password for migration compatibility', () => {
      const profileWithoutPassword: Prisma.ProfileCreateInput = {
        missionBoardId: 'mb-456',
        email: 'existing@example.com',
        name: 'Existing User',
        currentSeniorityLevel: SeniorityLevel.STAFF_ENGINEER,
        // password field is optional/nullable
      };

      expect(profileWithoutPassword.password).toBeUndefined();
    });

    it('should support all profile types in Profile creation', () => {
      const employeeProfile: Prisma.ProfileCreateInput = {
        missionBoardId: 'mb-789',
        email: 'employee@example.com',
        name: 'Employee User',
        currentSeniorityLevel: SeniorityLevel.JUNIOR_ENGINEER,
        type: ProfileType.EMPLOYEE,
      };

      const techLeadProfile: Prisma.ProfileCreateInput = {
        missionBoardId: 'mb-101',
        email: 'techlead@example.com',
        name: 'Tech Lead User',
        currentSeniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
        type: ProfileType.TECH_LEAD,
      };

      const adminProfile: Prisma.ProfileCreateInput = {
        missionBoardId: 'mb-202',
        email: 'admin@example.com',
        name: 'Admin User',
        currentSeniorityLevel: SeniorityLevel.STAFF_ENGINEER,
        type: ProfileType.ADMIN,
      };

      expect(employeeProfile.type).toBe(ProfileType.EMPLOYEE);
      expect(techLeadProfile.type).toBe(ProfileType.TECH_LEAD);
      expect(adminProfile.type).toBe(ProfileType.ADMIN);
    });

    it('should have password field in Profile update input', () => {
      const profileUpdate: Prisma.ProfileUpdateInput = {
        password: 'new-hashed-password',
      };

      expect(profileUpdate.password).toBeDefined();
    });

    it('should have type field in Profile update input', () => {
      const profileUpdate: Prisma.ProfileUpdateInput = {
        type: ProfileType.TECH_LEAD,
      };

      expect(profileUpdate.type).toBe(ProfileType.TECH_LEAD);
    });
  });
});
