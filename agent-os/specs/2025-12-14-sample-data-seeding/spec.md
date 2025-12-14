# Specification: Sample Data Seeding

## Goal
Create a comprehensive seeding system that generates realistic fake data for Profiles, Projects, Assignments, EmployeeSkills, Suggestions, and SeniorityHistory to enable development without Mission Board integration, while preserving existing admin-seeded skills.

## User Stories
- As a developer, I want to run a seed script that populates the database with realistic fake employees and projects so that I can work on features without connecting to Mission Board
- As a developer, I want the seeding to be idempotent so that I can reset the database to a clean state without losing the admin-seeded skills

## Specific Requirements

**Seed Folder Architecture**
- Create `/apps/api/prisma/seeds/` folder to organize all seed scripts
- Move existing skills seeding logic from `seed.ts` into `seeds/skills.seed.ts`
- Create `seeds/sample-data.seed.ts` for profiles, projects, assignments, and related data
- Create main `seed.ts` orchestrator that imports and executes all seed scripts sequentially
- Update `package.json` prisma.seed script to point to the main orchestrator
- Each seed file exports an async function that can be called independently

**Faker.js Integration**
- Install @faker-js/faker as a dev dependency in `/apps/api/package.json`
- Use Faker.js to generate realistic names, email prefixes (combine with @ravn.com domain), avatar URLs
- Generate diverse but realistic data for roles, project names, and tags
- Seed random data deterministically by setting Faker seed for reproducible results across runs

**Profile Generation (20-30 employees)**
- Generate 20-30 employee profiles with realistic names using Faker.js
- Email format: `firstname.lastname@ravn.com` (derived from generated name, lowercased, no spaces)
- Generate unique `missionBoardId` for each profile (use UUID or incremental pattern)
- Use Faker.js to generate `avatarUrl` (placeholder URLs or avatar services)
- Distribute seniority levels following organizational pyramid: 40% Junior, 30% Mid, 20% Senior, 10% Lead
- Ensure at least 5-10 profiles have Lead seniority to satisfy Tech Lead assignment requirements

**Project Generation (5-10 projects)**
- Generate 5-10 projects with realistic project names using Faker.js (e.g., "Mobile App Redesign", "Payment Gateway Integration")
- Assign unique `missionBoardId` for each project
- Assign exactly one Tech Lead per project from profiles with Lead seniority level
- Ensure no Tech Lead is assigned to multiple projects (one-to-one Tech Lead-to-Project constraint)
- Vary project types to enable skill-project alignment (mobile, backend, frontend, full-stack projects)

**Assignment Distribution**
- Ensure ALL employees have at least one assignment (no bench employees)
- Distribute assignments: 60-70% of employees on 1 project, 20-30% on 2 projects, 5-10% on 3 projects
- Generate unique `missionBoardId` for each assignment
- Assign realistic roles (e.g., "Frontend Developer", "Backend Engineer", "QA Analyst") based on project type
- Add 1-3 tags per assignment (e.g., ["react", "typescript"], ["api", "rest"])

**EmployeeSkill Validation**
- Generate 3-7 validated EmployeeSkill records per profile
- Align skills with employee's project assignments (mobile projects → MOBILE/FRONTEND skills, backend projects → BACKEND/DATABASE skills)
- Proficiency distribution: 10% NOVICE, 40% INTERMEDIATE, 40% ADVANCED, 10% EXPERT
- Enforce logical consistency: Junior employees cannot have EXPERT proficiency, Lead employees should have more ADVANCED/EXPERT skills
- Set `validatedAt` dates ranging from 1 week ago to 12 months ago using random distribution
- Assign `validatedById` to reference Tech Leads or senior employees (can be null for some records)

**Skill Suggestion Generation**
- Generate 1-3 pending Suggestion records per profile
- Set `source` to SELF_REPORT and `status` to PENDING
- Set `createdAt` dates within the last 1-2 weeks
- Use realistic proficiency suggestions (avoid suggesting skills already validated at same level)
- Ensure suggested skills are contextually relevant to employee's current assignments

