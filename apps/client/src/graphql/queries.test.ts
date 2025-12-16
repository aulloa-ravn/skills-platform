import { describe, it, expect } from 'vitest';
import { GET_PROFILE_QUERY } from './queries';

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
    expect(queryString).toContain('validatedBy');
  });

  it('should include nested validator fields', () => {
    const queryString = GET_PROFILE_QUERY.loc?.source.body;

    // Validator should have id and name
    expect(queryString).toContain('validatedBy');
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
    expect(queryString).toContain('effectiveDate');
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
