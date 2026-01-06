# Spec Requirements: Sample Data Seeding

## Initial Description
Create fake data for Profiles, Projects, Assignments, and Suggestions to enable development without Mission Board integration. This feature involves seeding realistic sample data that allows developers to work on the Skills Platform features without requiring the external Mission Board system to be connected.

## Requirements Discussion

### First Round Questions

**Q1:** Sample Data Volume - I'm assuming you want a moderate dataset (e.g., 20-30 fake employees, 5-10 projects, with varied assignment distributions) to simulate realistic usage scenarios without overwhelming the database. Should we go with this scale, or do you need more/fewer records?
**Answer:** 20-30 fake employees, 5-10 projects with varied assignment distributions - Confirmed OK

**Q2:** Profile Distribution - I'm thinking we should create employees across different seniority levels (Junior, Mid, Senior, Lead) with realistic email patterns (firstname.lastname@ravn.com). Should we distribute them evenly across seniority levels, or follow a typical organizational pyramid (more juniors, fewer leads)?
**Answer:** Across different seniority levels with realistic email patterns - Confirmed OK

**Q3:** Project-Assignment Relationships - I assume most employees should have 1-2 active project assignments, with some having none (bench) and a few having 3+ (multi-project). Should we also designate 1 Tech Lead per project from the seeded profiles?
**Answer:** NO bench employees - everyone should be assigned. 1 Tech Lead per project from the seeded profiles - Confirmed

**Q4:** Skill Validation Data - I'm thinking we should create a mix of validated skills (EmployeeSkills with validatedAt dates) and pending suggestions for each employee. Should we aim for something like 3-7 validated skills per person, with 1-3 pending suggestions, using realistic proficiency distributions (more Intermediate/Advanced, fewer Novice/Expert)?
**Answer:** 3-7 validated skills per person, 1-3 pending suggestions, realistic proficiency distributions - Confirmed OK

**Q5:** Seniority History - I assume each employee should have 1-3 seniority history records showing career progression over time (e.g., promoted from Junior to Mid 6 months ago). Should these be sequential progressions, or can some employees have lateral moves or no history at all?
**Answer:** Sequential progressions (promoted over time, not lateral moves) - Confirmed

**Q6:** Data Realism vs. Randomness - I'm assuming we should use realistic-sounding names and ensure logical consistency (e.g., a Junior shouldn't have Expert-level skills, skills should match project context). Should we use a library like Faker.js for name generation, or would you prefer simpler placeholder names (Employee1, Employee2)?
**Answer:** Use Faker.js for realistic name generation and ensure logical consistency - Confirmed

**Q7:** Seeding Strategy - I'm thinking we should create an idempotent seed script that clears existing sample data before re-seeding (using a flag or specific identifier), so developers can reset to a clean state. Should the script preserve admin-seeded skills (the 50 tech skills) while clearing Profiles, Projects, Assignments, and Suggestions?
**Answer:** Idempotent script that clears existing sample data before re-seeding, preserve the 136 admin-seeded skills - Confirmed OK

**Q8:** Edge Cases and Scenarios - Are there specific scenarios you want represented in the seed data? For example: employees with stale skills (validated 12+ months ago) to test re-validation flagging, skills spanning multiple disciplines per person, projects without Tech Leads, employees with many pending suggestions (to test inbox UI with volume), or anything else I should exclude from the initial seeding?
**Answer:** No specific scenarios requested

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Skills Taxonomy Seeding - Path: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/prisma/seed.ts`
- Pattern to reference: The existing seed.ts file uses Prisma upsert pattern for idempotent seeding of 136 skills across multiple disciplines
- Seeding approach: Currently a single seed.ts file with manual skill entries and console logging for created/updated counts

### Follow-up Questions

**Follow-up 1:** Assignment Distribution - Since everyone should be assigned (no bench employees), should we aim for a realistic distribution like: Most employees (60-70%) on 1 project, Some employees (20-30%) on 2 projects, Few employees (5-10%) on 3 projects - Or would you prefer a different distribution pattern?
**Answer:** 60-70% on 1 project, 20-30% on 2 projects, 5-10% on 3 projects - Confirmed OK

**Follow-up 2:** Tech Lead Selection - When designating 1 Tech Lead per project from the seeded profiles, should Tech Leads be: Only from Senior/Lead seniority levels? Able to be Tech Lead on multiple projects (same person leading 2-3 projects)? Or should each Tech Lead only lead one project?
**Answer:** Only from Lead seniority level (NOT Senior). The same person CANNOT lead more than one project (each Tech Lead only leads one project)

**Follow-up 3:** Skill-Project Context Matching - Should the validated skills for employees roughly align with their project assignments? For example: If someone is assigned to a "Mobile App Redesign" project, should they have more MOBILE/FRONTEND skills validated? Or should skills be randomly distributed regardless of project context?
**Answer:** Skills should be validated and roughly align with project assignments (e.g., Mobile projects → MOBILE/FRONTEND skills)

**Follow-up 4:** Seeding Script Location - I found the existing skills taxonomy seed script at `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/prisma/seed.ts` which currently has 136 skills. Should the sample data seeding: Be added to the same seed.ts file (extending the existing script)? Or be created as a separate script (e.g., seed-sample-data.ts) that can be run independently?
**Answer:** Create a seed folder containing all the seed files (restructure the seeding approach to organize multiple seed scripts)

**Follow-up 5:** Date Ranges for Historical Data - For seniority history and validated skills timestamps, what timeframe makes sense? Seniority history: Should progressions span the last 1-3 years? Validated skills: Should validatedAt dates range from recent (last week) to older (6-12 months ago)? Pending suggestions: Should they all have recent createdAt dates (last 1-2 weeks)?
**Answer:** Seniority history 1-3 years, validated skills last week to 6-12 months, pending suggestions last 1-2 weeks - Confirmed OK

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
Not applicable - no visual files were provided.

## Requirements Summary

### Functional Requirements

**Data Volume:**
- Generate 20-30 fake employee profiles
- Generate 5-10 projects
- Ensure all employees have at least one assignment (no bench employees)
- Assignment distribution: 60-70% on 1 project, 20-30% on 2 projects, 5-10% on 3 projects

**Profile Data:**
- Realistic names generated using Faker.js
- Email pattern: firstname.lastname@ravn.com
- Distribution across seniority levels: Junior, Mid, Senior, Lead (organizational pyramid distribution)
- Each profile includes currentSeniorityLevel, unique missionBoardId, and avatarUrl
- Each employee has 3-7 validated skills with realistic proficiency distributions (more Intermediate/Advanced, fewer Novice/Expert)
- Each employee has 1-3 pending suggestions
- Logical consistency enforced (e.g., Juniors don't have Expert-level skills)

**Project Data:**
- 5-10 projects with realistic names
- Each project has exactly 1 Tech Lead assigned
- Tech Leads must be from Lead seniority level only (NOT Senior)
- Each Tech Lead can only lead one project (no multi-project Tech Leads)
- Unique missionBoardId for each project

**Assignment Data:**
- All employees must be assigned to at least one project
- Assignments include role and tags fields
- Unique missionBoardId for each assignment
- Distribution follows 60-70% / 20-30% / 5-10% pattern for 1/2/3 projects

**Skill Validation Data:**
- 3-7 EmployeeSkill records per profile (validated skills)
- Skills should roughly align with project assignments (context-aware matching)
- Example: Mobile projects → employees have MOBILE/FRONTEND skills
- Proficiency levels: realistic distribution (more Intermediate/Advanced, fewer Novice/Expert)
- ValidatedAt dates range from recent (last week) to older (6-12 months ago)
- ValidatedById should reference appropriate Tech Leads or senior employees

**Suggestion Data:**
- 1-3 pending Suggestion records per profile
- Source: SELF_REPORT
- Status: PENDING
- Created dates: last 1-2 weeks
- Suggested proficiency levels should be realistic

**Seniority History:**
- Each employee has 1-3 seniority history records
- Sequential progressions only (no lateral moves)
- Example progression timeline: Junior → Mid → Senior → Lead
- Effective dates span the last 1-3 years
- CreatedById can reference admin profiles or be null for initial records

### Reusability Opportunities

**Existing Seed Script to Reference:**
- File: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/prisma/seed.ts`
- Pattern: Uses Prisma upsert for idempotent seeding
- Logging: Console logs for created/updated counts
- Structure: Single file with manual entries

