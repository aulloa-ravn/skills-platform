# Task Breakdown: Employee Profile API

## Overview
Total Task Groups: 4
Estimated Complexity: Medium (M)

## Task List

### GraphQL DTOs and Schema Layer

#### Task Group 1: Response Type Definitions
**Dependencies:** None

- [ ] 1.0 Complete GraphQL DTO layer
  - [ ] 1.1 Write 2-8 focused tests for GraphQL response types
    - Limit to 2-8 highly focused tests maximum
    - Test only critical DTO structure validation (e.g., required fields present, enum registration, nested object structure)
    - Skip exhaustive testing of all field combinations and edge cases
  - [ ] 1.2 Register Prisma enums for GraphQL
    - Register `ProficiencyLevel` enum using `registerEnumType` pattern
    - Register `Discipline` enum using `registerEnumType` pattern
    - Follow pattern from `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/auth/dto/login.response.ts`
  - [ ] 1.3 Create profile header response DTO
    - File: `apps/api/src/profile/dto/profile.response.ts`
    - Create `ProfileResponse` ObjectType with fields: id, name, email, currentSeniorityLevel, avatarUrl (nullable)
    - Create nested ObjectTypes for complex structures (to be used in subsequent sub-tasks)
  - [ ] 1.4 Create validated skills response DTOs
    - In same file: `apps/api/src/profile/dto/profile.response.ts`
    - Create `ValidatorInfo` ObjectType with fields: id (nullable), name (nullable)
    - Create `ValidatedSkillResponse` ObjectType with fields:
      - skillName: String
      - discipline: Discipline enum
      - proficiencyLevel: ProficiencyLevel enum
      - validatedAt: DateTime (use GraphQLISODateTime scalar)
      - validator: ValidatorInfo (nullable)
  - [ ] 1.5 Create pending skills response DTO
    - In same file: `apps/api/src/profile/dto/profile.response.ts`
    - Create `PendingSkillResponse` ObjectType with fields:
      - skillName: String
      - discipline: Discipline enum
      - suggestedProficiency: ProficiencyLevel enum
      - createdAt: DateTime (use GraphQLISODateTime scalar)
  - [ ] 1.6 Create skills tiers response DTO
    - In same file: `apps/api/src/profile/dto/profile.response.ts`
    - Create `SkillsTiersResponse` ObjectType with fields:
      - coreStack: [ValidatedSkillResponse] array
      - validatedInventory: [ValidatedSkillResponse] array
      - pending: [PendingSkillResponse] array
  - [ ] 1.7 Create seniority history response DTO
    - In same file: `apps/api/src/profile/dto/profile.response.ts`
    - Create `SeniorityHistoryResponse` ObjectType with fields:
      - seniorityLevel: String
      - effectiveDate: DateTime
      - createdBy: ValidatorInfo (nullable, reuse ValidatorInfo type for creator)
  - [ ] 1.8 Create assignment response DTOs
    - In same file: `apps/api/src/profile/dto/profile.response.ts`
    - Create `TechLeadInfo` ObjectType with fields: id (nullable), name (nullable), email (nullable)
    - Create `CurrentAssignmentResponse` ObjectType with fields:
      - projectName: String
      - role: String
      - tags: [String] array
      - techLead: TechLeadInfo (nullable)
  - [ ] 1.9 Add collections to main ProfileResponse
    - Update `ProfileResponse` ObjectType to include:
      - skills: SkillsTiersResponse
      - seniorityHistory: [SeniorityHistoryResponse] array
      - currentAssignments: [CurrentAssignmentResponse] array
  - [ ] 1.10 Ensure DTO layer tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify enum registration works
    - Verify nested object types are properly structured
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- All Prisma enums are registered for GraphQL
- All response DTOs are properly decorated with @ObjectType and @Field
- Nested object structures are correctly defined
- GraphQL schema generates without errors

### Service Layer - Authorization and Data Fetching

