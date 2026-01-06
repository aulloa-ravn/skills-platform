# Task Breakdown: Sample Data Seeding

## Overview
Total Task Groups: 6
Estimated Tasks: 40+

## Task List

### Foundation Layer

#### Task Group 1: Seed Infrastructure Setup
**Dependencies:** None

- [x] 1.0 Complete seed infrastructure foundation
  - [x] 1.1 Write 2-8 focused tests for seed infrastructure
    - Limit to 2-8 highly focused tests maximum
    - Test seed folder structure creation
    - Test Faker.js deterministic seeding (same seed = same output)
    - Test main orchestrator imports and executes seed files
    - Skip exhaustive testing of all utility functions
  - [x] 1.2 Create `/apps/api/prisma/seeds/` folder structure
    - Create seeds directory
    - Verify directory exists and is accessible
  - [x] 1.3 Install and configure Faker.js
    - Run: `cd /Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api && pnpm add -D @faker-js/faker`
    - Verify installation in package.json
  - [x] 1.4 Create seed utilities module
    - Create `seeds/seed-utils.ts` with shared utility functions
    - Add Faker seed initialization function for deterministic data
    - Add email generator: `generateEmail(firstName, lastName)` returning `firstname.lastname@ravn.com`
    - Add missionBoardId generator (UUID-based)
    - Add date range generators for realistic timestamps
    - Add distribution calculator helpers (for percentages)
  - [x] 1.5 Refactor existing skills seed
    - Create `seeds/skills.seed.ts`
    - Move existing 136 skills seeding logic from `seed.ts` to `skills.seed.ts`
    - Export async function: `export async function seedSkills(prisma: PrismaClient)`
    - Maintain existing upsert pattern and logging
    - Preserve counter logic (createdCount, updatedCount)
  - [x] 1.6 Create main seed orchestrator
    - Create new `seed.ts` as main orchestrator
    - Import seedSkills from `seeds/skills.seed.ts`
    - Import seedSampleData (to be created in Task Group 2)
    - Implement main() function that calls seed functions sequentially
    - Add try/catch with error handling and stack trace logging
    - Add finally block with prisma.$disconnect()
    - Add overall timing and summary logging
  - [x] 1.7 Update package.json prisma.seed configuration
    - Verify `"seed": "ts-node prisma/seed.ts"` points to orchestrator
    - Test execution: `cd /Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api && pnpm prisma db seed`
  - [x] 1.8 Ensure seed infrastructure tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify folder structure created successfully
    - Verify Faker.js installed and deterministic
    - Verify orchestrator executes skills seed
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- Seed folder structure exists at `/apps/api/prisma/seeds/`
- Faker.js installed as dev dependency
- Utilities module provides reusable helper functions
- Existing 136 skills seed logic moved to `skills.seed.ts`
- Main orchestrator successfully calls and executes skills seed
- `pnpm prisma db seed` executes without errors

---

### Data Generation Layer - Profiles & Seniority

#### Task Group 2: Profile and Seniority History Generation
**Dependencies:** Task Group 1

