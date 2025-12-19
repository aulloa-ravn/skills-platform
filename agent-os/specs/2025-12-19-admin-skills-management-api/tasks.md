# Task Breakdown: Admin Skills Management API

## Overview
Total Tasks: 4 task groups with 26 sub-tasks
Feature Type: Backend API (GraphQL)
Testing Strategy: Focused unit tests (2-8 per layer, max 10 additional for gap filling)

## Task List

### GraphQL DTOs and Schema

#### Task Group 1: Input/Output Types and Schema Registration
**Dependencies:** None

- [x] 1.0 Complete GraphQL DTOs and schema layer
  - [x] 1.1 Write 2-8 focused tests for DTO validation
    - Limit to 2-8 highly focused tests maximum
    - Test only critical validation behaviors (e.g., required fields, enum validation, whitespace trimming)
    - Skip exhaustive coverage of all edge cases
  - [x] 1.2 Create CreateSkillInput DTO
    - File: `/apps/api/src/skills/dto/create-skill.input.ts`
    - Use @InputType decorator from @nestjs/graphql
    - Fields: name (String!, required), discipline (Discipline!, required)
    - Validators: @IsNotEmpty(), @IsString() for name; @IsEnum(Discipline) for discipline
    - Reuse pattern from: `/apps/api/src/profile/dto/resolution.input.ts`
  - [x] 1.3 Create UpdateSkillInput DTO
    - File: `/apps/api/src/skills/dto/update-skill.input.ts`
    - Use @InputType decorator
    - Fields: id (ID!, required), name (String, optional), discipline (Discipline, optional)
    - Validators: @IsNotEmpty() for id; @IsOptional(), @IsString(), @IsNotEmpty() for name; @IsOptional(), @IsEnum(Discipline) for discipline
    - Ensure at least one of name or discipline is provided (validation in service layer)
  - [x] 1.4 Create Skill ObjectType
    - File: `/apps/api/src/skills/dto/skill.response.ts`
    - Use @ObjectType decorator from @nestjs/graphql
    - Fields: id (ID!), name (String!), discipline (Discipline!), isActive (Boolean!), createdAt (DateTime!), updatedAt (DateTime!)
    - Use @Field decorator for each field with appropriate GraphQL types
  - [x] 1.5 Register Discipline enum for GraphQL
    - File: `/apps/api/src/skills/dto/skill.response.ts` or separate enums file
    - Use registerEnumType(Discipline, { name: 'Discipline', description: '...' })
    - Import Discipline from @prisma/client
    - Reuse pattern from: `/apps/api/src/profile/dto/resolution.input.ts` (ResolutionAction enum)
  - [x] 1.6 Ensure DTO layer tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify class-validator decorators work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- All DTOs have proper GraphQL decorators (@InputType, @ObjectType, @Field)
- Discipline enum registered with GraphQL schema
- Class-validator decorators applied to all input fields

### Service Layer

#### Task Group 2: Skills Service with Validation Logic
**Dependencies:** Task Group 1

