# Task Breakdown: Skills Taxonomy Seeding

## Overview
Total Tasks: 18 core tasks across 3 major groups
Feature: Implement idempotent Prisma seed script to populate database with 138 predefined technical skills organized by discipline

## Task List

### Database Schema Updates

#### Task Group 1: Discipline Enum Expansion and Migration
**Dependencies:** None

- [ ] 1.0 Complete database schema updates for discipline taxonomy
  - [ ] 1.1 Update Prisma schema to expand Discipline enum
    - Open: /Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/prisma/schema.prisma
    - Locate the existing Discipline enum definition
    - Add 9 new enum values: STYLING, TOOLS, API, PERFORMANCE, SECURITY, IOS, ANDROID, BUILD_TOOLS, NO_CODE
    - Maintain existing values: FRONTEND, BACKEND, LANGUAGES, DEVOPS, DATABASE, DESIGN, MOBILE, TESTING, CLOUD, OTHER
    - Verify enum now contains all 19 discipline categories from skills-list.md
    - Save changes to schema.prisma
  - [ ] 1.2 Generate Prisma migration for enum expansion
    - Run command: pnpm --filter @skills-platform/api prisma migrate dev --name add-discipline-enum-values
    - Verify migration file is created in apps/api/prisma/migrations/
    - Review migration SQL to ensure it properly adds new enum values
    - Confirm migration doesn't drop or alter existing enum values
  - [ ] 1.3 Apply migration to database
    - Ensure DATABASE_URL environment variable is configured
    - Execute the migration (should happen automatically with migrate dev)
    - Verify all 19 discipline enum values exist in PostgreSQL database
    - Confirm existing Skill records (if any) are not affected

**Acceptance Criteria:**
- Discipline enum in schema.prisma contains all 19 values
- Migration file successfully generated with proper SQL
- Database schema updated with new enum values
- No data loss or corruption of existing records

### Seed Script Implementation

#### Task Group 2: Prisma Seed Script with Upsert Logic
**Dependencies:** Task Group 1

