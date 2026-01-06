# Spec Requirements: Employee Profile API

## Initial Description
Employee Profile API — Build GraphQL queries to fetch profile data including validated skills (tiered), seniority timeline, and current assignments

**Source:** Product Roadmap Item #5

**Size Estimate:** M (Medium)

**Context:** This feature is part of the Skills Platform project and represents the API foundation for displaying employee profile information. It follows the completion of:
- Database Schema & Migrations
- Skills Taxonomy Seeding
- Sample Data Seeding
- Authentication Foundation

This API will enable the Employee Profile UI (next roadmap item) to display comprehensive employee information including their validated skills organized in tiers, their seniority progression over time, and their current project assignments.

## Requirements Discussion

### First Round Questions

**Q1:** Query naming and structure - I'm assuming we'll create a single GraphQL query called `profile` that accepts an optional `profileId` argument (defaults to the authenticated user's profile if not provided). This would allow users to fetch their own profile by default, and admins/tech leads to fetch other profiles by ID. Is that correct, or should we have separate queries like `myProfile` and `getProfile(id: String!)`?

**Answer:** Only `getProfile(id: String!)` - always requires an ID parameter, no optional/default behavior.

**Q2:** Authentication and authorization - I assume this query should require authentication (using the JWT guard from your auth system), and regular employees can only query their own profile while ADMIN and TECH_LEAD roles can query any profile. Is that correct?

**Answer:** Exactly as proposed - JWT guard required, employees can only query their own profile, TECH_LEAD can only view profiles of employees in projects they lead, ADMIN can view any profile.

**Q3:** Skills tiering logic - Based on the product mission, I understand skills should be organized into three tiers:
- **Core Stack:** Skills from the employee's current active project(s)
- **Validated Inventory:** All other approved/validated skills not in Core Stack
- **Pending:** Skills with PENDING status from suggestions

Should the Core Stack tier be determined by matching validated skills against the skills/tags from current Assignment records, or is there another field/logic for identifying "current project skills"?

**Answer:** Approved - three tiers (Core Stack from current projects, Validated Inventory for other approved skills, Pending for suggestions).

**Q4:** Proficiency level handling - I assume we'll return the proficiency level (NOVICE, INTERMEDIATE, ADVANCED, EXPERT) for each validated skill from the EmployeeSkill table. Should we also return the proficiency level for pending skills (from the Suggestion table's `suggestedProficiency` field)?

**Answer:** Approved - return proficiency levels for both validated skills and pending skills (suggestedProficiency).

**Q5:** Skills validation metadata - For validated skills, should we return metadata like `validatedAt` (when it was validated), `validatedBy` (who validated it), and the validator's name? This could be useful for building trust in the validation system.

**Answer:** Approved - return validatedAt, validatedBy, and validator's name.

**Q6:** Seniority timeline response structure - I'm thinking the seniority timeline should return an array of seniority history records sorted by `effectiveDate` (most recent first), with each record including the seniority level, effective date, and optionally who created it. Should we also calculate/return the duration of each seniority level, or just return the raw history records?

**Answer:** Return raw history records only (no duration calculation needed).

**Q7:** Current assignments details - For the current assignments section, should we return just the basic project info (project name, role, tags) from the Assignment model, or should we also include the Tech Lead information for each project (requiring a join to the Project table)?

**Answer:** Include Tech Lead information for each project (requires join to Project table).

**Q8:** Avatar and profile header - The Profile model has an `avatarUrl` field. Should we return this in the profile response, and are there any other profile header fields we should include beyond name, email, currentSeniorityLevel, and avatarUrl?

**Answer:** Approved - return avatarUrl, name, email, currentSeniorityLevel.

**Q9:** Scope boundaries - Should this API exclude any functionality such as editing profile data, updating skills, or managing seniority history? I'm assuming this is strictly a read-only query for displaying profile information, and mutations will come in separate features.

**Answer:** Approved - strictly read-only query, mutations will come in separate features.

### Existing Code to Reference

No similar existing features identified for reference. User did not provide paths to existing patterns.

### Follow-up Questions

No follow-up questions were required.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual assets were found during the mandatory visual check.

## Requirements Summary

### Functional Requirements

**GraphQL Query:**
- Query name: `getProfile`
- Required parameter: `id: String!` (no optional/default behavior)
- Returns comprehensive profile data including tiered skills, seniority history, and current assignments

**Profile Header Fields:**
- `id`: Profile identifier
- `name`: Employee name
- `email`: Employee email
- `currentSeniorityLevel`: Current seniority level string
- `avatarUrl`: Optional avatar URL