- [x] 2.0 Complete profile and seniority generation
  - [x] 2.1 Write 2-8 focused tests for profile generation
    - Limit to 2-8 highly focused tests maximum
    - Test profile count (20-30 profiles created)
    - Test email format validation (firstname.lastname@ravn.com)
    - Test seniority pyramid distribution (40% Junior, 30% Mid, 20% Senior, 10% Lead)
    - Test at least 5-10 profiles have Lead seniority
    - Test unique missionBoardId per profile
    - Skip exhaustive validation of all profile fields
  - [x] 2.2 Create profile generation module
    - Create `seeds/profiles.seed.ts`
    - Implement `generateProfiles(count: number)` function
    - Use Faker.js with deterministic seed for reproducible names
    - Generate unique first and last names for each profile
    - Generate email using utility: `generateEmail(firstName, lastName)`
    - Generate unique missionBoardId for each profile
    - Generate avatarUrl using Faker.js image.avatar() or placeholder service
  - [x] 2.3 Implement seniority distribution logic
    - Calculate seniority distribution: 40% Junior, 30% Mid, 20% Senior, 10% Lead
    - Ensure minimum 5-10 profiles have Lead seniority (for Tech Lead requirements)
    - If count is 20: 8 Junior, 6 Mid, 4 Senior, 2 Lead (adjust to ensure 5-10 Leads)
    - If count is 30: 12 Junior, 9 Mid, 6 Senior, 3 Lead
    - Store seniority level in currentSeniorityLevel field
  - [x] 2.4 Create seniority history generation module
    - Create `seeds/seniority-history.seed.ts`
    - Implement `generateSeniorityHistory(profiles: Profile[])` function
    - For each profile, generate 1-3 history records based on current seniority
    - Junior employees: 1 record (hired as Junior)
    - Mid employees: 1-2 records (Junior → Mid progression)
    - Senior employees: 2-3 records (Junior → Mid → Senior)
    - Lead employees: 2-3 records (various progression paths)
  - [x] 2.5 Implement chronological progression logic
    - Set effectiveDate ranging from 3 years ago to present
    - Ensure dates are chronologically sequential (earlier promotions before later ones)
    - Use realistic promotion intervals (e.g., Junior → Mid: 1-2 years, Mid → Senior: 1.5-3 years)
    - Final history record effectiveDate should reflect current seniority level
    - Set createdById to null or reference senior profiles randomly
  - [x] 2.6 Integrate profile and seniority seeding
    - Create main `seedSampleData(prisma: PrismaClient)` function in `seeds/sample-data.seed.ts`
    - Import profile and seniority history generators
    - Generate 20-30 profiles
    - Create profiles using prisma.profile.createMany()
    - Generate and create seniority history records
    - Add console logging: "Created X profiles (Y Junior, Z Mid, W Senior, V Lead)"
    - Add console logging: "Created X seniority history records"
  - [x] 2.7 Ensure profile generation tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify 20-30 profiles created
    - Verify seniority distribution matches target percentages
    - Verify at least 5-10 Lead profiles exist
    - Verify all emails follow @ravn.com pattern
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- 20-30 profiles generated with realistic names using Faker.js
- Email format: firstname.lastname@ravn.com (all lowercase, no spaces)
- Seniority distribution: ~40% Junior, ~30% Mid, ~20% Senior, ~10% Lead
- At least 5-10 profiles have Lead seniority
- Each profile has unique missionBoardId
- Seniority history records show sequential progressions
- Chronological consistency maintained (effectiveDate ordering)
- Console logs display profile and seniority history creation counts

---

### Data Generation Layer - Projects & Assignments

#### Task Group 3: Project and Assignment Generation
**Dependencies:** Task Group 2 (requires Lead profiles)

