import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResolutionService } from './resolution.service';
import { ResolutionResolver } from './resolution.resolver';
import {
  ProfileType,
  ProficiencyLevel,
  SuggestionStatus,
  SeniorityLevel,
} from '@prisma/client';
import { ResolutionAction } from './dto/resolution.input';

describe('Resolution Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let service: ResolutionService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [ResolutionService, ResolutionResolver, PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    service = moduleFixture.get<ResolutionService>(ResolutionService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('End-to-end APPROVE action', () => {
    it('should successfully approve suggestion and create EmployeeSkill', async () => {
      // Setup test data
      const profile = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-e2e-approve',
          email: 'e2e-approve@test.com',
          name: 'E2E Approve Test',
          currentSeniorityLevel: SeniorityLevel.MID_ENGINEER,
        },
      });

      const skill = await prisma.skill.create({
        data: {
          name: 'E2E TypeScript Approve',
          discipline: 'BACKEND',
        },
      });

      const suggestion = await prisma.suggestion.create({
        data: {
          profileId: profile.id,
          skillId: skill.id,
          suggestedProficiency: ProficiencyLevel.ADVANCED,
          status: SuggestionStatus.PENDING,
          source: 'SELF_REPORT',
        },
      });

      const admin = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-admin-approve',
          email: 'admin-approve@test.com',
          name: 'Admin Approver',
          currentSeniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
          type: ProfileType.ADMIN,
        },
      });

      // Execute APPROVE action
      const result = await service.resolveSuggestions(
        admin.id,
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: suggestion.id,
              action: ResolutionAction.APPROVE,
            },
          ],
        },
      );

      // Verify response
      expect(result.success).toBe(true);
      expect(result.processed).toHaveLength(1);
      expect(result.errors).toHaveLength(0);

      // Verify database state
      const updatedSuggestion = await prisma.suggestion.findUnique({
        where: { id: suggestion.id },
      });
      expect(updatedSuggestion?.status).toBe(SuggestionStatus.APPROVED);
      expect(updatedSuggestion?.resolvedAt).toBeDefined();

      const employeeSkill = await prisma.employeeSkill.findUnique({
        where: {
          profileId_skillId: {
            profileId: profile.id,
            skillId: skill.id,
          },
        },
      });
      expect(employeeSkill).toBeDefined();
      expect(employeeSkill?.proficiencyLevel).toBe(ProficiencyLevel.ADVANCED);
      expect(employeeSkill?.lastValidatedById).toBe(admin.id);

      // Cleanup
      await prisma.employeeSkill.delete({
        where: { id: employeeSkill!.id },
      });
      await prisma.suggestion.delete({ where: { id: suggestion.id } });
      await prisma.skill.delete({ where: { id: skill.id } });
      await prisma.profile.delete({ where: { id: profile.id } });
      await prisma.profile.delete({ where: { id: admin.id } });
    });
  });

  describe('End-to-end ADJUST_LEVEL action', () => {
    it('should use adjusted proficiency level', async () => {
      // Setup test data
      const profile = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-e2e-adjust',
          email: 'e2e-adjust@test.com',
          name: 'E2E Adjust Test',
          currentSeniorityLevel: SeniorityLevel.MID_ENGINEER,
        },
      });

      const skill = await prisma.skill.create({
        data: {
          name: 'E2E React Adjust',
          discipline: 'FRONTEND',
        },
      });

      const suggestion = await prisma.suggestion.create({
        data: {
          profileId: profile.id,
          skillId: skill.id,
          suggestedProficiency: ProficiencyLevel.INTERMEDIATE,
          status: SuggestionStatus.PENDING,
          source: 'SELF_REPORT',
        },
      });

      const admin = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-admin-adjust',
          email: 'admin-adjust@test.com',
          name: 'Admin Adjuster',
          currentSeniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
          type: ProfileType.ADMIN,
        },
      });

      // Execute ADJUST_LEVEL action
      const result = await service.resolveSuggestions(
        admin.id,
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: suggestion.id,
              action: ResolutionAction.ADJUST_LEVEL,
              adjustedProficiency: 'EXPERT',
            },
          ],
        },
      );

      // Verify response
      expect(result.success).toBe(true);
      expect(result.processed[0].proficiencyLevel).toBe('EXPERT');

      // Verify database state
      const employeeSkill = await prisma.employeeSkill.findUnique({
        where: {
          profileId_skillId: {
            profileId: profile.id,
            skillId: skill.id,
          },
        },
      });
      expect(employeeSkill?.proficiencyLevel).toBe(ProficiencyLevel.EXPERT);

      // Cleanup
      await prisma.employeeSkill.delete({
        where: { id: employeeSkill!.id },
      });
      await prisma.suggestion.delete({ where: { id: suggestion.id } });
      await prisma.skill.delete({ where: { id: skill.id } });
      await prisma.profile.delete({ where: { id: profile.id } });
      await prisma.profile.delete({ where: { id: admin.id } });
    });
  });

  describe('End-to-end REJECT action', () => {
    it('should not create EmployeeSkill', async () => {
      // Setup test data
      const profile = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-e2e-reject',
          email: 'e2e-reject@test.com',
          name: 'E2E Reject Test',
          currentSeniorityLevel: SeniorityLevel.MID_ENGINEER,
        },
      });

      const skill = await prisma.skill.create({
        data: {
          name: 'E2E Python Reject',
          discipline: 'BACKEND',
        },
      });

      const suggestion = await prisma.suggestion.create({
        data: {
          profileId: profile.id,
          skillId: skill.id,
          suggestedProficiency: ProficiencyLevel.NOVICE,
          status: SuggestionStatus.PENDING,
          source: 'SELF_REPORT',
        },
      });

      const admin = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-admin-reject',
          email: 'admin-reject@test.com',
          name: 'Admin Rejecter',
          currentSeniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
          type: ProfileType.ADMIN,
        },
      });

      // Execute REJECT action
      const result = await service.resolveSuggestions(
        admin.id,
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: suggestion.id,
              action: ResolutionAction.REJECT,
            },
          ],
        },
      );

      // Verify response
      expect(result.success).toBe(true);

      // Verify database state
      const updatedSuggestion = await prisma.suggestion.findUnique({
        where: { id: suggestion.id },
      });
      expect(updatedSuggestion?.status).toBe(SuggestionStatus.REJECTED);

      const employeeSkill = await prisma.employeeSkill.findUnique({
        where: {
          profileId_skillId: {
            profileId: profile.id,
            skillId: skill.id,
          },
        },
      });
      expect(employeeSkill).toBeNull();

      // Cleanup
      await prisma.suggestion.delete({ where: { id: suggestion.id } });
      await prisma.skill.delete({ where: { id: skill.id } });
      await prisma.profile.delete({ where: { id: profile.id } });
      await prisma.profile.delete({ where: { id: admin.id } });
    });
  });

  describe('TECH_LEAD authorization', () => {
    it('should only allow TECH_LEAD to resolve their team suggestions', async () => {
      // Setup test data
      const techLead = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-tech-lead',
          email: 'tech-lead@test.com',
          name: 'Tech Lead',
          currentSeniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
          type: ProfileType.TECH_LEAD,
        },
      });

      const employee = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-employee',
          email: 'employee@test.com',
          name: 'Team Employee',
          currentSeniorityLevel: SeniorityLevel.MID_ENGINEER,
        },
      });

      const project = await prisma.project.create({
        data: {
          name: 'Test Project',
          missionBoardId: 'mb-project',
          techLeadId: techLead.id,
        },
      });

      const assignment = await prisma.assignment.create({
        data: {
          profileId: employee.id,
          projectId: project.id,
          missionBoardId: 'mb-assignment',
          role: 'Developer',
          tags: [],
        },
      });

      const skill = await prisma.skill.create({
        data: {
          name: 'TL Authorization Test',
          discipline: 'BACKEND',
        },
      });

      const suggestion = await prisma.suggestion.create({
        data: {
          profileId: employee.id,
          skillId: skill.id,
          suggestedProficiency: ProficiencyLevel.INTERMEDIATE,
          status: SuggestionStatus.PENDING,
          source: 'SELF_REPORT',
        },
      });

      // Execute as TECH_LEAD
      const result = await service.resolveSuggestions(
        techLead.id,
        ProfileType.TECH_LEAD,
        {
          decisions: [
            {
              suggestionId: suggestion.id,
              action: ResolutionAction.REJECT,
            },
          ],
        },
      );

      // Verify access granted
      expect(result.success).toBe(true);
      expect(result.processed).toHaveLength(1);

      // Cleanup
      await prisma.suggestion.delete({ where: { id: suggestion.id } });
      await prisma.assignment.delete({ where: { id: assignment.id } });
      await prisma.skill.delete({ where: { id: skill.id } });
      await prisma.project.delete({ where: { id: project.id } });
      await prisma.profile.delete({ where: { id: employee.id } });
      await prisma.profile.delete({ where: { id: techLead.id } });
    });
  });

  describe('ADMIN authorization', () => {
    it('should allow ADMIN to resolve any suggestion', async () => {
      // Setup test data
      const admin = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-admin-any',
          email: 'admin-any@test.com',
          name: 'Admin Any',
          currentSeniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
          type: ProfileType.ADMIN,
        },
      });

      const employee = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-employee-any',
          email: 'employee-any@test.com',
          name: 'Random Employee',
          currentSeniorityLevel: SeniorityLevel.MID_ENGINEER,
        },
      });

      const skill = await prisma.skill.create({
        data: {
          name: 'Admin Any Test',
          discipline: 'FRONTEND',
        },
      });

      const suggestion = await prisma.suggestion.create({
        data: {
          profileId: employee.id,
          skillId: skill.id,
          suggestedProficiency: ProficiencyLevel.ADVANCED,
          status: SuggestionStatus.PENDING,
          source: 'SELF_REPORT',
        },
      });

      // Execute as ADMIN (no project association needed)
      const result = await service.resolveSuggestions(
        admin.id,
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: suggestion.id,
              action: ResolutionAction.REJECT,
            },
          ],
        },
      );

      // Verify access granted
      expect(result.success).toBe(true);
      expect(result.processed).toHaveLength(1);

      // Cleanup
      await prisma.suggestion.delete({ where: { id: suggestion.id } });
      await prisma.skill.delete({ where: { id: skill.id } });
      await prisma.profile.delete({ where: { id: employee.id } });
      await prisma.profile.delete({ where: { id: admin.id } });
    });
  });

  describe('Batch processing with partial failures', () => {
    it('should return correct response structure', async () => {
      // Setup test data
      const admin = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-admin-batch',
          email: 'admin-batch@test.com',
          name: 'Admin Batch',
          currentSeniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
          type: ProfileType.ADMIN,
        },
      });

      const profile = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-employee-batch',
          email: 'employee-batch@test.com',
          name: 'Batch Employee',
          currentSeniorityLevel: SeniorityLevel.MID_ENGINEER,
        },
      });

      const skill = await prisma.skill.create({
        data: {
          name: 'Batch Test Skill',
          discipline: 'BACKEND',
        },
      });

      const validSuggestion = await prisma.suggestion.create({
        data: {
          profileId: profile.id,
          skillId: skill.id,
          suggestedProficiency: ProficiencyLevel.INTERMEDIATE,
          status: SuggestionStatus.PENDING,
          source: 'SELF_REPORT',
        },
      });

      // Execute with one valid and one invalid suggestion
      const result = await service.resolveSuggestions(
        admin.id,
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: validSuggestion.id,
              action: ResolutionAction.REJECT,
            },
            {
              suggestionId: 0,
              action: ResolutionAction.APPROVE,
            },
          ],
        },
      );

      // Verify partial success
      expect(result.success).toBe(false);
      expect(result.processed).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('NOT_FOUND');

      // Cleanup
      await prisma.suggestion.delete({ where: { id: validSuggestion.id } });
      await prisma.skill.delete({ where: { id: skill.id } });
      await prisma.profile.delete({ where: { id: profile.id } });
      await prisma.profile.delete({ where: { id: admin.id } });
    });
  });

  describe('Duplicate suggestionIds', () => {
    it('should process only first occurrence', async () => {
      // Setup test data
      const admin = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-admin-dup',
          email: 'admin-dup@test.com',
          name: 'Admin Duplicate',
          currentSeniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
          type: ProfileType.ADMIN,
        },
      });

      const profile = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-employee-dup',
          email: 'employee-dup@test.com',
          name: 'Duplicate Employee',
          currentSeniorityLevel: SeniorityLevel.MID_ENGINEER,
        },
      });

      const skill = await prisma.skill.create({
        data: {
          name: 'Duplicate Test Skill',
          discipline: 'BACKEND',
        },
      });

      const suggestion = await prisma.suggestion.create({
        data: {
          profileId: profile.id,
          skillId: skill.id,
          suggestedProficiency: ProficiencyLevel.NOVICE,
          status: SuggestionStatus.PENDING,
          source: 'SELF_REPORT',
        },
      });

      // Execute with duplicate suggestionIds
      const result = await service.resolveSuggestions(
        admin.id,
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: suggestion.id,
              action: ResolutionAction.REJECT,
            },
            {
              suggestionId: suggestion.id,
              action: ResolutionAction.APPROVE,
            },
          ],
        },
      );

      // Verify only first processed
      expect(result.success).toBe(true);
      expect(result.processed).toHaveLength(1);
      expect(result.processed[0].action).toBe(ResolutionAction.REJECT);

      // Cleanup
      await prisma.suggestion.delete({ where: { id: suggestion.id } });
      await prisma.skill.delete({ where: { id: skill.id } });
      await prisma.profile.delete({ where: { id: profile.id } });
      await prisma.profile.delete({ where: { id: admin.id } });
    });
  });

  describe('Already processed suggestion', () => {
    it('should return ALREADY_PROCESSED error', async () => {
      // Setup test data
      const admin = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-admin-processed',
          email: 'admin-processed@test.com',
          name: 'Admin Processed',
          currentSeniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
          type: ProfileType.ADMIN,
        },
      });

      const profile = await prisma.profile.create({
        data: {
          missionBoardId: 'mb-employee-processed',
          email: 'employee-processed@test.com',
          name: 'Processed Employee',
          currentSeniorityLevel: SeniorityLevel.MID_ENGINEER,
        },
      });

      const skill = await prisma.skill.create({
        data: {
          name: 'Already Processed Skill',
          discipline: 'BACKEND',
        },
      });

      const suggestion = await prisma.suggestion.create({
        data: {
          profileId: profile.id,
          skillId: skill.id,
          suggestedProficiency: ProficiencyLevel.INTERMEDIATE,
          status: SuggestionStatus.APPROVED,
          source: 'SELF_REPORT',
          resolvedAt: new Date(),
        },
      });

      // Try to process already approved suggestion
      const result = await service.resolveSuggestions(
        admin.id,
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: suggestion.id,
              action: ResolutionAction.APPROVE,
            },
          ],
        },
      );

      // Verify error
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('ALREADY_PROCESSED');

      // Cleanup
      await prisma.suggestion.delete({ where: { id: suggestion.id } });
      await prisma.skill.delete({ where: { id: skill.id } });
      await prisma.profile.delete({ where: { id: profile.id } });
      await prisma.profile.delete({ where: { id: admin.id } });
    });
  });

  describe('Missing adjustedProficiency for ADJUST_LEVEL', () => {
    it('should return MISSING_PROFICIENCY error', async () => {
      const result = await service.resolveSuggestions(
        'admin-id',
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: 0,
              action: ResolutionAction.ADJUST_LEVEL,
              // Missing adjustedProficiency
            },
          ],
        },
      );

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('MISSING_PROFICIENCY');
    });
  });

  describe('Invalid proficiency level', () => {
    it('should return INVALID_PROFICIENCY error', async () => {
      const result = await service.resolveSuggestions(
        'admin-id',
        ProfileType.ADMIN,
        {
          decisions: [
            {
              suggestionId: 0,
              action: ResolutionAction.ADJUST_LEVEL,
              adjustedProficiency: 'INVALID_LEVEL',
            },
          ],
        },
      );

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('INVALID_PROFICIENCY');
    });
  });
});
