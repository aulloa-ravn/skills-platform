# Task Breakdown: Admin Skills Management API

## Overview
Total Task Groups: 3
Estimated Total Tasks: 16

This feature adds GraphQL Query operations (`getAllSkills` and `getSkillById`) to the existing Skills API to enable admin users to retrieve and filter skills from the canonical skills taxonomy.

## Task List

### API Layer - DTOs

#### Task Group 1: Input and Response Type Definitions
**Dependencies:** None

- [x] 1.0 Complete DTO layer for query operations
  - [x] 1.1 Write 2-4 focused tests for GetAllSkillsInput validation
    - Test that all filter fields are optional
    - Test isActive accepts boolean values or null
    - Test disciplines accepts array of Discipline enum values
    - Test searchTerm accepts string values
    - Limit to 2-4 validation tests maximum
  - [x] 1.2 Create GetAllSkillsInput DTO at `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/dto/get-all-skills.input.ts`
    - Use `@InputType()` decorator for GraphQL schema registration
    - Add three optional fields: `isActive` (Boolean nullable), `disciplines` (Discipline array nullable), `searchTerm` (String nullable)
    - Apply `@Field({ nullable: true })` decorator to all fields
    - Apply `@IsOptional()` validator to all fields
    - Use `@IsBoolean()` for isActive field
    - Use `@IsEnum(Discipline, { each: true })` for disciplines array field
    - Use `@IsString()` for searchTerm field
    - Import Discipline enum from `@prisma/client`
    - Follow pattern from `update-skill.input.ts` for optional field structure
  - [x] 1.3 Verify existing Skill response type at `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/dto/skill.response.ts`
    - Confirm ObjectType includes all fields: id, name, discipline, isActive, createdAt, updatedAt
    - Confirm Discipline enum is registered for GraphQL schema
    - No modifications needed - reuse as-is for query return types
  - [x] 1.4 Ensure DTO layer tests pass
    - Run ONLY the 2-4 validation tests written in 1.1
    - Verify GetAllSkillsInput accepts optional filter fields correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-4 tests written in 1.1 pass
- GetAllSkillsInput DTO properly validates optional filter fields
- Existing Skill response type is verified and ready for reuse
- All DTOs are properly decorated for GraphQL schema

### API Layer - Service Methods

#### Task Group 2: Skills Service Query Methods
**Dependencies:** Task Group 1

- [x] 2.0 Complete service layer query methods
  - [x] 2.1 Write 4-8 focused tests for service query methods
    - Test getAllSkills returns skills sorted alphabetically by name
    - Test getAllSkills filters by isActive status (true, false, null/all)
    - Test getAllSkills filters by multiple disciplines using IN operator
    - Test getAllSkills filters by searchTerm with case-insensitive partial match
    - Test getAllSkills combines multiple filters using AND logic
    - Test getSkillById returns skill when found
    - Test getSkillById throws NotFoundException with code 'NOT_FOUND' when skill doesn't exist
    - Limit to 4-8 focused tests maximum
  - [x] 2.2 Add getAllSkills method to SkillsService at `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/skills.service.ts`
    - Method signature: `async getAllSkills(input?: GetAllSkillsInput): Promise<Skill[]>`
    - Build dynamic Prisma where clause based on provided filters
    - Apply isActive filter when provided (true for active only, false for disabled only, null/undefined for all)
    - Apply disciplines filter using Prisma `in` operator when array provided
    - Apply searchTerm filter using Prisma `contains` with `mode: 'insensitive'` for case-insensitive partial match
    - Combine multiple filters using AND logic when multiple provided
    - Use `this.prisma.skill.findMany({ where, orderBy: { name: 'asc' } })` for query
    - Return array of Skill objects sorted alphabetically by name (ascending)
    - Follow existing service method patterns from skills.service.ts
  - [x] 2.3 Add getSkillById method to SkillsService at `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/skills.service.ts`
    - Method signature: `async getSkillById(id: number): Promise<Skill>`
    - Use `this.prisma.skill.findUnique({ where: { id } })` to fetch skill
    - Throw NotFoundException with `extensions: { code: 'NOT_FOUND' }` when skill not found
    - Follow existing error handling pattern from skills.service.ts (same pattern as updateSkill, disableSkill)
    - Return single Skill object when found
  - [x] 2.4 Ensure service layer tests pass
    - Run ONLY the 4-8 tests written in 2.1
    - Verify getAllSkills filtering and sorting work correctly
    - Verify getSkillById handles found and not-found cases
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-8 tests written in 2.1 pass
- getAllSkills correctly filters by isActive, disciplines, and searchTerm
- getAllSkills returns results sorted alphabetically by name
- getAllSkills combines multiple filters using AND logic
- getSkillById returns skill or throws NOT_FOUND error appropriately
- Service methods follow existing patterns from skills.service.ts

