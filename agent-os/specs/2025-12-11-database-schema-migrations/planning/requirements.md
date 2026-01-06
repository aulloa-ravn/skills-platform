# Spec Requirements: Database Schema & Migrations

## Initial Description
Set up Prisma with PostgreSQL, create all models (Profile, Skill, EmployeeSkill, Suggestion, Project, Assignment, SeniorityHistory) and run initial migrations.

## Requirements Discussion

### First Round Questions

**Q1:** For the Profile model, I assume this will store employee information synced from Mission Board (id, email, name, avatar, current seniority level). Should we include any additional fields like department, hire date, or is the core identity sufficient for now?
**Answer:** No additional fields needed, core identity is sufficient.

**Q2:** For EmployeeSkill (the junction between Profile and Skill representing validated skills), I assume we need: profileId, skillId, proficiencyLevel (Novice/Intermediate/Advanced/Expert), validatedAt timestamp, and validatedById (the Tech Lead who validated). Should we also track the project context where the skill was validated?
**Answer:** No, don't track project context.

**Q3:** For the Suggestion model (pending skill validation requests), I assume we need: profileId, skillId, suggestedProficiency, status (Pending/Approved/Rejected/Adjusted), createdAt, and resolvedAt. Should we store who resolved it and any rejection reason or adjustment notes?
**Answer:** No, don't store who resolved or rejection reasons.

**Q4:** For Project and Assignment models (synced from Mission Board), I assume Assignment links a Profile to a Project with a role field to identify Tech Leads. Is the Tech Lead role the only role we care about, or should we track other roles (Developer, Designer, etc.) for future features?
**Answer:** Only Tech Lead role for now.

**Q5:** For SeniorityHistory, I assume we need profileId, seniorityLevel, effectiveDate, and possibly createdById (admin who made the entry). Should this be append-only (immutable history) or should admins be able to edit past entries?
**Answer:** Immutable (append-only history).

**Q6:** For the Skill model (canonical taxonomy), I assume fields like: id, name, discipline (Frontend/Backend/Languages/etc.), and isActive boolean for soft-deletes. Should discipline be a separate model for flexibility, or is a string enum sufficient given the controlled taxonomy?
**Answer:** String enum is sufficient.

**Q7:** For IDs, I assume we'll use UUIDs as primary keys for all models (standard for distributed systems and security). Is that correct, or would you prefer auto-incrementing integers?
**Answer:** UUIDs as primary keys.

**Q8:** Is there anything specific you want to exclude from this initial schema? For example, should we skip audit fields (createdAt/updatedAt) on certain models, or defer any relationships to a later phase?
**Answer:** Not specified (assume no exclusions).

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

No follow-up questions needed - answers were comprehensive.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No ERD diagrams or schema documentation provided.

## Requirements Summary

### Functional Requirements

**Profile Model:**
- Store employee identity synced from Mission Board
- Fields: id (UUID), email, name, avatar, current seniority level
- Core identity only, no additional fields

**Skill Model (Canonical Taxonomy):**
- Admin-controlled list of skills
- Fields: id (UUID), name, discipline (string enum), isActive (boolean for soft-delete)
- Discipline values: Frontend, Backend, Languages, etc.

**EmployeeSkill Model (Validated Skills):**
- Junction table linking Profile to Skill
- Fields: id (UUID), profileId, skillId, proficiencyLevel, validatedAt, validatedById
- Proficiency levels: Novice, Intermediate, Advanced, Expert
- No project context tracking

**Suggestion Model (Pending Validations):**
- Skill validation requests from employees
- Fields: id (UUID), profileId, skillId, suggestedProficiency, status, createdAt, resolvedAt
- Status values: Pending, Approved, Rejected, Adjusted
- No resolver tracking or rejection reasons

**Project Model:**
- Synced from Mission Board
- Fields: id (UUID), name, and relevant project identifiers

**Assignment Model:**
- Links Profile to Project with role
- Fields: id (UUID), profileId, projectId, role
- Only Tech Lead role is relevant for validation routing

**SeniorityHistory Model:**
- Immutable append-only history
- Fields: id (UUID), profileId, seniorityLevel, effectiveDate, createdById (optional)
- Cannot edit past entries, only append new records

### Reusability Opportunities

- Existing Prisma schema file at `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/prisma/schema.prisma` (currently empty, ready for models)
- Standard Prisma patterns for NestJS integration per tech stack

### Scope Boundaries

**In Scope:**
- All seven models: Profile, Skill, EmployeeSkill, Suggestion, Project, Assignment, SeniorityHistory
- UUID primary keys for all models
- Standard audit fields (createdAt/updatedAt) where appropriate
- Enum definitions for proficiency levels, suggestion status, and skill disciplines
- Foreign key relationships between models
- Initial Prisma migration to create all tables

**Out of Scope:**
- Project context tracking on EmployeeSkill
- Resolver/rejection reason tracking on Suggestion
- Multiple assignment roles (only Tech Lead)
- Editing seniority history entries (append-only)
- Department or hire date on Profile
- Separate Discipline model (using string enum instead)

### Technical Considerations

- Database: PostgreSQL (per tech-stack.md)
- ORM: Prisma with Prisma Migrate
- Primary Keys: UUIDs for all models
- Location: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/prisma/schema.prisma`
- Monorepo structure: Backend in `apps/api`
- Environment: DATABASE_URL environment variable already configured in schema
