# Specification: Validation Inbox API

## Goal
Create a GraphQL query that returns hierarchical inbox data (Projects → Employees → Pending Suggestions) filtered by the logged-in Tech Lead, enabling tech leads and admins to view all pending skill validations requiring their review.

## User Stories
- As a Tech Lead, I want to view all pending skill suggestions for employees across my projects so that I can efficiently review and validate their skills
- As an Admin, I want to view all pending skill suggestions across all projects so that I can oversee the validation process organization-wide

## Specific Requirements

**GraphQL Query Structure**
- Query name `getValidationInbox` with no required arguments
- Returns `InboxResponse` ObjectType containing array of `ProjectInbox` objects
- Apply `@UseGuards(JwtAuthGuard)` decorator to protect the resolver
- Use `@CurrentUser()` decorator to extract authenticated user (id, email, role) from JWT token
- Follow NestJS GraphQL patterns using `@Query`, `@Field`, `@ObjectType` decorators
- Register Prisma enums (`ProficiencyLevel`, `SuggestionSource`, `Discipline`) for GraphQL using `registerEnumType`

**Three-Level Hierarchical Response**
- Level 1 ProjectInbox: project ID, project name, count of pending suggestions for this project, array of EmployeeInbox
- Level 2 EmployeeInbox: employee ID, employee name, employee email, count of pending suggestions for this employee in this project, array of PendingSuggestion
- Level 3 PendingSuggestion: suggestion ID, skill name, skill discipline, suggested proficiency level, source (SELF_REPORT or SYSTEM_FLAG), created date, current proficiency level (nullable)
- Create separate ObjectType classes for each level in `dto/inbox.response.ts` file
- Use `GraphQLISODateTime` for date fields following existing patterns

**Role-Based Authorization Logic**
- EMPLOYEE role: Throw `ForbiddenException` with message "You do not have permission to access the validation inbox" and extensions code 'FORBIDDEN'
- TECH_LEAD role: Filter projects where `Project.techLeadId === authenticated user.id`, only return projects with at least one pending suggestion
- ADMIN role: Return all projects with pending suggestions (no tech lead filtering)
- Implement authorization check in service layer similar to `ProfileService.checkAuthorization` pattern
- Follow error handling pattern with extensions object for GraphQL error codes

**Data Filtering and Grouping**
- Only include projects that have at least one suggestion with `status === 'PENDING'`
- Within projects, only include employees who have at least one pending suggestion
- No deduplication: same employee can appear under multiple projects if they have pending suggestions in each
- Filter suggestions by `Suggestion.status === 'PENDING'`
- Group data by project first, then by employee within each project
- Sort projects alphabetically by name, employees alphabetically by name within projects

**Current Proficiency Lookup**
- For each pending suggestion, query `EmployeeSkill` table to find existing proficiency
- Query condition: `EmployeeSkill.profileId === employee.id AND EmployeeSkill.skillId === suggestion.skillId`
- If EmployeeSkill record exists, return `proficiencyLevel` value in `currentProficiency` field
- If no EmployeeSkill record exists, return `null` for `currentProficiency` field
- Include this lookup in the Prisma query strategy to minimize database round-trips

**Prisma Query Strategy**
- Query projects with include for assignments and nested suggestion filtering
- For TECH_LEAD: apply `where: { techLeadId: userId }` on Project query
- For ADMIN: query all projects without tech lead filter
- Use nested includes to fetch: Project → Assignment → Profile, Suggestion → Skill, EmployeeSkill (for current proficiency)
- Filter suggestions at query level with `where: { status: 'PENDING' }`
- Structure: `prisma.project.findMany({ where: {...}, include: { assignments: { include: { profile: {...}, suggestions: {...} } } } })`
- Transform Prisma result into hierarchical DTOs in service layer before returning

**Module Integration**
- Extend existing ProfileModule at `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/`
- Create new `inbox.resolver.ts` file in profile directory for GraphQL resolver
- Create new `inbox.service.ts` file in profile directory for business logic
- Create new `dto/inbox.response.ts` file for ObjectType definitions (InboxResponse, ProjectInbox, EmployeeInbox, PendingSuggestion)
- Add InboxService and InboxResolver to ProfileModule providers array
- Inject PrismaService into InboxService via constructor

**Error Handling**
- Use `ForbiddenException` from `@nestjs/common` for EMPLOYEE role access denial
- Include extensions object with code property: `{ message: '...', extensions: { code: 'FORBIDDEN' } }`
- Let NestJS handle database errors with standard 500 responses
- No custom error handling for missing data - empty arrays are valid responses
- Follow error pattern established in ProfileService and AuthService

