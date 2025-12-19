# Spec Requirements: Admin Skills Management API

## Initial Description

Roadmap item 13: Admin Skills Management API — Build CRUD endpoints for managing the canonical skills taxonomy (add, edit, disable skills)

This is a backend API feature that will allow admins to manage the master list of skills in the system. It needs to provide GraphQL mutations for creating new skills, editing existing skills, and disabling/archiving skills (soft delete).

Context from user:
- This is a backend API feature (GraphQL mutations)
- Only admins should have access to these operations
- The Skill model already exists in the Prisma schema
- Other parts of the system (Profile, Validation Inbox, Resolution UI) depend on the skills taxonomy

## Requirements Discussion

### First Round Questions

**Q1:** I assume we need three mutations: `createSkill`, `updateSkill`, and `disableSkill`. For `createSkill`, the input would require `name` (unique string) and `discipline` (from the Discipline enum), returning the created Skill object. For `updateSkill`, I'm thinking we'd allow updating both `name` and `discipline` fields. Does that cover the mutations you need, or should we also include a mutation to re-enable disabled skills (like `enableSkill`)?

**Answer:** Four mutations needed: createSkill, updateSkill, disableSkill, AND enableSkill

**Q2:** For the `updateSkill` mutation, I assume admins can edit both the `name` and `discipline` fields. Should we also allow changing the `isActive` status directly through this mutation, or should enable/disable be handled only through dedicated `disableSkill`/`enableSkill` mutations?

**Answer:** Approved - updateSkill can edit name and discipline. Enable/disable only through dedicated mutations (not through updateSkill)

**Q3:** I'm thinking `disableSkill` should set `isActive = false` rather than actually deleting the record, preserving historical data and existing references in EmployeeSkill and Suggestion tables. Should disabled skills be completely hidden from autocomplete and all user-facing queries, or should they remain visible with a "disabled" indicator in certain contexts (like viewing historical employee skills)?

**Answer:** disableSkill sets isActive = false (soft delete). Disabled skills are hidden from autocomplete and all user-facing queries (not shown with "disabled" indicator)

**Q4:** For authorization, I assume we need to check that `context.user.role === Role.ADMIN` using a GraphQL guard or decorator (similar to how you might have implemented auth for the Validation Inbox). Should these mutations reject with a "Forbidden" error for non-admin users, or should we return a custom error type with more details?

**Answer:** Approved - check context.user.role === Role.ADMIN, reject with "Forbidden" error for non-admin

**Q5:** For validation rules, I assume we should prevent duplicate skill names (case-insensitive), ensure the discipline is a valid enum value, and require non-empty names. Should we also validate against creating skills with names that only differ by special characters or whitespace (e.g., "React" vs "React " vs "React.js"), or is exact string matching sufficient?

**Answer:** Approved - prevent duplicate names (case-insensitive), ensure valid discipline enum, require non-empty names, validate against special character/whitespace differences (e.g., "React" vs "React ")

**Q6:** I'm thinking about edge cases: if an admin tries to disable a skill that's actively referenced in EmployeeSkills or pending Suggestions, should we allow it (just setting `isActive = false`) or should we block it with a warning? Similarly, should we prevent updating a skill's name to match an existing (even disabled) skill's name?

**Answer:**
- Allow disabling skills that are actively referenced in EmployeeSkills or Suggestions
- Prevent updating a skill's name to match an existing (even disabled) skill's name

**Q7:** For the GraphQL types, I assume the input types would be something like `CreateSkillInput { name: String!, discipline: Discipline! }` and `UpdateSkillInput { id: ID!, name: String, discipline: Discipline }` (with optional fields for partial updates). Should we return just the modified Skill object, or a custom response type that includes additional metadata like `success: Boolean` or validation warnings?

**Answer:** Approved - CreateSkillInput { name: String!, discipline: Discipline! }, UpdateSkillInput { id: ID!, name: String, discipline: Discipline }. Return modified Skill object (not custom response type)

**Q8:** Are there any specific scenarios we should explicitly exclude from this feature? For example, batch operations (creating/updating multiple skills at once), skill merging (combining duplicate skills and migrating references), or skill usage analytics (showing which employees have this skill before disabling)?

**Answer:** Exclude batch operations, skill merging, usage analytics

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

No follow-up questions needed.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

Not applicable.

## Requirements Summary

### Functional Requirements

**Four GraphQL Mutations:**

1. **createSkill**
   - Input: `CreateSkillInput { name: String!, discipline: Discipline! }`
   - Creates a new skill in the taxonomy
   - Returns: Skill object
   - Sets `isActive = true` by default

2. **updateSkill**
   - Input: `UpdateSkillInput { id: ID!, name: String, discipline: Discipline }`
   - Updates an existing skill's name and/or discipline
   - Returns: Updated Skill object
   - Does NOT allow changing isActive status

3. **disableSkill**
   - Input: `id: ID!`
   - Sets `isActive = false` (soft delete)
   - Returns: Updated Skill object
   - Preserves historical data and existing references