- [x] 2.0 Complete skills service layer
  - [x] 2.1 Write 2-8 focused tests for service methods
    - Limit to 2-8 highly focused tests maximum
    - Test only critical service behaviors (e.g., name uniqueness check, normalization, soft delete logic)
    - Skip exhaustive testing of all validation scenarios
  - [x] 2.2 Create SkillsService with constructor
    - File: `/apps/api/src/skills/skills.service.ts`
    - Use @Injectable() decorator
    - Inject PrismaService in constructor
    - Reuse pattern from: `/apps/api/src/profile/resolution.service.ts`
  - [x] 2.3 Implement name normalization helper method
    - Method: private normalizeName(name: string): string
    - Trim leading/trailing whitespace
    - Convert to lowercase for case-insensitive comparison
    - Return normalized string for uniqueness checks
  - [x] 2.4 Implement name uniqueness validation method
    - Method: private async validateNameUniqueness(name: string, excludeId?: string): Promise<void>
    - Normalize input name using normalizeName()
    - Query database for skills with matching normalized name (case-insensitive)
    - Use Prisma where clause: { name: { equals: normalizedName, mode: 'insensitive' } }
    - Exclude current skill ID if provided (for update operations)
    - Check both active AND disabled skills
    - Throw BadRequestException if duplicate found with message 'Skill name already exists' and code 'DUPLICATE_NAME'
  - [x] 2.5 Implement createSkill method
    - Method: async createSkill(input: CreateSkillInput): Promise<Skill>
    - Validate name uniqueness using validateNameUniqueness()
    - Trim name before storage: input.name.trim()
    - Create skill with: prisma.skill.create({ data: { name: trimmedName, discipline: input.discipline, isActive: true } })
    - Return created Skill object
    - Prisma auto-handles createdAt, updatedAt, id generation
  - [x] 2.6 Implement updateSkill method
    - Method: async updateSkill(input: UpdateSkillInput): Promise<Skill>
    - Verify skill exists using prisma.skill.findUnique({ where: { id: input.id } })
    - Throw NotFoundException if skill not found with message 'Skill not found' and code 'NOT_FOUND'
    - Validate at least one field (name or discipline) is provided
    - If name provided: validate uniqueness excluding current skill ID, trim name
    - Build update data object dynamically based on provided fields
    - Update skill: prisma.skill.update({ where: { id: input.id }, data: updateData })
    - Return updated Skill object
  - [x] 2.7 Implement disableSkill method
    - Method: async disableSkill(id: string): Promise<Skill>
    - Verify skill exists using prisma.skill.findUnique({ where: { id } })
    - Throw NotFoundException if skill not found with message 'Skill not found' and code 'NOT_FOUND'
    - Verify skill is currently active (isActive === true)
    - Throw BadRequestException if already disabled with message 'Skill is already disabled' and code 'ALREADY_DISABLED'
    - Update skill: prisma.skill.update({ where: { id }, data: { isActive: false } })
    - Return updated Skill object
    - Note: Allow disabling even if referenced in EmployeeSkill or Suggestion tables
  - [x] 2.8 Implement enableSkill method
    - Method: async enableSkill(id: string): Promise<Skill>
    - Verify skill exists using prisma.skill.findUnique({ where: { id } })
    - Throw NotFoundException if skill not found with message 'Skill not found' and code 'NOT_FOUND'
    - Verify skill is currently disabled (isActive === false)
    - Throw BadRequestException if already active with message 'Skill is already active' and code 'ALREADY_ACTIVE'
    - Update skill: prisma.skill.update({ where: { id }, data: { isActive: true } })
    - Return updated Skill object
  - [x] 2.9 Ensure service layer tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify critical service methods work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- All service methods properly validate inputs
- Name normalization and uniqueness checks work correctly
- Appropriate exceptions thrown for error cases (BadRequestException, NotFoundException)
- Soft delete behavior correctly manages isActive flag

### Resolver Layer

#### Task Group 3: GraphQL Resolver with Admin Authorization
**Dependencies:** Task Groups 1-2

