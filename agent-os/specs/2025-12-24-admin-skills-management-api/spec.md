# Specification: Admin Skills Management API

## Goal
Add GraphQL Query operations to the existing Skills API to enable admin users to retrieve and filter skills from the canonical skills taxonomy for management purposes.

## User Stories
- As an admin, I want to retrieve a filtered list of all skills so that I can view and manage the skills taxonomy
- As an admin, I want to retrieve a single skill by ID so that I can view its details before editing

## Specific Requirements

**getAllSkills Query Operation**
- Add Query resolver method decorated with `@Query(() => [Skill])`
- Accept optional input DTO with three filter fields: `isActive` (Boolean nullable), `disciplines` (Discipline array nullable), `searchTerm` (String nullable)
- Return array of Skill objects sorted alphabetically by name (ascending)
- Use Prisma `findMany` with `where` clause for filtering and `orderBy: { name: 'asc' }` for sorting
- Apply case-insensitive partial match on skill name when `searchTerm` provided using Prisma `contains` with `mode: 'insensitive'`
- Filter by `isActive` status when provided (true for active only, false for disabled only, null/undefined for all)
- Filter by multiple disciplines when `disciplines` array provided using Prisma `in` operator
- Guard with `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(ProfileType.ADMIN)`

**getSkillById Query Operation**
- Add Query resolver method decorated with `@Query(() => Skill)`
- Accept skill ID as number parameter using `@Args('id') id: number`
- Return single Skill object or throw NotFoundException with code 'NOT_FOUND' if skill doesn't exist
- Use Prisma `findUnique` with `where: { id }` to fetch skill
- Guard with `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(ProfileType.ADMIN)`
- Follow existing error handling pattern from skills.service.ts

**GetAllSkillsInput DTO**
- Create new InputType in `dto/get-all-skills.input.ts` file
- Include three optional fields: `isActive` (Boolean), `disciplines` (Discipline array), `searchTerm` (String)
- Use `@Field({ nullable: true })` decorator for all fields
- Apply `@IsOptional()` validator to all fields
- Use `@IsBoolean()` for isActive, `@IsEnum(Discipline, { each: true })` for disciplines array, `@IsString()` for searchTerm
- Import Discipline enum from @prisma/client

**Service Layer Implementation**
- Add `getAllSkills(input?: GetAllSkillsInput)` method to SkillsService
- Build dynamic Prisma where clause based on provided filters
- Combine multiple filters using AND logic when multiple provided
- Add `getSkillById(id: number)` method to SkillsService
- Throw NotFoundException with `extensions: { code: 'NOT_FOUND' }` when skill not found in getSkillById

**Access Control Enforcement**
- Both query operations require JWT authentication via JwtAuthGuard
- Both query operations require ADMIN role via RolesGuard and @Roles decorator
- Non-admin users receive FORBIDDEN error when attempting to access
- Follow exact same guard pattern as existing mutations in skills.resolver.ts

**Response Type**
- Both queries return existing Skill ObjectType from `dto/skill.response.ts`
- Skill includes all fields: id, name, discipline, isActive, createdAt, updatedAt
- getAllSkills returns array `[Skill]`, getSkillById returns single `Skill`
- No pagination implementation required

## Visual Design
No visual assets provided.

## Existing Code to Leverage

**skills.resolver.ts**
- Contains all CRUD mutations with proper guard decorators (`@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles(ProfileType.ADMIN)`)
- Shows pattern for using `@Args()` decorator to accept parameters
- Demonstrates integration with SkillsService for business logic delegation
- Add new Query methods to this existing resolver class

**skills.service.ts**
- Contains comprehensive error handling with NotFoundException and custom error codes
- Shows pattern for Prisma queries using this.prisma.skill methods
- Demonstrates validation approach with private helper methods
- Add new query service methods following existing patterns (private helpers if needed, public methods for queries)

**update-skill.input.ts**
- Shows how to structure optional input fields using `@Field({ nullable: true })`
- Demonstrates `@IsOptional()` validator usage for nullable fields
- Pattern for using `@IsEnum()` with Discipline enum from @prisma/client
- Use as template for GetAllSkillsInput DTO structure

**skill.response.ts**
- Existing ObjectType that both queries will return
- Already registered Discipline enum for GraphQL schema
- Contains all required fields for skill representation
- Reuse this response type without modification

**inbox.resolver.ts and profile.resolver.ts**
- Show Query resolver patterns with `@Query()` decorator
- Demonstrate `@UseGuards(JwtAuthGuard)` usage on query operations
- Pattern for using `@Args()` to accept query parameters
- Follow same resolver structure for consistency

## Out of Scope
- Pagination support (cursor-based or offset-based) deferred to future enhancement
- Making queries accessible to all authenticated users (admin-only access for this spec)
- Bulk operations such as bulk disable, bulk delete, or bulk update
- Skill usage analytics showing count of employees with each skill
- Cascading delete effects or impact analysis on EmployeeSkills when skill is disabled
- Additional validation rules beyond what currently exists in skills.service.ts
- Sorting by fields other than name (e.g., createdAt, updatedAt, discipline)
- Advanced search features like fuzzy matching or regex support
- Filtering by date ranges (createdAt or updatedAt)
- Export functionality to download skills list as CSV or JSON
