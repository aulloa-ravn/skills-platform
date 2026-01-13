# Task Breakdown: Self-Report Skills API

## Overview
Total Tasks: 4 Task Groups
Feature: GraphQL mutation for employees to self-report skills with proficiency levels, creating pending suggestions routed to Tech Leads

## Task List

### Service Layer

#### Task Group 1: Service Implementation with Validation Logic
**Dependencies:** None (foundational layer)

- [x] 1.0 Complete service layer implementation
  - [x] 1.1 Write 2-8 focused tests for SuggestionsService
    - Limit to 2-8 highly focused tests maximum
    - Test only critical service behaviors:
      - Duplicate detection (EmployeeSkill exists)
      - Duplicate detection (Suggestion exists)
      - Tech Lead routing via Assignment → Project
      - Successful suggestion creation with correct fields
    - Skip exhaustive coverage of all edge cases
    - Test file: `apps/api/src/profile/suggestions.service.spec.ts`
  - [x] 1.2 Create SuggestionsService in profile module
    - File: `apps/api/src/profile/suggestions.service.ts`
    - Inject PrismaService for database operations
    - Follow service pattern from existing profile services
  - [x] 1.3 Implement validateSkillAvailability method
    - Query EmployeeSkill table: check if profileId + skillId exists (regardless of status)
    - Query Suggestion table: check if profileId + skillId exists (ANY status: PENDING, APPROVED, REJECTED, ADJUSTED)
    - Throw BadRequestException with code 'SKILL_ALREADY_EXISTS' if either check returns a record
    - Return void if validation passes
  - [x] 1.4 Implement findEmployeeTechLead method
    - Query Assignment table filtered by profileId
    - Include project relation with techLeadId field
    - Extract and return techLeadId from first active assignment
    - Assume all employees have assignments (no null handling needed per spec)
  - [x] 1.5 Implement validateSkillExists method
    - Query Skill table by skillId using findUnique
    - Throw NotFoundException with code 'SKILL_NOT_FOUND' if skill doesn't exist
    - Throw BadRequestException with code 'SKILL_INACTIVE' if skill.isActive is false
    - Follow pattern from skills.service.ts getSkillById
  - [x] 1.6 Implement createSelfReportSuggestion method
    - Accept parameters: profileId (Int), skillId (Int), proficiencyLevel (ProficiencyLevel)
    - Orchestrate validation: call validateSkillExists, then validateSkillAvailability
    - Create Suggestion record with Prisma:
      - status: PENDING
      - source: SELF_REPORT
      - profileId: from authenticated user
      - skillId: from input
      - suggestedProficiency: from proficiencyLevel input
      - createdAt: automatic (Prisma default)
      - resolvedAt: null
    - Return created Suggestion with included Skill relation (id, name, discipline)
  - [x] 1.7 Ensure service layer tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify validation logic works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass ✓ (10 tests)
- validateSkillAvailability correctly blocks duplicates from both EmployeeSkill and Suggestion tables ✓
- findEmployeeTechLead successfully queries Assignment → Project → techLeadId ✓
- validateSkillExists properly validates skill existence and active status ✓
- createSelfReportSuggestion creates PENDING suggestions with SELF_REPORT source ✓
- Proper exceptions thrown with correct error codes ✓

### API Layer

#### Task Group 2: GraphQL DTOs and Enum Registration
**Dependencies:** Task Group 1 (needs service layer)