- [x] 3.0 Complete skills resolver layer
  - [x] 3.1 Write 2-8 focused tests for resolver authorization
    - Limit to 2-8 highly focused tests maximum
    - Test only critical resolver behaviors (e.g., admin authorization check, mutation success case)
    - Skip exhaustive testing of all mutation scenarios
  - [x] 3.2 Create SkillsResolver with constructor
    - File: `/apps/api/src/skills/skills.resolver.ts`
    - Use @Resolver() decorator from @nestjs/graphql
    - Inject SkillsService in constructor
    - Reuse pattern from: `/apps/api/src/profile/resolution.resolver.ts`
  - [x] 3.3 Implement createSkill mutation
    - Use @Mutation(() => Skill) decorator
    - Apply guards: @UseGuards(JwtAuthGuard, RolesGuard)
    - Apply role decorator: @Roles(Role.ADMIN)
    - Parameters: @Args('input') input: CreateSkillInput
    - Call: return this.skillsService.createSkill(input)
    - Guards automatically handle authentication and admin authorization
  - [x] 3.4 Implement updateSkill mutation
    - Use @Mutation(() => Skill) decorator
    - Apply guards: @UseGuards(JwtAuthGuard, RolesGuard)
    - Apply role decorator: @Roles(Role.ADMIN)
    - Parameters: @Args('input') input: UpdateSkillInput
    - Call: return this.skillsService.updateSkill(input)
  - [x] 3.5 Implement disableSkill mutation
    - Use @Mutation(() => Skill) decorator
    - Apply guards: @UseGuards(JwtAuthGuard, RolesGuard)
    - Apply role decorator: @Roles(Role.ADMIN)
    - Parameters: @Args('id') id: string
    - Call: return this.skillsService.disableSkill(id)
    - Note: Single id argument, NOT wrapped in input type per spec
  - [x] 3.6 Implement enableSkill mutation
    - Use @Mutation(() => Skill) decorator
    - Apply guards: @UseGuards(JwtAuthGuard, RolesGuard)
    - Apply role decorator: @Roles(Role.ADMIN)
    - Parameters: @Args('id') id: string
    - Call: return this.skillsService.enableSkill(id)
    - Note: Single id argument, NOT wrapped in input type per spec
  - [x] 3.7 Ensure resolver layer tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify mutations require admin role
    - Verify mutations call service methods correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- All mutations protected by JwtAuthGuard and RolesGuard
- @Roles(Role.ADMIN) decorator applied to all mutations
- Non-admin users receive ForbiddenException
- All mutations return Skill object (not custom response types)

### Module Configuration and Integration

#### Task Group 4: Module Setup and Test Gap Analysis
**Dependencies:** Task Groups 1-3

- [x] 4.0 Complete module configuration and test coverage
  - [x] 4.1 Create SkillsModule
    - File: `/apps/api/src/skills/skills.module.ts`
    - Use @Module decorator from @nestjs/common
    - Imports: [PrismaModule]
    - Providers: [SkillsService, SkillsResolver]
    - Exports: [SkillsService] (for potential use in other modules)
  - [x] 4.2 Register SkillsModule in AppModule
    - File: `/apps/api/src/app.module.ts`
    - Add SkillsModule to imports array
    - Verify module loads correctly
  - [x] 4.3 Create barrel export (index.ts)
    - File: `/apps/api/src/skills/index.ts`
    - Export all DTOs, service, resolver, and module
    - Optional: helps with cleaner imports
  - [x] 4.4 Review tests from Task Groups 1-3
    - Review the 2-8 tests written for DTOs (Task 1.1)
    - Review the 2-8 tests written for service (Task 2.1)
    - Review the 2-8 tests written for resolver (Task 3.1)
    - Total existing tests: approximately 6-24 tests
  - [x] 4.5 Analyze test coverage gaps for THIS feature only
    - Identify critical workflows that lack test coverage
    - Focus ONLY on gaps related to admin skills management feature
    - Do NOT assess entire application test coverage
    - Prioritize integration points: service-to-resolver, service-to-database
    - Consider testing: full mutation workflows, error handling paths, edge cases
  - [x] 4.6 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration between layers (resolver -> service -> database)
    - Test critical error handling paths (duplicate names, not found, already disabled/enabled)
    - Test full mutation workflows end-to-end if not covered
    - Do NOT write comprehensive coverage for all scenarios
    - Skip performance tests, load tests, and security tests unless business-critical
  - [x] 4.7 Run feature-specific tests only
    - Run ONLY tests related to admin skills management feature
    - Expected total: approximately 16-34 tests maximum
    - Verify all critical workflows pass
    - Do NOT run the entire application test suite
  - [x] 4.8 Verify GraphQL schema generation
    - Start the NestJS application in development mode
    - Verify GraphQL schema includes: Discipline enum, Skill type, CreateSkillInput, UpdateSkillInput
    - Verify mutations appear in schema: createSkill, updateSkill, disableSkill, enableSkill
    - Test with GraphQL Playground or similar tool (optional manual verification)