- [ ] 2.0 Complete seed script implementation
  - [ ] 2.1 Create seed script file structure and boilerplate
    - Create new file: /Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/prisma/seed.ts
    - Import PrismaClient from @prisma/client
    - Instantiate PrismaClient with proper configuration
    - Set up main async function to orchestrate seeding
    - Add try-catch-finally error handling structure
    - Implement prismaClient.$disconnect() in finally block for cleanup
    - Use TypeScript with strict type safety
  - [ ] 2.2 Implement logging infrastructure
    - Add script start message: "Starting skills taxonomy seeding..."
    - Create counter variables for tracking created vs updated skills
    - Implement per-skill logging with skill name and operation type (created/updated)
    - Add final summary log: "Successfully seeded X skills (Y created, Z updated)"
    - Add error logging with console.error for caught exceptions
    - Include stack traces in error messages
  - [ ] 2.3 Implement idempotent upsert logic for Frontend skills (8 skills)
    - Use prisma.skill.upsert() for each skill
    - Match on unique name field: where: { name: skillName }
    - On create: set name, discipline (FRONTEND), isActive: true
    - On update: update discipline field only (preserve isActive, id, timestamps)
    - Skills: React, Next.js, Vue.js, Angular, Svelte, Nuxt.js, Electron, Blazor
    - Group skills in code with comment: // Frontend Skills
  - [ ] 2.4 Implement upsert logic for Styling skills (6 skills)
    - Follow same upsert pattern as 2.3
    - Set discipline: STYLING
    - Skills: HTML, Tailwind CSS, CSS, Sass/SCSS, Styled Components, Bootstrap
    - Preserve exact naming including special characters (e.g., "Sass/SCSS")
    - Group with comment: // Styling Skills
  - [ ] 2.5 Implement upsert logic for Languages skills (18 skills)
    - Follow same upsert pattern as 2.3
    - Set discipline: LANGUAGES
    - Skills: TypeScript, JavaScript, Python, Java, C#, C++, C, Go, Rust, PHP, Ruby, Objective-C, Swift, Kotlin, Dart, Scala, Elixir, Erlang
    - Preserve exact naming including special characters (e.g., "C#", "C++")
    - Group with comment: // Language Skills
  - [ ] 2.6 Implement upsert logic for Backend skills (12 skills)
    - Follow same upsert pattern as 2.3
    - Set discipline: BACKEND
    - Skills: Node.js, Express.js, Nest.js, Django, Flask, FastAPI, Spring Boot, .NET, Laravel, Ruby on Rails, Gin, Fiber
    - Preserve exact naming including dots and casing (e.g., "Next.js", ".NET")
    - Group with comment: // Backend Skills
  - [ ] 2.7 Implement upsert logic for Database skills (10 skills)
    - Follow same upsert pattern as 2.3
    - Set discipline: DATABASE
    - Skills: PostgreSQL, MySQL, MongoDB, Redis, SQLite, Cassandra, DynamoDB, Neo4j, InfluxDB, Elasticsearch
    - Group with comment: // Database Skills
  - [ ] 2.8 Implement upsert logic for Cloud skills (14 skills)
    - Follow same upsert pattern as 2.3
    - Set discipline: CLOUD
    - Skills: AWS, Google Cloud, Microsoft Azure, Vercel, Netlify, Heroku, DigitalOcean, Linode, Railway, Render, Supabase, Firebase, PlanetScale, Cloudflare
    - Group with comment: // Cloud Skills
  - [ ] 2.9 Implement upsert logic for DevOps skills (10 skills)
    - Follow same upsert pattern as 2.3
    - Set discipline: DEVOPS
    - Skills: Docker, Kubernetes, Terraform, Ansible, Jenkins, GitHub Actions, GitLab CI, CircleCI, Nginx, Apache
    - Group with comment: // DevOps Skills
  - [ ] 2.10 Implement upsert logic for Tools skills (4 skills)
    - Follow same upsert pattern as 2.3
    - Set discipline: TOOLS
    - Skills: Git, GitHub, GitLab, Bitbucket
    - Group with comment: // Tools Skills
  - [ ] 2.11 Implement upsert logic for Design skills (5 skills)
    - Follow same upsert pattern as 2.3
    - Set discipline: DESIGN
    - Skills: Figma, Adobe XD, Sketch, Photoshop, Illustrator
    - Group with comment: // Design Skills
  - [ ] 2.12 Implement upsert logic for API skills (6 skills)
    - Follow same upsert pattern as 2.3
    - Set discipline: API
    - Skills: GraphQL, REST API, Apollo, Relay, tRPC, jQuery
    - Note: jQuery categorized as API per skills-list.md source of truth
    - Group with comment: // API Skills
  - [ ] 2.13 Implement upsert logic for Testing, Performance, and Security skills (13 skills)
    - Follow same upsert pattern as 2.3
    - Testing (TESTING): Jest, Cypress, Playwright, Testing Library, Manual QA, Vitest, Selenium, JUnit, Espresso
    - Performance (PERFORMANCE): JMeter, K6
    - Security (SECURITY): SonarQube, Snyk
    - Group with comments: // Testing Skills, // Performance Skills, // Security Skills
  - [ ] 2.14 Implement upsert logic for Mobile platform skills (11 skills)
    - Follow same upsert pattern as 2.3
    - Mobile (MOBILE): React Native, Android, iOS, Flutter, Ionic, Expo
    - iOS (IOS): SwiftUI, UIKit
    - Android (ANDROID): Jetpack Compose, XML Layouts, Gradle
    - Note: "Android" and "iOS" appear both as MOBILE skills and separate discipline categories per skills-list.md
    - Group with comments: // Mobile Skills, // iOS Skills, // Android Skills
  - [ ] 2.15 Implement upsert logic for Build Tools and No-Code skills (10 skills)
    - Follow same upsert pattern as 2.3
    - Build Tools (BUILD_TOOLS): Webpack, Vite, Rollup, Parcel, Turborepo, Lerna
    - No-Code (NO_CODE): Webflow, Framer, Power Apps, Workfront Fusion
    - Group with comments: // Build Tools Skills, // No-Code Skills
  - [ ] 2.16 Implement upsert logic for Other skills (11 skills)
    - Follow same upsert pattern as 2.3
    - Set discipline: OTHER
    - Skills: Machine Learning, Shopify, WebAssembly, Socket.io, Stripe, Storybook, UiPath, Unity, Roku
    - Note: Only 9 skills listed above - verify skills-list.md shows 11 total in Other category
    - Add remaining 2 skills from source list
    - Group with comment: // Other Skills

**Acceptance Criteria:**
- Seed script creates/updates all 138 skills from skills-list.md
- Each skill has correct discipline mapping per source list
- Exact skill names preserved including special characters and casing
- Upsert logic handles both new and existing skills correctly
- isActive flag set to true for new skills, preserved for existing skills
- Script outputs clear logging with counts of created vs updated skills
- Error handling catches and logs failures with stack traces

### Configuration and Verification

#### Task Group 3: Package.json Configuration and Seed Execution
**Dependencies:** Task Group 2