#### Task Group 2: Profile Service Implementation
**Dependencies:** Task Group 1

- [ ] 2.0 Complete profile service layer
  - [ ] 2.1 Write 2-8 focused tests for profile service
    - Limit to 2-8 highly focused tests maximum
    - Test only critical service behaviors:
      - Authorization check for EMPLOYEE role (can only access own profile)
      - Authorization check for TECH_LEAD role (can access team member profiles)
      - Authorization check for ADMIN role (can access any profile)
      - Profile not found scenario
      - Skills tiering logic (Core Stack vs Validated Inventory partitioning)
    - Skip exhaustive testing of all service methods and data scenarios
  - [ ] 2.2 Create profile module structure
    - Create directory: `apps/api/src/profile/`
    - Create `profile.module.ts` with:
      - Import PrismaModule
      - Import AuthModule
      - Provide ProfileService
      - Export ProfileService (for potential future use)
    - Register ProfileModule in `apps/api/src/app.module.ts` imports array
  - [ ] 2.3 Create profile service with authorization logic
    - Create file: `apps/api/src/profile/profile.service.ts`
    - Inject PrismaService via constructor
    - Implement private helper method `checkAuthorization(userId: string, userRole: Role, requestedProfileId: string): Promise<void>`
      - EMPLOYEE: Verify userId === requestedProfileId, throw ForbiddenException if not
      - TECH_LEAD: Query projects where techLeadId === userId, then check if requested profile has assignments in those projects
        - Use Prisma query: `prisma.assignment.findFirst({ where: { profileId: requestedProfileId, project: { techLeadId: userId } } })`
        - Throw ForbiddenException if no matching assignment found
      - ADMIN: No restrictions, return immediately
      - ForbiddenException format: `throw new ForbiddenException({ message: 'You do not have permission to view this profile', extensions: { code: 'FORBIDDEN' } })`
  - [ ] 2.4 Implement profile header data fetching
    - In ProfileService, create method `getProfile(userId: string, userRole: Role, profileId: string): Promise<ProfileResponse>`
    - Check profile exists using `prisma.profile.findUnique({ where: { id: profileId }, select: { id, name, email, currentSeniorityLevel, avatarUrl } })`
    - Throw NotFoundException if profile not found: `throw new NotFoundException({ message: 'Profile not found', extensions: { code: 'NOT_FOUND' } })`
    - Call checkAuthorization helper method
    - Map profile header fields to ProfileResponse DTO
  - [ ] 2.5 Implement skills tiering logic
    - In ProfileService, create private helper method `getSkillsTiers(profileId: string): Promise<SkillsTiersResponse>`
    - Fetch current assignments: `prisma.assignment.findMany({ where: { profileId }, select: { tags: true } })`
    - Extract all tags from assignments and create Set for O(1) lookup
    - Fetch validated skills: `prisma.employeeSkill.findMany({ where: { profileId }, include: { skill: true, validatedBy: { select: { id, name } } } })`
    - Partition validated skills into coreStack (tag matches) and validatedInventory (no tag match)
    - Fetch pending skills: `prisma.suggestion.findMany({ where: { profileId, status: 'PENDING' }, include: { skill: true } })`
    - Map each tier to appropriate response DTOs
    - Return SkillsTiersResponse with all three tiers
  - [ ] 2.6 Implement seniority history fetching
    - In ProfileService, create private helper method `getSeniorityHistory(profileId: string): Promise<SeniorityHistoryResponse[]>`
    - Query: `prisma.seniorityHistory.findMany({ where: { profileId }, include: { createdBy: { select: { id, name } } }, orderBy: { effectiveDate: 'desc' } })`
    - Map to SeniorityHistoryResponse DTOs
    - Handle nullable createdBy relation gracefully
  - [ ] 2.7 Implement current assignments fetching
    - In ProfileService, create private helper method `getCurrentAssignments(profileId: string): Promise<CurrentAssignmentResponse[]>`
    - Query: `prisma.assignment.findMany({ where: { profileId }, include: { project: { include: { techLead: { select: { id, name, email } } } } } })`
    - Map to CurrentAssignmentResponse DTOs with nested TechLeadInfo
    - Handle nullable techLeadId in Project model
  - [ ] 2.8 Integrate all data in getProfile method
    - Call all helper methods (getSkillsTiers, getSeniorityHistory, getCurrentAssignments)
    - Combine results into complete ProfileResponse DTO
    - Return fully populated ProfileResponse
  - [ ] 2.9 Ensure service layer tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify authorization logic works for all roles
    - Verify skills tiering logic correctly partitions Core Stack vs Validated Inventory
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- Authorization logic correctly enforces EMPLOYEE, TECH_LEAD, and ADMIN permissions
- Profile not found throws NotFoundException with code 'NOT_FOUND'
- Unauthorized access throws ForbiddenException with code 'FORBIDDEN'
- Skills are correctly partitioned into three tiers (Core Stack, Validated Inventory, Pending)
- Seniority history is sorted by effectiveDate descending
- All Prisma queries use efficient joins with include/select
- Nullable relations are handled gracefully