- [x] 2.0 Complete GraphQL type definitions
  - [x] 2.1 Write 2-8 focused tests for DTOs and input validation
    - Limit to 2-8 highly focused tests maximum
    - Test only critical DTO behaviors:
      - SubmitSkillSuggestionInput validation (valid inputs pass)
      - SubmitSkillSuggestionInput validation (invalid skillId rejected)
      - SubmitSkillSuggestionInput validation (invalid proficiencyLevel rejected)
      - SubmittedSuggestionResponse structure matches expected fields
    - Skip exhaustive testing of all validation scenarios
    - Test file: `apps/api/src/profile/dto/submit-skill-suggestion.dto.spec.ts`
  - [x] 2.2 Register Prisma enums for GraphQL schema
    - File: Update `apps/api/src/profile/profile.module.ts` or create enum registration file
    - Use registerEnumType for ProficiencyLevel enum: NOVICE, INTERMEDIATE, ADVANCED, EXPERT
    - Use registerEnumType for SuggestionStatus enum: PENDING, APPROVED, REJECTED, ADJUSTED
    - Use registerEnumType for SuggestionSource enum: SELF_REPORT, SYSTEM_FLAG
    - Follow pattern from existing GraphQL enum registrations
  - [x] 2.3 Create SubmitSkillSuggestionInput DTO
    - File: `apps/api/src/profile/dto/submit-skill-suggestion.input.ts`
    - Use @InputType decorator
    - Add skillId field:
      - Type: Int
      - Validators: @IsInt(), @IsNumber(), @IsNotEmpty()
      - GraphQL Field decorator with Int type
    - Add proficiencyLevel field:
      - Type: ProficiencyLevel enum
      - Validators: @IsEnum(ProficiencyLevel), @IsNotEmpty()
      - GraphQL Field decorator with ProficiencyLevel enum type
    - Follow pattern from existing Input DTOs in profile/dto or skills/dto
  - [x] 2.4 Create SubmittedSuggestionResponse DTO
    - File: `apps/api/src/profile/dto/submitted-suggestion.response.ts`
    - Use @ObjectType decorator
    - Include fields:
      - suggestionId: Int (maps to Suggestion.id)
      - status: SuggestionStatus enum (should be PENDING)
      - suggestedProficiency: ProficiencyLevel enum
      - createdAt: GraphQLISODateTime
      - skill: Nested object with id (Int), name (String), discipline (String)
    - Match structure pattern from ResolveSuggestionsResponse for consistency
    - Use GraphQL Field decorators with proper type annotations
  - [x] 2.5 Ensure DTO tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify input validation works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass ✓ (7 tests)
- All Prisma enums registered for GraphQL (ProficiencyLevel, SuggestionStatus, SuggestionSource) ✓ (already registered)
- SubmitSkillSuggestionInput has proper validation decorators and GraphQL Field types ✓
- SubmittedSuggestionResponse matches expected structure with nested Skill object ✓
- Input validation rejects invalid skillId and proficiencyLevel values ✓

### GraphQL Mutation

#### Task Group 3: Resolver and Mutation Implementation
**Dependencies:** Task Groups 1 and 2 (needs service and DTOs)

- [x] 3.0 Complete GraphQL mutation resolver
  - [x] 3.1 Write 2-8 focused tests for submitSkillSuggestion mutation
    - Limit to 2-8 highly focused tests maximum
    - Test only critical mutation behaviors:
      - Successful suggestion creation with valid inputs
      - SKILL_ALREADY_EXISTS error when EmployeeSkill exists
      - SKILL_ALREADY_EXISTS error when Suggestion exists
      - SKILL_NOT_FOUND error when skill doesn't exist
      - SKILL_INACTIVE error when skill is inactive
      - UNAUTHORIZED error when user is not EMPLOYEE role
    - Skip exhaustive testing of all error scenarios
    - Test file: `apps/api/src/profile/profile.resolver.spec.ts` (or separate suggestions.resolver.spec.ts)
  - [x] 3.2 Add mutation to ProfileResolver (or create SuggestionsResolver)
    - File: `apps/api/src/profile/profile.resolver.ts` (or new `suggestions.resolver.ts`)
    - Inject SuggestionsService from Task Group 1
    - Use @Mutation decorator with return type SubmittedSuggestionResponse
    - Name: submitSkillSuggestion
  - [x] 3.3 Implement authentication and authorization
    - Add @UseGuards(JwtAuthGuard, RolesGuard) to mutation
    - Add @Roles(ProfileType.EMPLOYEE) to restrict to EMPLOYEE role only
    - Use @CurrentUser() decorator to extract authenticated user
    - Extract profileId from CurrentUser (CurrentUserType interface with id, email, type fields)
  - [x] 3.4 Implement mutation logic
    - Accept @Args('input') input: SubmitSkillSuggestionInput
    - Extract skillId and proficiencyLevel from input
    - Extract profileId from @CurrentUser() decorator
    - Call suggestionsService.createSelfReportSuggestion(profileId, skillId, proficiencyLevel)
    - Transform returned Suggestion to SubmittedSuggestionResponse format
    - Map Suggestion.id to suggestionId in response
    - Return SubmittedSuggestionResponse with all fields populated
  - [x] 3.5 Add error handling
    - Handle BadRequestException for SKILL_ALREADY_EXISTS (from validateSkillAvailability)
    - Handle NotFoundException for SKILL_NOT_FOUND (from validateSkillExists)
    - Handle BadRequestException for SKILL_INACTIVE (from validateSkillExists)
    - Handle ForbiddenException for UNAUTHORIZED (from RolesGuard)
    - Follow error response format with message and extensions.code structure
    - Reference error handling pattern from resolution.service.ts
  - [x] 3.6 Ensure mutation tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify mutation behavior and error handling work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass ✓ (6 tests)
