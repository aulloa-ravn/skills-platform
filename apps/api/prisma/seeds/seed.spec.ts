import { PrismaClient } from '@prisma/client';
import {
  initializeFaker,
  generateEmail,
  generateMissionBoardId,
  distributeByPercentages,
  shuffleArray,
  selectRandomItems,
  getRandomInt,
} from './seed-utils';
import { seedSkills } from './skills.seed';
import { seedSampleData } from './sample-data.seed';
import {
  getRelevantSkillsForProjectType,
  ProjectType,
} from './skill-context';

describe('Seed Infrastructure', () => {
  describe('Seed Utilities', () => {
    beforeEach(() => {
      initializeFaker(12345);
    });

    it('should generate email in correct format', () => {
      const email = generateEmail('John', 'Doe');
      expect(email).toBe('john.doe@ravn.com');
    });

    it('should generate mission board ID in UUID format', () => {
      const id = generateMissionBoardId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should distribute items by percentages correctly', () => {
      const counts = distributeByPercentages(100, [40, 30, 20, 10]);
      expect(counts).toEqual([40, 30, 20, 10]);
    });

    it('should produce deterministic results with same seed', () => {
      initializeFaker(12345);
      const email1 = generateEmail('John', 'Doe');

      initializeFaker(12345);
      const email2 = generateEmail('John', 'Doe');

      expect(email1).toBe(email2);
    });
  });

  describe('Skill Context Mapping', () => {
    it('should map MOBILE project type to relevant disciplines', () => {
      const mockSkills = [
        {
          id: '1',
          name: 'React Native',
          discipline: 'MOBILE',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Node.js',
          discipline: 'BACKEND',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const relevantSkills = getRelevantSkillsForProjectType(
        'MOBILE' as ProjectType,
        mockSkills,
      );
      expect(relevantSkills).toHaveLength(1);
      expect(relevantSkills[0].name).toBe('React Native');
    });
  });
});

describe('Profile and Seniority Generation', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create 20-30 profiles with realistic data', async () => {
    const profiles = await prisma.profile.findMany();
    expect(profiles.length).toBeGreaterThanOrEqual(20);
    expect(profiles.length).toBeLessThanOrEqual(30);

    // Verify email format
    profiles.forEach((profile) => {
      expect(profile.email).toMatch(/^[a-z]+\.[a-z]+@ravn\.com$/);
    });
  });

  it('should distribute seniority levels following pyramid structure', async () => {
    const profiles = await prisma.profile.findMany();
    const total = profiles.length;

    const juniorCount = profiles.filter(
      (p) => p.currentSeniorityLevel === 'JUNIOR',
    ).length;
    const midCount = profiles.filter(
      (p) => p.currentSeniorityLevel === 'MID',
    ).length;
    const seniorCount = profiles.filter(
      (p) => p.currentSeniorityLevel === 'SENIOR',
    ).length;
    const leadCount = profiles.filter(
      (p) => p.currentSeniorityLevel === 'LEAD',
    ).length;

    // Check rough percentages (within 10% tolerance)
    expect(juniorCount / total).toBeGreaterThanOrEqual(0.3);
    expect(juniorCount / total).toBeLessThanOrEqual(0.5);

    expect(midCount / total).toBeGreaterThanOrEqual(0.2);
    expect(midCount / total).toBeLessThanOrEqual(0.4);

    expect(seniorCount / total).toBeGreaterThanOrEqual(0.1);
    expect(seniorCount / total).toBeLessThanOrEqual(0.3);

    expect(leadCount / total).toBeGreaterThanOrEqual(0.05);
  });

  it('should have at least 5-10 Lead profiles', async () => {
    const leadProfiles = await prisma.profile.findMany({
      where: { currentSeniorityLevel: 'LEAD' },
    });

    expect(leadProfiles.length).toBeGreaterThanOrEqual(5);
  });

  it('should create seniority history with sequential progressions', async () => {
    const histories = await prisma.seniorityHistory.findMany({
      orderBy: { effectiveDate: 'asc' },
    });

    expect(histories.length).toBeGreaterThan(0);

    // Group by profile and check chronology
    const historiesByProfile = new Map<string, typeof histories>();

    histories.forEach((history) => {
      if (!historiesByProfile.has(history.profileId)) {
        historiesByProfile.set(history.profileId, []);
      }
      historiesByProfile.get(history.profileId)?.push(history);
    });

    historiesByProfile.forEach((profileHistories) => {
      for (let i = 1; i < profileHistories.length; i++) {
        expect(profileHistories[i].effectiveDate.getTime()).toBeGreaterThan(
          profileHistories[i - 1].effectiveDate.getTime(),
        );
      }
    });
  });
});

