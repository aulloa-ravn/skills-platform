# Spec Requirements: Skills Taxonomy Seeding

## Initial Description
Seed the database with top 50 tech skills including discipline mappings (e.g., React/Frontend, Node.js/Backend, TypeScript/Languages).

This is roadmap item #2 from the product roadmap. It is a foundational feature that enables development without Mission Board integration by providing a canonical set of skills that can be used throughout the system.

## Requirements Discussion

### First Round Questions

**Q1:** I assume you want the "top 50 tech skills" to include modern JavaScript frameworks (React, Vue, Angular), backend frameworks (Node.js, Django, FastAPI), databases (PostgreSQL, MongoDB, Redis), cloud platforms (AWS, GCP, Azure), and DevOps tools (Docker, Kubernetes, CI/CD). Should we cover all these categories, or would you like me to propose a specific curated list based on Ravn's typical tech stack?

**Answer:** Curated list approach is ok

**Q2:** I'm thinking the seed data should be implemented as a Prisma seed script (`prisma/seed.ts`) that can be run via `pnpm prisma db seed` and would be idempotent (safe to run multiple times without creating duplicates). Is that the approach you want?

**Answer:** Yes - Prisma seed script approach (prisma/seed.ts, run via pnpm prisma db seed, idempotent)

**Q3:** Looking at the Discipline enum in your schema, I see: FRONTEND, BACKEND, LANGUAGES, DEVOPS, DATABASE, DESIGN, MOBILE, TESTING, CLOUD, OTHER. Should programming languages like JavaScript, TypeScript, Python be categorized under LANGUAGES, while frameworks go to their respective disciplines (React → FRONTEND, Node.js → BACKEND)?

**Answer:** Yes - Programming languages under LANGUAGES, frameworks to their respective disciplines

**Q4:** I assume all seeded skills should have `isActive: true` by default. Should there be any skills marked as inactive, or are we only seeding currently relevant technologies?

**Answer:** Yes - All seeded skills should have isActive: true by default

**Q5:** For skills that could belong to multiple disciplines (e.g., GraphQL could be BACKEND or FRONTEND, TypeScript could be LANGUAGES or FRONTEND/BACKEND), which discipline should take precedence? Should we pick the most common usage context?

**Answer:** No - For multi-discipline skills, check skills-list.md

**Q6:** I'm thinking the seed script should include clear comments grouping skills by discipline for maintainability, and potentially use a structured data format (array of objects with name and discipline) rather than individual insert statements. Does that align with your preferences?

**Answer:** No (regarding structured data format preference)

**Q7:** Should the seed script handle updates to existing skills (e.g., if we change a discipline mapping and re-run the seed), or should it only insert skills that don't already exist based on the unique name constraint?

**Answer:** Insert the skills listed in skills-list.md

**Q8:** Is there anything you explicitly want to EXCLUDE from this seeding feature? For example: no legacy technologies, no design tools, no business/soft skills, only technical programming skills?

**Answer:** Insert the skills listed in skills-list.md

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

**Follow-up 1:** I notice the list contains **138 skills**, not the "top 50" mentioned in the roadmap. Should we seed all 138 skills from the list, or would you like me to filter it down to a smaller subset? If filtering, which categories should we prioritize?

**Answer:** Seed all 138 skills from the list

**Follow-up 2:** The skills-list.md uses discipline names that **don't match your Prisma schema's Discipline enum**. For example:
- List uses: "Styling", "Tools", "API", "Performance", "Security", "iOS", "Android", "Build Tools", "No-Code"
- Schema has: FRONTEND, BACKEND, LANGUAGES, DEVOPS, DATABASE, DESIGN, MOBILE, TESTING, CLOUD, OTHER

Should I map these to the existing enum values? Here's my suggested mapping:
- "Styling" → FRONTEND (since CSS/HTML are frontend technologies)
- "Tools" (Git, GitHub, etc.) → DEVOPS
- "API" (GraphQL, REST, etc.) → BACKEND
- "Performance" (JMeter, K6) → TESTING
- "Security" (SonarQube, Snyk) → DEVOPS
- "iOS" → MOBILE
- "Android" → MOBILE
- "Build Tools" → DEVOPS
- "No-Code" → OTHER

Is this mapping correct, or would you prefer different assignments?

**Answer:** Map disciplines according to skills-list.md (the list is the source of truth for discipline naming)

**Follow-up 3:** I see some potential categorization questions:
- jQuery is listed under "API" - should this be FRONTEND instead?
- Supabase/Firebase are listed as "Cloud" but they're also databases - is CLOUD the right choice?
- Expo is listed separately but it's part of the React Native ecosystem - should it stay as MOBILE?

Should I use the disciplines exactly as shown in skills-list.md after mapping, or can I make judgment calls on better categorizations?

**Answer:** skills-list.md is the source of truth for all categorizations

**Follow-up 4:** For the idempotent seeding logic, should the seed script:
- **Option A:** Use `upsert` to update discipline mappings if a skill name already exists (allows you to change disciplines by re-running seed)
- **Option B:** Use `createMany` with `skipDuplicates: true` (only inserts new skills, ignores existing ones)
- **Option C:** Check if ANY skills exist, and if so, skip seeding entirely (one-time seed only)

**Answer:** Option A - Use upsert to update discipline mappings if a skill name already exists (allows changing disciplines by re-running seed)

**Follow-up 5:** Should the seed script output any logging/confirmation messages (e.g., "Seeded 138 skills successfully") or run silently?

**Answer:** With confirmation messages (not silent)

## Visual Assets

### Files Provided:
- `skills-list.md`: Complete list of 138 skills with their discipline mappings in markdown table format

