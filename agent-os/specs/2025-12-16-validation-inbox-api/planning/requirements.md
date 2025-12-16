# Spec Requirements: Validation Inbox API

## Initial Description
Validation Inbox API — Create GraphQL queries returning hierarchical inbox data (projects -> members -> suggestions) filtered by logged-in Tech Lead

Source: Product Roadmap Item #9
Size Estimate: M (Medium)

## Requirements Discussion

### First Round Questions

**Q1:** Hierarchical Structure - I assume the inbox data should be structured as: Projects (that the tech lead leads) → Employees (assigned to each project) → Pending Suggestions (for each employee). The query should return all three levels in one call. Is that correct, or should we provide separate queries for each level?

**Answer:** Single query returning all three levels (Projects → Employees → Pending Suggestions) in one call. This is consistent with existing patterns like the Employee Profile API.

**Q2:** Filtering by Tech Lead - I'm thinking the query should automatically filter based on the logged-in user's ID (extracted from JWT token via CurrentUser decorator, similar to the Employee Profile API). The query would join Profile → Project (where techLeadId === user.id) → Assignment → Suggestion (where status === 'PENDING'). Should we support any additional filtering parameters (like date range, specific proficiency levels, or skill disciplines), or just return all pending suggestions for the tech lead's projects?

**Answer:** Automatically filter based on the logged-in user's ID (from JWT token). Return all pending suggestions without additional filtering parameters.

**Q3:** Suggestion Grouping - I assume suggestions should be grouped by project first, then by employee within each project. Should suggestions for the same employee on multiple projects appear under each respective project, or should we deduplicate somehow?

**Answer:** Suggestions for the same employee on multiple projects appear under each respective project separately (no deduplication).

**Q4:** Response Data - For each suggestion in the inbox, I'm thinking we should return: suggestion ID, skill name, skill discipline, suggested proficiency level, created date, and the employee's current proficiency for that skill (if they have one). Should we also include the source (SELF_REPORT vs SYSTEM_FLAG) and any other metadata?

**Answer:** Approved - return suggestion ID, skill name, skill discipline, suggested proficiency level, created date, employee's current proficiency for that skill (if they have one), and source (SELF_REPORT vs SYSTEM_FLAG).

**Q5:** Empty States - Should the query return projects with zero pending suggestions, or only projects that have at least one pending suggestion? Similarly, should we return employees within a project who have no pending suggestions?

**Answer:** Only return projects with at least one pending suggestion, and within those projects, only employees who have pending suggestions. This keeps the inbox focused on actionable items.

**Q6:** Authorization - I assume this query should be accessible by TECH_LEAD and ADMIN roles only (not EMPLOYEE role). ADMIN can see the inbox for all tech leads (not filtered), while TECH_LEAD sees only their own projects' suggestions. Is that correct?

**Answer:** Approved - TECH_LEAD sees only their own projects' suggestions, ADMIN sees all (not filtered), EMPLOYEE has no access.

**Q7:** Performance Considerations - Given that this could potentially return a lot of nested data, should we implement any limits (e.g., maximum number of projects, employees, or suggestions per query), or should we return everything and handle pagination in a future iteration?

**Answer:** Return everything without limits. Handle pagination in a future iteration.

**Q8:** Out of Scope - I assume this API will NOT include mutation operations (approve, reject, adjust suggestions), profile editing, or real-time updates via subscriptions. Those will be handled in future specs. Is there anything else you want to explicitly exclude from this API specification?

**Answer:** Approved - exclude mutation operations (approve, reject, adjust suggestions), profile editing, and real-time updates.

### Existing Code to Reference

Based on user's response about similar features:

**Similar Features Identified:**
- Feature: Employee Profile API - Path: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/`
- Components to potentially reuse:
  - ProfileService authorization pattern (`checkAuthorization` method for role-based access control)
  - CurrentUser decorator from authentication system
  - JwtAuthGuard pattern for protecting GraphQL resolvers
  - GraphQL ObjectType and Field decorator patterns for response DTOs
  - PrismaService usage for complex queries with relations and filtering
  - Error handling patterns (NotFoundException, ForbiddenException with extensions)

- Feature: Authentication Foundation - Path: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/auth/`
- Backend logic to reference:
  - JWT token validation and user extraction
  - Role-based authorization checks
  - Error handling with GraphQL error codes (FORBIDDEN, UNAUTHORIZED)

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No visual files found during mandatory check.

## Requirements Summary

### Functional Requirements

**GraphQL Query Design:**
- Query name: `getValidationInbox` with no required arguments
- Returns hierarchical InboxResponse object containing array of ProjectInbox objects
- Each ProjectInbox contains project metadata and array of EmployeeInbox objects
- Each EmployeeInbox contains employee metadata and array of PendingSuggestion objects
- Use NestJS GraphQL decorators (@Query, @Field, @ObjectType) following existing patterns
- Register all Prisma enums (ProficiencyLevel, SuggestionSource, Discipline) for GraphQL

**Authentication & Authorization:**
- Apply JWT guard using existing JwtAuthGuard
- Use CurrentUser decorator to extract authenticated user from JWT token
- TECH_LEAD role: Can only see projects where they are the tech lead (Project.techLeadId === user.id)
- ADMIN role: Can see all projects with pending suggestions (no filtering)
- EMPLOYEE role: No access - throw ForbiddenException
- Throw ForbiddenException with code 'FORBIDDEN' if EMPLOYEE attempts access
- Follow authorization pattern from ProfileService