### API Layer - GraphQL Resolvers

#### Task Group 3: Skills Resolver Query Operations
**Dependencies:** Task Group 2

- [x] 3.0 Complete GraphQL resolver query operations
  - [x] 3.1 Write 4-6 focused tests for resolver query operations
    - Test getAllSkills query requires JWT authentication (JwtAuthGuard)
    - Test getAllSkills query requires ADMIN role (returns FORBIDDEN for non-admin)
    - Test getAllSkills query delegates to service with correct input
    - Test getSkillById query requires JWT authentication and ADMIN role
    - Test getSkillById query delegates to service with correct ID parameter
    - Test getSkillById query returns NOT_FOUND error when skill doesn't exist
    - Limit to 4-6 focused tests maximum
  - [x] 3.2 Add getAllSkills Query resolver to `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/skills.resolver.ts`
    - Add method decorated with `@Query(() => [Skill], { name: 'getAllSkills' })`
    - Apply `@UseGuards(JwtAuthGuard, RolesGuard)` decorator
    - Apply `@Roles(ProfileType.ADMIN)` decorator for admin-only access
    - Accept optional input parameter: `@Args('input', { nullable: true }) input?: GetAllSkillsInput`
    - Delegate to `this.skillsService.getAllSkills(input)` for business logic
    - Return array of Skill objects
    - Follow exact same guard pattern as existing mutations (createSkill, updateSkill, etc.)
    - Reference query patterns from inbox.resolver.ts and profile.resolver.ts
  - [x] 3.3 Add getSkillById Query resolver to `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/skills.resolver.ts`
    - Add method decorated with `@Query(() => Skill, { name: 'getSkillById' })`
    - Apply `@UseGuards(JwtAuthGuard, RolesGuard)` decorator
    - Apply `@Roles(ProfileType.ADMIN)` decorator for admin-only access
    - Accept ID parameter: `@Args('id', { type: () => Int }) id: number`
    - Delegate to `this.skillsService.getSkillById(id)` for business logic
    - Return single Skill object or allow NotFoundException to propagate
    - Follow exact same guard pattern as existing mutations
  - [x] 3.4 Verify GraphQL schema generation includes new query operations
    - Confirm getAllSkills query appears in GraphQL schema with correct input and return types
    - Confirm getSkillById query appears in GraphQL schema with ID parameter
    - Test schema introspection to verify query operations are registered
  - [x] 3.5 Ensure resolver layer tests pass
    - Run ONLY the 4-6 tests written in 3.1
    - Verify guards enforce authentication and admin-only access
    - Verify resolvers delegate correctly to service layer
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 3.1 pass
- getAllSkills query is protected by JwtAuthGuard, RolesGuard, and ADMIN role
- getSkillById query is protected by JwtAuthGuard, RolesGuard, and ADMIN role
- Non-admin users receive FORBIDDEN error when attempting to access queries
- Resolvers correctly delegate to service layer methods
- GraphQL schema includes both new query operations with correct types

### Testing & Integration

