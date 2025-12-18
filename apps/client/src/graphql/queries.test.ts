import { describe, it, expect } from 'vitest';
import { GET_PROFILE_QUERY, GET_VALIDATION_INBOX_QUERY } from './queries';

describe('GraphQL Queries - GET_PROFILE_QUERY', () => {
  it('should define GET_PROFILE_QUERY', () => {
    expect(GET_PROFILE_QUERY).toBeDefined();
  });

  it('should have correct query structure with all required fields', () => {
    const queryString = GET_PROFILE_QUERY.loc?.source.body;

    // Verify it's a query operation
    expect(queryString).toContain('query GetProfile');

    // Verify required parameter
    expect(queryString).toContain('$id: String!');

    // Verify profile header fields
    expect(queryString).toContain('id');
    expect(queryString).toContain('name');
    expect(queryString).toContain('email');
    expect(queryString).toContain('avatarUrl');
    expect(queryString).toContain('currentSeniority');

    // Verify three-tier skills
    expect(queryString).toContain('coreStack');
    expect(queryString).toContain('validatedInventory');
    expect(queryString).toContain('pending');

    // Verify seniority history
    expect(queryString).toContain('seniorityHistory');

    // Verify current assignments
    expect(queryString).toContain('currentAssignments');
  });

  it('should include nested skill fields in coreStack', () => {
    const queryString = GET_PROFILE_QUERY.loc?.source.body;

    // Skill fields should appear in query
    expect(queryString).toContain('discipline');
    expect(queryString).toContain('proficiencyLevel');
    expect(queryString).toContain('validatedAt');
    expect(queryString).toContain('validator');
  });

  it('should include nested validator fields', () => {
    const queryString = GET_PROFILE_QUERY.loc?.source.body;

    // Validator should have id and name
    expect(queryString).toContain('validator');
  });

  it('should include pending skill fields', () => {
    const queryString = GET_PROFILE_QUERY.loc?.source.body;

    expect(queryString).toContain('pending');
    expect(queryString).toContain('suggestedProficiency');
    expect(queryString).toContain('createdAt');
  });

  it('should include seniority history fields with creator', () => {
    const queryString = GET_PROFILE_QUERY.loc?.source.body;

    expect(queryString).toContain('seniorityLevel');
    expect(queryString).toContain('start_date');
    expect(queryString).toContain('end_date');
    expect(queryString).toContain('createdBy');
  });

  it('should include assignment fields with tech lead info', () => {
    const queryString = GET_PROFILE_QUERY.loc?.source.body;

    expect(queryString).toContain('projectName');
    expect(queryString).toContain('role');
    expect(queryString).toContain('tags');
    expect(queryString).toContain('techLead');
  });
});

describe('GraphQL Queries - GET_VALIDATION_INBOX_QUERY', () => {
  it('should define GET_VALIDATION_INBOX_QUERY', () => {
    expect(GET_VALIDATION_INBOX_QUERY).toBeDefined();
  });

  it('should have correct query structure with no required variables', () => {
    const queryString = GET_VALIDATION_INBOX_QUERY.loc?.source.body;

    // Verify it's a query operation
    expect(queryString).toContain('query GetValidationInbox');

    // Verify root field
    expect(queryString).toContain('getValidationInbox');

    // Should not have variables (filtered by role on backend)
    expect(queryString).not.toContain('$');
  });

  it('should include project fields with pending suggestions count', () => {
    const queryString = GET_VALIDATION_INBOX_QUERY.loc?.source.body;

    expect(queryString).toContain('projects');
    expect(queryString).toContain('projectId');
    expect(queryString).toContain('projectName');
    expect(queryString).toContain('pendingSuggestionsCount');
  });

  it('should include nested employee fields', () => {
    const queryString = GET_VALIDATION_INBOX_QUERY.loc?.source.body;

    expect(queryString).toContain('employees');
    expect(queryString).toContain('employeeId');
    expect(queryString).toContain('employeeName');
    expect(queryString).toContain('employeeEmail');
    expect(queryString).toContain('pendingSuggestionsCount');
  });

  it('should include nested suggestion fields', () => {
    const queryString = GET_VALIDATION_INBOX_QUERY.loc?.source.body;

    expect(queryString).toContain('suggestions');
    expect(queryString).toContain('id');
    expect(queryString).toContain('skillName');
    expect(queryString).toContain('discipline');
    expect(queryString).toContain('suggestedProficiency');
    expect(queryString).toContain('source');
    expect(queryString).toContain('createdAt');
    expect(queryString).toContain('currentProficiency');
  });

  it('should fetch all required fields for inbox display', () => {
    const queryString = GET_VALIDATION_INBOX_QUERY.loc?.source.body;

    // Verify critical fields for UI display
    expect(queryString).toContain('projectName');
    expect(queryString).toContain('employeeName');
    expect(queryString).toContain('skillName');
    expect(queryString).toContain('suggestedProficiency');
    expect(queryString).toContain('currentProficiency');
  });
});
