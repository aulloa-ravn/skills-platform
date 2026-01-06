# Specification: Admin Skills Management API

## Goal
Build GraphQL mutations for admin-only CRUD operations on the canonical skills taxonomy, enabling admins to create, update, disable, and re-enable skills while maintaining data integrity and historical references.

## User Stories
- As an admin, I want to create new skills with a name and discipline so that employees can add them to their profiles
- As an admin, I want to update existing skills' names and disciplines so that the taxonomy stays accurate and well-organized
- As an admin, I want to disable skills (soft delete) so that they are hidden from users while preserving historical data and existing employee skill references

## Specific Requirements

**Four GraphQL Mutations**
- createSkill: accepts name (String!) and discipline (Discipline!), returns created Skill object with isActive=true by default
- updateSkill: accepts id (ID!), optional name (String), optional discipline (Discipline), returns updated Skill object, does NOT allow changing isActive
- disableSkill: accepts id (ID!), sets isActive=false (soft delete), returns updated Skill object
- enableSkill: accepts id (ID!), sets isActive=true (re-enables disabled skill), returns updated Skill object

**GraphQL Input Types**
- CreateSkillInput with required fields: name (String!), discipline (Discipline!)
- UpdateSkillInput with required id field and optional name/discipline for partial updates
- DisableSkill and enableSkill accept single id argument (not wrapped in input type)
- Return type for all mutations is the Skill object (not custom response types with success/metadata)

**Admin-Only Authorization**
- All four mutations require Role.ADMIN check via context.user.role
- Use @Roles(Role.ADMIN) decorator with RolesGuard and JwtAuthGuard (following pattern from resolution.resolver.ts)
- Return ForbiddenException with message and code 'FORBIDDEN' for non-admin users
- Follow existing guard composition pattern: @UseGuards(JwtAuthGuard, RolesGuard)

**Name Uniqueness and Normalization Validation**
- Prevent duplicate skill names using case-insensitive comparison (e.g., "React" vs "react" are duplicates)
- Normalize names by trimming leading/trailing whitespace before comparison and storage
- Validate against special character/whitespace variations (e.g., "React" and "React " should be treated as duplicates)
- Uniqueness check applies to BOTH active and disabled skills (cannot reuse name from disabled skill)
- For updateSkill, prevent changing name to match ANY existing skill's normalized name (except the skill being updated)

**Discipline Enum Validation**
- Discipline must be one of: FRONTEND, BACKEND, LANGUAGES, DEVOPS, DATABASE, DESIGN, MOBILE, TESTING, CLOUD, OTHER, STYLING, TOOLS, API, PERFORMANCE, SECURITY, IOS, ANDROID, BUILD_TOOLS, NO_CODE
- Validation handled automatically by GraphQL schema and class-validator decorators
- Return validation error if invalid discipline provided

**Required Field Validation**
- createSkill: both name and discipline are required (non-nullable)
- updateSkill: at least one of name or discipline should be provided for the update to be meaningful
- All mutations: name must be non-empty after trimming whitespace
- Use IsNotEmpty, IsString, IsEnum validators from class-validator (following pattern from resolution.input.ts)

**Soft Delete Behavior for disableSkill**
- Set isActive=false rather than deleting database record
- Allow disabling skills even if referenced in EmployeeSkill or Suggestion tables (preserves historical data)
- Disabled skills hidden from all user-facing queries and autocomplete (filter by isActive=true in other resolvers)
- Verify skill exists and is currently active (isActive=true) before disabling
- Return appropriate error if skill not found or already disabled

**Enable Skill Behavior**
- Set isActive=true to re-enable a previously disabled skill
- Verify skill exists and is currently disabled (isActive=false) before enabling
- Return appropriate error if skill not found or already active
- Re-enabled skills immediately available in autocomplete and user-facing queries

**Error Handling and Edge Cases**
- Return BadRequestException for validation failures (duplicate name, empty name, invalid discipline)
- Return NotFoundException if skill ID does not exist in database
- Return BadRequestException if attempting to disable already-disabled skill or enable already-active skill
- Follow error handling pattern from resolution.service.ts with structured error responses
- All database operations should update the updatedAt timestamp automatically via Prisma

**GraphQL Schema Registration**
- Register Discipline enum for GraphQL using registerEnumType (following pattern from profile.response.ts)
- Define Skill ObjectType with all fields from Prisma model for GraphQL schema
- Use @InputType decorator for CreateSkillInput and UpdateSkillInput
- Use @Mutation decorator with return type specification

## Existing Code to Leverage

**RolesGuard and @Roles Decorator**
- /apps/api/src/auth/guards/roles.guard.ts implements role-based authorization checking context.user.role against required roles
- /apps/api/src/auth/decorators/roles.decorator.ts provides @Roles(...roles) decorator using SetMetadata
- Throws ForbiddenException with structured error message and extensions.code when user lacks required role
- Use @UseGuards(JwtAuthGuard, RolesGuard) with @Roles(Role.ADMIN) on all skill management mutations

**JwtAuthGuard for Authentication**
- /apps/api/src/auth/guards/jwt-auth.guard.ts extends AuthGuard('jwt') and handles GraphQL context
- Extracts request from GqlExecutionContext for passport JWT strategy
- Use as first guard in composition before RolesGuard

**PrismaService for Database Operations**
- /apps/api/src/prisma/prisma.service.ts extends PrismaClient with module lifecycle hooks
- Inject into SkillsService for all database operations on Skill model
- Use Prisma methods: create, update, findUnique, findFirst for skill mutations
- Prisma automatically handles updatedAt timestamp on updates

**GraphQL Input/Response Type Patterns**
- /apps/api/src/profile/dto/resolution.input.ts shows InputType with Field decorators and class-validator decorators (IsNotEmpty, IsString, IsEnum)
- /apps/api/src/profile/dto/profile.response.ts shows ObjectType definitions and registerEnumType pattern for Discipline and ProficiencyLevel
- Follow same patterns for CreateSkillInput, UpdateSkillInput, and Skill ObjectType

**Resolver Pattern with Guards and CurrentUser**
- /apps/api/src/profile/resolution.resolver.ts shows @Mutation with @UseGuards(JwtAuthGuard, RolesGuard) and @Args('input')
- /apps/api/src/profile/inbox.resolver.ts shows @Query with @UseGuards(JwtAuthGuard) and @CurrentUser() decorator
- Follow same resolver structure for skills.resolver.ts with admin role enforcement

**Service Validation and Error Handling**
- /apps/api/src/profile/resolution.service.ts shows validation methods returning structured errors, ForbiddenException usage, and Prisma transactions
- Implement similar validation pattern for skill name uniqueness, normalization, and existence checks
- Use BadRequestException, NotFoundException, and ForbiddenException from @nestjs/common

## Out of Scope
- Batch operations (creating, updating, or disabling multiple skills in single mutation call)
- Skill merging functionality (combining duplicate skills and migrating EmployeeSkill/Suggestion references to merged skill)
- Usage analytics (querying which employees have a skill, showing skill usage count before disabling)
- Hard delete functionality (permanent removal of skill records from database)
- Audit logging or history tracking of skill changes (who changed what when)
- Skill synonyms, aliases, or alternate names
- Skill descriptions, metadata, or additional fields beyond name and discipline
- Skill categorization or hierarchies beyond the discipline field
- Frontend UI components or admin dashboard (API-only implementation)
- Integration tests or E2E tests (unit tests deferred per roadmap constraints)