**Testing Strategy**
- Unit test InboxService authorization logic for all three roles (EMPLOYEE denied, TECH_LEAD filtered, ADMIN unfiltered)
- Unit test data transformation from Prisma result to hierarchical DTOs
- Unit test current proficiency lookup logic (exists vs null)
- Unit test empty state handling (no projects, no employees, no suggestions)
- Integration test end-to-end GraphQL query execution with real database
- Mock PrismaService in unit tests using Jest mocks

## Visual Design
No visual assets provided.

## Existing Code to Leverage

**ProfileService Authorization Pattern (`/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/profile.service.ts`)**
- Reuse `checkAuthorization` method pattern for role-based access control
- ADMIN bypasses filtering, TECH_LEAD applies relationship-based filtering, EMPLOYEE denied
- Use `ForbiddenException` with extensions object containing error code 'FORBIDDEN'
- Async method that throws exception for unauthorized access
- Follow pattern: check role first, then apply role-specific logic

**ProfileService Prisma Query Patterns (`/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/profile.service.ts`)**
- Reuse complex nested includes pattern from `getSkillsTiers`, `getCurrentAssignments` methods
- Use `prisma.findMany` with `where` and `include` clauses for efficient relational data loading
- Use `Promise.all` for parallel data fetching when queries are independent
- Private helper methods for breaking down complex data fetching logic
- Transform Prisma results into DTO objects before returning

**ProfileResolver GraphQL Patterns (`/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/profile.resolver.ts`)**
- Apply `@UseGuards(JwtAuthGuard)` at resolver level (not applied currently, but should be for inbox)
- Use `@CurrentUser()` decorator to extract authenticated user from JWT token
- Use `@Query(() => ReturnType)` decorator for GraphQL query definition
- Pass user.id and user.role to service layer for authorization
- Keep resolver thin - delegate all business logic to service layer

**Profile Response DTOs (`/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/dto/profile.response.ts`)**
- Use `@ObjectType()` decorator for GraphQL response classes
- Use `@Field()` decorator for each property, specify GraphQL type with `@Field(() => Type)`
- Use `registerEnumType` at top of file to register Prisma enums for GraphQL
- Use `GraphQLISODateTime` for DateTime fields
- Nest ObjectType classes for hierarchical structures (e.g., SkillsTiersResponse contains ValidatedSkillResponse[])

**CurrentUser Decorator (`/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/auth/decorators/current-user.decorator.ts`)**
- Use `CurrentUser` decorator to extract user from request context
- Returns `CurrentUserType` interface with id, email, role properties
- Automatically extracts user from JWT token via GqlExecutionContext
- No additional configuration needed - just import and use in resolver

**JwtAuthGuard (`/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/auth/guards/jwt-auth.guard.ts`)**
- Apply `@UseGuards(JwtAuthGuard)` to protect GraphQL resolvers
- Extends AuthGuard('jwt') from @nestjs/passport
- Handles GraphQL context extraction via GqlExecutionContext
- Respects @Public() decorator for public endpoints (not applicable for inbox)

**ProfileModule Structure (`/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/profile.module.ts`)**
- Import PrismaModule and AuthModule in module imports
- Add service and resolver to providers array
- Export service if needed by other modules (not required for inbox)
- Follow NestJS module pattern for dependency injection

**Prisma Schema Relations (`/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/prisma/schema.prisma`)**
- Project has techLead relation via techLeadId to Profile
- Assignment connects Profile to Project via profileId and projectId
- Suggestion connects to Profile via profileId and Skill via skillId
- EmployeeSkill connects Profile to Skill with proficiencyLevel
- Use indexes on profileId, skillId, status for optimized queries

## Out of Scope
- Mutation operations to approve, reject, or adjust suggestions (handled in future spec #11 "Skill Resolution API")
- Real-time subscriptions for inbox updates via GraphQL subscriptions
- Pagination or limits on number of projects, employees, or suggestions returned
- Additional filtering parameters such as date range, proficiency level filters, or skill discipline filters
- Sorting options beyond alphabetical by name (e.g., sort by suggestion count, created date)
- Profile editing mutations for employees or tech leads
- Suggestion creation mutations (handled in future spec #7 "Self-Report Skills API")
- Batch operations on multiple suggestions at once
- Separate detailed suggestion view query (this spec only provides inbox listing)
- Count-only queries that return total pending suggestion count without full data
- Historical suggestion data showing resolved suggestions with APPROVED, REJECTED, or ADJUSTED status
- Caching strategies or performance optimizations beyond efficient Prisma queries with includes
- Deduplication of employees who appear in multiple projects with pending suggestions
- Email notifications or real-time alerts for new pending suggestions
- Export functionality to download inbox data as CSV or PDF