#### Task Group 4: Integration Testing & Gap Analysis
**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 2-4 DTO validation tests (Task 1.1)
    - Review the 4-8 service layer tests (Task 2.1)
    - Review the 4-6 resolver layer tests (Task 3.1)
    - Total existing tests: approximately 10-18 tests
  - [x] 4.2 Analyze integration test coverage gaps for THIS feature only
    - Identify critical end-to-end workflows that lack test coverage
    - Focus on integration between resolver, service, and Prisma layers
    - Check for gaps in filter combination scenarios (multiple filters together)
    - Check for gaps in error handling integration (NOT_FOUND propagation, FORBIDDEN handling)
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end query workflows over unit test gaps
  - [x] 4.3 Write up to 6 additional integration tests maximum
    - Test end-to-end getAllSkills query with authenticated admin user
    - Test end-to-end getAllSkills query with complex filter combinations (isActive + disciplines + searchTerm)
    - Test end-to-end getAllSkills query returns empty array when no skills match filters
    - Test end-to-end getSkillById query with authenticated admin user
    - Test end-to-end query access control (non-admin user receives FORBIDDEN)
    - Test end-to-end NOT_FOUND error handling for getSkillById
    - Add maximum of 6 new integration tests to fill identified critical gaps
    - Focus on GraphQL query execution through full stack
    - Do NOT write comprehensive coverage for all edge cases
  - [x] 4.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1, 2.1, 3.1, and 4.3)
    - Expected total: approximately 16-24 tests maximum
    - Verify all feature-specific tests pass
    - Verify GraphQL queries work end-to-end with proper filtering and access control
    - Do NOT run the entire application test suite

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 16-24 tests total)
- End-to-end query workflows are covered for both getAllSkills and getSkillById
- Access control is verified through integration tests (admin-only enforcement)
- Filter combinations are tested (isActive + disciplines + searchTerm together)
- Error handling is verified (NOT_FOUND, FORBIDDEN)
- No more than 6 additional integration tests added when filling in testing gaps
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:
1. **API Layer - DTOs** (Task Group 1) - Define input and response types
2. **API Layer - Service Methods** (Task Group 2) - Implement business logic and Prisma queries
3. **API Layer - GraphQL Resolvers** (Task Group 3) - Add GraphQL query operations with access control
4. **Testing & Integration** (Task Group 4) - Verify end-to-end functionality and fill coverage gaps

## Implementation Notes

### Key Technical Details

**Prisma Query Patterns:**
- `findMany` with dynamic `where` clause for getAllSkills
- `findUnique` with `where: { id }` for getSkillById
- Use `orderBy: { name: 'asc' }` for alphabetical sorting
- Use `contains` with `mode: 'insensitive'` for case-insensitive search
- Use `in` operator for multiple disciplines filter

**Access Control Pattern:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ProfileType.ADMIN)
```

**Error Handling Pattern:**
```typescript
throw new NotFoundException('Skill not found', {
  extensions: { code: 'NOT_FOUND' }
});
```

**Filter Combination Logic:**
- Build dynamic where clause based on provided filters
- Combine filters using AND logic when multiple provided
- Handle null/undefined as "no filter" for each optional field

### Files to Modify

**New Files:**
- `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/dto/get-all-skills.input.ts`

**Modified Files:**
- `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/skills.service.ts` (add getAllSkills and getSkillById methods)
- `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/skills.resolver.ts` (add Query operations)

**Files to Reference:**
- `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/dto/skill.response.ts` (reuse as-is)
- `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/dto/update-skill.input.ts` (pattern for optional fields)
- `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/inbox.resolver.ts` (Query pattern)
- `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/profile.resolver.ts` (Query with Args pattern)

### Out of Scope Reminders

- No pagination implementation (deferred to future enhancement)
- Admin-only access (not accessible to all authenticated users)
- No bulk operations
- No skill usage analytics
- No sorting by fields other than name
- No advanced search features (fuzzy matching, regex)
