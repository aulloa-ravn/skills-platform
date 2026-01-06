# Specification: Skill Resolution API

## Goal
Implement a GraphQL mutation that allows tech leads and admins to batch process pending skill suggestions by approving, adjusting proficiency levels, or rejecting them with proper authorization and database updates.

## User Stories
- As a tech lead, I want to approve multiple skill suggestions for my team members in one operation so that I can efficiently validate their skills
- As an admin, I want to adjust proficiency levels on suggestions across all projects so that I can ensure accurate skill assessments
- As a tech lead, I want to reject invalid skill suggestions with proper error feedback so that I can maintain data quality

## Specific Requirements

**GraphQL Mutation Structure**
- Mutation name: `resolveSuggestions`
- Input: `ResolveSuggestionsInput!` containing array of decisions
- Returns: `ResolveSuggestionsResponse` with success boolean, processed items array, and errors array
- Follow existing mutation pattern from LOGIN_MUTATION and REFRESH_TOKEN_MUTATION
- Use @UseGuards(JwtAuthGuard) for authentication like InboxResolver
- Inject CurrentUser decorator to access authenticated user's ID and role

**Decision Input Type Definition**
- Each decision contains: suggestionId (String!), action (ResolutionAction! enum), adjustedProficiency (String optional)
- ResolutionAction enum values: APPROVE, ADJUST_LEVEL, REJECT
- Use class-validator decorators: @IsNotEmpty, @IsString, @IsEnum for validation
- adjustedProficiency required when action is ADJUST_LEVEL, null otherwise
- Follow InputType pattern from login.input.ts with @InputType() and @Field() decorators

**Response Type Definition**
- ResolveSuggestionsResponse contains: success (Boolean!), processed (ResolvedSuggestion[] array), errors (ResolutionError[] array)
- ResolvedSuggestion contains: suggestionId, action, employeeName, skillName, proficiencyLevel
- ResolutionError contains: suggestionId, message, code (error type identifier)
- Follow ObjectType pattern from inbox.response.ts with proper GraphQL decorators
- Use registerEnumType for ResolutionAction enum like SuggestionSource in inbox.response.ts

**APPROVE Action Database Operations**
- Update Suggestion record: set status to APPROVED (from SuggestionStatus enum), set resolvedAt timestamp
- Create EmployeeSkill record: profileId from suggestion, skillId from suggestion, proficiencyLevel = suggestedProficiency from Suggestion
- Set validatedById = current user's ID, validatedAt = current timestamp
- No deletion - maintain audit trail by keeping suggestion records
- Use Prisma transaction to ensure atomicity between update and create operations

**ADJUST_LEVEL Action Database Operations**
- Same as APPROVE action but use adjustedProficiency from input instead of suggestedProficiency
- Update Suggestion record: set status to APPROVED (not ADJUSTED - treat same as approval per requirements)
- Create EmployeeSkill with adjusted proficiency value
- Validate adjustedProficiency against ProficiencyLevel enum (NOVICE, INTERMEDIATE, ADVANCED, EXPERT)
- No tracking that adjustment occurred - treat identically to approval in database

**REJECT Action Database Operations**
- Update Suggestion record: set status to REJECTED, set resolvedAt timestamp
- Do NOT create EmployeeSkill record
- Do NOT delete Suggestion record - maintain audit trail
- Single Prisma update operation (no transaction needed)

**Authorization Implementation**
- TECH_LEAD role: can only resolve suggestions for employees assigned to their projects (techLeadId matches user ID)
- ADMIN role: can resolve any suggestion across all projects
- Validate authorization per suggestion ID before processing
- Query Suggestion with nested includes to check if suggestion's employee has assignment where project.techLeadId = user ID
- Follow authorization pattern from InboxService.buildProjectsQuery for role-based filtering
- Throw ForbiddenException for unauthorized access attempts with suggestionId in error