### GraphQL Resolver Layer

#### Task Group 3: Profile Resolver Implementation
**Dependencies:** Task Group 2

- [ ] 3.0 Complete GraphQL resolver layer
  - [ ] 3.1 Write 2-8 focused tests for resolver layer
    - Limit to 2-8 highly focused tests maximum
    - Test only critical resolver behaviors:
      - Query with valid authentication returns profile data
      - Query without authentication is rejected (if not using global guard)
      - Query with invalid profileId returns error
      - CurrentUser decorator correctly extracts user info from JWT
    - Skip exhaustive testing of all resolver scenarios
  - [ ] 3.2 Create profile resolver
    - Create file: `apps/api/src/profile/profile.resolver.ts`
    - Add `@Resolver()` class decorator
    - Inject ProfileService via constructor
  - [ ] 3.3 Implement getProfile query
    - Add `@Query(() => ProfileResponse)` decorator
    - Use `@UseGuards(JwtAuthGuard)` if not using global guard (check app.module.ts for global guard configuration)
    - Use `@CurrentUser()` decorator to extract authenticated user
    - Use `@Args('id')` decorator to extract profileId parameter
    - Method signature: `async getProfile(@CurrentUser() user: CurrentUserType, @Args('id') profileId: string): Promise<ProfileResponse>`
    - Call `profileService.getProfile(user.id, user.role, profileId)`
    - Return result directly (service handles all error cases)
  - [ ] 3.4 Register resolver in ProfileModule
    - Update `apps/api/src/profile/profile.module.ts`
    - Add ProfileResolver to providers array
  - [ ] 3.5 Ensure resolver layer tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify query accepts profileId argument
    - Verify CurrentUser decorator extracts user correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- GraphQL query `getProfile(id: String!)` is accessible via GraphQL playground
- Query requires authentication (JWT guard applied)
- Query returns complete ProfileResponse with all nested data
- CurrentUser decorator correctly extracts user info from JWT token
- Resolver delegates business logic to ProfileService

### Testing and Integration

#### Task Group 4: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-3

