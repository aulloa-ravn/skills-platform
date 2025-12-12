# Task Breakdown: Database Schema & Migrations

## Overview
Total Tasks: 18 sub-tasks across 3 task groups

This feature establishes the foundational database layer for the Ravn Skills Platform using Prisma with PostgreSQL. It includes 7 models (Profile, Skill, EmployeeSkill, Suggestion, Project, Assignment, SeniorityHistory) and 4 enums (ProficiencyLevel, SuggestionStatus, SuggestionSource, Discipline).

## Task List

### Database Layer

#### Task Group 1: Prisma Setup & Enum Definitions
**Dependencies:** None

- [ ] 1.0 Complete Prisma configuration and enum definitions
  - [ ] 1.1 Write 3-5 focused tests for database connection and enum values
    - Test database connection establishment via Prisma client
    - Test enum value validation for ProficiencyLevel
    - Test enum value validation for SuggestionStatus
    - Test enum value validation for Discipline
  - [ ] 1.2 Define all enums in Prisma schema
    - Add `ProficiencyLevel` enum: NOVICE, INTERMEDIATE, ADVANCED, EXPERT
    - Add `SuggestionStatus` enum: PENDING, APPROVED, REJECTED, ADJUSTED
    - Add `SuggestionSource` enum: SELF_REPORT, SYSTEM_FLAG
    - Add `Discipline` enum: FRONTEND, BACKEND, LANGUAGES, DEVOPS, DATABASE, DESIGN, MOBILE, TESTING, CLOUD, OTHER
    - Location: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/prisma/schema.prisma`
  - [ ] 1.3 Verify Prisma client generation works
    - Run `npx prisma generate` to ensure schema is valid
    - Confirm TypeScript types are generated for enums
  - [ ] 1.4 Ensure enum tests pass
    - Run ONLY the 3-5 tests written in 1.1
    - Verify enum values are correctly defined

**Acceptance Criteria:**
- All 4 enums defined in Prisma schema
- Prisma client generates without errors
- TypeScript types available for all enum values
- Tests for enum validation pass

---

#### Task Group 2: Core Models (Profile, Skill, Project)
**Dependencies:** Task Group 1

- [ ] 2.0 Complete core foundational models
  - [ ] 2.1 Write 4-6 focused tests for core model functionality
    - Test Profile creation with UUID and required fields
    - Test Skill creation with unique name constraint
    - Test Project creation with missionBoardId unique constraint
    - Test Profile-Project tech lead relation
    - Test Skill isActive default value
  - [ ] 2.2 Create Profile model
    - Fields:
      - `id` String @id @default(uuid())
      - `missionBoardId` String @unique
      - `email` String @unique
      - `name` String
      - `avatarUrl` String?
      - `currentSeniorityLevel` String
      - `createdAt` DateTime @default(now())
      - `updatedAt` DateTime @updatedAt
    - Relations: employeeSkills, seniorityHistory, suggestions, assignments, techLeadProjects
  - [ ] 2.3 Create Skill model
    - Fields:
      - `id` String @id @default(uuid())
      - `name` String @unique
      - `discipline` Discipline
      - `isActive` Boolean @default(true)
      - `createdAt` DateTime @default(now())
      - `updatedAt` DateTime @updatedAt
    - Relations: employeeSkills, suggestions
  - [ ] 2.4 Create Project model
    - Fields:
      - `id` String @id @default(uuid())
      - `name` String
      - `missionBoardId` String @unique
      - `techLeadId` String?
      - `createdAt` DateTime @default(now())
      - `updatedAt` DateTime @updatedAt
    - Relations: techLead (Profile), assignments
  - [ ] 2.5 Verify schema validity with `prisma validate`
    - Run `npx prisma validate` to check syntax
    - Ensure no circular dependency issues
  - [ ] 2.6 Ensure core model tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Verify model creation and constraints work

**Acceptance Criteria:**
- Profile, Skill, and Project models defined correctly
- All unique constraints in place (email, missionBoardId, skill name)
- Tech lead relationship between Project and Profile established
- UUID primary keys for all models
- Timestamps configured correctly

---

#### Task Group 3: Junction & History Models
**Dependencies:** Task Group 2

- [ ] 3.0 Complete junction tables and history tracking models
  - [ ] 3.1 Write 5-8 focused tests for junction and history models
    - Test EmployeeSkill creation with profileId and skillId
    - Test EmployeeSkill unique constraint on [profileId, skillId]
    - Test Suggestion creation with status default or required
    - Test Assignment creation with tags array
    - Test SeniorityHistory append-only behavior (no updatedAt)
    - Test foreign key constraints are enforced
  - [ ] 3.2 Create EmployeeSkill model (validated skills junction)
    - Fields:
      - `id` String @id @default(uuid())
      - `profileId` String
      - `skillId` String
      - `proficiencyLevel` ProficiencyLevel
      - `validatedAt` DateTime
      - `validatedById` String?
      - `createdAt` DateTime @default(now())
      - `updatedAt` DateTime @updatedAt
    - Relations: profile (Profile), skill (Skill), validatedBy (Profile)
    - Constraint: @@unique([profileId, skillId])
    - Indexes: @@index([profileId]), @@index([skillId])
  - [ ] 3.3 Create Suggestion model (pending validations)
    - Fields:
      - `id` String @id @default(uuid())
      - `profileId` String
      - `skillId` String
      - `suggestedProficiency` ProficiencyLevel
      - `status` SuggestionStatus
      - `source` SuggestionSource
      - `createdAt` DateTime @default(now())
      - `resolvedAt` DateTime?
    - Relations: profile (Profile), skill (Skill)
    - Indexes: @@index([profileId]), @@index([skillId]), @@index([status])
  - [ ] 3.4 Create Assignment model (project-profile link)
    - Fields:
      - `id` String @id @default(uuid())
      - `profileId` String
      - `projectId` String
      - `missionBoardId` String @unique
      - `role` String
      - `tags` String[]
      - `createdAt` DateTime @default(now())
      - `updatedAt` DateTime @updatedAt
    - Relations: profile (Profile), project (Project)
    - Indexes: @@index([profileId]), @@index([projectId])
  - [ ] 3.5 Create SeniorityHistory model (append-only)
    - Fields:
      - `id` String @id @default(uuid())
      - `profileId` String
      - `seniorityLevel` String
      - `effectiveDate` DateTime
      - `createdById` String?
      - `createdAt` DateTime @default(now())
    - Note: No updatedAt field (immutable records)
    - Relations: profile (Profile), createdBy (Profile)
    - Index: @@index([profileId])
  - [ ] 3.6 Run initial migration
    - Execute `npx prisma migrate dev --name init`
    - Migration creates all 7 tables with proper constraints
    - Verify migration file is generated in `/apps/api/prisma/migrations/`
  - [ ] 3.7 Verify Prisma client generation
    - Run `npx prisma generate` after migration
    - Confirm all model types are available
  - [ ] 3.8 Ensure junction and history model tests pass
    - Run ONLY the 5-8 tests written in 3.1
    - Verify all foreign key relationships work
    - Verify unique constraints are enforced

**Acceptance Criteria:**
- All 4 junction/history models defined (EmployeeSkill, Suggestion, Assignment, SeniorityHistory)
- Unique constraint on EmployeeSkill [profileId, skillId]
- SeniorityHistory has no updatedAt (append-only)
- Assignment supports tags as String array
- All foreign key indexes created for query performance
- Migration runs successfully
- Prisma client generates with full type support

---

### Testing

#### Task Group 4: Test Review & Schema Validation
**Dependencies:** Task Groups 1-3

- [ ] 4.0 Review existing tests and validate complete schema
  - [ ] 4.1 Review tests from Task Groups 1-3
    - Review the 3-5 tests from Task Group 1 (enums)
    - Review the 4-6 tests from Task Group 2 (core models)
    - Review the 5-8 tests from Task Group 3 (junction models)
    - Total existing tests: approximately 12-19 tests
  - [ ] 4.2 Analyze test coverage gaps for database schema
    - Identify critical relationship tests that may be missing
    - Focus on cross-model relationships and cascading behavior
    - Do NOT assess entire application test coverage
  - [ ] 4.3 Write up to 5 additional strategic tests if needed
    - Add tests for critical cross-model relationships
    - Test cascade delete behavior if applicable
    - Test complex queries across relationships (e.g., Profile -> EmployeeSkills -> Skills)
    - Verify foreign key integrity across all models
  - [ ] 4.4 Run all database schema tests
    - Run all tests written for this feature (12-24 tests total)
    - Verify all constraints and relationships work correctly
    - Confirm migration is stable and repeatable

**Acceptance Criteria:**
- All database schema tests pass (approximately 12-24 tests)
- All 7 models correctly defined and related
- All 4 enums available in Prisma client
- Migration file committed to version control
- No gaps in critical relationship testing

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Prisma Setup & Enum Definitions** - Establishes foundation with enum types
2. **Task Group 2: Core Models** - Creates Profile, Skill, Project (independent entities)
3. **Task Group 3: Junction & History Models** - Creates EmployeeSkill, Suggestion, Assignment, SeniorityHistory (depend on core models)
4. **Task Group 4: Test Review & Schema Validation** - Final validation and gap analysis

---

## Model Relationship Summary

```
Profile
  |-- has many --> EmployeeSkill
  |-- has many --> SeniorityHistory
  |-- has many --> Suggestion
  |-- has many --> Assignment
  |-- has many --> Project (as tech lead)