- [x] 3.0 Complete project and assignment generation
  - [x] 3.1 Write 2-8 focused tests for project and assignment generation
    - Limit to 2-8 highly focused tests maximum
    - Test project count (5-10 projects created)
    - Test each project has exactly one Tech Lead
    - Test Tech Leads are from Lead seniority level only
    - Test no Tech Lead assigned to multiple projects
    - Test all employees have at least one assignment
    - Test assignment distribution (60-70% on 1 project, 20-30% on 2, 5-10% on 3)
    - Skip exhaustive testing of assignment roles and tags
  - [x] 3.2 Create project generation module
    - Create `seeds/projects.seed.ts`
    - Implement `generateProjects(count: number, leadProfiles: Profile[])` function
    - Use Faker.js to generate realistic project names (e.g., "Mobile App Redesign", "Payment Gateway Integration")
    - Generate unique missionBoardId for each project
    - Vary project types: mobile, backend, frontend, full-stack (store in name or tags)
    - Track project type for later skill-project alignment
  - [x] 3.3 Implement Tech Lead assignment logic
    - Filter profiles to get only those with Lead seniority level
    - Ensure sufficient Lead profiles exist (minimum 5-10 from Task Group 2)
    - Assign exactly one unique Tech Lead per project (techLeadId field)
    - Ensure no Lead profile is assigned as Tech Lead to multiple projects
    - Validate constraint: if 5 projects, use 5 different Tech Leads
    - Add console logging: "Assigned Tech Leads: [names/IDs]"
  - [x] 3.4 Create assignment generation module
    - Create `seeds/assignments.seed.ts`
    - Implement `generateAssignments(profiles: Profile[], projects: Project[])` function
    - Calculate target distribution: 60-70% on 1 project, 20-30% on 2, 5-10% on 3
    - Example for 25 profiles: 16 on 1 project (64%), 7 on 2 projects (28%), 2 on 3 projects (8%)
  - [x] 3.5 Implement assignment distribution logic
    - Shuffle profiles to randomize assignment distribution
    - Split profiles into three groups based on target percentages
    - Group 1: Assign to 1 random project each
    - Group 2: Assign to 2 random projects each
    - Group 3: Assign to 3 random projects each
    - Ensure every profile gets at least one assignment (no bench employees)
    - Generate unique missionBoardId for each assignment
  - [x] 3.6 Add assignment roles and tags
    - Define role options based on project type:
      - Mobile: ["Mobile Developer", "iOS Engineer", "Android Engineer", "QA Engineer"]
      - Backend: ["Backend Engineer", "API Developer", "Database Engineer", "DevOps Engineer"]
      - Frontend: ["Frontend Developer", "UI Engineer", "React Developer", "QA Analyst"]
      - Full-stack: Mix of all role types
    - Assign realistic role from appropriate list based on project type
    - Add 1-3 tags per assignment:
      - Mobile tags: ["react-native", "ios", "android", "mobile-ui", "app-store"]
      - Backend tags: ["api", "rest", "graphql", "postgresql", "redis", "docker"]
      - Frontend tags: ["react", "typescript", "tailwind", "nextjs", "ui-ux"]
    - Store tags as array in assignment.tags field
  - [x] 3.7 Integrate project and assignment seeding
    - Add project generation to `seedSampleData()` in `seeds/sample-data.seed.ts`
    - Generate 5-10 projects with Tech Lead assignments
    - Create projects using prisma.project.createMany()
    - Generate and create assignments
    - Add console logging: "Created X projects with Tech Leads"
    - Add console logging: "Created X assignments (distribution: Y on 1 project, Z on 2, W on 3)"
  - [x] 3.8 Ensure project and assignment tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify 5-10 projects created
    - Verify each project has exactly one Tech Lead
    - Verify all Tech Leads are from Lead seniority level
    - Verify no Tech Lead assigned to multiple projects
    - Verify all profiles have at least one assignment
    - Verify assignment distribution approximates target percentages
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- 5-10 projects created with realistic names
- Each project has exactly one Tech Lead from Lead seniority profiles
- No Tech Lead assigned to multiple projects
- All 20-30 employees have at least one assignment (0% bench)
- Assignment distribution: ~60-70% on 1 project, ~20-30% on 2, ~5-10% on 3
- Assignments have realistic roles based on project type
- Assignments have 1-3 relevant tags per assignment
- Console logs display project and assignment creation with distribution breakdown

---

### Data Generation Layer - Employee Skills

#### Task Group 4: Employee Skill Validation Generation
**Dependencies:** Task Group 3 (requires assignments for context-aware skills)