### Visual Insights:
- **Total Skills:** 138 skills organized in a two-column table (Skill | Discipline)
- **Discipline Coverage:** The list includes diverse discipline categories: Frontend, Styling, Languages, Backend, Database, Cloud, DevOps, Tools, Design, API, Testing, Performance, Security, Mobile, iOS, Android, Build Tools, No-Code, and Other
- **Fidelity Level:** Source data file (structured data, not visual mockup)
- **Discipline Mapping Required:** The discipline names in skills-list.md don't directly match the Prisma Discipline enum values and will need to be mapped during seeding

### Discipline Mapping Analysis:
Based on skills-list.md, the following discipline mappings are required:

| skills-list.md Discipline | Prisma Discipline Enum | Count |
|---------------------------|------------------------|-------|
| Frontend | FRONTEND | 8 |
| Styling | (needs mapping) | 6 |
| Languages | LANGUAGES | 18 |
| Backend | BACKEND | 12 |
| Database | DATABASE | 10 |
| Cloud | CLOUD | 14 |
| DevOps | DEVOPS | 10 |
| Tools | (needs mapping) | 4 |
| Design | DESIGN | 5 |
| API | (needs mapping) | 6 |
| Testing | TESTING | 9 |
| Performance | (needs mapping) | 2 |
| Security | (needs mapping) | 2 |
| Mobile | MOBILE | 6 |
| iOS | (needs mapping) | 2 |
| Android | (needs mapping) | 3 |
| Build Tools | (needs mapping) | 6 |
| No-Code | (needs mapping) | 4 |
| Other | OTHER | 11 |

**Required Enum Updates:**
The Prisma Discipline enum must be updated to include all discipline categories from skills-list.md:
- Add: STYLING
- Add: TOOLS
- Add: API
- Add: PERFORMANCE
- Add: SECURITY
- Add: IOS
- Add: ANDROID
- Add: BUILD_TOOLS
- Add: NO_CODE

## Requirements Summary

### Functional Requirements
- Seed database with **138 skills** (not 50 as originally planned in roadmap)
- Each skill must have:
  - Unique name (as specified in skills-list.md)
  - Discipline mapping (as specified in skills-list.md)
  - `isActive: true` by default
  - Auto-generated UUID, createdAt, updatedAt timestamps
- Implement as Prisma seed script at `apps/api/prisma/seed.ts`
- Execute via `pnpm prisma db seed` command
- Use **upsert** logic to allow re-running the seed script to update discipline mappings
- Output confirmation messages during seeding (not silent execution)

### Data Source
- **Source of Truth:** `skills-list.md` file provided in planning/visuals/ folder
- Contains 138 rows of skills with exact skill names and discipline mappings
- No filtering or curation needed - seed all 138 skills exactly as listed
- No judgment calls on categorization - use disciplines exactly as shown in the list

### Reusability Opportunities
No existing seeding scripts or similar patterns identified in the codebase to reference.

### Scope Boundaries

**In Scope:**
- Create Prisma seed script (`apps/api/prisma/seed.ts`)
- Update Prisma schema to add missing Discipline enum values (STYLING, TOOLS, API, PERFORMANCE, SECURITY, IOS, ANDROID, BUILD_TOOLS, NO_CODE)
- Generate and apply migration for Discipline enum updates
- Seed all 138 skills from skills-list.md with exact name and discipline mappings
- Implement upsert logic for idempotent seeding
- Add logging/confirmation messages
- Configure package.json to support `pnpm prisma db seed` command
- Set all skills to `isActive: true`

**Out of Scope:**
- Manual skill entry UI (covered in future roadmap item #13-14)
- Skill validation logic
- Updating or managing existing EmployeeSkill records
- Seeding employee profiles, projects, or other related data (covered in roadmap item #3)
- Mission Board integration
- Admin interface for managing taxonomy
- Filtering or reducing the 138 skills to a smaller subset

### Technical Considerations

**Database Schema Changes:**
- Must update the Prisma Discipline enum to include 9 additional values:
  ```prisma
  enum Discipline {
    FRONTEND
    BACKEND
    LANGUAGES
    DEVOPS
    DATABASE
    DESIGN
    MOBILE
    TESTING
    CLOUD
    OTHER
    STYLING        // new
    TOOLS          // new
    API            // new
    PERFORMANCE    // new
    SECURITY       // new
    IOS            // new
    ANDROID        // new
    BUILD_TOOLS    // new
    NO_CODE        // new
  }
  ```
- This enum change will require a database migration
- The Skill model already has the correct structure (id, name, discipline, isActive, createdAt, updatedAt)

**Seeding Implementation:**
- Use Prisma Client's `upsert` method to handle idempotency
- Match on unique `name` field for upsert logic
- Script should work whether database is empty or already contains skills
- Must handle case-sensitive skill names correctly (e.g., "Next.js" vs "next.js")

**Script Configuration:**
- Add `prisma.seed` configuration to `apps/api/package.json`:
  ```json
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
  ```
- Ensure ts-node is available as a dev dependency

**Logging Requirements:**
- Output start message (e.g., "Starting skills taxonomy seeding...")
- Output progress or completion count (e.g., "Seeded 138 skills successfully")
- Handle and log any errors gracefully
- Indicate whether skills were created or updated during upsert

**Data Integrity:**
- Preserve existing skill IDs if skill already exists (upsert behavior)
- Update discipline if changed in skills-list.md
- Don't modify isActive flag for existing skills during re-seeding
- All new skills default to `isActive: true`

**Tech Stack Alignment:**
- Implementation uses: NestJS, Prisma, PostgreSQL, TypeScript
- Follows existing Prisma schema conventions
- Runs as part of standard Prisma CLI workflow
