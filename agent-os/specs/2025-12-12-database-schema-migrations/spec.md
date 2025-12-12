# Specification: Database Schema & Migrations

## Goal
Set up Prisma with PostgreSQL and create all foundational data models (Profile, Skill, EmployeeSkill, Suggestion, Project, Assignment, SeniorityHistory) to establish the database layer for the Ravn Skills Platform, enabling subsequent API and UI development.

## User Stories
- As a developer, I want a complete database schema so that I can build APIs for employee profiles, skill validation, and admin management
- As the system, I need structured tables for syncing Mission Board data (Projects, Assignments, People) so that validation routing works correctly

## Specific Requirements

**Profile Model**
- UUID primary key with `id` field using `@default(uuid())`
- Store `missionBoardId` as unique String for external system reference
- Include `email` (String, unique), `name` (String), `avatarUrl` (String, optional)
- Store `currentSeniorityLevel` as String for display purposes (e.g., "Senior Engineer")
- Add `createdAt` and `updatedAt` timestamps with `@default(now())` and `@updatedAt`
- Define relations to EmployeeSkill, SeniorityHistory, Suggestion, Assignment, and Project (as tech lead)

**Skill Model (Canonical Taxonomy)**
- UUID primary key for consistency across all models
- Include `name` (String, unique) for the canonical skill name
- Use `discipline` as String field with values: Frontend, Backend, Languages, DevOps, Database, Design, Mobile, Testing, Cloud, Other
- Include `isActive` Boolean defaulting to true for soft-delete capability
- Add `createdAt` and `updatedAt` timestamps
- Define relation to EmployeeSkill and Suggestion models

**EmployeeSkill Model (Validated Skills)**
- UUID primary key (not composite key for simpler querying)
- Foreign keys: `profileId` and `skillId` with appropriate relations
- Use `proficiencyLevel` String field with ProficiencyLevel enum: NOVICE, INTERMEDIATE, ADVANCED, EXPERT
- Include `validatedAt` DateTime for when skill was last validated
- Include `validatedById` String (optional) referencing the Tech Lead's Profile id who validated
- Add unique constraint on `@@unique([profileId, skillId])` to prevent duplicate entries
- Add `createdAt` and `updatedAt` timestamps

**Suggestion Model (Pending Validations)**
- UUID primary key
- Foreign keys: `profileId` (who the suggestion is about) and `skillId`
- Use `suggestedProficiency` String field with ProficiencyLevel enum values
- Use `status` String field with SuggestionStatus enum: PENDING, APPROVED, REJECTED, ADJUSTED
- Include `source` String field with SuggestionSource enum: SELF_REPORT, SYSTEM_FLAG (for stale skill re-validation)
- Include `createdAt` timestamp and `resolvedAt` DateTime (optional, set when status changes from PENDING)
- No resolver tracking or rejection reasons per requirements

**Project Model**
- UUID primary key (will use Mission Board project ID as the actual id value during sync)
- Include `name` (String) for project display name
- Include `missionBoardId` as unique String for external reference
- Include `techLeadId` (String, optional) referencing Profile id
- Define relation to Profile for tech lead and to Assignment model
- Add `createdAt` and `updatedAt` timestamps

**Assignment Model**
- UUID primary key (will use Mission Board assignment ID as actual id during sync)
- Foreign keys: `profileId` and `projectId` with appropriate relations
- Include `missionBoardId` as unique String for external reference
- Include `role` String field - only "TECH_LEAD" role is relevant for validation routing, all other roles stored as-is
- Include `tags` as String array for technology tags from Mission Board (e.g., ["React", "Node.js"])
- Add `createdAt` and `updatedAt` timestamps

**SeniorityHistory Model**
- UUID primary key
- Foreign key: `profileId` referencing Profile
- Include `seniorityLevel` (String) for the role/level title (e.g., "Junior Engineer", "Mid-Level Engineer")
- Include `effectiveDate` DateTime for when this level started
- Include `createdById` (String, optional) for admin who created the entry
- Immutable/append-only: no updatedAt field, entries should never be modified after creation
- Only `createdAt` timestamp needed

**Enum Definitions**
- Define `ProficiencyLevel` enum with values: NOVICE, INTERMEDIATE, ADVANCED, EXPERT
- Define `SuggestionStatus` enum with values: PENDING, APPROVED, REJECTED, ADJUSTED
- Define `SuggestionSource` enum with values: SELF_REPORT, SYSTEM_FLAG
- Define `Discipline` enum with values: FRONTEND, BACKEND, LANGUAGES, DEVOPS, DATABASE, DESIGN, MOBILE, TESTING, CLOUD, OTHER

## Visual Design
No visual assets provided - this is a backend-only database schema specification.

## Existing Code to Leverage

**`/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/prisma/schema.prisma`**
- Existing Prisma schema file with generator and datasource already configured
- PostgreSQL datasource using DATABASE_URL environment variable
- Add all models to this file below the existing configuration
- Follow Prisma's convention of PascalCase for model names

**`/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/PRD.md` (Database Schema Section)**
- Reference schema provides architectural guidance on relationships
- Adapt to use UUIDs instead of autoincrement integers per requirements
- Use camelCase for field names instead of snake_case for TypeScript consistency
- Add missing timestamps and adjust relations as specified in requirements

**`/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/agent-os/standards/backend/models.md`**
- Include createdAt/updatedAt timestamps on all tables (except SeniorityHistory which is append-only)
- Use database constraints (unique, foreign keys) for data integrity
- Index foreign key columns for query performance

**`/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/agent-os/standards/backend/migrations.md`**
- Keep the initial migration focused on schema creation only
- Use clear descriptive migration name like "init" or "initial_schema"
- Commit migration files to version control

## Out of Scope
- Project context tracking on EmployeeSkill (do not add projectId or assignment reference)
- Resolver tracking on Suggestion (do not add resolvedById field)
- Rejection reason or adjustment notes on Suggestion (do not add notes/reason fields)
- Multiple assignment roles beyond Tech Lead (store role as string but only TECH_LEAD is used for routing logic)
- Editing seniority history entries (model is append-only, no update operations)
- Department or hire date fields on Profile
- Separate Discipline model (using string/enum instead)
- Seeding data (handled in separate spec "Skills Taxonomy Seeding")
- API endpoints or GraphQL resolvers (handled in separate specs)
- Authentication or authorization logic
