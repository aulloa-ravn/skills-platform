# Task Breakdown: Skill Resolution API

## Overview
Total Tasks: 4 major task groups with 18 sub-tasks

## Task List

### Backend Layer - DTOs and Types

#### Task Group 1: GraphQL Input/Output Type Definitions
**Dependencies:** None

- [x] 1.0 Complete GraphQL type definitions for mutation
  - [x] 1.1 Write 2-8 focused tests for DTO validation
    - Limit to 2-8 highly focused tests maximum
    - Test only critical validation behaviors (e.g., ResolutionAction enum validation, adjustedProficiency requirement for ADJUST_LEVEL, invalid proficiency level rejection)
    - Skip exhaustive coverage of all validation combinations
  - [x] 1.2 Create ResolutionAction enum type
    - Values: APPROVE, ADJUST_LEVEL, REJECT
    - Register with GraphQL using registerEnumType
    - Follow pattern from: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/graphql/mutations.ts` SuggestionSource enum
  - [x] 1.3 Create DecisionInput DTO class
    - Fields: suggestionId (String!), action (ResolutionAction!), adjustedProficiency (String, optional)
    - Use @InputType() and @Field() decorators
    - Apply class-validator decorators: @IsNotEmpty, @IsString, @IsEnum
    - Follow pattern from: login.input.ts
  - [x] 1.4 Create ResolveSuggestionsInput DTO class
    - Field: decisions (DecisionInput[] array)
    - Use @InputType() with @Field(() => [DecisionInput]) decorator
    - Apply @IsArray and @ValidateNested decorators
    - Follow pattern from: login.input.ts
  - [x] 1.5 Create ResolvedSuggestion response type
    - Fields: suggestionId (String!), action (ResolutionAction!), employeeName (String!), skillName (String!), proficiencyLevel (String!)
    - Use @ObjectType() and @Field() decorators
    - Follow pattern from: inbox.response.ts
  - [x] 1.6 Create ResolutionError response type
    - Fields: suggestionId (String!), message (String!), code (String! - error type identifier)
    - Use @ObjectType() and @Field() decorators
    - Error codes: NOT_FOUND, ALREADY_PROCESSED, MISSING_PROFICIENCY, INVALID_PROFICIENCY, UNAUTHORIZED, VALIDATION_FAILED
  - [x] 1.7 Create ResolveSuggestionsResponse type
    - Fields: success (Boolean!), processed (ResolvedSuggestion[] array), errors (ResolutionError[] array)
    - Use @ObjectType() with @Field() decorators for all fields
    - Follow pattern from: login.response.ts and inbox.response.ts
  - [x] 1.8 Ensure DTO layer tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify enum registration works correctly
    - Verify class-validator decorators function properly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- All DTOs properly decorated with GraphQL and class-validator decorators
- ResolutionAction enum registered in GraphQL schema
- Input validation works for required fields and enums
- Response types structured for frontend consumption

### Backend Layer - Service and Authorization

#### Task Group 2: Resolution Service Implementation
**Dependencies:** Task Group 1

- [x] 2.0 Complete resolution service logic
  - [x] 2.1 Write 2-8 focused tests for service layer
    - Limit to 2-8 highly focused tests maximum
    - Test only critical service behaviors (e.g., APPROVE action creates EmployeeSkill, REJECT action updates status only, authorization check for TECH_LEAD, batch processing with partial failures)
    - Skip exhaustive testing of all edge cases and combinations
  - [x] 2.2 Create ResolutionService class
    - Inject PrismaService in constructor
    - Create resolveSuggestions method accepting (userId: string, role: UserRole, input: ResolveSuggestionsInput)
    - Return Promise<ResolveSuggestionsResponse>
    - Follow service pattern from: InboxService
  - [x] 2.3 Implement authorization check method
    - Method: checkSuggestionAuthorization(userId: string, role: UserRole, suggestionId: string)
    - ADMIN role: return true immediately
    - TECH_LEAD role: query Suggestion with nested includes to verify suggestion's employee has assignment where project.techLeadId = userId
    - Throw ForbiddenException with suggestionId in error if unauthorized
    - Follow pattern from: InboxService.buildProjectsQuery role-based filtering
  - [x] 2.4 Implement validation helper methods
    - Method: validateSuggestionExists(suggestionId: string) - verify suggestion exists and status is PENDING
    - Method: validateProficiencyLevel(proficiency: string) - verify matches ProficiencyLevel enum
    - Method: validateDecisionInput(decision: DecisionInput) - verify adjustedProficiency present for ADJUST_LEVEL
    - Return validation errors with appropriate error codes (NOT_FOUND, ALREADY_PROCESSED, INVALID_PROFICIENCY, MISSING_PROFICIENCY)
  - [x] 2.5 Implement APPROVE action handler
    - Use Prisma transaction: prisma.$transaction
    - Update Suggestion: set status to APPROVED, set resolvedAt to current timestamp
    - Create EmployeeSkill: profileId from suggestion, skillId from suggestion, proficiencyLevel = suggestion.suggestedProficiency
    - Set validatedById = userId, validatedAt = current timestamp
    - Return ResolvedSuggestion object with employee name, skill name, proficiency level
    - Use try-catch to handle database errors
  - [x] 2.6 Implement ADJUST_LEVEL action handler
    - Same flow as APPROVE but use adjustedProficiency from input
    - Update Suggestion: set status to APPROVED (treat same as approval), set resolvedAt
    - Create EmployeeSkill with adjusted proficiency value
    - Validate adjustedProficiency against ProficiencyLevel enum before processing
    - Return ResolvedSuggestion object with adjusted proficiency
  - [x] 2.7 Implement REJECT action handler
    - Single Prisma update operation (no transaction needed)
    - Update Suggestion: set status to REJECTED, set resolvedAt to current timestamp
    - Do NOT create EmployeeSkill record
    - Do NOT delete Suggestion record (maintain audit trail)
    - Return ResolvedSuggestion object indicating rejection
  - [x] 2.8 Implement batch processing orchestration
    - Track processed suggestionIds in Set to detect duplicates
    - Iterate through decisions array
    - For each decision: validate, authorize, process action
    - Use try-catch per decision to isolate failures
    - Collect successful resolutions in processed array
    - Collect failures in errors array with suggestionId, message, code
    - Return success = true only if ALL processed successfully, false if any failures
    - Skip duplicate suggestionIds silently (process only first occurrence)
  - [x] 2.9 Ensure service layer tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify critical action handlers work correctly
    - Verify authorization logic functions properly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- Authorization correctly enforces TECH_LEAD vs ADMIN permissions
- APPROVE action atomically updates Suggestion and creates EmployeeSkill
- ADJUST_LEVEL action uses adjusted proficiency value
- REJECT action only updates Suggestion status
- Batch processing handles partial failures gracefully
- Duplicate suggestionIds in batch are handled correctly
- Validation errors return appropriate error codes

### Backend Layer - GraphQL Resolver

#### Task Group 3: Mutation Resolver Implementation
**Dependencies:** Task Groups 1, 2

- [x] 3.0 Complete GraphQL resolver
  - [x] 3.1 Write 2-8 focused tests for resolver layer
    - Limit to 2-8 highly focused tests maximum
    - Test only critical resolver behaviors (e.g., authentication guard enforcement, CurrentUser injection, successful mutation response, authorization error handling)
    - Skip exhaustive integration testing (covered in Task Group 4)
  - [x] 3.2 Create ResolutionResolver class
    - Inject ResolutionService in constructor
    - Use @Resolver() decorator
    - Follow resolver pattern from: auth.resolver.ts
  - [x] 3.3 Implement resolveSuggestions mutation method
    - Method signature: resolveSuggestions(@Args('input') input: ResolveSuggestionsInput, @CurrentUser() user)
    - Return type: Promise<ResolveSuggestionsResponse>
    - Use @Mutation(() => ResolveSuggestionsResponse) decorator
    - Use @UseGuards(JwtAuthGuard) for authentication
    - Extract user.id and user.role from CurrentUser decorator
    - Call resolutionService.resolveSuggestions(user.id, user.role, input)
    - Return service response directly
  - [x] 3.4 Add error handling for resolver
    - Catch and transform ForbiddenException to GraphQL error
    - Catch and transform ValidationException to GraphQL error
    - Allow service-level errors to propagate with proper formatting
    - Follow error handling pattern from existing resolvers
  - [x] 3.5 Register resolver in module
    - Add ResolutionResolver to providers array in appropriate module
    - Add ResolutionService to providers array
    - Ensure PrismaService is available for injection
    - Follow module registration pattern from existing features
  - [x] 3.6 Ensure resolver layer tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify mutation can be invoked with proper authentication
    - Verify CurrentUser decorator provides user data
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Mutation properly decorated with @Mutation and @UseGuards
- CurrentUser decorator successfully injects user ID and role
- Service layer is called with correct parameters
- Resolver registered in appropriate NestJS module
- Authentication guard prevents unauthenticated access

### Frontend and Integration Testing

#### Task Group 4: Frontend Mutation and Comprehensive Testing
**Dependencies:** Task Groups 1, 2, 3

- [x] 4.0 Complete frontend mutation and testing
  - [x] 4.1 Create frontend mutation definition
    - File: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/graphql/mutations.ts`
    - Export RESOLVE_SUGGESTIONS_MUTATION constant
    - Use gql template literal: mutation ResolveSuggestions($input: ResolveSuggestionsInput!)
    - Request fields: success, processed (suggestionId, action, employeeName, skillName, proficiencyLevel), errors (suggestionId, message, code)
    - Follow pattern from: LOGIN_MUTATION and REFRESH_TOKEN_MUTATION
  - [x] 4.2 Review existing tests and identify critical gaps
    - Review the 2-8 tests written by dto-engineer (Task 1.1)
    - Review the 2-8 tests written by service-engineer (Task 2.1)
    - Review the 2-8 tests written by resolver-engineer (Task 3.1)
    - Total existing tests: approximately 6-24 tests
    - Identify critical integration gaps: end-to-end mutation flow, authorization edge cases, transaction rollback scenarios
  - [x] 4.3 Write up to 10 additional integration tests maximum
    - End-to-end test: APPROVE action successfully creates EmployeeSkill
    - End-to-end test: ADJUST_LEVEL action uses adjusted proficiency
    - End-to-end test: REJECT action does not create EmployeeSkill
    - Integration test: TECH_LEAD can only resolve their team's suggestions
    - Integration test: ADMIN can resolve any suggestion
    - Integration test: Batch with partial failures returns correct response structure
    - Integration test: Duplicate suggestionIds processed only once
    - Integration test: Already processed suggestion returns ALREADY_PROCESSED error
    - Edge case test: Missing adjustedProficiency for ADJUST_LEVEL returns error
    - Edge case test: Invalid proficiency level returns INVALID_PROFICIENCY error
    - Maximum 10 tests - focus on critical workflows and authorization scenarios
  - [x] 4.4 Run feature-specific test suite
    - Run ONLY tests related to Skill Resolution API feature
    - Expected total: approximately 16-34 tests maximum (existing + new integration tests)
    - Verify all critical workflows pass: APPROVE, ADJUST_LEVEL, REJECT
    - Verify authorization scenarios work correctly
    - Verify batch processing and error handling function properly
    - Do NOT run the entire application test suite

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 16-34 tests total)
- Frontend mutation properly defined and exportable for Apollo Client
- End-to-end workflows verified: APPROVE creates EmployeeSkill, REJECT does not
- Authorization correctly enforced for TECH_LEAD and ADMIN roles
- Batch processing with partial failures returns expected response structure
- Edge cases handled: duplicates, missing fields, invalid values, already processed suggestions
- No more than 10 additional tests added when filling in integration gaps
- Testing focused exclusively on Skill Resolution API feature requirements

