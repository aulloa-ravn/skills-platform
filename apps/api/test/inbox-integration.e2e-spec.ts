import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { hashPassword } from '../src/auth/utils/password.util';
import {
  Role,
  ProficiencyLevel,
  Discipline,
  SuggestionSource,
  SuggestionStatus,
} from '@prisma/client';

/**
 * End-to-end integration tests for Validation Inbox API feature
 * Tests complete inbox query workflows across all layers
 */
describe('Validation Inbox API Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let employeeId: string;
  let techLeadId: string;
  let adminId: string;
  let employee1Id: string;
  let employee2Id: string;
  let project1Id: string;
  let project2Id: string;
  let skill1Id: string;
  let skill2Id: string;
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

    // Create test skills
    const skill1 = await prisma.skill.create({
      data: {
        name: 'React-Inbox',
        discipline: Discipline.FRONTEND,
        isActive: true,
      },
    });
    skill1Id = skill1.id;

    const skill2 = await prisma.skill.create({
      data: {
        name: 'Node.js-Inbox',
        discipline: Discipline.BACKEND,
        isActive: true,
      },
    });
    skill2Id = skill2.id;

    // Create employee user (no inbox access)
    const employee = await prisma.profile.create({
      data: {
        name: 'Regular Employee',
        email: 'employee-inbox@test.com',
        password: await hashPassword('password123'),
        role: Role.EMPLOYEE,
        currentSeniorityLevel: 'Developer',
        missionBoardId: 'emp-inbox-001',
      },
    });
    employeeId = employee.id;

    // Create tech lead user
    const techLead = await prisma.profile.create({
      data: {
        name: 'Tech Lead Inbox',
        email: 'techlead-inbox@test.com',
        password: await hashPassword('password123'),
        role: Role.TECH_LEAD,
        currentSeniorityLevel: 'Senior Developer',
        missionBoardId: 'lead-inbox-001',
      },
    });
    techLeadId = techLead.id;

    // Create admin user
    const admin = await prisma.profile.create({
      data: {
        name: 'Admin Inbox',
        email: 'admin-inbox@test.com',
        password: await hashPassword('password123'),
        role: Role.ADMIN,
        currentSeniorityLevel: 'Tech Lead',
        missionBoardId: 'admin-inbox-001',
      },
    });
    adminId = admin.id;

    // Create employee 1 (will have pending suggestions)
    const emp1 = await prisma.profile.create({
      data: {
        name: 'Alice Developer',
        email: 'alice-inbox@test.com',
        password: await hashPassword('password123'),
        role: Role.EMPLOYEE,
        currentSeniorityLevel: 'Developer',
        missionBoardId: 'emp1-inbox-001',
      },
    });
    employee1Id = emp1.id;

    // Create employee 2 (will have pending suggestions in multiple projects)
    const emp2 = await prisma.profile.create({
      data: {
        name: 'Bob Developer',
        email: 'bob-inbox@test.com',
        password: await hashPassword('password123'),
        role: Role.EMPLOYEE,
        currentSeniorityLevel: 'Developer',
        missionBoardId: 'emp2-inbox-001',
      },
    });
    employee2Id = emp2.id;

    // Create project 1 with tech lead
    const proj1 = await prisma.project.create({
      data: {
        name: 'Alpha Project',
        missionBoardId: 'proj1-inbox-001',
        techLeadId: techLeadId,
      },
    });
    project1Id = proj1.id;

    // Create project 2 (different tech lead, for admin-only testing)
    const proj2 = await prisma.project.create({
      data: {
        name: 'Beta Project',
        missionBoardId: 'proj2-inbox-001',
        techLeadId: adminId, // Admin is tech lead here
      },
    });
    project2Id = proj2.id;

    // Create assignment: employee1 in project1
    await prisma.assignment.create({
      data: {
        profileId: employee1Id,
        projectId: project1Id,
        missionBoardId: 'assign1-inbox-001',
        role: 'Frontend Developer',
        tags: ['React-Inbox'],
      },
    });

    // Create assignment: employee2 in project1
    await prisma.assignment.create({
      data: {
        profileId: employee2Id,
        projectId: project1Id,
        missionBoardId: 'assign2-inbox-001',
        role: 'Full Stack Developer',
        tags: ['React-Inbox', 'Node.js-Inbox'],
      },
    });

    // Create assignment: employee2 in project2 (multi-project employee)
    await prisma.assignment.create({
      data: {
        profileId: employee2Id,
        projectId: project2Id,
        missionBoardId: 'assign3-inbox-001',
        role: 'Backend Developer',
        tags: ['Node.js-Inbox'],
      },
    });

    // Create existing skill for employee1 (to test currentProficiency)
    await prisma.employeeSkill.create({
      data: {
        profileId: employee1Id,
        skillId: skill1Id,
        proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
        validatedAt: new Date(),
        validatedById: techLeadId,
      },
    });

    // Create PENDING suggestions for employee1 in project1
    await prisma.suggestion.create({
      data: {
        profileId: employee1Id,
        skillId: skill1Id,
        suggestedProficiency: ProficiencyLevel.ADVANCED,
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SELF_REPORT,
      },
    });

    await prisma.suggestion.create({
      data: {
        profileId: employee1Id,
        skillId: skill2Id,
        suggestedProficiency: ProficiencyLevel.NOVICE,
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SYSTEM_FLAG,
      },
    });

    // Create PENDING suggestions for employee2 in project1
    await prisma.suggestion.create({
      data: {
        profileId: employee2Id,
        skillId: skill1Id,
        suggestedProficiency: ProficiencyLevel.EXPERT,
        status: SuggestionStatus.PENDING,
        source: SuggestionSource.SELF_REPORT,
      },
    });

    // Create APPROVED suggestion (should NOT appear in inbox)
    await prisma.suggestion.create({
      data: {
        profileId: employee2Id,
        skillId: skill2Id,
        suggestedProficiency: ProficiencyLevel.ADVANCED,
        status: SuggestionStatus.APPROVED,
        source: SuggestionSource.SELF_REPORT,
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
            email: 'employee-inbox@test.com',
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
            email: 'techlead-inbox@test.com',
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
            email: 'admin-inbox@test.com',
            password: 'password123',
          },
        },
      });
    adminToken = adminLogin.body.data.login.accessToken;
  });

  afterAll(async () => {
    // Clean up test data in correct order
    await prisma.suggestion.deleteMany({
      where: {
        profileId: {
          in: [employee1Id, employee2Id],
        },
      },
    });
    await prisma.employeeSkill.deleteMany({
      where: {
        profileId: {
          in: [employee1Id, employee2Id],
        },
      },
    });
    await prisma.assignment.deleteMany({
      where: {
        projectId: {
          in: [project1Id, project2Id],
        },
      },
    });
    await prisma.project.delete({ where: { id: project1Id } }).catch(() => {});
    await prisma.project.delete({ where: { id: project2Id } }).catch(() => {});
    await prisma.profile.delete({ where: { id: employeeId } }).catch(() => {});
    await prisma.profile.delete({ where: { id: techLeadId } }).catch(() => {});
    await prisma.profile.delete({ where: { id: adminId } }).catch(() => {});
    await prisma.profile.delete({ where: { id: employee1Id } }).catch(() => {});
    await prisma.profile.delete({ where: { id: employee2Id } }).catch(() => {});
    await prisma.skill.delete({ where: { id: skill1Id } }).catch(() => {});
    await prisma.skill.delete({ where: { id: skill2Id } }).catch(() => {});
    await app.close();
  });

  describe('Authorization - EMPLOYEE Role', () => {
    it('should deny EMPLOYEE access with ForbiddenException', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          query: `
            query GetValidationInbox {
              getValidationInbox {
                projects {
                  projectId
                  projectName
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
      expect(response.body.errors[0].message).toContain(
        'You do not have permission to access the validation inbox',
      );
    });
  });

  describe('Authorization - TECH_LEAD Role', () => {
    it('should allow TECH_LEAD to see only their own projects with pending suggestions', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${techLeadToken}`)
        .send({
          query: `
            query GetValidationInbox {
              getValidationInbox {
                projects {
                  projectId
                  projectName
                  pendingSuggestionsCount
                  employees {
                    employeeId
                    employeeName
                    employeeEmail
                    pendingSuggestionsCount
                  }
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const inbox = response.body.data.getValidationInbox;

      // Should only see project1 (Alpha Project) where they are tech lead
      expect(inbox.projects).toHaveLength(1);
      expect(inbox.projects[0].projectName).toBe('Alpha Project');
      expect(inbox.projects[0].projectId).toBe(project1Id);

      // Should see both employees with pending suggestions
      expect(inbox.projects[0].employees.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Authorization - ADMIN Role', () => {
    it('should allow ADMIN to see all projects with pending suggestions', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            query GetValidationInbox {
              getValidationInbox {
                projects {
                  projectId
                  projectName
                  pendingSuggestionsCount
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const inbox = response.body.data.getValidationInbox;

      // Should see project1 (Alpha Project) with pending suggestions
      // Note: May also see project2 if there are pending suggestions there
      expect(inbox.projects.length).toBeGreaterThanOrEqual(1);
      const alphaProject = inbox.projects.find(
        (p: any) => p.projectName === 'Alpha Project',
      );
      expect(alphaProject).toBeDefined();
    });
  });

  describe('Data Filtering - Only Pending Suggestions', () => {
    it('should exclude projects with no pending suggestions', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            query GetValidationInbox {
              getValidationInbox {
                projects {
                  projectName
                  employees {
                    employeeName
                  }
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const inbox = response.body.data.getValidationInbox;

      // All returned projects should have at least one employee with pending suggestions
      inbox.projects.forEach((project: any) => {
        expect(project.employees.length).toBeGreaterThan(0);
      });
    });

    it('should exclude employees with no pending suggestions within a project', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${techLeadToken}`)
        .send({
          query: `
            query GetValidationInbox {
              getValidationInbox {
                projects {
                  projectName
                  employees {
                    employeeName
                    pendingSuggestionsCount
                  }
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const inbox = response.body.data.getValidationInbox;

      // All returned employees should have at least 1 pending suggestion
      inbox.projects.forEach((project: any) => {
        project.employees.forEach((employee: any) => {
          expect(employee.pendingSuggestionsCount).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Current Proficiency Lookup', () => {
    it('should return current proficiency when EmployeeSkill exists', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${techLeadToken}`)
        .send({
          query: `
            query GetValidationInbox {
              getValidationInbox {
                projects {
                  employees {
                    employeeName
                    suggestions {
                      skillName
                      suggestedProficiency
                      currentProficiency
                    }
                  }
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const inbox = response.body.data.getValidationInbox;

      // Find Alice Developer's React-Inbox suggestion
      const aliceEmployee = inbox.projects[0].employees.find(
        (e: any) => e.employeeName === 'Alice Developer',
      );
      expect(aliceEmployee).toBeDefined();

      const reactSuggestion = aliceEmployee.suggestions.find(
        (s: any) => s.skillName === 'React-Inbox',
      );
      expect(reactSuggestion).toBeDefined();
      expect(reactSuggestion.currentProficiency).toBe('INTERMEDIATE');
      expect(reactSuggestion.suggestedProficiency).toBe('ADVANCED');
    });

    it('should return null for currentProficiency when EmployeeSkill does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${techLeadToken}`)
        .send({
          query: `
            query GetValidationInbox {
              getValidationInbox {
                projects {
                  employees {
                    employeeName
                    suggestions {
                      skillName
                      currentProficiency
                    }
                  }
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const inbox = response.body.data.getValidationInbox;

      // Find Alice Developer's Node.js-Inbox suggestion (no existing skill)
      const aliceEmployee = inbox.projects[0].employees.find(
        (e: any) => e.employeeName === 'Alice Developer',
      );
      expect(aliceEmployee).toBeDefined();

      const nodeSuggestion = aliceEmployee.suggestions.find(
        (s: any) => s.skillName === 'Node.js-Inbox',
      );
      expect(nodeSuggestion).toBeDefined();
      expect(nodeSuggestion.currentProficiency).toBeNull();
    });
  });

  describe('Hierarchical Data Structure', () => {
    it('should return complete 3-level hierarchy (Projects → Employees → Suggestions)', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${techLeadToken}`)
        .send({
          query: `
            query GetValidationInbox {
              getValidationInbox {
                projects {
                  projectId
                  projectName
                  pendingSuggestionsCount
                  employees {
                    employeeId
                    employeeName
                    employeeEmail
                    pendingSuggestionsCount
                    suggestions {
                      id
                      skillName
                      discipline
                      suggestedProficiency
                      source
                      createdAt
                      currentProficiency
                    }
                  }
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const inbox = response.body.data.getValidationInbox;

      // Verify Level 1: Projects
      expect(Array.isArray(inbox.projects)).toBe(true);
      expect(inbox.projects.length).toBeGreaterThan(0);
      const project = inbox.projects[0];
      expect(project.projectId).toBeDefined();
      expect(project.projectName).toBeDefined();
      expect(project.pendingSuggestionsCount).toBeGreaterThan(0);

      // Verify Level 2: Employees
      expect(Array.isArray(project.employees)).toBe(true);
      expect(project.employees.length).toBeGreaterThan(0);
      const employee = project.employees[0];
      expect(employee.employeeId).toBeDefined();
      expect(employee.employeeName).toBeDefined();
      expect(employee.employeeEmail).toBeDefined();
      expect(employee.pendingSuggestionsCount).toBeGreaterThan(0);

      // Verify Level 3: Suggestions
      expect(Array.isArray(employee.suggestions)).toBe(true);
      expect(employee.suggestions.length).toBeGreaterThan(0);
      const suggestion = employee.suggestions[0];
      expect(suggestion.id).toBeDefined();
      expect(suggestion.skillName).toBeDefined();
      expect(suggestion.discipline).toBeDefined();
      expect(suggestion.suggestedProficiency).toBeDefined();
      expect(suggestion.source).toBeDefined();
      expect(suggestion.createdAt).toBeDefined();
    });
  });

  describe('Sorting', () => {
    it('should sort projects alphabetically by name', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            query GetValidationInbox {
              getValidationInbox {
                projects {
                  projectName
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const inbox = response.body.data.getValidationInbox;

      if (inbox.projects.length > 1) {
        const projectNames = inbox.projects.map((p: any) => p.projectName);
        // Use localeCompare for sorting to match service implementation
        const sortedNames = [...projectNames].sort((a, b) => a.localeCompare(b));
        expect(projectNames).toEqual(sortedNames);
      }
    });

    it('should sort employees alphabetically by name within projects', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${techLeadToken}`)
        .send({
          query: `
            query GetValidationInbox {
              getValidationInbox {
                projects {
                  employees {
                    employeeName
                  }
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const inbox = response.body.data.getValidationInbox;

      inbox.projects.forEach((project: any) => {
        if (project.employees.length > 1) {
          const employeeNames = project.employees.map((e: any) => e.employeeName);
          // Use localeCompare for sorting to match service implementation
          const sortedNames = [...employeeNames].sort((a, b) => a.localeCompare(b));
          expect(employeeNames).toEqual(sortedNames);
        }
      });
    });
  });

  describe('Suggestion Count Aggregation', () => {
    it('should correctly count pending suggestions at project level', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${techLeadToken}`)
        .send({
          query: `
            query GetValidationInbox {
              getValidationInbox {
                projects {
                  projectName
                  pendingSuggestionsCount
                  employees {
                    pendingSuggestionsCount
                  }
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const inbox = response.body.data.getValidationInbox;

      inbox.projects.forEach((project: any) => {
        const employeeTotalCount = project.employees.reduce(
          (sum: number, emp: any) => sum + emp.pendingSuggestionsCount,
          0,
        );
        expect(project.pendingSuggestionsCount).toBe(employeeTotalCount);
      });
    });

    it('should correctly count pending suggestions at employee level', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${techLeadToken}`)
        .send({
          query: `
            query GetValidationInbox {
              getValidationInbox {
                projects {
                  employees {
                    employeeName
                    pendingSuggestionsCount
                    suggestions {
                      id
                    }
                  }
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const inbox = response.body.data.getValidationInbox;

      inbox.projects.forEach((project: any) => {
        project.employees.forEach((employee: any) => {
          expect(employee.pendingSuggestionsCount).toBe(
            employee.suggestions.length,
          );
        });
      });
    });
  });

  describe('Empty State Handling', () => {
    it('should return empty projects array when no pending suggestions exist', async () => {
      // Create a new tech lead with a project but no pending suggestions
      const emptyTechLead = await prisma.profile.create({
        data: {
          name: 'Empty Tech Lead',
          email: 'empty-techlead@test.com',
          password: await hashPassword('password123'),
          role: Role.TECH_LEAD,
          currentSeniorityLevel: 'Senior Developer',
          missionBoardId: 'empty-lead-001',
        },
      });

      const emptyProject = await prisma.project.create({
        data: {
          name: 'Empty Project',
          missionBoardId: 'empty-proj-001',
          techLeadId: emptyTechLead.id,
        },
      });

      // Login as empty tech lead
      const emptyLogin = await request(app.getHttpServer())
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
              email: 'empty-techlead@test.com',
              password: 'password123',
            },
          },
        });
      const emptyToken = emptyLogin.body.data.login.accessToken;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${emptyToken}`)
        .send({
          query: `
            query GetValidationInbox {
              getValidationInbox {
                projects {
                  projectName
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const inbox = response.body.data.getValidationInbox;
      expect(inbox.projects).toEqual([]);

      // Cleanup
      await prisma.project.delete({ where: { id: emptyProject.id } });
      await prisma.profile.delete({ where: { id: emptyTechLead.id } });
    });
  });

  describe('Error Handling', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetValidationInbox {
              getValidationInbox {
                projects {
                  projectName
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
    });
  });
});
