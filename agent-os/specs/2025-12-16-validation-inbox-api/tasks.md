# Task Breakdown: Validation Inbox API

## Overview
Total Tasks: 4 Task Groups
Feature: GraphQL query returning hierarchical inbox data (Projects → Employees → Suggestions) filtered by role-based authorization

## Task List

### API Layer

#### Task Group 1: GraphQL DTOs and Response Types
**Dependencies:** None

- [x] 1.0 Complete GraphQL response type definitions
  - [x] 1.1 Write 2-8 focused tests for DTO structure validation
    - Limit to 2-8 highly focused tests maximum
    - Test only critical DTO behaviors (e.g., enum registration, field nullability, type validation)
    - Skip exhaustive testing of all field combinations
  - [x] 1.2 Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/dto/inbox.response.ts`
    - Register enums: `SuggestionSource`, `SuggestionStatus` (in addition to existing `ProficiencyLevel`, `Discipline`)
    - Create `PendingSuggestion` ObjectType:
      - Fields: `id` (String), `skillName` (String), `discipline` (Discipline enum), `suggestedProficiency` (ProficiencyLevel enum), `source` (SuggestionSource enum), `createdAt` (GraphQLISODateTime), `currentProficiency` (ProficiencyLevel enum, nullable)
    - Create `EmployeeInbox` ObjectType:
      - Fields: `employeeId` (String), `employeeName` (String), `employeeEmail` (String), `pendingSuggestionsCount` (Int), `suggestions` (array of PendingSuggestion)
    - Create `ProjectInbox` ObjectType:
      - Fields: `projectId` (String), `projectName` (String), `pendingSuggestionsCount` (Int), `employees` (array of EmployeeInbox)
    - Create `InboxResponse` ObjectType:
      - Fields: `projects` (array of ProjectInbox)
    - Follow pattern from: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/dto/profile.response.ts`
  - [x] 1.3 Ensure DTO tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify enum registration works correctly
    - Verify nullable fields are properly configured
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- All ObjectTypes properly decorated with @ObjectType()
- All fields properly decorated with @Field() and correct types
- Enums registered using registerEnumType pattern
- GraphQLISODateTime used for date fields
- Nullable fields marked with { nullable: true }

#### Task Group 2: Inbox Service Layer
**Dependencies:** Task Group 1

- [x] 2.0 Complete inbox business logic service
  - [x] 2.1 Write 2-8 focused tests for InboxService
    - Limit to 2-8 highly focused tests maximum
    - Test only critical service behaviors:
      - Authorization check for EMPLOYEE role (should throw ForbiddenException)
      - TECH_LEAD filtering by techLeadId
      - ADMIN no filtering (returns all projects)
      - Current proficiency lookup logic (exists vs null)
      - Empty state handling (no pending suggestions)
    - Mock PrismaService using Jest mocks
    - Skip exhaustive testing of all data transformation scenarios
  - [x] 2.2 Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/inbox.service.ts`
    - Injectable service class with PrismaService constructor injection
    - Implement main method: `getValidationInbox(userId: string, userRole: Role): Promise<InboxResponse>`
    - Implement private method: `checkAuthorization(userRole: Role): void`
      - EMPLOYEE role: throw ForbiddenException with message "You do not have permission to access the validation inbox" and extensions code 'FORBIDDEN'
      - TECH_LEAD and ADMIN: return (allow access)
      - Follow pattern from: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/profile.service.ts` checkAuthorization method
    - Implement private method: `buildProjectsQuery(userId: string, userRole: Role)`
      - For TECH_LEAD: return `{ techLeadId: userId, assignments: { some: { profile: { suggestions: { some: { status: 'PENDING' } } } } } }`
      - For ADMIN: return `{ assignments: { some: { profile: { suggestions: { some: { status: 'PENDING' } } } } } }`
      - This ensures only projects with pending suggestions are returned
    - Implement main Prisma query in `getValidationInbox`:
      - Query: `prisma.project.findMany({ where: buildProjectsQuery(), include: { assignments: { include: { profile: { include: { suggestions: { where: { status: 'PENDING' }, include: { skill: true } }, employeeSkills: true } } } } }, orderBy: { name: 'asc' } })`
      - This fetches projects with nested assignments, profiles, pending suggestions, skills, and employee skills in one query
    - Implement private method: `transformToInboxResponse(projects: Project[]): InboxResponse`
      - Transform Prisma result into hierarchical DTO structure
      - For each project: create ProjectInbox with id, name, and count of all pending suggestions across all employees
      - For each employee in project: create EmployeeInbox with id, name, email, and count of pending suggestions for this employee in this project
      - For each suggestion: create PendingSuggestion with id, skill name, discipline, suggested proficiency, source, created date
      - Lookup current proficiency: find EmployeeSkill where profileId === employee.id AND skillId === suggestion.skillId, return proficiencyLevel or null
      - Filter out employees with zero pending suggestions
      - Sort employees alphabetically by name within each project
    - Follow async/await pattern for all database operations
  - [x] 2.3 Ensure InboxService tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify authorization logic works for all roles
    - Verify Prisma query structure is correct (via mocks)
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- Authorization correctly denies EMPLOYEE role
- TECH_LEAD filtering applies techLeadId constraint
- ADMIN filtering returns all projects
- Prisma query uses efficient nested includes
- Current proficiency lookup implemented correctly
- Data transformation produces correct hierarchical structure
- Empty arrays returned when no pending suggestions exist

#### Task Group 3: GraphQL Resolver
**Dependencies:** Task Group 2

