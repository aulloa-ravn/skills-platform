import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { hashPassword } from '../src/auth/utils/password.util';
import { Role, ProficiencyLevel, Discipline } from '@prisma/client';

/**
 * End-to-end integration tests for Employee Profile API feature
 * Tests complete profile query workflows across all layers
 */
describe('Profile API Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let employeeId: string;
  let techLeadId: string;
  let adminId: string;
  let teamMemberId: string;
  let projectId: string;
  let skillId: string;
  let employeeToken: string;
  let techLeadToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test skill
    const skill = await prisma.skill.create({
      data: {
        name: 'TypeScript-Test',
        discipline: Discipline.LANGUAGES,
        isActive: true,
      },
    });
    skillId = skill.id;

    // Create employee user
    const employee = await prisma.profile.create({
      data: {
        name: 'Employee User',
        email: 'employee@test.com',
        password: await hashPassword('password123'),
        role: Role.EMPLOYEE,
        currentSeniorityLevel: 'Developer',
        missionBoardId: 'emp-mb-001',
      },
    });
    employeeId = employee.id;

    // Create tech lead user
    const techLead = await prisma.profile.create({
      data: {
        name: 'Tech Lead User',
        email: 'techlead@test.com',
        password: await hashPassword('password123'),
        role: Role.EMPLOYEE, // Will become TECH_LEAD via project assignment
        currentSeniorityLevel: 'Senior Developer',
        missionBoardId: 'lead-mb-001',
      },
    });
    techLeadId = techLead.id;

    // Create admin user
    const admin = await prisma.profile.create({
      data: {
        name: 'Admin User',
        email: 'admin@test.com',
        password: await hashPassword('password123'),
        role: Role.ADMIN,
        currentSeniorityLevel: 'Tech Lead',
        missionBoardId: 'admin-mb-001',
      },
    });
    adminId = admin.id;

    // Create team member under tech lead
    const teamMember = await prisma.profile.create({
      data: {
        name: 'Team Member',
        email: 'teammember@test.com',
        password: await hashPassword('password123'),
        role: Role.EMPLOYEE,
        currentSeniorityLevel: 'Junior Developer',
        missionBoardId: 'team-mb-001',
      },
    });
    teamMemberId = teamMember.id;

    // Create project with tech lead
    const project = await prisma.project.create({
      data: {
        name: 'Test Project',
        missionBoardId: 'proj-mb-001',
        techLeadId: techLeadId,
      },
    });
    projectId = project.id;

    // Create assignment for team member
    await prisma.assignment.create({
      data: {
        profileId: teamMemberId,
        projectId: projectId,
        missionBoardId: 'assign-mb-001',
        role: 'Full Stack Developer',
        tags: ['TypeScript-Test', 'React', 'Node.js'],
      },
    });

    // Create validated skill for team member
    await prisma.employeeSkill.create({
      data: {
        profileId: teamMemberId,
        skillId: skillId,
        proficiencyLevel: ProficiencyLevel.EXPERT,
        validatedAt: new Date(),
        validatedById: techLeadId,
      },
    });

    // Create pending suggestion for team member
    await prisma.suggestion.create({
      data: {
        profileId: teamMemberId,
        skillId: skillId,
        suggestedProficiency: ProficiencyLevel.ADVANCED,
        status: 'PENDING',
        source: 'SELF_REPORT',
      },
    });

    // Create seniority history for team member
    await prisma.seniorityHistory.create({
      data: {
        profileId: teamMemberId,
        seniorityLevel: 'Junior Developer',
        start_date: new Date('2024-01-01'),
        end_date: null,
        createdById: adminId,
      },
    });

    // Login to get tokens
    const employeeLogin = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation Login($input: LoginInput!) {
            login(input: $input) {
              accessToken
            }
          }
        `,
        variables: {
          input: {
            email: 'employee@test.com',
            password: 'password123',
          },
        },
      });
    employeeToken = employeeLogin.body.data.login.accessToken;

    const techLeadLogin = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation Login($input: LoginInput!) {
            login(input: $input) {
              accessToken
            }
          }
        `,
        variables: {
          input: {
            email: 'techlead@test.com',
            password: 'password123',
          },
        },
      });
    techLeadToken = techLeadLogin.body.data.login.accessToken;

    const adminLogin = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation Login($input: LoginInput!) {
            login(input: $input) {
              accessToken
            }
          }
        `,
        variables: {
          input: {
            email: 'admin@test.com',
            password: 'password123',
          },
        },
      });
    adminToken = adminLogin.body.data.login.accessToken;
  });

  afterAll(async () => {
    // Clean up test data in correct order
    await prisma.suggestion.deleteMany({ where: { profileId: teamMemberId } });
    await prisma.employeeSkill.deleteMany({
      where: { profileId: teamMemberId },
    });
    await prisma.seniorityHistory.deleteMany({
      where: { profileId: teamMemberId },
    });
    await prisma.assignment.deleteMany({ where: { projectId } });
    await prisma.project.delete({ where: { id: projectId } }).catch(() => {});
    await prisma.profile.delete({ where: { id: employeeId } }).catch(() => {});
    await prisma.profile.delete({ where: { id: techLeadId } }).catch(() => {});
    await prisma.profile.delete({ where: { id: adminId } }).catch(() => {});
    await prisma.profile
      .delete({ where: { id: teamMemberId } })
      .catch(() => {});
    await prisma.skill.delete({ where: { id: skillId } }).catch(() => {});
    await app.close();
  });

  describe('Authorization - EMPLOYEE Role', () => {
    it('should allow employee to access their own profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          query: `
            query GetProfile($id: String!) {
              getProfile(id: $id) {
                id
                name
                email
                currentSeniorityLevel
              }
            }
          `,
          variables: {
            id: employeeId,
          },
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.getProfile.id).toBe(employeeId);
      expect(response.body.data.getProfile.name).toBe('Employee User');
    });

    it('should deny employee access to another profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          query: `
            query GetProfile($id: String!) {
              getProfile(id: $id) {
                id
                name
              }
            }
          `,
          variables: {
            id: teamMemberId,
          },
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    });
  });

  describe('Authorization - TECH_LEAD Role', () => {
    it('should allow tech lead to access team member profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${techLeadToken}`)
        .send({
          query: `
            query GetProfile($id: String!) {
              getProfile(id: $id) {
                id
                name
                email
                skills {
                  coreStack {
                    skillName
                    proficiencyLevel
                  }
                }
              }
            }
          `,
          variables: {
            id: teamMemberId,
          },
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.getProfile.id).toBe(teamMemberId);
      expect(response.body.data.getProfile.name).toBe('Team Member');
    });

    it('should deny tech lead access to non-team member profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${techLeadToken}`)
        .send({
          query: `
            query GetProfile($id: String!) {
              getProfile(id: $id) {
                id
              }
            }
          `,
          variables: {
            id: employeeId,
          },
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    });
  });

  describe('Authorization - ADMIN Role', () => {
    it('should allow admin to access any profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            query GetProfile($id: String!) {
              getProfile(id: $id) {
                id
                name
              }
            }
          `,
          variables: {
            id: employeeId,
          },
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.getProfile.id).toBe(employeeId);
    });
  });

  describe('Complete Profile Response Structure', () => {
    it('should return complete profile with all nested data structures', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            query GetProfile($id: String!) {
              getProfile(id: $id) {
                id
                name
                email
                currentSeniorityLevel
                avatarUrl
                skills {
                  coreStack {
                    skillName
                    discipline
                    proficiencyLevel
                    validatedAt
                    validator {
                      id
                      name
                    }
                  }
                  validatedInventory {
                    skillName
                    discipline
                    proficiencyLevel
                  }
                  pending {
                    skillName
                    discipline
                    suggestedProficiency
                    createdAt
                  }
                }
                seniorityHistory {
                  seniorityLevel
                  start_date
                  end_date
                  createdBy {
                    id
                    name
                  }
                }
                currentAssignments {
                  projectName
                  role
                  tags
                  techLead {
                    id
                    name
                    email
                  }
                }
              }
            }
          `,
          variables: {
            id: teamMemberId,
          },
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const profile = response.body.data.getProfile;

      // Verify profile header
      expect(profile.id).toBe(teamMemberId);
      expect(profile.name).toBe('Team Member');
      expect(profile.email).toBe('teammember@test.com');
      expect(profile.currentSeniorityLevel).toBe('Junior Developer');

      // Verify skills structure
      expect(profile.skills).toBeDefined();
      expect(Array.isArray(profile.skills.coreStack)).toBe(true);
      expect(Array.isArray(profile.skills.validatedInventory)).toBe(true);
      expect(Array.isArray(profile.skills.pending)).toBe(true);

      // Verify seniority history
      expect(Array.isArray(profile.seniorityHistory)).toBe(true);
      expect(profile.seniorityHistory.length).toBeGreaterThan(0);

      // Verify current assignments
      expect(Array.isArray(profile.currentAssignments)).toBe(true);
      expect(profile.currentAssignments.length).toBeGreaterThan(0);
      expect(profile.currentAssignments[0].projectName).toBe('Test Project');
      expect(profile.currentAssignments[0].techLead).toBeDefined();
      expect(profile.currentAssignments[0].techLead.name).toBe(
        'Tech Lead User',
      );
    });
  });

  describe('Skills Tiering Algorithm', () => {
    it('should correctly organize skills into Core Stack based on assignment tags', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${techLeadToken}`)
        .send({
          query: `
            query GetProfile($id: String!) {
              getProfile(id: $id) {
                skills {
                  coreStack {
                    skillName
                    proficiencyLevel
                  }
                  validatedInventory {
                    skillName
                  }
                }
              }
            }
          `,
          variables: {
            id: teamMemberId,
          },
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const skills = response.body.data.getProfile.skills;

      // TypeScript-Test should be in Core Stack (matches assignment tag)
      expect(skills.coreStack.length).toBeGreaterThan(0);
      const coreStackSkill = skills.coreStack.find(
        (s: any) => s.skillName === 'TypeScript-Test',
      );
      expect(coreStackSkill).toBeDefined();
      expect(coreStackSkill.proficiencyLevel).toBe('EXPERT');
    });
  });

  describe('Error Handling', () => {
    it('should return NOT_FOUND error for non-existent profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            query GetProfile($id: String!) {
              getProfile(id: $id) {
                id
              }
            }
          `,
          variables: {
            id: 'non-existent-id',
          },
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    });

    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetProfile($id: String!) {
              getProfile(id: $id) {
                id
              }
            }
          `,
          variables: {
            id: employeeId,
          },
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle profile with no validated skills', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          query: `
            query GetProfile($id: String!) {
              getProfile(id: $id) {
                id
                skills {
                  coreStack {
                    skillName
                  }
                  validatedInventory {
                    skillName
                  }
                  pending {
                    skillName
                  }
                }
              }
            }
          `,
          variables: {
            id: employeeId,
          },
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const skills = response.body.data.getProfile.skills;
      expect(skills.coreStack).toEqual([]);
      expect(skills.validatedInventory).toEqual([]);
      expect(Array.isArray(skills.pending)).toBe(true);
    });
  });
});
