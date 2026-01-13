# Specification: Self-Report Skills API

## Goal
Enable employees to submit skill suggestions from the canonical taxonomy with proficiency levels, creating pending validation requests that automatically route to their Tech Lead.

## User Stories
- As an employee, I want to submit skills I possess so that my Tech Lead can validate them and add them to my profile
- As an employee, I want to select a proficiency level when suggesting a skill so that my self-assessment is captured for Tech Lead review

## Specific Requirements

**GraphQL Mutation: submitSkillSuggestion**
- Accept two required inputs: skillId (Int) and proficiencyLevel (ProficiencyLevel enum)
- Validate user is authenticated with EMPLOYEE role using JwtAuthGuard
- Return newly created Suggestion object with all fields including id, status, skill details, and proficiency level
- Use NestJS @Mutation decorator with proper GraphQL type annotations
- Extract authenticated user from CurrentUser decorator to get profileId

**Duplicate Skill Prevention**
- Query EmployeeSkill table to check if employee already has this skill (regardless of status)
- Query Suggestion table to check if employee has ANY existing suggestion for this skill (PENDING, APPROVED, REJECTED, or ADJUSTED)
- Throw BadRequestException with code 'SKILL_ALREADY_EXISTS' if either check returns a record
- Perform both checks before creating the suggestion record

**Tech Lead Routing Logic**
- Query Assignment table to find employee's current project assignment
- Include project relation with techLeadId field to determine which Tech Lead should review
- System assumes all employees have at least one assignment with a valid Tech Lead (no edge case handling needed)
- No explicit assignment of Tech Lead to Suggestion record (routing handled by querying employee's project assignments)

**Suggestion Record Creation**
- Create Suggestion with status: PENDING, source: SELF_REPORT, profileId from authenticated user
- Set suggestedProficiency to the provided proficiencyLevel input
- Set skillId to the provided skillId input
- Set createdAt to current timestamp (handled by Prisma default)
- Leave resolvedAt as null since status is PENDING

**Proficiency Level Validation**
- Use ProficiencyLevel enum from Prisma schema: NOVICE, INTERMEDIATE, ADVANCED, EXPERT
- Validate input using @IsEnum decorator from class-validator in Input DTO
- Register ProficiencyLevel enum for GraphQL using registerEnumType

**Skill Existence Validation**
- Query Skill table to verify skillId exists and isActive is true
- Throw NotFoundException with code 'SKILL_NOT_FOUND' if skill doesn't exist
- Throw BadRequestException with code 'SKILL_INACTIVE' if skill exists but isActive is false

**Input DTO Structure**
- Create SubmitSkillSuggestionInput class with @InputType decorator
- Include skillId field as Int with @IsInt, @IsNumber, @IsNotEmpty validators
- Include proficiencyLevel field as ProficiencyLevel enum with @IsEnum, @IsNotEmpty validators
- Use class-validator decorators for input validation

**Response DTO Structure**
- Create SubmittedSuggestionResponse ObjectType with all Suggestion fields
- Include nested Skill object with id, name, discipline fields
- Include suggestionId (Int), status (SuggestionStatus enum), suggestedProficiency (ProficiencyLevel enum)
- Include createdAt (GraphQLISODateTime) for timestamp display
- Match response structure pattern from ResolveSuggestionsResponse for consistency

**Error Handling**
- SKILL_ALREADY_EXISTS: Employee already has this skill in EmployeeSkill or Suggestion table
- SKILL_NOT_FOUND: Skill with provided skillId does not exist
- SKILL_INACTIVE: Skill exists but is disabled (isActive = false)
- UNAUTHORIZED: User is not authenticated or not EMPLOYEE role
- NO_ACTIVE_ASSIGNMENT: Employee has no current project assignment (exclude from implementation per requirements)

**Service Layer Implementation**
- Create new SuggestionsService in profile module (suggestions are profile-related operations)
- Implement validateSkillAvailability method to check EmployeeSkill and Suggestion duplicates
- Implement findEmployeeTechLead method to query Assignment and Project for Tech Lead routing
- Implement createSelfReportSuggestion method to orchestrate validation and creation
- Inject PrismaService for database operations

## Existing Code to Leverage

**Resolution Service Pattern (apps/api/src/profile/resolution.service.ts)**
- Use transaction pattern from handleApprove and handleAdjustLevel methods for atomic operations if needed
- Follow authorization checking pattern from checkSuggestionAuthorization for role-based access
- Replicate error handling structure with NestJS exceptions (BadRequestException, NotFoundException, ForbiddenException)
- Follow Prisma query patterns for Suggestion table operations with includes for related data

**Skills Service Validation (apps/api/src/skills/skills.service.ts)**
- Use getSkillById pattern to verify skill existence before creating suggestion
- Follow error response format with message and extensions.code structure
- Replicate Prisma findUnique pattern for single record lookups with proper null checking

**Auth Decorators and Guards (apps/api/src/auth)**
- Use @UseGuards(JwtAuthGuard, RolesGuard) pattern for authentication and authorization
- Use @Roles(ProfileType.EMPLOYEE) decorator to restrict mutation to EMPLOYEE role
- Use @CurrentUser() decorator to extract authenticated user from JWT token
- Follow CurrentUserType interface structure with id, email, type fields

**GraphQL Input/Response DTOs (apps/api/src/skills/dto and apps/api/src/profile/dto)**
- Follow @InputType pattern from CreateSkillInput with Field decorators and class-validator annotations
- Use @ObjectType pattern from Skill response with Field decorators and GraphQL type mappings
- Register Prisma enums with registerEnumType for GraphQL schema generation
- Use GraphQLISODateTime for timestamp fields instead of Date

**Prisma Schema Models (apps/api/prisma/schema.prisma)**
- Reference Suggestion model with all fields: id, profileId, skillId, suggestedProficiency, status, source, createdAt, resolvedAt
- Use ProficiencyLevel enum: NOVICE, INTERMEDIATE, ADVANCED, EXPERT
- Use SuggestionStatus enum: PENDING, APPROVED, REJECTED, ADJUSTED
- Use SuggestionSource enum: SELF_REPORT, SYSTEM_FLAG
- Reference EmployeeSkill unique constraint: profileId_skillId for duplicate checking

## Out of Scope
- Batch submission of multiple skills at once (single skill per mutation only)
- Free-text skill entry or creating new skills in taxonomy (only existing skills from Skill table)
- Re-submission of rejected suggestions (blocked by duplicate prevention logic)
- Manual Tech Lead selection by employee (automatic routing only)
- Edge case handling for employees without active assignments (system assumes all employees have assignments)
- Handling suggestions where employee has no Tech Lead assigned (system assumes all projects have Tech Leads)
- Frontend UI implementation for skill submission form (covered in separate spec)
- Email notifications to Tech Lead when suggestion is created
- Validation workflow implementation or Tech Lead inbox UI (already implemented)
- Allowing employees to update or delete pending suggestions after submission