**Skills Tiering (Three Tiers):**
1. **Core Stack**: Validated skills that match skills/tags from employee's current Assignment records
2. **Validated Inventory**: All other approved/validated skills (from EmployeeSkill table) not in Core Stack
3. **Pending**: Skills with PENDING status from Suggestion table

**Skills Data Fields:**
- For validated skills (Core Stack & Validated Inventory):
  - Skill name
  - Skill discipline
  - Proficiency level (NOVICE, INTERMEDIATE, ADVANCED, EXPERT)
  - `validatedAt`: Timestamp when skill was validated
  - `validatedBy`: Profile ID of validator
  - Validator's name
- For pending skills:
  - Skill name
  - Skill discipline
  - `suggestedProficiency`: Proficiency level from Suggestion table
  - Created date

**Seniority Timeline:**
- Array of seniority history records from SeniorityHistory table
- Sorted by `effectiveDate` (most recent first)
- Each record includes:
  - Seniority level
  - Effective date
  - Created by (Profile ID, optional)
  - Creator's name (if applicable)
- No duration calculation needed

**Current Assignments:**
- List of current project assignments from Assignment table
- For each assignment, include:
  - Project name
  - Assignment role
  - Assignment tags
  - Tech Lead information (requires join to Project table):
    - Tech Lead ID
    - Tech Lead name
    - Tech Lead email

### Reusability Opportunities

**Authentication Pattern:**
- Reuse existing JWT guard from `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/auth` module
- Follow the authentication pattern established in `auth.resolver.ts` and `auth.service.ts`

**GraphQL Patterns:**
- Follow ObjectType pattern from `login.response.ts` for creating response DTOs
- Use `@Field()` decorators and `registerEnumType` pattern for GraphQL schema generation
- Follow resolver pattern from `auth.resolver.ts` with `@Query()` decorator

**Database Access:**
- Use PrismaService pattern established in the auth module for database queries
- Leverage Prisma's relational query capabilities for joins (Profile → EmployeeSkill → Skill, Profile → Assignment → Project, etc.)

### Scope Boundaries

**In Scope:**
- Single read-only GraphQL query: `getProfile(id: String!)`
- Authentication using existing JWT guard
- Role-based authorization logic:
  - EMPLOYEE: Can only query their own profile
  - TECH_LEAD: Can query profiles of employees in projects they lead
  - ADMIN: Can query any profile
- Comprehensive profile data fetching including:
  - Profile header (name, email, seniority, avatar)
  - Tiered skills display (Core Stack, Validated Inventory, Pending)
  - Skills validation metadata
  - Seniority timeline
  - Current assignments with Tech Lead details
- Proper error handling for unauthorized access attempts

**Out of Scope:**
- Profile editing/mutations (future feature)
- Skills management mutations (future feature)
- Seniority history mutations (future feature)
- Optional/default parameter behavior (query always requires ID)
- Duration calculations for seniority levels
- Pagination for skills or history (assume reasonable dataset sizes)
- Filtering or sorting options for skills/history beyond the specified tiering logic
- Profile search or listing queries

### Technical Considerations

**Technology Stack:**
- NestJS 11 with GraphQL (@nestjs/graphql + Apollo Server)
- Prisma ORM for PostgreSQL database access
- JWT authentication with existing auth guards
- TypeScript with strict mode

**Database Models Involved:**
- Profile (primary)
- EmployeeSkill (for validated skills)
- Skill (skill taxonomy)
- Suggestion (for pending skills)
- Assignment (current assignments)
- Project (for Tech Lead information)
- SeniorityHistory (seniority timeline)

**Authorization Logic Details:**
- TECH_LEAD role check: Query projects where requesting user is techLeadId, then check if requested profile has assignments in those projects
- EMPLOYEE role check: Verify requested profileId matches authenticated user's ID
- ADMIN role: No restrictions

**Data Relationships:**
- Profile → EmployeeSkill → Skill (validated skills with proficiency)
- Profile → EmployeeSkill → Profile (validator information via validatedById)
- Profile → Suggestion → Skill (pending skills)
- Profile → Assignment → Project → Profile (current assignments with Tech Lead)
- Profile → SeniorityHistory (seniority timeline)

**Core Stack Logic:**
- Fetch employee's current Assignment records
- Extract skill tags from those assignments
- Match validated EmployeeSkill records where skill name matches assignment tags
- Remaining validated skills go to Validated Inventory tier

**Error Scenarios:**
- Profile not found: Return appropriate error
- Unauthorized access: Throw UnauthorizedException
- Invalid JWT: Handled by existing auth guard
- Database connection issues: Let NestJS handle with standard error response