**Validation Rules**
- Verify suggestionId exists in database using Prisma findUnique
- Verify suggestion status is PENDING (not APPROVED or REJECTED already)
- Verify adjustedProficiency matches ProficiencyLevel enum when action is ADJUST_LEVEL
- Verify user has permission for specific suggestion based on role and project assignment
- Use class-validator decorators in DTO for input validation (@IsEnum, @IsNotEmpty, @IsString)
- Return individual errors for failed validations with clear error codes and messages

**Batch Processing with Partial Failure Handling**
- Process each decision independently in the decisions array
- Continue processing remaining items if one fails validation or authorization
- Collect successful resolutions in processed array
- Collect failures in errors array with suggestionId reference
- Overall success = true only if ALL decisions processed successfully, false if any failures
- Use try-catch blocks per decision to isolate failures
- De-duplicate suggestionIds: process first occurrence only, silently ignore subsequent duplicates in batch

**Edge Case Handling**
- Duplicate suggestionIds in single batch: track processed IDs in Set, skip duplicates silently
- Concurrent processing prevention: Only assigned tech lead can process suggestions (enforced by authorization check)
- Already processed suggestions: return error with code ALREADY_PROCESSED if status is not PENDING
- Non-existent suggestionId: return error with code NOT_FOUND
- Missing adjustedProficiency for ADJUST_LEVEL: return error with code MISSING_PROFICIENCY
- Invalid proficiencyLevel value: return error with code INVALID_PROFICIENCY

**Core Stack vs Validated Inventory Classification Logic**
- Query employee's current assignments to get assigned skills (tags on Assignment table)
- Core stack: skills where skill.name matches any tag in employee's active assignments
- Validated inventory: all other validated skills not matching active assignment tags
- This classification happens automatically when GET_PROFILE_QUERY fetches data - no special handling needed in mutation
- EmployeeSkill creation is sufficient - resolver handles classification on read

## Existing Code to Leverage

**InboxService authorization pattern (inbox.service.ts)**
- Use checkAuthorization method pattern to validate TECH_LEAD vs ADMIN access
- Adapt buildProjectsQuery role-based filtering for per-suggestion authorization checks
- Reuse ForbiddenException throwing pattern for unauthorized access
- Apply same Prisma nested query pattern to verify user has access to suggestion's project

**GraphQL mutation resolver pattern (auth.resolver.ts)**
- Follow @Mutation decorator pattern with input argument using @Args('input')
- Use @UseGuards(JwtAuthGuard) for authentication enforcement
- Inject @CurrentUser() decorator to access authenticated user's id and role
- Return Promise<ResponseType> from async method that calls service layer

**DTO input/output patterns (login.input.ts, login.response.ts, inbox.response.ts)**
- Use @InputType() with @Field() decorators for mutation input classes
- Use @ObjectType() with @Field() decorators for response classes
- Apply class-validator decorators (@IsNotEmpty, @IsString, @IsEnum) for validation
- Register Prisma enums with registerEnumType for GraphQL schema exposure
- Use GraphQLISODateTime for timestamp fields like resolvedAt

**Prisma transaction patterns for atomicity**
- Use prisma.$transaction for operations that must succeed together (update Suggestion + create EmployeeSkill)
- Follow existing PrismaService injection pattern in constructors
- Use Prisma's type-safe queries with proper where clauses and include statements
- Apply error handling with try-catch for database operation failures

**Frontend mutation structure (mutations.ts)**
- Create RESOLVE_SUGGESTIONS_MUTATION using gql template literal
- Follow pattern: mutation ResolveSuggestions($input: ResolveSuggestionsInput!)
- Request fields: success, processed (with nested fields), errors (with nested fields)
- Export mutation constant for use in Apollo Client useMutation hook

## Out of Scope
- Notification system for alerting employees when their suggestions are processed
- Email notifications to employees about resolution decisions
- Real-time WebSocket updates to connected clients when suggestions are resolved
- Audit logging beyond status updates in Suggestion table (no separate audit table)
- Analytics dashboard or reporting on resolution patterns and metrics
- Undo or rollback functionality for processed suggestions
- Bulk selection UI components or filtering helpers (frontend concern)
- Automated suggestion processing based on rules or AI
- Integration with external systems or third-party APIs
- Performance optimization for extremely large batches (focus on correctness first)
