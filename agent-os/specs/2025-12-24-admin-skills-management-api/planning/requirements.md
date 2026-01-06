# Spec Requirements: Admin Skills Management API

## Initial Description
**Item 13: Admin Skills Management API** - Build CRUD endpoints for managing the canonical skills taxonomy (add, edit, disable skills)

## Requirements Discussion

### First Round Questions

**Q1:** I notice the CRUD mutations (createSkill, updateSkill, disableSkill, enableSkill) are already fully implemented with admin-only access control. The only missing piece appears to be a Query operation to fetch/list skills for the admin UI to display. Should I add queries like `getAllSkills` (with optional filter for active/disabled/all) and `getSkillById`?

**Answer:** Yes, add getAllSkills (with optional filter for active/disabled/all) and getSkillById queries

**Q2:** I assume the getAllSkills query should return skills sorted alphabetically by name and allow filtering by discipline and/or active status. Is that correct, or would you prefer a different sorting strategy (e.g., most recently created first)?

**Answer:** Alphabetically by name with filtering by discipline and active status - correct

**Q3:** For pagination, I'm thinking this can start without pagination since the taxonomy should remain relatively small (you seeded 50 skills initially). Should we defer pagination to a future enhancement, or would you prefer cursor-based or offset-based pagination from the start?

**Answer:** Postpone pagination for future improvement (no pagination in this spec)

**Q4:** The existing implementation enforces case-insensitive uniqueness for skill names and validates against both active and disabled skills. Should the getAllSkills query also support search/filtering by skill name (case-insensitive partial match) to help admins quickly find skills?

**Answer:** Yes, support search/filtering by skill name (case-insensitive partial match)

**Q5:** I assume query access should be admin-only (using the same `@Roles(ProfileType.ADMIN)` guard as mutations). However, employees might need to see the skills list for the self-report feature (Item 8). Should the getAllSkills query be accessible to all authenticated users, or admin-only?

**Answer:** Admin-only for now, all authenticated users for future improvement (admin-only for this spec)

**Q6:** For the discipline filter, should it accept multiple disciplines (e.g., return all FRONTEND and BACKEND skills) or just a single discipline at a time?

**Answer:** Accept multiple disciplines

**Q7:** The current implementation has comprehensive error handling (NOT_FOUND, DUPLICATE_NAME, ALREADY_DISABLED, etc.). Are there any additional validation rules or edge cases you'd like covered beyond what's already implemented?

**Answer:** No additional validation rules beyond what's already implemented

**Q8:** Are there any features explicitly out of scope for this spec, such as bulk operations (bulk disable, bulk delete), skill usage analytics (how many employees have this skill), or cascading effects (what happens to EmployeeSkills when a skill is disabled)?

**Answer:** No further features outside the scope of this specification

### Existing Code to Reference