Skill
  |-- has many --> EmployeeSkill
  |-- has many --> Suggestion

Project
  |-- belongs to --> Profile (tech lead, optional)
  |-- has many --> Assignment

Assignment
  |-- belongs to --> Profile
  |-- belongs to --> Project

EmployeeSkill
  |-- belongs to --> Profile
  |-- belongs to --> Skill
  |-- belongs to --> Profile (validatedBy, optional)

Suggestion
  |-- belongs to --> Profile
  |-- belongs to --> Skill

SeniorityHistory
  |-- belongs to --> Profile
  |-- belongs to --> Profile (createdBy, optional)
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/prisma/schema.prisma` | Modify | Add all 7 models and 4 enums |
| `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/prisma/migrations/*` | Create | Initial migration files (generated by Prisma) |
| `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/**/*.spec.ts` | Create | Test files for database models |

---

## Technical Notes

- **Primary Keys**: All models use UUID strings with `@default(uuid())`
- **Timestamps**: All models include `createdAt`; all except SeniorityHistory include `updatedAt`
- **Indexes**: Foreign key columns should be indexed for query performance
- **Unique Constraints**: missionBoardId fields, email, skill name, and [profileId, skillId] on EmployeeSkill
- **Enum Storage**: Prisma stores enums as native PostgreSQL enum types
- **Tags Array**: Assignment.tags uses PostgreSQL array type via `String[]`