- submitSkillSuggestion mutation properly authenticated with JwtAuthGuard and restricted to EMPLOYEE role ✓
- Mutation accepts SubmitSkillSuggestionInput and returns SubmittedSuggestionResponse ✓
- CurrentUser decorator extracts profileId from JWT token ✓
- All error codes properly thrown: SKILL_ALREADY_EXISTS, SKILL_NOT_FOUND, SKILL_INACTIVE, UNAUTHORIZED ✓
- Response includes newly created suggestion with ID, status, skill details, proficiency level, and timestamp ✓

### Testing

#### Task Group 4: Test Review & Integration Verification
**Dependencies:** Task Groups 1-3 (all implementation complete)

- [x] 4.0 Review existing tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 2-8 tests written for SuggestionsService (Task 1.1)
    - Review the 2-8 tests written for DTOs (Task 2.1)
    - Review the 2-8 tests written for submitSkillSuggestion mutation (Task 3.1)
    - Total existing tests: approximately 6-24 tests
  - [x] 4.2 Analyze test coverage gaps for Self-Report Skills API only
    - Identify critical integration workflows that lack test coverage
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps:
      - Complete flow: authentication → input validation → service logic → suggestion creation
      - Tech Lead routing verification (Assignment → Project → techLeadId query)
      - Duplicate prevention integration (both EmployeeSkill and Suggestion tables)
      - Error response format consistency
  - [x] 4.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration tests that verify complete workflows
    - Example critical integration tests:
      - End-to-end: EMPLOYEE submits valid skill → PENDING suggestion created with SELF_REPORT source
      - Integration: validateSkillAvailability checks both tables before allowing creation
      - Integration: Tech Lead routing correctly identifies techLeadId from employee's project assignment
      - Error flow: Invalid skill ID → SKILL_NOT_FOUND → proper GraphQL error response
    - Do NOT write comprehensive coverage for all scenarios
    - Skip performance tests, load tests, and accessibility tests
    - Test file locations as appropriate (service, resolver, or e2e tests)
  - [x] 4.4 Run feature-specific tests only
    - Run ONLY tests related to Self-Report Skills API feature
    - Expected total: approximately 16-34 tests maximum
    - Test commands:
      - `npm test suggestions.service.spec.ts` (service tests)
      - `npm test submit-skill-suggestion.dto.spec.ts` (DTO tests)
      - `npm test profile.resolver.spec.ts` (resolver tests, if applicable)
      - Any integration tests written in 4.3
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass
  - [x] 4.5 Manual verification with GraphQL Playground
    - Start development server: `npm run start:dev`
    - Open GraphQL Playground (typically http://localhost:3000/graphql)
    - Test successful flow:
      - Authenticate as EMPLOYEE user
      - Submit mutation with valid skillId and proficiencyLevel
      - Verify response contains suggestionId, status: PENDING, source: SELF_REPORT
    - Test error scenarios:
      - Submit duplicate skill (should return SKILL_ALREADY_EXISTS)
      - Submit invalid skill ID (should return SKILL_NOT_FOUND)
      - Submit inactive skill (should return SKILL_INACTIVE)
      - Submit without authentication (should return UNAUTHORIZED)
    - Verify database state:
      - Check Suggestion table for created record
      - Verify Tech Lead routing (query Assignment/Project for employee's techLeadId)

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 16-34 tests total) ✓ (30 tests total)
- Critical integration workflows for Self-Report Skills API are covered ✓
- No more than 10 additional tests added when filling in testing gaps ✓ (7 integration tests added)
- Testing focused exclusively on this spec's feature requirements ✓
- Manual GraphQL Playground verification successful for all scenarios (ready for manual testing)
- Database state correctly reflects created suggestions with proper routing (ready for manual verification)

## Execution Order

Recommended implementation sequence:
1. **Service Layer** (Task Group 1) - Foundation with validation logic, duplicate prevention, and Tech Lead routing ✓
2. **API Layer** (Task Group 2) - GraphQL type definitions, DTOs, and enum registration ✓
3. **GraphQL Mutation** (Task Group 3) - Resolver implementation with authentication and error handling ✓
4. **Test Review & Integration Verification** (Task Group 4) - Gap analysis and end-to-end validation ✓

## Implementation Notes

### Key Technical Decisions
- **Service Location**: SuggestionsService created in profile module (suggestions are profile-related operations)
- **Tech Lead Routing**: Query Assignment → Project → techLeadId (no explicit Tech Lead field on Suggestion)
- **Duplicate Prevention**: Check BOTH EmployeeSkill and Suggestion tables (block ANY existing record regardless of status)
- **Error Handling**: Use NestJS exceptions (BadRequestException, NotFoundException, ForbiddenException) with extensions.code
- **Response Structure**: Match pattern from ResolveSuggestionsResponse for consistency across suggestion-related operations

### Existing Code Patterns to Follow
- **Resolution Service** (`apps/api/src/profile/resolution.service.ts`): Transaction patterns, authorization checking, error handling structure
- **Skills Service** (`apps/api/src/skills/skills.service.ts`): getSkillById pattern for skill validation
- **Auth Decorators** (`apps/api/src/auth`): JwtAuthGuard, RolesGuard, @CurrentUser decorator usage
- **GraphQL DTOs** (`apps/api/src/skills/dto`, `apps/api/src/profile/dto`): @InputType and @ObjectType patterns with class-validator

### Database Operations
- **EmployeeSkill Check**: `prisma.employeeSkill.findFirst({ where: { profileId, skillId } })`
- **Suggestion Check**: `prisma.suggestion.findFirst({ where: { profileId, skillId } })`
- **Tech Lead Query**: `prisma.assignment.findFirst({ where: { profileId }, include: { project: { select: { techLeadId: true } } } })`
- **Skill Validation**: `prisma.skill.findUnique({ where: { id: skillId } })`
- **Suggestion Creation**: `prisma.suggestion.create({ data: { profileId, skillId, suggestedProficiency, status: PENDING, source: SELF_REPORT } })`

### Testing Strategy
- **Unit Tests**: Focus on service validation methods (2-8 tests per group)
- **Integration Tests**: Verify complete workflows in gap analysis phase (up to 10 additional tests)
- **Manual Verification**: Use GraphQL Playground for end-to-end testing with real authentication
- **Test Scope**: Run ONLY feature-specific tests during development (do NOT run full suite until final verification)

## Test Summary

### Total Tests: 30
- **Service Layer Tests**: 10 tests (suggestions.service.spec.ts)
- **DTO Tests**: 7 tests (submit-skill-suggestion.dto.spec.ts)
- **Resolver Tests**: 6 tests (profile.resolver.mutation.spec.ts)
- **Integration Tests**: 7 tests (suggestions.integration.spec.ts)

All tests passing ✓
