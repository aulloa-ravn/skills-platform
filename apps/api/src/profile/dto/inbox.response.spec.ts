import { Field, ObjectType, Int } from '@nestjs/graphql';
import {
  InboxResponse,
  ProjectInbox,
  EmployeeInbox,
  PendingSuggestion,
} from './inbox.response';
import { ProficiencyLevel, Discipline, SuggestionSource } from '@prisma/client';

describe('InboxResponse DTOs', () => {
  describe('PendingSuggestion', () => {
    it('should create a valid PendingSuggestion object with all required fields', () => {
      const suggestion: PendingSuggestion = {
        id: 'suggestion-1',
        skillName: 'React',
        discipline: Discipline.FRONTEND,
        suggestedProficiency: ProficiencyLevel.ADVANCED,
        source: SuggestionSource.SELF_REPORT,
        createdAt: new Date('2025-01-15'),
        currentProficiency: ProficiencyLevel.INTERMEDIATE,
      };

      expect(suggestion.id).toBe('suggestion-1');
      expect(suggestion.skillName).toBe('React');
      expect(suggestion.discipline).toBe(Discipline.FRONTEND);
      expect(suggestion.suggestedProficiency).toBe(ProficiencyLevel.ADVANCED);
      expect(suggestion.source).toBe(SuggestionSource.SELF_REPORT);
      expect(suggestion.currentProficiency).toBe(ProficiencyLevel.INTERMEDIATE);
    });

    it('should allow currentProficiency to be null/undefined', () => {
      const suggestion: PendingSuggestion = {
        id: 'suggestion-2',
        skillName: 'TypeScript',
        discipline: Discipline.BACKEND,
        suggestedProficiency: ProficiencyLevel.EXPERT,
        source: SuggestionSource.SYSTEM_FLAG,
        createdAt: new Date('2025-01-16'),
        currentProficiency: undefined,
      };

      expect(suggestion.currentProficiency).toBeUndefined();
    });
  });

  describe('EmployeeInbox', () => {
    it('should create a valid EmployeeInbox object with nested suggestions', () => {
      const employee: EmployeeInbox = {
        employeeId: 'emp-1',
        employeeName: 'John Doe',
        employeeEmail: 'john@ravn.com',
        pendingSuggestionsCount: 2,
        suggestions: [
          {
            id: 'suggestion-1',
            skillName: 'React',
            discipline: Discipline.FRONTEND,
            suggestedProficiency: ProficiencyLevel.ADVANCED,
            source: SuggestionSource.SELF_REPORT,
            createdAt: new Date('2025-01-15'),
            currentProficiency: ProficiencyLevel.INTERMEDIATE,
          },
        ],
      };

      expect(employee.employeeId).toBe('emp-1');
      expect(employee.employeeName).toBe('John Doe');
      expect(employee.pendingSuggestionsCount).toBe(2);
      expect(employee.suggestions).toHaveLength(1);
    });
  });

  describe('ProjectInbox', () => {
    it('should create a valid ProjectInbox object with nested employees', () => {
      const project: ProjectInbox = {
        projectId: 'proj-1',
        projectName: 'Project Alpha',
        pendingSuggestionsCount: 3,
        employees: [
          {
            employeeId: 'emp-1',
            employeeName: 'John Doe',
            employeeEmail: 'john@ravn.com',
            pendingSuggestionsCount: 2,
            suggestions: [],
          },
        ],
      };

      expect(project.projectId).toBe('proj-1');
      expect(project.projectName).toBe('Project Alpha');
      expect(project.pendingSuggestionsCount).toBe(3);
      expect(project.employees).toHaveLength(1);
    });
  });

  describe('InboxResponse', () => {
    it('should create a valid InboxResponse with nested hierarchy', () => {
      const response: InboxResponse = {
        projects: [
          {
            projectId: 'proj-1',
            projectName: 'Project Alpha',
            pendingSuggestionsCount: 2,
            employees: [
              {
                employeeId: 'emp-1',
                employeeName: 'John Doe',
                employeeEmail: 'john@ravn.com',
                pendingSuggestionsCount: 2,
                suggestions: [
                  {
                    id: 'suggestion-1',
                    skillName: 'React',
                    discipline: Discipline.FRONTEND,
                    suggestedProficiency: ProficiencyLevel.ADVANCED,
                    source: SuggestionSource.SELF_REPORT,
                    createdAt: new Date('2025-01-15'),
                    currentProficiency: ProficiencyLevel.INTERMEDIATE,
                  },
                ],
              },
            ],
          },
        ],
      };

      expect(response.projects).toHaveLength(1);
      expect(response.projects[0].employees).toHaveLength(1);
      expect(response.projects[0].employees[0].suggestions).toHaveLength(1);
    });

    it('should allow empty projects array', () => {
      const response: InboxResponse = {
        projects: [],
      };

      expect(response.projects).toHaveLength(0);
    });
  });
});