**Hierarchical Data Structure:**
- Level 1 (Project): Project ID, project name, count of pending suggestions for this project
- Level 2 (Employee): Employee ID, employee name, employee email, count of pending suggestions for this employee in this project
- Level 3 (Suggestion): Suggestion ID, skill name, skill discipline, suggested proficiency level, source (SELF_REPORT or SYSTEM_FLAG), created date, current proficiency level (nullable - employee's existing proficiency for this skill if they have it)

**Filtering Logic:**
- For TECH_LEAD: Filter projects by techLeadId === authenticated user ID
- For ADMIN: Return all projects (no tech lead filtering)
- For all roles: Only include projects that have at least one pending suggestion
- Only include employees within projects who have at least one pending suggestion
- Filter suggestions by status === 'PENDING'
- No deduplication: Same employee can appear in multiple projects if they have pending suggestions in each

**Data Fetching Strategy:**
- Use Prisma queries with include and where clauses for efficient data loading
- Query projects filtered by techLeadId (for TECH_LEAD) or all projects (for ADMIN)
- For each project, query assignments to get employees
- For each employee in each project, query suggestions with status === 'PENDING'
- Include Skill relation on Suggestion to get skill name and discipline
- Include EmployeeSkill relation to get current proficiency level (if exists)
- Group and structure data into three-level hierarchy before returning

**Current Proficiency Logic:**
- For each pending suggestion, check if employee has existing EmployeeSkill record for that skill
- If EmployeeSkill exists, return the proficiencyLevel
- If EmployeeSkill does not exist, return null/undefined for current proficiency
- Query EmployeeSkill table with where clause: profileId === employee.id AND skillId === suggestion.skillId

**Error Handling:**
- Use ForbiddenException for EMPLOYEE role access attempts with code 'FORBIDDEN'
- Include extensions object with error code for client-side error handling
- Follow error pattern from ProfileService and AuthService
- Let NestJS handle database errors with standard 500 responses

**Module Structure:**
- Reuse existing profile module at `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/`
- Add new inbox.resolver.ts and inbox.service.ts to profile module
- Create dto/ subdirectory files for InboxResponse, ProjectInbox, EmployeeInbox, PendingSuggestion ObjectTypes
- No need to create new module - extend ProfileModule with inbox functionality

### Reusability Opportunities

**Authorization Pattern:**
- Reuse ProfileService authorization approach with role-based checks
- Pattern: Check user.role, apply different filtering logic based on role
- ADMIN bypass filtering, TECH_LEAD filter by relationship, EMPLOYEE denied

**GraphQL Patterns:**
- Reuse resolver structure from profile.resolver.ts
- Reuse ObjectType/Field decorator patterns from profile.response.ts DTOs
- Reuse enum registration pattern for Prisma enums

**Prisma Query Patterns:**
- Reuse complex query patterns with include and where from ProfileService
- Reuse relation-based filtering (similar to tech lead assignment checks)
- Reuse Promise.all pattern for parallel data fetching if needed

**Decorator Patterns:**
- Reuse @UseGuards(JwtAuthGuard) from profile.resolver.ts
- Reuse @CurrentUser() decorator from existing auth implementation
- Reuse @Query() and @Args() decorator patterns

### Scope Boundaries

**In Scope:**
- Single GraphQL query: `getValidationInbox`
- Three-level hierarchical response: Projects → Employees → Suggestions
- Automatic filtering based on logged-in user's role and ID
- Authorization for TECH_LEAD and ADMIN roles only
- Return all pending suggestions without pagination or additional filters
- Include current proficiency level for each suggestion if employee has existing skill
- Include suggestion source (SELF_REPORT vs SYSTEM_FLAG)
- Empty state handling: only return projects and employees with pending suggestions
- Error handling for unauthorized access

**Out of Scope:**
- Mutation operations (approve, reject, adjust suggestions) - handled in future spec #11 "Skill Resolution API"
- Real-time subscriptions for inbox updates
- Pagination or limits on number of projects/employees/suggestions
- Additional filtering parameters (date range, proficiency level, discipline)
- Sorting options for projects, employees, or suggestions
- Profile editing mutations
- Suggestion creation mutations - handled in future spec #7 "Self-Report Skills API"
- Batch operations on suggestions
- Suggestion detail view query (separate from inbox listing)
- Count-only queries (e.g., total pending suggestions count)
- Historical suggestion data (resolved suggestions with status APPROVED, REJECTED, ADJUSTED)
- Caching strategies or performance optimizations beyond efficient Prisma queries
- Deduplication of employees appearing in multiple projects

### Technical Considerations

**Integration Points:**
- JWT authentication system for user identification and role extraction
- Prisma ORM for database queries with PostgreSQL
- NestJS GraphQL module with Apollo Server for API layer
- CurrentUser decorator for accessing authenticated user context
- JwtAuthGuard for protecting GraphQL resolvers

**Existing System Constraints:**
- Must follow NestJS GraphQL patterns established in auth and profile modules
- Must use Prisma Client for all database operations
- Must follow error handling patterns with extensions object and error codes
- Must use existing Role enum (EMPLOYEE, TECH_LEAD, ADMIN) from Prisma schema
- Email domain constraint: all emails must be from ravn.com domain (established in roadmap)

**Technology Preferences:**
- TypeScript for type safety across resolver, service, and DTO layers
- GraphQL ObjectType decorators for response structure definition
- Prisma include/where for efficient relational queries vs multiple queries
- Promise-based async/await for asynchronous operations

**Similar Code Patterns to Follow:**
- Follow ProfileService.getProfile pattern for authorization checks
- Follow ProfileService private methods pattern for breaking down complex data fetching
- Follow profile.response.ts pattern for nested ObjectType DTOs
- Follow auth error handling pattern with extensions.code for error categorization
- Follow ProfileModule pattern for module organization and dependency injection