## Execution Order

Recommended implementation sequence:
1. Backend Layer - DTOs and Types (Task Group 1)
2. Backend Layer - Service and Authorization (Task Group 2)
3. Backend Layer - GraphQL Resolver (Task Group 3)
4. Frontend and Integration Testing (Task Group 4)

## Implementation Notes

**Database Transaction Requirements:**
- APPROVE and ADJUST_LEVEL actions MUST use Prisma transactions to ensure atomicity
- Transaction should include: Suggestion update + EmployeeSkill create
- REJECT action uses single update operation (no transaction needed)

**Authorization Pattern:**
- Reuse InboxService.buildProjectsQuery pattern for role-based filtering
- Query path: Suggestion -> Employee -> Assignments -> Project -> techLeadId
- ADMIN bypasses project assignment check
- TECH_LEAD must have techLeadId matching user ID on at least one of employee's projects

**Error Code Standards:**
- NOT_FOUND: Suggestion ID does not exist
- ALREADY_PROCESSED: Suggestion status is not PENDING
- MISSING_PROFICIENCY: adjustedProficiency missing for ADJUST_LEVEL action
- INVALID_PROFICIENCY: proficiency value does not match ProficiencyLevel enum
- UNAUTHORIZED: User lacks permission for specific suggestion
- VALIDATION_FAILED: General validation error

**Batch Processing Behavior:**
- Process decisions independently
- Continue processing on individual failures
- Collect successes in processed array
- Collect failures in errors array
- Overall success = true only if zero errors
- Deduplicate suggestionIds: process first occurrence only

**Core Stack Classification:**
- No special handling needed in mutation
- EmployeeSkill creation is sufficient
- GET_PROFILE_QUERY resolver handles classification automatically based on active assignments
- Core stack = skills matching tags on employee's active assignments
- Validated inventory = all other validated skills

**Testing Strategy:**
- Each task group (1-3) writes 2-8 focused tests for their layer
- Task Group 4 adds maximum 10 integration tests to fill critical gaps
- Focus on end-to-end workflows and authorization scenarios
- Total expected tests: approximately 16-34 tests maximum for entire feature