- [x] 4.0 Complete employee skill validation generation
  - [x] 4.1 Write 2-8 focused tests for employee skill generation
    - Limit to 2-8 highly focused tests maximum
    - Test each profile has 3-7 validated skills
    - Test skills align with project assignments (context-aware)
    - Test proficiency distribution (10% NOVICE, 40% INTERMEDIATE, 40% ADVANCED, 10% EXPERT)
    - Test logical consistency (Juniors don't have EXPERT, Leads have more ADVANCED/EXPERT)
    - Test validatedAt dates range from 1 week to 12 months ago
    - Skip exhaustive testing of all skill-seniority combinations
  - [x] 4.2 Create skill-project context mapping
    - Create `seeds/skill-context.ts` utility module
    - Define mapping of project types to relevant disciplines:
      - Mobile projects → [MOBILE, FRONTEND, UI_UX, TESTING]
      - Backend projects → [BACKEND, DATABASE, CLOUD, DEVOPS, API_DESIGN]
      - Frontend projects → [FRONTEND, UI_UX, JAVASCRIPT, CSS, TESTING]
      - Full-stack projects → [FRONTEND, BACKEND, DATABASE, CLOUD, API_DESIGN]
    - Implement `getRelevantSkillsForProjects(projects: Project[], allSkills: Skill[])` function
    - Filter skills by discipline based on project type
    - Return skill IDs that match project context
  - [x] 4.3 Create employee skill generation module
    - Create `seeds/employee-skills.seed.ts`
    - Implement `generateEmployeeSkills(profiles: Profile[], assignments: Assignment[], projects: Project[], skills: Skill[])` function
    - For each profile, get their project assignments
    - Determine relevant skill disciplines based on assigned projects
    - Generate 3-7 validated skills per profile
  - [x] 4.4 Implement context-aware skill selection
    - For each profile, map assignments to projects to get project types
    - Get relevant skills using skill-context mapping
    - Randomly select 3-7 skills from relevant skill pool
    - Ensure no duplicate skills per profile (unique constraint on [profileId, skillId])
    - If relevant skill pool is small, supplement with random skills from other disciplines
  - [x] 4.5 Implement proficiency distribution logic
    - Target distribution: 10% NOVICE, 40% INTERMEDIATE, 40% ADVANCED, 10% EXPERT
    - For 5 skills: 0-1 NOVICE, 2 INTERMEDIATE, 2 ADVANCED, 0-1 EXPERT
    - Apply seniority-based constraints:
      - Junior (seniority): Allow NOVICE, INTERMEDIATE, ADVANCED (no EXPERT)
      - Mid (seniority): Allow NOVICE, INTERMEDIATE, ADVANCED, rare EXPERT
      - Senior (seniority): Allow all levels, favor ADVANCED/EXPERT
      - Lead (seniority): Allow all levels, majority ADVANCED/EXPERT
    - Adjust proficiency distribution based on seniority level
  - [x] 4.6 Generate validation metadata
    - Set validatedAt dates using random distribution from 1 week ago to 12 months ago
    - Use Faker.js date.recent() and date.past() methods
    - Ensure dates are in the past and realistic
    - Set validatedById to reference Tech Leads or senior employees (profileId of Lead/Senior)
    - Allow some validatedById to be null (self-validated or legacy)
    - Generate random 20-30% null validatedById, 70-80% assigned to senior profiles
  - [x] 4.7 Integrate employee skill seeding
    - Add employee skill generation to `seedSampleData()` in `seeds/sample-data.seed.ts`
    - Fetch all existing skills from database: `const skills = await prisma.skill.findMany()`
    - Generate employee skills with context awareness
    - Create employee skills using prisma.employeeSkill.createMany()
    - Add console logging: "Created X employee skills (avg Y per profile)"
    - Add console logging: "Proficiency distribution: A NOVICE, B INTERMEDIATE, C ADVANCED, D EXPERT"
  - [x] 4.8 Ensure employee skill tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify each profile has 3-7 validated skills
    - Verify skills align with project context (Mobile → MOBILE/FRONTEND skills)
    - Verify proficiency distribution approximates target percentages
    - Verify Junior employees don't have EXPERT skills
    - Verify Lead employees have more ADVANCED/EXPERT skills
    - Verify validatedAt dates within 1 week to 12 months range
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- Each profile has 3-7 validated skills
- Skills align with employee's project assignments (context-aware)
- Proficiency distribution approximates: 10% NOVICE, 40% INTERMEDIATE, 40% ADVANCED, 10% EXPERT
- Logical consistency: Juniors lack EXPERT, Leads have more ADVANCED/EXPERT
- ValidatedAt dates range from 1 week ago to 12 months ago
- ValidatedById references Tech Leads/senior profiles or null
- No duplicate skills per profile (unique constraint satisfied)
- Console logs display employee skill creation with proficiency breakdown

---

### Data Generation Layer - Skill Suggestions

#### Task Group 5: Skill Suggestion Generation
**Dependencies:** Task Group 4 (requires validated skills to avoid duplication)

- [x] 5.0 Complete skill suggestion generation
  - [x] 5.1 Write 2-8 focused tests for skill suggestion generation
    - Limit to 2-8 highly focused tests maximum
    - Test each profile has 1-3 pending suggestions
    - Test all suggestions have source = SELF_REPORT and status = PENDING
    - Test createdAt dates within last 1-2 weeks
    - Test suggestions don't duplicate existing validated skills at same proficiency
    - Test suggested skills are contextually relevant to assignments
    - Skip exhaustive testing of all suggestion scenarios
  - [x] 5.2 Create skill suggestion generation module
    - Create `seeds/skill-suggestions.seed.ts`
    - Implement `generateSkillSuggestions(profiles: Profile[], employeeSkills: EmployeeSkill[], assignments: Assignment[], projects: Project[], skills: Skill[])` function
    - For each profile, generate 1-3 pending suggestions
    - Use randomization: 60% get 1 suggestion, 30% get 2, 10% get 3
  - [x] 5.3 Implement context-aware suggestion selection
    - For each profile, get their project assignments
    - Determine relevant skill disciplines using skill-context mapping from Task 4.2
    - Filter skills to those relevant to employee's project context
    - Exclude skills already validated for this profile at same or higher proficiency
    - Randomly select 1-3 skills from filtered pool
  - [x] 5.4 Implement suggestion proficiency logic
    - For each suggested skill, determine realistic proficiency level
    - If skill doesn't exist in employee's validated skills: suggest NOVICE or INTERMEDIATE
    - If skill exists at lower proficiency: suggest next level up (NOVICE → INTERMEDIATE, INTERMEDIATE → ADVANCED, etc.)
    - Ensure suggestions make logical sense based on employee seniority
    - Junior employees: suggest NOVICE, INTERMEDIATE
    - Mid employees: suggest INTERMEDIATE, ADVANCED
    - Senior/Lead employees: suggest ADVANCED, EXPERT
  - [x] 5.5 Generate suggestion metadata
    - Set source to SELF_REPORT (enum value)
    - Set status to PENDING (enum value)
    - Set createdAt dates using random distribution within last 1-2 weeks
    - Use Faker.js date.recent({ days: 14 }) method
    - Ensure all createdAt dates are recent and realistic
  - [x] 5.6 Integrate skill suggestion seeding
    - Add skill suggestion generation to `seedSampleData()` in `seeds/sample-data.seed.ts`
    - Generate suggestions with context awareness and duplication checks
    - Create suggestions using prisma.suggestion.createMany()
    - Add console logging: "Created X skill suggestions (distribution: Y with 1, Z with 2, W with 3)"
    - Add console logging: "All suggestions set to PENDING status from SELF_REPORT source"
  - [x] 5.7 Ensure skill suggestion tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify each profile has 1-3 pending suggestions
    - Verify all suggestions have source = SELF_REPORT and status = PENDING
    - Verify createdAt dates within last 1-2 weeks
    - Verify suggestions don't duplicate validated skills at same proficiency
    - Verify suggested skills are contextually relevant
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 5.1 pass
- Each profile has 1-3 pending suggestions
- All suggestions have source = SELF_REPORT and status = PENDING
- CreatedAt dates within last 1-2 weeks (recent dates)
- Suggestions don't duplicate existing validated skills at same/higher proficiency
- Suggested skills align with employee's project context
- Suggested proficiency levels are realistic based on seniority
- Console logs display suggestion creation with distribution breakdown

---

### Data Integrity & Cleanup Layer

#### Task Group 6: Idempotent Seeding and Validation
**Dependencies:** Task Groups 1-5 (requires all generation logic complete)

- [x] 6.0 Complete idempotent seeding and data validation
  - [x] 6.1 Write 2-8 focused tests for idempotent seeding
    - Limit to 2-8 highly focused tests maximum
    - Test seed script can run multiple times without errors
    - Test existing sample data deleted before re-seeding
    - Test 136 admin-seeded skills preserved (NOT deleted)
    - Test foreign key constraints handled correctly (deletion order)
    - Test final data counts match expected values
    - Skip exhaustive testing of all edge cases
  - [x] 6.2 Implement data cleanup strategy
    - Add cleanup logic at start of `seedSampleData()` function
    - Log: "Cleaning up existing sample data..."
    - Delete in correct order to handle foreign key constraints:
      1. Delete SeniorityHistory (child of Profile)
      2. Delete Suggestion (child of Profile and Skill)
      3. Delete EmployeeSkill (child of Profile and Skill)
      4. Delete Assignment (child of Profile and Project)
      5. Delete Project (references Profile as Tech Lead)
      6. Delete Profile (parent of many tables)
    - Use prisma.[model].deleteMany() for each model
    - Log deletion counts: "Deleted X seniority histories, Y suggestions, Z employee skills, etc."
  - [x] 6.3 Verify skill preservation
    - Before cleanup, log: "Preserving X existing skills..."
    - Do NOT delete or modify Skill table records
    - After cleanup, verify skill count unchanged: `const skillCount = await prisma.skill.count()`
    - Assert skillCount === 136 (or current count)
    - Log: "Verified X skills preserved"
  - [x] 6.4 Implement Prisma transaction wrapper
    - Wrap cleanup and creation logic in Prisma transaction for atomicity
    - Use `await prisma.$transaction(async (tx) => { ... })`
    - Ensures all deletions and creations succeed or all rollback
    - Add transaction timeout: `{ timeout: 30000 }` (30 seconds)
    - Add error handling within transaction
  - [x] 6.5 Add data integrity validation
    - After seeding completes, run validation checks
    - Validate all emails use @ravn.com domain:
      - Query: `const invalidEmails = await prisma.profile.findMany({ where: { NOT: { email: { endsWith: '@ravn.com' } } } })`
      - Assert: invalidEmails.length === 0
    - Validate Tech Leads have Lead seniority:
      - Query projects with Tech Lead details
      - Assert all techLead.currentSeniorityLevel === 'LEAD'
    - Validate each project has exactly one Tech Lead:
      - Query: `const projectsWithoutLead = await prisma.project.findMany({ where: { techLeadId: null } })`
      - Assert: projectsWithoutLead.length === 0
    - Validate assignment distribution:
      - Count assignments per profile
      - Calculate percentages for 1/2/3 project groups
      - Log: "Assignment distribution: X% on 1 project, Y% on 2, Z% on 3"
      - Assert percentages approximately match targets (within 10% tolerance)
    - Validate seniority history chronology:
      - For each profile with multiple history records, verify dates are sequential
      - Assert effectiveDate[i] < effectiveDate[i+1]
    - Log validation results: "All data integrity checks passed"
  - [x] 6.6 Implement comprehensive logging
    - Add timestamp logging for each seeding phase:
      - Log: "[timestamp] Starting profile generation..."
      - Log: "[timestamp] Profile generation complete"
    - Log counts for each model created:
      - "Created X profiles (Y Junior, Z Mid, W Senior, V Lead)"
      - "Created X projects with Tech Leads"
      - "Created X assignments (distribution: ...)"
      - "Created X employee skills (avg Y per profile)"
      - "Created X skill suggestions"
      - "Created X seniority history records"
    - Log validation check results
    - Add final summary with total time elapsed:
      - Log: "Seeding completed in X.XX seconds"
      - Log: "Total records created: X profiles, Y projects, Z assignments, W skills, V suggestions, U histories"
  - [x] 6.7 Add error handling and rollback
    - Wrap entire seeding logic in try/catch block
    - On error, log detailed error message with stack trace
    - Log: "ERROR: Seeding failed - [error message]"
    - If using transaction, rollback is automatic
    - Provide helpful error messages for common issues:
      - "Insufficient Lead profiles for Tech Lead assignments"
      - "Unique constraint violation on [field]"
      - "Foreign key constraint violation"
    - Exit process with error code on failure: `process.exit(1)`
  - [x] 6.8 Test idempotent seeding end-to-end
    - Run seed script first time: `cd /Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api && pnpm prisma db seed`
    - Verify all data created successfully
    - Note record counts from logs
    - Run seed script second time (idempotent test)
    - Verify old data deleted and new data created
    - Verify record counts match first run (deterministic with Faker seed)
    - Verify 136 skills preserved both times
    - Verify no errors or warnings
  - [x] 6.9 Ensure idempotent seeding tests pass
    - Run ONLY the 2-8 tests written in 6.1
    - Verify seed script runs multiple times successfully
    - Verify sample data deleted before re-seeding
    - Verify skills preserved (count remains 136)
    - Verify deletion order prevents foreign key errors
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 6.1 pass
- Seed script can run multiple times without errors (idempotent)
- Existing sample data deleted before re-seeding (clean slate)
- 136 admin-seeded skills preserved (NOT deleted)
- Foreign key constraints handled correctly (proper deletion order)
- Prisma transaction ensures atomic operations (all succeed or all rollback)
- Data integrity validations pass:
  - All emails use @ravn.com domain
  - All Tech Leads have Lead seniority
  - All projects have exactly one Tech Lead
  - Assignment distribution matches targets (within tolerance)
  - Seniority history dates are chronological
- Comprehensive logging displays:
  - Timestamps for each phase
  - Deletion counts
  - Creation counts with distributions
  - Validation check results
  - Total time elapsed
  - Final summary
- Error handling provides helpful messages
- Deterministic seeding produces same data each run (Faker seed)

---

### Final Testing & Documentation

#### Task Group 7: Comprehensive Testing and Documentation
**Dependencies:** Task Groups 1-6 (all features complete)

- [x] 7.0 Complete comprehensive testing and documentation
  - [x] 7.1 Review tests from Task Groups 1-6
    - Review the 2-8 tests written by infrastructure-engineer (Task 1.1)
    - Review the 2-8 tests written by data-engineer (Task 2.1)
    - Review the 2-8 tests written by data-engineer (Task 3.1)
    - Review the 2-8 tests written by data-engineer (Task 4.1)
    - Review the 2-8 tests written by data-engineer (Task 5.1)
    - Review the 2-8 tests written by data-engineer (Task 6.1)
    - Total existing tests: approximately 12-48 tests
  - [x] 7.2 Analyze test coverage gaps for Sample Data Seeding feature only
    - Identify critical seeding workflows that lack test coverage
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end seeding workflows over unit test gaps
    - Examples of potential gaps:
      - End-to-end seeding workflow (cleanup → seed → validate)
      - Skill-project context alignment verification
      - Seniority-proficiency consistency checks
      - Assignment distribution accuracy
      - Date chronology validation
  - [x] 7.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points and end-to-end workflows
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases, performance tests, and stress tests unless business-critical
    - Example test cases:
      - Full seeding workflow produces expected data structure
      - Re-running seed (idempotent) produces consistent results
      - Skill-project alignment works across all project types
      - Seniority constraints enforced (Juniors lack EXPERT skills)
      - All foreign key relationships valid after seeding
  - [x] 7.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, and 7.3)
    - Expected total: approximately 22-58 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass
    - Fix any failing tests
  - [x] 7.5 Create usage documentation
    - Create `seeds/README.md` with seeding documentation
    - Document purpose of seed folder structure
    - Document each seed file and its responsibility
    - Provide usage instructions:
      - How to run full seed: `pnpm prisma db seed`
      - How to run individual seed files (if applicable)
      - Expected output and logging
    - Document data volumes and distributions:
      - Profiles: 20-30 (seniority pyramid)
      - Projects: 5-10 (each with 1 Tech Lead)
      - Assignments: all employees assigned, distribution percentages
      - Employee Skills: 3-7 per profile, context-aware
      - Suggestions: 1-3 per profile, PENDING status
      - Seniority History: 1-3 per profile, sequential
    - Document idempotent behavior and data preservation
    - Document Faker.js deterministic seeding for reproducibility
  - [x] 7.6 Add troubleshooting guide
    - Document common issues and solutions:
      - "Insufficient Lead profiles" → adjust seniority distribution
      - "Unique constraint violation" → check for duplicate data
      - "Foreign key constraint error" → verify deletion order
      - "Seeding takes too long" → optimize batch operations or reduce data volume
    - Document how to reset database completely:
      - `pnpm prisma migrate reset` (resets schema and runs seed)
      - `pnpm prisma db push && pnpm prisma db seed` (push schema then seed)
    - Document how to verify seeded data:
      - Query examples using Prisma Studio or direct queries
      - Expected counts for each model
  - [x] 7.7 Verify end-to-end seeding workflow
    - Perform full end-to-end manual verification:
      - Reset database: `cd /Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api && pnpm prisma migrate reset`
      - Run seed: `pnpm prisma db seed`
      - Verify console logs show expected counts and distributions
      - Verify no errors or warnings
      - Query database to verify data integrity:
        - Check profile count (20-30)
        - Check project count (5-10)
        - Check each project has Tech Lead
        - Check all employees have assignments
        - Check employee skills align with project context
        - Check suggestions are PENDING and recent
        - Check seniority history chronology
      - Run seed again (idempotent test)
      - Verify data refreshed and counts remain consistent
      - Verify skills still at 136 (preserved)
  - [x] 7.8 Update main README if needed
    - If there's a main project README, add section on seeding
    - Link to `seeds/README.md` for detailed documentation
    - Provide quick start guide for developers:
      - "To populate database with sample data: `pnpm prisma db seed`"
      - "Seeding is idempotent and safe to run multiple times"
      - "Preserves existing skills taxonomy (136 skills)"

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 22-58 tests total)
- Critical seeding workflows covered by tests
- No more than 10 additional tests added when filling testing gaps
- Testing focused exclusively on Sample Data Seeding feature requirements
- Comprehensive documentation in `seeds/README.md`:
  - Purpose and architecture
  - Usage instructions
  - Data volumes and distributions
  - Idempotent behavior
  - Troubleshooting guide