**Seniority History**
- Generate 1-3 SeniorityHistory records per profile showing sequential career progression
- Progression examples: Junior → Mid (1 year ago), Mid → Senior (6 months ago)
- Set `effectiveDate` ranging from 3 years ago to present, ensuring chronological consistency
- Most junior employees should have 1 record, senior/lead employees should have 2-3 records
- Set `createdById` to null or reference senior profiles for realistic approval tracking

**Idempotent Seeding Strategy**
- Before seeding, delete ALL existing records for: Profile, Project, Assignment, EmployeeSkill, Suggestion, SeniorityHistory
- Preserve the 136 admin-seeded Skill records (do NOT delete or modify Skill table)
- Use Prisma transaction to ensure atomic deletion and creation
- Log counts of deleted and created records for each model
- Handle foreign key constraints by deleting in correct order (child records before parent records)

**Logging and Feedback**
- Console log start/end of each seeding phase with timestamps
- Log counts for each model: "Created X profiles, Y projects, Z assignments..."
- Log any validation errors or constraint violations during seeding
- Provide final summary with total records created and time elapsed

**Data Integrity Constraints**
- Validate all emails use @ravn.com domain before insertion
- Ensure Tech Leads have Lead seniority level (validation check)
- Verify each project has exactly one Tech Lead after seeding
- Ensure assignment distribution matches target percentages (60-70% / 20-30% / 5-10%)
- Validate seniority history dates are chronological and effectiveDate <= current date

## Visual Design
No visual assets provided.

## Existing Code to Leverage

**`/apps/api/prisma/seed.ts` - Skills Taxonomy Seeding Pattern**
- Uses Prisma `upsert` pattern for idempotent seeding with `where: { name }` clause
- Implements counters (createdCount, updatedCount) to track seeding results
- Console logs each operation with skill name and discipline for transparency
- Wraps seeding logic in try/catch with error handling and stack trace logging
- Uses main() function pattern with finally block to disconnect Prisma client

**`/apps/api/prisma/schema.prisma` - Database Models and Relationships**
- Profile model with unique constraints on email and missionBoardId fields
- Project model with techLeadId foreign key and unique missionBoardId
- Assignment model with composite relations to Profile and Project, unique missionBoardId
- EmployeeSkill model with unique constraint on [profileId, skillId] composite key
- SeniorityHistory model with profileId index and optional createdById reference

**Prisma Client Initialization Pattern**
- Import PrismaClient and instantiate at module level: `const prisma = new PrismaClient()`
- Use prisma.$disconnect() in finally block to clean up connections
- Available Prisma methods: create, upsert, delete, deleteMany, findUnique, findMany

**Package.json Seed Script Configuration**
- Current configuration: `"seed": "ts-node prisma/seed.ts"` in prisma section
- Can execute seed script via `pnpm prisma db seed` command
- TypeScript execution via ts-node allows importing types from @prisma/client

**Enum Types for Data Generation**
- ProficiencyLevel: NOVICE, INTERMEDIATE, ADVANCED, EXPERT
- SuggestionStatus: PENDING, APPROVED, REJECTED, ADJUSTED
- SuggestionSource: SELF_REPORT, SYSTEM_FLAG
- Discipline: FRONTEND, BACKEND, MOBILE, DATABASE, CLOUD, DEVOPS, etc. (19 total disciplines)

## Out of Scope
- Mission Board API integration or data synchronization (deferred to later)
- Actual email sending or SMTP validation for generated emails
- Avatar image generation, hosting, or upload (use placeholder URLs only)
- Automated testing or validation scripts for seeded data
- UI or admin panel for triggering seeding (command-line execution only)
- Edge case scenarios: stale skills flagging, projects without Tech Leads, employees with 10+ suggestions
- User authentication, authorization, or permission checks during seeding
- Data export or backup functionality for seeded data
- Seeding for additional models not mentioned (e.g., future Activity logs, Notifications)
- Performance optimization for large-scale seeding (100+ employees, 50+ projects)