- [x] 3.0 Complete GraphQL resolver
  - [x] 3.1 Write 2-8 focused tests for InboxResolver
    - Limit to 2-8 highly focused tests maximum
    - Test only critical resolver behaviors:
      - JWT guard is applied (verify @UseGuards decorator)
      - CurrentUser decorator extracts user correctly
      - Service method is called with correct parameters
      - Query returns InboxResponse type
    - Mock InboxService using Jest mocks
    - Skip exhaustive testing of all user scenarios
  - [x] 3.2 Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/inbox.resolver.ts`
    - @Resolver() decorator on class
    - Constructor inject InboxService
    - Implement query method with decorators:
      - `@Query(() => InboxResponse)`
      - `@UseGuards(JwtAuthGuard)`
      - Method: `async getValidationInbox(@CurrentUser() user: CurrentUserType): Promise<InboxResponse>`
    - Method implementation: `return this.inboxService.getValidationInbox(user.id, user.role);`
    - Import CurrentUser decorator from: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/auth/decorators/current-user.decorator.ts`
    - Import JwtAuthGuard from: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/auth/guards/jwt-auth.guard.ts`
    - Follow pattern from: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/profile.resolver.ts`
  - [x] 3.3 Update `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/profile.module.ts`
    - Add `InboxService` to providers array
    - Add `InboxResolver` to providers array
    - Ensure PrismaModule is already imported (should be from existing ProfileModule setup)
  - [x] 3.4 Ensure InboxResolver tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify resolver properly delegates to service
    - Verify decorators are applied correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Resolver registered in ProfileModule
- JwtAuthGuard applied to protect query
- CurrentUser decorator extracts user from JWT
- Resolver delegates to service layer
- Query returns InboxResponse type

### Testing

#### Task Group 4: Integration Tests and Gap Analysis
**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 2-8 tests written for DTOs (Task 1.1)
    - Review the 2-8 tests written for InboxService (Task 2.1)
    - Review the 2-8 tests written for InboxResolver (Task 3.1)
    - Total existing tests: approximately 6-24 tests
  - [x] 4.2 Analyze test coverage gaps for THIS feature only
    - Identify critical end-to-end workflows that lack test coverage:
      - GraphQL query execution with real JWT token
      - Full data hierarchy transformation with real database data
      - Role-based filtering with actual project/assignment relationships
      - Current proficiency lookup across multiple suggestions
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize integration tests over additional unit tests
  - [x] 4.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new integration tests to fill identified critical gaps:
      - Integration test: TECH_LEAD user queries inbox, verifies only own projects returned
      - Integration test: ADMIN user queries inbox, verifies all projects returned
      - Integration test: EMPLOYEE user queries inbox, verifies ForbiddenException thrown
      - Integration test: Verify projects without pending suggestions are excluded
      - Integration test: Verify employees without pending suggestions are excluded within projects
      - Integration test: Verify current proficiency lookup returns correct values (null when no EmployeeSkill exists)
      - Integration test: Verify sorting (projects alphabetically, employees alphabetically within projects)
      - Integration test: Verify suggestion count aggregation at project and employee levels
      - Integration test: Verify empty inbox returns empty array (not error)
      - Integration test: Verify same employee appears under multiple projects if they have pending suggestions in each
    - Use real database with test data seeding
    - Use GraphQL query execution with mocked JWT authentication
    - Do NOT write comprehensive coverage for all edge cases
    - Focus on business-critical workflows only
  - [x] 4.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1, 2.1, 3.1, and 4.3)
    - Expected total: approximately 16-34 tests maximum
    - Do NOT run the entire application test suite
    - Verify all tests pass
    - Verify critical workflows for all three roles work correctly

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 16-34 tests total)
- Integration tests cover end-to-end GraphQL query execution
- Role-based authorization tested with real database relationships
- Current proficiency lookup tested with real data
- Hierarchical data transformation tested with real Prisma results
- Empty state handling tested
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:
1. API Layer - DTOs (Task Group 1): Create GraphQL response types first to define the contract
2. API Layer - Service (Task Group 2): Implement business logic and data fetching with role-based authorization
3. API Layer - Resolver (Task Group 3): Wire up GraphQL query endpoint with authentication guards
4. Integration Testing (Task Group 4): End-to-end testing with real database and GraphQL execution

## Notes

**Key Dependencies:**
- Prisma models: Project, Assignment, Profile, Suggestion, Skill, EmployeeSkill
- Existing auth system: JwtAuthGuard, CurrentUser decorator, Role enum
- Existing profile module: ProfileModule, ProfileService patterns
- Existing DTOs: Pattern for ObjectType decorators and enum registration

**Reusable Patterns:**
- Authorization pattern from ProfileService.checkAuthorization
- Nested Prisma includes from ProfileService.getSkillsTiers
- DTO structure from profile.response.ts
- Resolver structure from profile.resolver.ts
- Error handling with ForbiddenException and extensions.code

**Performance Considerations:**
- Single Prisma query with nested includes minimizes database round-trips
- Include employeeSkills in initial query to avoid N+1 lookups for current proficiency
- Filter at database level using where clauses rather than in-memory filtering
- Use indexes on profileId, skillId, status, techLeadId for query optimization

**Data Flow:**
1. GraphQL query → Resolver (with JWT guard)
2. Resolver extracts user from JWT → Service
3. Service checks authorization (throw if EMPLOYEE)
4. Service builds role-specific Prisma query (filter by techLeadId for TECH_LEAD, no filter for ADMIN)
5. Service executes query with nested includes
6. Service transforms Prisma result to hierarchical DTOs
7. Service returns InboxResponse → Resolver → GraphQL response