- [ ] 4.0 Review existing tests and fill critical gaps only
  - [ ] 4.1 Review tests from Task Groups 1-3
    - Review the 2-8 tests written for DTO layer (Task 1.1)
    - Review the 2-8 tests written for service layer (Task 2.1)
    - Review the 2-8 tests written for resolver layer (Task 3.1)
    - Total existing tests: approximately 6-24 tests
  - [ ] 4.2 Analyze test coverage gaps for Employee Profile API feature only
    - Identify critical user workflows that lack test coverage:
      - End-to-end query test with real database (may require test database setup)
      - Integration test for skills tiering with actual assignment data
      - Edge case: Profile with no validated skills
      - Edge case: Profile with no pending suggestions
      - Edge case: Profile with no assignments
      - Edge case: TECH_LEAD viewing profile outside their team
      - Error handling: Malformed profileId
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
  - [ ] 4.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points and end-to-end workflows:
      - Full query execution with authentication (E2E test)
      - Skills tiering with real assignment tags (integration test)
      - Authorization boundary tests (TECH_LEAD access validation)
      - Empty data scenarios (no skills, no assignments, no history)
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases not critical to business functionality
  - [ ] 4.4 Manual GraphQL playground testing
    - Start API server and open GraphQL playground
    - Test getProfile query with different user roles:
      - Login as EMPLOYEE, query own profile (should succeed)
      - Login as EMPLOYEE, query another profile (should fail with FORBIDDEN)
      - Login as TECH_LEAD, query team member profile (should succeed)
      - Login as TECH_LEAD, query non-team member profile (should fail with FORBIDDEN)
      - Login as ADMIN, query any profile (should succeed)
    - Verify response structure matches ProfileResponse DTO
    - Verify skills are correctly organized into three tiers
    - Verify seniority history is sorted by effectiveDate descending
    - Verify Tech Lead information is included in assignments
  - [ ] 4.5 Run feature-specific tests only
    - Run ONLY tests related to Employee Profile API feature (tests from 1.1, 2.1, 3.1, and 4.3)
    - Expected total: approximately 16-34 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass
    - Fix any failures before marking feature complete

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 16-34 tests total)
- Critical user workflows for Employee Profile API are covered
- No more than 10 additional tests added when filling in testing gaps
- Manual GraphQL playground testing confirms all authorization scenarios work
- Query returns correct data structure matching ProfileResponse DTO
- Skills tiering logic works correctly with real data
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:
1. **GraphQL DTOs and Schema Layer** (Task Group 1) - Define all response types and register enums
2. **Service Layer** (Task Group 2) - Implement authorization and data fetching logic
3. **Resolver Layer** (Task Group 3) - Wire up GraphQL query to service
4. **Testing and Integration** (Task Group 4) - Fill test gaps and validate end-to-end

## Technical Notes

**Key File Locations:**
- GraphQL DTOs: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/dto/profile.response.ts`
- Profile Service: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/profile.service.ts`
- Profile Resolver: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/profile.resolver.ts`
- Profile Module: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/profile.module.ts`
- Prisma Schema: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/prisma/schema.prisma`

**Existing Patterns to Follow:**
- Auth resolver pattern: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/auth/auth.resolver.ts`
- DTO pattern: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/auth/dto/login.response.ts`
- Service pattern: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/auth/auth.service.ts`
- Error handling: Use NestJS exceptions with extensions object (see auth.service.ts lines 117-122, 172-177)

**Database Models Involved:**
- Profile (main entity)
- EmployeeSkill (validated skills)
- Skill (skill taxonomy)
- Suggestion (pending skills)
- Assignment (current assignments)
- Project (for Tech Lead info)
- SeniorityHistory (seniority timeline)

**Authorization Matrix:**
| Role | Can Access |
|------|------------|
| EMPLOYEE | Only their own profile (userId === profileId) |
| TECH_LEAD | Profiles of employees assigned to projects they lead |
| ADMIN | Any profile without restrictions |

**Skills Tiering Algorithm:**
1. Fetch all current assignments for profile
2. Extract all tags from assignments into a Set
3. Fetch all validated EmployeeSkill records
4. Partition validated skills:
   - **Core Stack**: Skill name matches any assignment tag
   - **Validated Inventory**: All other validated skills
5. Fetch all Suggestion records with status === 'PENDING'
   - **Pending**: Map to PendingSkillResponse

**Error Codes:**
- `NOT_FOUND`: Profile does not exist
- `FORBIDDEN`: User does not have permission to view profile
- `UNAUTHORIZED`: Invalid or missing JWT token (handled by auth guard)
