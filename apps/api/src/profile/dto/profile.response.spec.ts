import { ProficiencyLevel, Discipline } from '@prisma/client';
import {
  ProfileResponse,
  ValidatedSkillResponse,
  PendingSkillResponse,
  SkillsTiersResponse,
  SeniorityHistoryResponse,
  CurrentAssignmentResponse,
  ValidatorInfo,
  TechLeadInfo,
} from './profile.response';

describe('Profile Response DTOs', () => {
  describe('ProfileResponse', () => {
    it('should create a complete profile response with all nested structures', () => {
      const profileResponse = new ProfileResponse();
      profileResponse.id = 'profile-123';
      profileResponse.name = 'John Doe';
      profileResponse.email = 'john@example.com';
      profileResponse.currentSeniorityLevel = 'Senior Developer';
      profileResponse.avatarUrl = 'https://example.com/avatar.png';
      profileResponse.skills = new SkillsTiersResponse();
      profileResponse.seniorityHistory = [];
      profileResponse.currentAssignments = [];

      expect(profileResponse.id).toBe('profile-123');
      expect(profileResponse.name).toBe('John Doe');
      expect(profileResponse.email).toBe('john@example.com');
      expect(profileResponse.currentSeniorityLevel).toBe('Senior Developer');
      expect(profileResponse.avatarUrl).toBe('https://example.com/avatar.png');
      expect(profileResponse.skills).toBeInstanceOf(SkillsTiersResponse);
      expect(Array.isArray(profileResponse.seniorityHistory)).toBe(true);
      expect(Array.isArray(profileResponse.currentAssignments)).toBe(true);
    });

    it('should handle nullable avatarUrl', () => {
      const profileResponse = new ProfileResponse();
      profileResponse.avatarUrl = undefined;

      expect(profileResponse.avatarUrl).toBeUndefined();
    });
  });

  describe('ValidatedSkillResponse', () => {
    it('should create a validated skill with all fields including validator', () => {
      const validatorInfo = new ValidatorInfo();
      validatorInfo.id = 'validator-123';
      validatorInfo.name = 'Jane Validator';

      const validatedSkill = new ValidatedSkillResponse();
      validatedSkill.skillName = 'TypeScript';
      validatedSkill.discipline = Discipline.BACKEND;
      validatedSkill.proficiencyLevel = ProficiencyLevel.EXPERT;
      validatedSkill.validatedAt = new Date('2024-01-01');
      validatedSkill.validator = validatorInfo;

      expect(validatedSkill.skillName).toBe('TypeScript');
      expect(validatedSkill.discipline).toBe(Discipline.BACKEND);
      expect(validatedSkill.proficiencyLevel).toBe(ProficiencyLevel.EXPERT);
      expect(validatedSkill.validatedAt).toEqual(new Date('2024-01-01'));
      expect(validatedSkill.validator).toEqual(validatorInfo);
    });

    it('should handle nullable validator', () => {
      const validatedSkill = new ValidatedSkillResponse();
      validatedSkill.validator = undefined;

      expect(validatedSkill.validator).toBeUndefined();
    });
  });

  describe('SkillsTiersResponse', () => {
    it('should organize skills into three tiers', () => {
      const skillsTiers = new SkillsTiersResponse();
      skillsTiers.coreStack = [];
      skillsTiers.validatedInventory = [];
      skillsTiers.pending = [];

      expect(Array.isArray(skillsTiers.coreStack)).toBe(true);
      expect(Array.isArray(skillsTiers.validatedInventory)).toBe(true);
      expect(Array.isArray(skillsTiers.pending)).toBe(true);
    });
  });

  describe('PendingSkillResponse', () => {
    it('should create a pending skill with suggested proficiency', () => {
      const pendingSkill = new PendingSkillResponse();
      pendingSkill.skillName = 'React';
      pendingSkill.discipline = Discipline.FRONTEND;
      pendingSkill.suggestedProficiency = ProficiencyLevel.INTERMEDIATE;
      pendingSkill.createdAt = new Date('2024-02-01');

      expect(pendingSkill.skillName).toBe('React');
      expect(pendingSkill.discipline).toBe(Discipline.FRONTEND);
      expect(pendingSkill.suggestedProficiency).toBe(
        ProficiencyLevel.INTERMEDIATE,
      );
      expect(pendingSkill.createdAt).toEqual(new Date('2024-02-01'));
    });
  });

  describe('SeniorityHistoryResponse', () => {
    it('should create seniority history with creator info', () => {
      const creatorInfo = new ValidatorInfo();
      creatorInfo.id = 'creator-123';
      creatorInfo.name = 'Admin User';

      const seniorityHistory = new SeniorityHistoryResponse();
      seniorityHistory.seniorityLevel = 'Senior Developer';
      seniorityHistory.effectiveDate = new Date('2023-01-01');
      seniorityHistory.createdBy = creatorInfo;

      expect(seniorityHistory.seniorityLevel).toBe('Senior Developer');
      expect(seniorityHistory.effectiveDate).toEqual(new Date('2023-01-01'));
      expect(seniorityHistory.createdBy).toEqual(creatorInfo);
    });
  });

  describe('CurrentAssignmentResponse', () => {
    it('should create assignment with tech lead info', () => {
      const techLead = new TechLeadInfo();
      techLead.id = 'lead-123';
      techLead.name = 'Tech Lead';
      techLead.email = 'lead@example.com';

      const assignment = new CurrentAssignmentResponse();
      assignment.projectName = 'Project Alpha';
      assignment.role = 'Full Stack Developer';
      assignment.tags = ['TypeScript', 'React', 'Node.js'];
      assignment.techLead = techLead;

      expect(assignment.projectName).toBe('Project Alpha');
      expect(assignment.role).toBe('Full Stack Developer');
      expect(assignment.tags).toEqual(['TypeScript', 'React', 'Node.js']);
      expect(assignment.techLead).toEqual(techLead);
    });

    it('should handle nullable tech lead', () => {
      const assignment = new CurrentAssignmentResponse();
      assignment.techLead = undefined;

      expect(assignment.techLead).toBeUndefined();
    });
  });

  describe('Enum Registration', () => {
    it('should properly register ProficiencyLevel enum', () => {
      expect(ProficiencyLevel.NOVICE).toBeDefined();
      expect(ProficiencyLevel.INTERMEDIATE).toBeDefined();
      expect(ProficiencyLevel.ADVANCED).toBeDefined();
      expect(ProficiencyLevel.EXPERT).toBeDefined();
    });

    it('should properly register Discipline enum', () => {
      expect(Discipline.FRONTEND).toBeDefined();
      expect(Discipline.BACKEND).toBeDefined();
      expect(Discipline.LANGUAGES).toBeDefined();
      expect(Discipline.DEVOPS).toBeDefined();
      expect(Discipline.DATABASE).toBeDefined();
    });
  });
});