**Similar Features Identified:**
- Query Pattern: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/inbox.resolver.ts` - Shows standard GraphQL Query implementation with `@UseGuards(JwtAuthGuard)` and `@CurrentUser()` decorator
- Query Pattern: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/profile/profile.resolver.ts` - Shows Query with Args decorator for parameters
- Existing Mutations: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/skills.resolver.ts` - Already implements all CRUD mutations with admin role guard
- Service Layer: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/skills.service.ts` - Implements business logic with comprehensive validation and error handling
- Auth Guards: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/auth/guards/roles.guard.ts` - Role-based access control implementation

### Follow-up Questions
No follow-up questions needed.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual insights available.

## Requirements Summary

### Functional Requirements

**Core Functionality:**
- Add two GraphQL Query operations to the existing Skills API:
  - `getAllSkills`: Returns a filtered and sorted list of skills
  - `getSkillById`: Returns a single skill by ID
- Both queries must be admin-only (using `@Roles(ProfileType.ADMIN)` guard)
- Mutations already exist and are fully functional (createSkill, updateSkill, disableSkill, enableSkill)

**getAllSkills Query Specifications:**
- **Sorting**: Return skills sorted alphabetically by name (ascending)
- **Filtering Options**:
  - `isActive` filter: Support three states - active only, disabled only, or all skills
  - `disciplines` filter: Accept multiple Discipline enum values (e.g., [FRONTEND, BACKEND])
  - `searchTerm` filter: Case-insensitive partial match on skill name
- **Return Type**: Array of Skill objects with all fields (id, name, discipline, isActive, createdAt, updatedAt)
- **No Pagination**: Return all matching results without pagination

**getSkillById Query Specifications:**
- **Input**: Skill ID (number)
- **Return Type**: Single Skill object or error if not found
- **Error Handling**: Return NOT_FOUND error if skill doesn't exist

**Access Control:**
- Both queries require JWT authentication (`@UseGuards(JwtAuthGuard, RolesGuard)`)
- Both queries require ADMIN role (`@Roles(ProfileType.ADMIN)`)
- Non-admin users receive FORBIDDEN error

**Existing Mutations (Already Implemented):**
- `createSkill`: Admin-only, creates new skill with name and discipline
- `updateSkill`: Admin-only, updates skill name and/or discipline
- `disableSkill`: Admin-only, soft deletes skill (sets isActive = false)
- `enableSkill`: Admin-only, re-activates disabled skill (sets isActive = true)

### Reusability Opportunities

**Existing Patterns to Follow:**
- Use same resolver structure as `inbox.resolver.ts` and `profile.resolver.ts` for Query operations
- Use same guard pattern (`@UseGuards(JwtAuthGuard, RolesGuard)`) as existing mutations in `skills.resolver.ts`
- Use same error handling pattern from `skills.service.ts` (NotFoundException with extensions.code)
- Follow existing DTO pattern from `skills/dto/` folder for input and response types

**Code to Extend:**
- `skills.resolver.ts`: Add Query decorator methods alongside existing Mutation methods
- `skills.service.ts`: Add query service methods (getAllSkills, getSkillById)
- `skills/dto/`: Create new input DTO for getAllSkills filters (GetAllSkillsInput)

**Existing Validation:**
- Case-insensitive uniqueness validation already implemented
- Discipline enum validation already exists
- Error codes already standardized (NOT_FOUND, DUPLICATE_NAME, etc.)

### Scope Boundaries

**In Scope:**
- Add `getAllSkills` Query operation with filtering (isActive, disciplines, searchTerm) and alphabetical sorting
- Add `getSkillById` Query operation
- Create input DTO for getAllSkills filters (optional fields)
- Implement service methods for both queries
- Enforce admin-only access control on both queries
- Return existing Skill response type
- Case-insensitive partial match search on skill name

**Out of Scope:**
- Pagination (deferred to future enhancement)
- Bulk operations (bulk disable, bulk delete, bulk update)
- Skill usage analytics (count of employees with each skill)
- Cascading delete effects (impact on EmployeeSkills when skill is disabled)
- Making queries accessible to all authenticated users (admin-only for this spec)
- Additional validation rules beyond what exists
- Sorting by fields other than name (e.g., createdAt, updatedAt)
- Advanced search features (fuzzy matching, regex)

### Technical Considerations

**Integration Points:**
- GraphQL schema must be extended with new Query operations
- Prisma queries will use `findMany` with `where`, `orderBy` for getAllSkills
- Prisma queries will use `findUnique` for getSkillById
- DTOs must use `@Field({ nullable: true })` for optional filter fields

**Existing System Constraints:**
- PostgreSQL database with Prisma ORM
- NestJS framework with GraphQL (Apollo Server)
- JWT authentication already configured
- Role-based access control already implemented
- Skill model fields: id (Int), name (String), discipline (Enum), isActive (Boolean), createdAt, updatedAt

**Technology Stack:**
- Backend: NestJS 11 with @nestjs/graphql
- ORM: Prisma
- Database: PostgreSQL
- GraphQL: Apollo Server
- Validation: class-validator decorators

**Similar Code Patterns to Follow:**
- Query resolver pattern from `profile.resolver.ts` and `inbox.resolver.ts`
- Admin guard pattern from existing `skills.resolver.ts` mutations
- Service layer validation from `skills.service.ts`
- DTO pattern from existing `skills/dto/` files