describe('Project and Assignment Generation', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create 5-10 projects', async () => {
    const projects = await prisma.project.findMany();
    expect(projects.length).toBeGreaterThanOrEqual(5);
    expect(projects.length).toBeLessThanOrEqual(10);
  });

  it('should assign exactly one Tech Lead per project', async () => {
    const projects = await prisma.project.findMany({
      include: { techLead: true },
    });

    projects.forEach((project) => {
      expect(project.techLeadId).toBeTruthy();
      expect(project.techLead).toBeTruthy();
    });
  });

  it('should ensure Tech Leads have LEAD seniority level', async () => {
    const projects = await prisma.project.findMany({
      include: { techLead: true },
    });

    projects.forEach((project) => {
      expect(project.techLead?.currentSeniorityLevel).toBe('LEAD');
    });
  });

  it('should ensure no Tech Lead leads multiple projects', async () => {
    const projects = await prisma.project.findMany();
    const techLeadIds = projects.map((p) => p.techLeadId);
    const uniqueIds = new Set(techLeadIds);

    expect(uniqueIds.size).toBe(techLeadIds.length);
  });

  it('should ensure all employees have at least one assignment', async () => {
    const profiles = await prisma.profile.findMany();
    const assignments = await prisma.assignment.findMany();

    const assignedProfileIds = new Set(
      assignments.map((a) => a.profileId),
    );

    profiles.forEach((profile) => {
      expect(assignedProfileIds.has(profile.id)).toBe(true);
    });
  });

  it('should follow assignment distribution pattern', async () => {
    const profiles = await prisma.profile.findMany();
    const assignments = await prisma.assignment.findMany();

    const assignmentCounts = new Map<string, number>();
    assignments.forEach((a) => {
      assignmentCounts.set(
        a.profileId,
        (assignmentCounts.get(a.profileId) || 0) + 1,
      );
    });

    const with1 = Array.from(assignmentCounts.values()).filter(
      (c) => c === 1,
    ).length;
    const with2 = Array.from(assignmentCounts.values()).filter(
      (c) => c === 2,
    ).length;
    const with3 = Array.from(assignmentCounts.values()).filter(
      (c) => c === 3,
    ).length;

    const total = profiles.length;

    // Check distribution (within tolerance)
    expect(with1 / total).toBeGreaterThanOrEqual(0.5); // ~60-70%
    expect(with2 / total).toBeGreaterThanOrEqual(0.15); // ~20-30%
    expect(with3 / total).toBeGreaterThanOrEqual(0.03); // ~5-10%
  });
});

describe('Employee Skill Validation Generation', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create 3-7 validated skills per profile', async () => {
    const profiles = await prisma.profile.findMany();
    const employeeSkills = await prisma.employeeSkill.findMany();

    const skillsByProfile = new Map<string, number>();
    employeeSkills.forEach((es) => {
      skillsByProfile.set(
        es.profileId,
        (skillsByProfile.get(es.profileId) || 0) + 1,
      );
    });

    profiles.forEach((profile) => {
      const count = skillsByProfile.get(profile.id) || 0;
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(7);
    });
  });

  it('should ensure Junior employees do not have EXPERT proficiency', async () => {
    const juniorProfiles = await prisma.profile.findMany({
      where: { currentSeniorityLevel: 'JUNIOR' },
    });

    const juniorSkills = await prisma.employeeSkill.findMany({
      where: {
        profileId: { in: juniorProfiles.map((p) => p.id) },
      },
    });

    juniorSkills.forEach((skill) => {
      expect(skill.proficiencyLevel).not.toBe('EXPERT');
    });
  });

  it('should have proficiency distribution roughly matching targets', async () => {
    const employeeSkills = await prisma.employeeSkill.findMany();
    const total = employeeSkills.length;

    const novice = employeeSkills.filter(
      (es) => es.proficiencyLevel === 'NOVICE',
    ).length;
    const intermediate = employeeSkills.filter(
      (es) => es.proficiencyLevel === 'INTERMEDIATE',
    ).length;
    const advanced = employeeSkills.filter(
      (es) => es.proficiencyLevel === 'ADVANCED',
    ).length;
    const expert = employeeSkills.filter(
      (es) => es.proficiencyLevel === 'EXPERT',
    ).length;

    // Rough distribution check (within tolerance)
    expect(novice / total).toBeLessThanOrEqual(0.25); // ~10%
    expect(intermediate / total).toBeGreaterThanOrEqual(0.25); // ~40%
    expect(advanced / total).toBeGreaterThanOrEqual(0.25); // ~40%
    expect(expert / total).toBeLessThanOrEqual(0.2); // ~10%
  });

  it('should have validatedAt dates within 1 week to 12 months ago', async () => {
    const employeeSkills = await prisma.employeeSkill.findMany();
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    employeeSkills.forEach((skill) => {
      expect(skill.validatedAt.getTime()).toBeLessThanOrEqual(now.getTime());
      expect(skill.validatedAt.getTime()).toBeGreaterThanOrEqual(
        oneYearAgo.getTime(),
      );
    });
  });
});

