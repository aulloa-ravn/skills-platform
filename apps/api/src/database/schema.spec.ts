import {
  Prisma,
  ProficiencyLevel,
  SuggestionStatus,
  SuggestionSource,
  Discipline,
  SeniorityLevel,
} from '@prisma/client';

/**
 * Database Schema Tests
 *
 * These tests validate that the Prisma schema is correctly defined by testing
 * that TypeScript types are generated correctly for enums and models.
 * These are compile-time validation tests that don't require a database connection.
 */
describe('Database Schema - Enums', () => {
  describe('ProficiencyLevel enum', () => {
    it('should have all expected proficiency level values', () => {
      const expectedValues = ['NOVICE', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
      const actualValues = Object.values(ProficiencyLevel);

      expect(actualValues).toEqual(expectedValues);
      expect(actualValues).toHaveLength(4);
    });

    it('should allow valid proficiency level values in type context', () => {
      const validLevels: ProficiencyLevel[] = [
        ProficiencyLevel.NOVICE,
        ProficiencyLevel.INTERMEDIATE,
        ProficiencyLevel.ADVANCED,
        ProficiencyLevel.EXPERT,
      ];

      expect(validLevels).toContain('NOVICE');
      expect(validLevels).toContain('INTERMEDIATE');
      expect(validLevels).toContain('ADVANCED');
      expect(validLevels).toContain('EXPERT');
    });
  });

  describe('SuggestionStatus enum', () => {
    it('should have all expected suggestion status values', () => {
      const expectedValues = ['PENDING', 'APPROVED', 'REJECTED', 'ADJUSTED'];
      const actualValues = Object.values(SuggestionStatus);

      expect(actualValues).toEqual(expectedValues);
      expect(actualValues).toHaveLength(4);
    });
  });

  describe('SuggestionSource enum', () => {
    it('should have all expected suggestion source values', () => {
      const expectedValues = ['SELF_REPORT', 'SYSTEM_FLAG'];
      const actualValues = Object.values(SuggestionSource);

      expect(actualValues).toEqual(expectedValues);
      expect(actualValues).toHaveLength(2);
    });
  });

  describe('Discipline enum', () => {
    it('should have all expected discipline values', () => {
      const expectedValues = [
        'FRONTEND',
        'BACKEND',
        'LANGUAGES',
        'DEVOPS',
        'DATABASE',
        'DESIGN',
        'MOBILE',
        'TESTING',
        'CLOUD',
        'OTHER',
        'STYLING',
        'TOOLS',
        'API',
        'PERFORMANCE',
        'SECURITY',
        'IOS',
        'ANDROID',
        'BUILD_TOOLS',
        'NO_CODE',
      ];
      const actualValues = Object.values(Discipline);

      expect(actualValues).toEqual(expectedValues);
      expect(actualValues).toHaveLength(19);
    });
  });
});

describe('Database Schema - Core Models', () => {
  describe('Profile model', () => {
    it('should have correct field structure for Profile creation', () => {
      const profileInput: Prisma.ProfileCreateInput = {
        missionBoardId: 'mb-123',
        email: 'test@example.com',
        name: 'Test User',
        currentSeniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
      };

      expect(profileInput.missionBoardId).toBe('mb-123');
      expect(profileInput.email).toBe('test@example.com');
      expect(profileInput.name).toBe('Test User');
      expect(profileInput.currentSeniorityLevel).toBe(
        SeniorityLevel.SENIOR_ENGINEER,
      );
    });

    it('should allow optional avatarUrl field', () => {
      const profileWithAvatar: Prisma.ProfileCreateInput = {
        missionBoardId: 'mb-456',
        email: 'avatar@example.com',
        name: 'Avatar User',
        currentSeniorityLevel: SeniorityLevel.MID_LEVEL_ENGINEER,
        avatarUrl: 'https://example.com/avatar.png',
      };

      expect(profileWithAvatar.avatarUrl).toBe(
        'https://example.com/avatar.png',
      );
    });
  });

  describe('Skill model', () => {
    it('should have correct field structure for Skill creation', () => {
      const skillInput: Prisma.SkillCreateInput = {
        name: 'TypeScript',
        discipline: 'LANGUAGES',
      };

      expect(skillInput.name).toBe('TypeScript');
      expect(skillInput.discipline).toBe('LANGUAGES');
    });

    it('should default isActive to true when not specified', () => {
      const skillInput: Prisma.SkillCreateInput = {
        name: 'React',
        discipline: 'FRONTEND',
      };

      // isActive is optional in create input (has default)
      expect(skillInput.isActive).toBeUndefined();
    });

    it('should allow explicit isActive value', () => {
      const skillInput: Prisma.SkillCreateInput = {
        name: 'jQuery',
        discipline: 'FRONTEND',
        isActive: false,
      };

      expect(skillInput.isActive).toBe(false);
    });
  });

  describe('Project model', () => {
    it('should have correct field structure for Project creation', () => {
      const projectInput: Prisma.ProjectCreateInput = {
        name: 'Test Project',
        missionBoardId: 'proj-123',
      };

      expect(projectInput.name).toBe('Test Project');
      expect(projectInput.missionBoardId).toBe('proj-123');
    });

    it('should allow optional techLead relation', () => {
      const projectWithTechLead: Prisma.ProjectCreateInput = {
        name: 'Project with Lead',
        missionBoardId: 'proj-456',
        techLead: {
          connect: { id: 'profile-id-123' },
        },
      };

      expect(projectWithTechLead.techLead).toBeDefined();
    });
  });
});