- [ ] 3.0 Complete seed configuration and verification
  - [ ] 3.1 Configure package.json for Prisma seeding
    - Open: /Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/package.json
    - Add "prisma" configuration object if not already present
    - Add "seed" property: "seed": "ts-node prisma/seed.ts"
    - Verify ts-node is listed in devDependencies (should be version 10.9.2)
    - Save package.json changes
  - [ ] 3.2 Execute seed script and verify results
    - Run command: pnpm --filter @skills-platform/api prisma db seed
    - Monitor console output for "Starting skills taxonomy seeding..." message
    - Verify each skill is logged with created/updated status
    - Confirm final summary shows "Successfully seeded 138 skills"
    - Note the count of created vs updated skills
  - [ ] 3.3 Verify database state after seeding
    - Query database to count total Skill records (should be 138)
    - Verify all 19 discipline categories are represented
    - Spot-check sample skills for correct discipline mappings
    - Confirm all skills have isActive: true
    - Verify UUIDs, createdAt, and updatedAt timestamps are properly set
  - [ ] 3.4 Test idempotency by re-running seed script
    - Run seed command again: pnpm --filter @skills-platform/api prisma db seed
    - Verify no duplicate skills are created
    - Confirm summary shows "138 skills (0 created, 138 updated)" or similar
    - Verify existing skill UUIDs remain unchanged
    - Confirm timestamps are properly maintained (createdAt stays same, updatedAt updates)
  - [ ] 3.5 Test discipline mapping updates
    - Manually edit seed.ts to change one skill's discipline
    - Re-run seed script
    - Verify the discipline was updated in database
    - Verify count shows 1 updated skill
    - Revert the manual change to maintain data integrity

**Acceptance Criteria:**
- package.json properly configured with prisma.seed setting
- Seed command executes successfully via pnpm prisma db seed
- All 138 skills seeded with correct names and disciplines
- Idempotent behavior confirmed - re-running doesn't create duplicates
- Discipline updates work correctly when seed script is modified
- Logging provides clear visibility into seeding operations

## Execution Order

Recommended implementation sequence:
1. **Database Schema Updates** (Task Group 1) - Expand Discipline enum and generate migration
2. **Seed Script Implementation** (Task Group 2) - Build seed.ts with upsert logic for all 138 skills
3. **Configuration and Verification** (Task Group 3) - Configure package.json and verify seeding works correctly

## Implementation Notes

### Skill Name Preservation
- All skill names must match skills-list.md exactly
- Preserve special characters: "C++", "C#", "Sass/SCSS", "Socket.io"
- Preserve casing: "Next.js", "Node.js", "Express.js", ".NET"
- Preserve spaces: "Google Cloud", "GitHub Actions", "Ruby on Rails"

### Discipline Mapping Source of Truth
- skills-list.md is the authoritative source for all discipline mappings
- No judgment calls or remapping allowed - use disciplines exactly as listed
- Note that "Android" and "iOS" appear both as:
  - Skills under MOBILE discipline (Android, iOS)
  - Separate disciplines (ANDROID for "Jetpack Compose", IOS for "SwiftUI")

### Upsert Strategy Details
- Match on: `where: { name: skillName }`
- Create: `{ name, discipline, isActive: true }`
- Update: `{ discipline }` only - do not modify isActive for existing skills
- This allows discipline recategorization by modifying seed script and re-running

### Error Handling
- Wrap all database operations in try-catch
- Use finally block to ensure prismaClient.$disconnect() always executes
- Log errors with console.error including stack traces
- Consider individual skill failures vs complete script failure

### Testing Approach
- Manual verification via database queries
- Test idempotency by running seed multiple times
- Test update behavior by modifying disciplines and re-running
- Verify no duplicate skills created
- Confirm all 138 skills present with correct mappings

### Tech Stack Alignment
- TypeScript for type safety
- Prisma Client for database operations
- ts-node for TypeScript execution
- PostgreSQL enum type for disciplines
- NestJS ecosystem integration

## Dependencies and Blockers

### External Dependencies
- PostgreSQL database must be running and accessible
- DATABASE_URL environment variable must be configured
- Prisma CLI must be installed (via pnpm)
- ts-node must be available as devDependency

### Potential Blockers
- Existing Skill records with disciplines not in expanded enum (migration will fail)
- Database connection issues during seed execution
- TypeScript compilation errors in seed.ts
- Enum values not matching between schema and seed script

## Success Metrics

### Functional Metrics
- 138 skills successfully seeded in database
- All 19 discipline categories properly represented
- Zero duplicate skills after multiple seed runs
- Discipline updates apply correctly when seed script modified

### Technical Metrics
- Migration executes without errors
- Seed script runs in under 10 seconds
- Clear logging output for debugging
- No TypeScript compilation errors
- Proper error handling and cleanup

### Quality Metrics
- All skill names match skills-list.md exactly
- All discipline mappings match skills-list.md exactly
- Idempotency verified through repeated execution
- Database integrity maintained (no orphaned records)