4. **enableSkill**
   - Input: `id: ID!`
   - Sets `isActive = true`
   - Returns: Updated Skill object
   - Re-enables a previously disabled skill

**Data Model (existing Prisma schema):**
```
model Skill {
  id         String     @id @default(uuid())
  name       String     @unique
  discipline Discipline
  isActive   Boolean    @default(true)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  // Relations
  employeeSkills EmployeeSkill[]
  suggestions    Suggestion[]
}
```

**Discipline Enum (existing):**
```
enum Discipline {
  FRONTEND, BACKEND, LANGUAGES, DEVOPS, DATABASE, DESIGN,
  MOBILE, TESTING, CLOUD, OTHER, STYLING, TOOLS, API,
  PERFORMANCE, SECURITY, IOS, ANDROID, BUILD_TOOLS, NO_CODE
}
```

### Authorization Requirements

- All four mutations require admin role
- Check: `context.user.role === Role.ADMIN`
- Return "Forbidden" error for non-admin users
- Use GraphQL guard or decorator pattern for authorization

### Validation Rules

**For createSkill:**
- Name must be non-empty (required)
- Name must be unique (case-insensitive comparison)
- Name normalization: prevent variations with special characters/whitespace
  - Example: "React", "React ", "React.js" should be treated as duplicates
  - Suggested approach: trim whitespace, normalize special characters for comparison
- Discipline must be a valid Discipline enum value (required)

**For updateSkill:**
- ID must reference an existing skill
- If name is provided:
  - Name must be non-empty
  - Name must be unique (case-insensitive, normalized)
  - Prevent updating to match ANY existing skill's name (including disabled skills)
- If discipline is provided:
  - Discipline must be a valid Discipline enum value
- At least one field (name or discipline) should be provided for update

**For disableSkill:**
- ID must reference an existing skill
- Skill must currently be active (isActive = true)
- Allow disabling even if skill is referenced in EmployeeSkills or Suggestions

**For enableSkill:**
- ID must reference an existing skill
- Skill must currently be disabled (isActive = false)

### Edge Cases and Constraints

**Disabled Skills Behavior:**
- Disabled skills (isActive = false) are hidden from:
  - Autocomplete queries
  - All user-facing queries
  - Skill selection dropdowns
- Disabled skills are NOT shown with "disabled" indicator
- Disabled skills remain in database with preserved references

**Referenced Skills:**
- Skills can be disabled even if actively referenced in:
  - EmployeeSkill records (validated skills on employee profiles)
  - Suggestion records (pending validation requests)
- This preserves historical data while preventing future use

**Name Uniqueness:**
- Name uniqueness check applies to BOTH active AND disabled skills
- Cannot update a skill's name to match any existing skill (active or disabled)
- Case-insensitive comparison
- Normalized comparison (whitespace and special characters)

**Update Behavior:**
- updateSkill allows partial updates (only name, only discipline, or both)
- Cannot change isActive through updateSkill
- updatedAt timestamp automatically updates on any mutation

### Reusability Opportunities

No existing similar admin CRUD patterns identified by user.

Implementation will establish patterns for:
- Admin-only GraphQL mutations
- Role-based authorization guards
- Entity CRUD operations
- Soft delete functionality

### Scope Boundaries

**In Scope:**
- Four GraphQL mutations: createSkill, updateSkill, disableSkill, enableSkill
- Admin role-based authorization
- Comprehensive validation (uniqueness, normalization, enum validation)
- Soft delete functionality (isActive flag)
- Single-skill operations

**Out of Scope:**
- Batch operations (creating/updating/disabling multiple skills at once)
- Skill merging (combining duplicate skills and migrating references)
- Usage analytics (showing which employees have a skill before disabling)
- Hard delete functionality
- Skill categorization beyond discipline
- Skill synonyms or aliases
- Skill descriptions or metadata
- Audit logging of skill changes
- UI components (this is API-only)

### Technical Considerations

**Integration Points:**
- Skill model already exists in Prisma schema
- EmployeeSkill and Suggestion tables have foreign key references to Skill
- Existing queries likely filter by `isActive = true` (should be verified/updated)
- Authorization system with Role enum already exists

**Existing System Constraints:**
- Using NestJS with @nestjs/graphql
- Apollo Server for GraphQL
- Prisma ORM with PostgreSQL
- JWT-based authentication with user context
- TypeScript strict mode enabled

**Technology Stack:**
- Framework: NestJS 11
- GraphQL: @nestjs/graphql with Apollo Server
- Database: PostgreSQL via Prisma
- Language: TypeScript
- Testing: Jest (deferred per roadmap constraints)

**Similar Code Patterns to Follow:**
- Authentication guards from existing API implementation
- GraphQL resolver patterns from Employee Profile API and Validation Inbox API
- Prisma service patterns from existing features
- Error handling conventions from backend codebase