**New Seeding Architecture:**
- Restructure seeding to use a seed folder with multiple organized seed scripts
- Separate concerns: skills seeding vs. sample data seeding
- Allow independent execution of different seed scripts

### Scope Boundaries

**In Scope:**
- Create sample data for: Profiles, Projects, Assignments, Suggestions, EmployeeSkills, SeniorityHistory
- Idempotent seeding strategy (can be run multiple times safely)
- Clear existing sample data before re-seeding
- Preserve the 136 admin-seeded skills in the Skill table
- Use Faker.js for realistic name generation
- Ensure logical consistency across all relationships
- Context-aware skill matching (skills align with project types)
- Realistic date ranges for historical data
- Console logging for transparency
- Restructure seeding approach into organized seed folder structure

**Out of Scope:**
- Mission Board integration (deferred to later)
- Actual email sending or validation
- Avatar image generation or hosting (can use placeholder URLs)
- Automated testing of seed data
- UI for triggering seeding (command-line only)
- Edge case scenarios (stale skills, projects without Tech Leads, etc.)
- User authentication or permission checks during seeding

### Technical Considerations

**Database Schema:**
- Schema defined in: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/prisma/schema.prisma`
- Models to populate: Profile, Project, Assignment, EmployeeSkill, Suggestion, SeniorityHistory
- Model to preserve: Skill (136 existing records)
- Enums to use: ProficiencyLevel, SuggestionStatus, SuggestionSource, Discipline
- Required unique fields: Profile.email, Profile.missionBoardId, Project.missionBoardId, Assignment.missionBoardId
- Required indexes: Various indexes on profileId, skillId, projectId, status

**Relationships to Maintain:**
- Profile → EmployeeSkill (one-to-many)
- Profile → Suggestion (one-to-many)
- Profile → Assignment (one-to-many)
- Profile → SeniorityHistory (one-to-many)
- Profile → Project (Tech Lead relationship)
- Project → Assignment (one-to-many)
- Skill → EmployeeSkill (one-to-many)
- Skill → Suggestion (one-to-many)
- EmployeeSkill.validatedById → Profile (optional)
- SeniorityHistory.createdById → Profile (optional)

**Technology Stack:**
- ORM: Prisma
- Database: PostgreSQL
- Language: TypeScript
- Data Generation: Faker.js library
- Runtime: Node.js >= 18
- Package Manager: pnpm 9.0.0

**Data Integrity Constraints:**
- All emails must use @ravn.com domain
- Tech Leads must have Lead seniority level
- Each Tech Lead can only lead one project
- Proficiency levels must match seniority (Juniors don't have Expert skills)
- Skills must align with project context
- Sequential seniority progressions only
- All employees must have at least one assignment
- Dates must be realistic and chronologically consistent

**Seeding Architecture Refactor:**
- Current: Single `/apps/api/prisma/seed.ts` file
- New: Create `/apps/api/prisma/seeds/` folder structure
- Separate scripts for different seeding concerns
- Main seed orchestrator to coordinate execution
- Allow independent execution of individual seed scripts