describe('Skill Suggestion Generation', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create 1-3 pending suggestions per profile', async () => {
    const profiles = await prisma.profile.findMany();
    const suggestions = await prisma.suggestion.findMany();

    const suggestionsByProfile = new Map<string, number>();
    suggestions.forEach((s) => {
      suggestionsByProfile.set(
        s.profileId,
        (suggestionsByProfile.get(s.profileId) || 0) + 1,
      );
    });

    profiles.forEach((profile) => {
      const count = suggestionsByProfile.get(profile.id) || 0;
      expect(count).toBeGreaterThanOrEqual(1);
      expect(count).toBeLessThanOrEqual(3);
    });
  });

  it('should set all suggestions to PENDING status with SELF_REPORT source', async () => {
    const suggestions = await prisma.suggestion.findMany();

    suggestions.forEach((suggestion) => {
      expect(suggestion.status).toBe('PENDING');
      expect(suggestion.source).toBe('SELF_REPORT');
    });
  });

  it('should have createdAt dates within last 1-2 weeks', async () => {
    const suggestions = await prisma.suggestion.findMany();
    const now = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    suggestions.forEach((suggestion) => {
      expect(suggestion.createdAt.getTime()).toBeLessThanOrEqual(
        now.getTime(),
      );
      expect(suggestion.createdAt.getTime()).toBeGreaterThanOrEqual(
        twoWeeksAgo.getTime(),
      );
    });
  });
});

describe('Idempotent Seeding and Validation', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should preserve 136 admin-seeded skills', async () => {
    const skills = await prisma.skill.findMany();
    expect(skills.length).toBe(136);
  });

  it('should validate all emails use @ravn.com domain', async () => {
    const profiles = await prisma.profile.findMany();

    profiles.forEach((profile) => {
      expect(profile.email).toMatch(/@ravn\.com$/);
    });
  });

  it('should validate all projects have exactly one Tech Lead', async () => {
    const projects = await prisma.project.findMany({
      include: { techLead: true },
    });

    projects.forEach((project) => {
      expect(project.techLeadId).toBeTruthy();
      expect(project.techLead).toBeTruthy();
      expect(project.techLead?.currentSeniorityLevel).toBe('LEAD');
    });
  });

  it('should handle foreign key relationships correctly', async () => {
    // Test that all relationships are valid
    const employeeSkills = await prisma.employeeSkill.findMany({
      include: { profile: true, skill: true },
    });

    employeeSkills.forEach((es) => {
      expect(es.profile).toBeTruthy();
      expect(es.skill).toBeTruthy();
    });

    const assignments = await prisma.assignment.findMany({
      include: { profile: true, project: true },
    });

    assignments.forEach((a) => {
      expect(a.profile).toBeTruthy();
      expect(a.project).toBeTruthy();
    });
  });
});

describe('End-to-End Seeding Workflow', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should run full seeding workflow successfully', async () => {
    // This test verifies the entire seeding process has completed
    const [
      profileCount,
      projectCount,
      assignmentCount,
      employeeSkillCount,
      suggestionCount,
      seniorityHistoryCount,
      skillCount,
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.project.count(),
      prisma.assignment.count(),
      prisma.employeeSkill.count(),
      prisma.suggestion.count(),
      prisma.seniorityHistory.count(),
      prisma.skill.count(),
    ]);

    expect(profileCount).toBeGreaterThanOrEqual(20);
    expect(projectCount).toBeGreaterThanOrEqual(5);
    expect(assignmentCount).toBeGreaterThan(0);
    expect(employeeSkillCount).toBeGreaterThan(0);
    expect(suggestionCount).toBeGreaterThan(0);
    expect(seniorityHistoryCount).toBeGreaterThan(0);
    expect(skillCount).toBe(136);
  });
});