- End-to-end verification completed successfully:
  - Full seed executes without errors
  - Data integrity validated
  - Idempotent re-seeding works
  - Skills preserved
- Main project README updated with seeding quick start (if applicable)

---

## Execution Order

Recommended implementation sequence:

1. **Foundation Layer** (Task Group 1)
   - Set up seed infrastructure, folder structure, Faker.js, utilities, and orchestrator
   - Refactor existing skills seed into modular structure

2. **Data Generation - Profiles & Seniority** (Task Group 2)
   - Generate profiles with seniority distribution
   - Generate seniority history with chronological progressions

3. **Data Generation - Projects & Assignments** (Task Group 3)
   - Generate projects with Tech Lead assignments
   - Generate assignments with distribution and context

4. **Data Generation - Employee Skills** (Task Group 4)
   - Generate validated employee skills with context-aware selection
   - Implement proficiency distribution and seniority constraints

5. **Data Generation - Skill Suggestions** (Task Group 5)
   - Generate pending skill suggestions with context awareness
   - Avoid duplication of validated skills

6. **Data Integrity & Cleanup** (Task Group 6)
   - Implement idempotent cleanup strategy
   - Add data integrity validations
   - Add comprehensive logging and error handling

7. **Final Testing & Documentation** (Task Group 7)
   - Review and fill testing gaps
   - Create comprehensive documentation
   - Verify end-to-end seeding workflow

---

## Notes

- **Deterministic Seeding**: Use Faker.js seed initialization (e.g., `faker.seed(12345)`) to ensure reproducible data across runs
- **Foreign Key Handling**: Always delete child records before parent records to avoid constraint violations
- **Transaction Safety**: Wrap cleanup and creation in Prisma transaction for atomic operations
- **Logging Transparency**: Provide detailed console logs for every seeding phase and validation check
- **Data Preservation**: Never delete or modify the Skill table (preserve 136 admin-seeded skills)
- **Context Awareness**: Align employee skills and suggestions with their project assignments for realism
- **Logical Consistency**: Enforce seniority-based constraints on proficiency levels and career progressions
- **Idempotent Design**: Seed script can be run multiple times safely, always producing consistent results
- **Testing Strategy**: Each task group writes 2-8 focused tests and runs only those tests, with a final comprehensive test review in Task Group 7