**Acceptance Criteria:**
- SkillsModule properly configured and registered in AppModule
- All feature-specific tests pass (approximately 16-34 tests total)
- Critical workflows covered: create, update, disable, enable skills
- Error handling paths tested: duplicate names, not found, invalid states
- No more than 10 additional tests added when filling in testing gaps
- GraphQL schema correctly includes all types, inputs, and mutations

## Execution Order

Recommended implementation sequence:
1. GraphQL DTOs and Schema (Task Group 1)
2. Skills Service (Task Group 2)
3. Skills Resolver (Task Group 3)
4. Module Configuration and Test Gap Analysis (Task Group 4)

## File Structure

Expected file structure after implementation:

```
/apps/api/src/skills/
├── dto/
│   ├── create-skill.input.ts      # CreateSkillInput with validators
│   ├── update-skill.input.ts      # UpdateSkillInput with validators
│   └── skill.response.ts          # Skill ObjectType and Discipline enum registration
├── skills.service.ts              # Service with validation and CRUD logic
├── skills.resolver.ts             # GraphQL resolver with admin guards
├── skills.module.ts               # Module configuration
├── index.ts                       # Barrel export (optional)
└── __tests__/                     # Test files (approximately 16-34 tests total)
    ├── skills.service.spec.ts
    ├── skills.resolver.spec.ts
    └── dto.validation.spec.ts
```

## Implementation Notes

**Authorization Pattern:**
- Use guard composition: @UseGuards(JwtAuthGuard, RolesGuard)
- JwtAuthGuard MUST come first (handles authentication)
- RolesGuard checks user.role against @Roles decorator metadata
- Guards throw ForbiddenException automatically for unauthorized access
- Follow pattern from: `/apps/api/src/auth/guards/roles.guard.ts`

**Validation Strategy:**
- Case-insensitive name comparison using Prisma mode: 'insensitive'
- Normalize names by trimming whitespace before storage and comparison
- Check uniqueness against ALL skills (active AND disabled)
- Use class-validator decorators on DTOs for basic validation
- Implement business logic validation in service layer

**Error Handling:**
- BadRequestException: validation failures (duplicate name, empty name, invalid state)
- NotFoundException: skill ID not found
- ForbiddenException: non-admin users (handled automatically by RolesGuard)
- Include structured error responses with message and extensions.code
- Follow pattern from: `/apps/api/src/profile/resolution.service.ts`

**Database Operations:**
- PrismaService automatically handles updatedAt timestamp on updates
- Use Prisma methods: create, update, findUnique, findFirst
- Soft delete: set isActive=false (never delete records)
- Allow disabling skills even if referenced in EmployeeSkill or Suggestion tables

**Testing Constraints:**
- Each task group (1-3) writes 2-8 focused tests maximum
- Tests cover only critical behaviors, not exhaustive coverage
- Test verification runs ONLY the newly written tests, not entire suite
- Task Group 4 adds maximum of 10 additional tests to fill critical gaps
- Total expected tests: approximately 16-34 tests for this feature

**GraphQL Schema:**
- Discipline enum must be registered using registerEnumType
- All mutations return Skill object (not custom response types)
- disableSkill and enableSkill accept single id argument (not wrapped in input type)
- CreateSkillInput and UpdateSkillInput use @InputType decorator
- Skill response uses @ObjectType decorator

**Integration Points:**
- Existing Skill model in Prisma schema (no changes needed)
- Existing RolesGuard and JwtAuthGuard (reuse as-is)
- Existing PrismaService (inject and use)
- Existing Role enum from @prisma/client
- Disabled skills should be filtered out in other resolvers (future enhancement, not in this spec)
