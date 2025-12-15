# Specification: Employee Profile API

## Goal
Build a GraphQL query to fetch comprehensive employee profile data including tiered skills (Core Stack, Validated Inventory, Pending), seniority timeline, and current project assignments with proper role-based authorization.

## User Stories
- As an employee, I want to query my own profile data so that I can view my validated skills, pending suggestions, seniority history, and current assignments
- As a tech lead, I want to view profiles of employees in projects I lead so that I can understand their skill inventory and current assignments
- As an admin, I want to view any employee profile so that I can manage the organization's skill inventory

## Specific Requirements

**GraphQL Query Design**
- Query name: `getProfile` with required argument `id: String!`
- Always requires profileId parameter (no optional/default behavior)
- Returns comprehensive ProfileResponse object with nested types for skills, seniority history, and assignments
- Use NestJS GraphQL decorators (`@Query`, `@Args`, `@Field`, `@ObjectType`) following existing auth resolver patterns
- Register all Prisma enums (ProficiencyLevel, Discipline) for GraphQL using `registerEnumType` pattern from login.response.ts

**Authentication & Authorization**
- Apply JWT guard using existing JwtAuthGuard from apps/api/src/auth/guards/jwt-auth.guard.ts
- Use CurrentUser decorator to extract authenticated user from JWT token
- Implement custom authorization logic in service layer (not roles guard)
- EMPLOYEE role: Can only query their own profile (verify user.id === requested profileId)
- TECH_LEAD role: Can query profiles of employees assigned to projects they lead (join Profile → Assignment → Project where techLeadId === user.id)
- ADMIN role: Can query any profile without restrictions
- Throw ForbiddenException with descriptive message and code 'FORBIDDEN' if authorization fails
- Throw NotFoundException with code 'NOT_FOUND' if profile doesn't exist

**Profile Header Fields**
- Return id, name, email, currentSeniorityLevel, and avatarUrl (nullable)
- Use Prisma query with select to fetch only needed fields
- Map directly from Profile model to ProfileResponse DTO

**Three-Tier Skills Organization**
- Tier 1 - Core Stack: Validated skills matching tags from current Assignment records
- Tier 2 - Validated Inventory: All other approved EmployeeSkill records not in Core Stack
- Tier 3 - Pending: Suggestion records with status === 'PENDING'
- Fetch all assignments for the profile, extract tags array, create Set for O(1) lookup
- Query EmployeeSkill with relations to Skill and validatedBy Profile
- Partition validated skills into Core Stack vs Validated Inventory based on tag matching
- Query Suggestion records with status PENDING and include related Skill data

**Validated Skills Metadata**
- For Core Stack and Validated Inventory tiers, return: skill name, discipline, proficiencyLevel, validatedAt, validatedById, and validator name
- Use Prisma include on EmployeeSkill → validatedBy relation to fetch validator Profile data
- Map EmployeeSkill records to ValidatedSkillResponse DTO with nested validator object
- Handle nullable validatedById gracefully (validator fields should be optional)

**Pending Skills Data**
- Return skill name, discipline, suggestedProficiency, and createdAt timestamp
- Query Suggestion table with include for Skill relation
- Map to PendingSkillResponse DTO with fields from both Suggestion and Skill models

**Seniority Timeline**
- Query SeniorityHistory table filtered by profileId, include createdBy Profile relation
- Sort by effectiveDate descending (most recent first) using Prisma orderBy
- Return array of history records with seniorityLevel, effectiveDate, createdById (nullable), and creator name (nullable)
- Map to SeniorityHistoryResponse DTO, handle nullable createdBy relation

**Current Assignments with Tech Lead Info**
- Query Assignment table filtered by profileId, include Project relation with techLead Profile
- Return project name, assignment role, assignment tags array, and nested tech lead info
- For tech lead, include: id, name, and email
- Map to CurrentAssignmentResponse DTO with nested TechLeadInfo object
- Handle nullable techLeadId in Project model (tech lead fields should be optional)

**Error Handling**
- Use NotFoundException for profile not found scenarios
- Use ForbiddenException for authorization failures with descriptive message
- Include extensions object with error code for client-side error handling
- Follow error pattern from auth.service.ts (UnauthorizedException example)
- Let NestJS handle database errors with standard 500 responses

**Module Structure**
- Create new profile module in apps/api/src/profile/ directory
- Include profile.resolver.ts, profile.service.ts, profile.module.ts
- Create dto/ subdirectory for all GraphQL response types
- Import PrismaModule and AuthModule in ProfileModule
- Register ProfileModule in AppModule imports array

## Visual Design
No visual mockups provided for this API feature.

## Existing Code to Leverage

**Authentication Guard Pattern**
- Reuse JwtAuthGuard from apps/api/src/auth/guards/jwt-auth.guard.ts by applying to resolver with `@UseGuards(JwtAuthGuard)` (or rely on global guard from app.module.ts)
- Use CurrentUser decorator from apps/api/src/auth/decorators/current-user.decorator.ts to extract authenticated user
- CurrentUserType interface provides id, email, and role fields for authorization logic

**GraphQL Resolver Pattern**
- Follow resolver structure from apps/api/src/auth/auth.resolver.ts with `@Resolver()` class decorator
- Use `@Query(() => ReturnType)` decorator for getProfile query method
- Use `@Args('argName')` decorator to extract query arguments
- Constructor inject ProfileService for business logic separation

**GraphQL DTO Pattern**
- Follow ObjectType pattern from apps/api/src/auth/dto/login.response.ts
- Use `@ObjectType()` decorator for response classes and `@Field()` for each property
- Use `@Field(() => Type)` syntax for custom types, enums, and arrays
- Register Prisma enums with registerEnumType function before use in DTOs
- Create nested ObjectTypes for complex structures (validator info, tech lead info)

**PrismaService Usage**
- Inject PrismaService from apps/api/src/prisma/prisma.service.ts into ProfileService
- Use Prisma Client methods: findUnique, findMany with where, include, select, orderBy
- Leverage Prisma relations for efficient joins instead of multiple queries
- Use Prisma's type safety for query building and result mapping

**Authorization Service Pattern**
- Reference AuthService from apps/api/src/auth/auth.service.ts for computed role logic
- Implement similar helper method in ProfileService for checking tech lead access (query projects by techLeadId, then check assignments)
- Use conditional logic based on user.role from CurrentUser decorator
- Throw appropriate NestJS exceptions (ForbiddenException, NotFoundException) with extensions

## Out of Scope
- Profile editing mutations (create, update, delete profile data)
- Skills management mutations (add, remove, update validated skills)
- Suggestion management mutations (approve, reject, adjust pending suggestions)
- Seniority history mutations (add, update seniority records)
- Pagination for skills, assignments, or seniority history
- Filtering or search parameters beyond profileId
- Sorting options for skills beyond the three-tier structure
- Skill proficiency level validation rules
- Profile listing or search queries (e.g., getAllProfiles, searchProfiles)
- Real-time subscriptions for profile updates
- Caching strategies or performance optimizations beyond efficient Prisma queries
- File upload for avatar images
- Batch queries for multiple profiles
- Duration calculation for seniority levels
