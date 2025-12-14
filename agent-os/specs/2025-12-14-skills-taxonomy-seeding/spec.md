# Specification: Skills Taxonomy Seeding

## Goal
Create an idempotent Prisma seed script that populates the database with 138 predefined technical skills, organized by discipline, enabling development and testing without Mission Board integration.

## User Stories
- As a developer, I want the database to be seeded with a comprehensive taxonomy of skills so that I can test features without external dependencies
- As a system administrator, I want to run the seed script multiple times safely so that I can update skill categorizations without data corruption

## Specific Requirements

**Discipline Enum Expansion**
- Add 9 new enum values to the Discipline enum in schema.prisma: STYLING, TOOLS, API, PERFORMANCE, SECURITY, IOS, ANDROID, BUILD_TOOLS, NO_CODE
- Maintain existing enum values: FRONTEND, BACKEND, LANGUAGES, DEVOPS, DATABASE, DESIGN, MOBILE, TESTING, CLOUD, OTHER
- Generate and apply a Prisma migration for the enum update
- The expanded enum accommodates all 19 unique discipline categories from skills-list.md

**Prisma Seed Script Implementation**
- Create seed.ts file at apps/api/prisma/seed.ts
- Import PrismaClient from @prisma/client
- Instantiate PrismaClient with proper error handling and connection management
- Use TypeScript with proper type safety for all operations
- Implement main async function that orchestrates seeding logic
- Execute prismaClient.$disconnect() in finally block for cleanup

**Idempotent Upsert Strategy**
- Use prisma.skill.upsert() for each skill to ensure idempotency
- Match on unique name field (where: { name: skillName })
- On create: set name, discipline, and isActive: true
- On update: update discipline field to allow recategorization on re-runs
- Never modify isActive flag for existing skills during upsert
- Preserve existing skill UUIDs and timestamps when updating

**Skill Data Seeding from skills-list.md**
- Seed all 138 skills exactly as listed in planning/visuals/skills-list.md
- Map each skill name to its corresponding discipline from the source list
- Use exact skill names including casing, special characters, and spacing (e.g., "Next.js", "Sass/SCSS", "C++", "C#")
- Group skills in the seed script by discipline for code maintainability
- Frontend skills (8): React, Next.js, Vue.js, Angular, Svelte, Nuxt.js, Electron, Blazor
- Styling skills (6): HTML, Tailwind CSS, CSS, Sass/SCSS, Styled Components, Bootstrap
- Languages skills (18): TypeScript, JavaScript, Python, Java, C#, C++, C, Go, Rust, PHP, Ruby, Objective-C, Swift, Kotlin, Dart, Scala, Elixir, Erlang
- Backend skills (12): Node.js, Express.js, Nest.js, Django, Flask, FastAPI, Spring Boot, .NET, Laravel, Ruby on Rails, Gin, Fiber
- Database skills (10): PostgreSQL, MySQL, MongoDB, Redis, SQLite, Cassandra, DynamoDB, Neo4j, InfluxDB, Elasticsearch

**Cloud and DevOps Skills**
- Cloud skills (14): AWS, Google Cloud, Microsoft Azure, Vercel, Netlify, Heroku, DigitalOcean, Linode, Railway, Render, Supabase, Firebase, PlanetScale, Cloudflare
- DevOps skills (10): Docker, Kubernetes, Terraform, Ansible, Jenkins, GitHub Actions, GitLab CI, CircleCI, Nginx, Apache
- Tools skills (4): Git, GitHub, GitLab, Bitbucket
- Build Tools skills (6): Webpack, Vite, Rollup, Parcel, Turborepo, Lerna

**Design, API, and Testing Skills**
- Design skills (5): Figma, Adobe XD, Sketch, Photoshop, Illustrator
- API skills (6): GraphQL, REST API, Apollo, Relay, tRPC, jQuery
- Testing skills (9): Jest, Cypress, Playwright, Testing Library, Manual QA, Vitest, Selenium, JUnit, Espresso
- Performance skills (2): JMeter, K6
- Security skills (2): SonarQube, Snyk

**Mobile and Platform-Specific Skills**
- Mobile skills (6): React Native, Android, iOS, Flutter, Ionic, Expo
- iOS skills (2): SwiftUI, UIKit
- Android skills (3): Jetpack Compose, XML Layouts, Gradle
- No-Code skills (4): Webflow, Framer, Power Apps, Workfront Fusion
- Other skills (11): Machine Learning, Shopify, WebAssembly, Socket.io, Stripe, Storybook, UiPath, Unity, Roku (total of 11 from source)

**Package.json Seed Configuration**
- Add prisma.seed configuration to apps/api/package.json pointing to seed script
- Configure seed command to use ts-node for TypeScript execution
- Verify ts-node is available as devDependency (already present in package.json)
- Enable execution via standard Prisma command: pnpm prisma db seed

**Confirmation Logging**
- Output "Starting skills taxonomy seeding..." message at script start
- Log each upsert operation with skill name and whether it was created or updated
- Output final summary: "Successfully seeded X skills (Y created, Z updated)"
- Log any errors with clear error messages and stack traces
- Use console.log for standard output and console.error for errors

## Visual Design

**`planning/visuals/skills-list.md`**
- Two-column markdown table with Skill and Discipline columns
- Contains complete source data for all 138 skills to be seeded
- Skills are organized sequentially covering all 19 discipline categories
- Each row provides exact skill name and discipline mapping
- Source of truth for skill names (preserve exact casing and formatting)
- Source of truth for discipline assignments (no judgment calls allowed)
- Table format requires parsing to extract skill-discipline pairs
- All 138 rows must be implemented in seed script without filtering

## Existing Code to Leverage

**Prisma Schema (apps/api/prisma/schema.prisma)**
- Skill model already defined with correct structure: id (UUID), name (unique String), discipline (Discipline enum), isActive (Boolean), createdAt, updatedAt
- Unique constraint on name field enables upsert matching strategy
- Discipline enum exists but needs 9 additional values added
- Database URL configured via DATABASE_URL environment variable
- PostgreSQL provider already configured

**TypeScript and NestJS Configuration**
- ts-node already available as devDependency in apps/api/package.json (version 10.9.2)
- TypeScript configuration at apps/api/tsconfig.json supports ES2023 target with nodenext modules
- @prisma/client available as devDependency (version 5.22.0)
- Module resolution configured for modern Node.js with ESM interop

**Prisma Migrations Directory**
- apps/api/prisma/migrations/ directory exists for storing schema migrations
- Use prisma migrate dev --name add-discipline-enum-values to generate enum migration
- Migration system already initialized and functional

## Out of Scope
- Manual skill entry UI or admin interface
- Skill validation logic beyond database constraints
- Seeding or modifying EmployeeSkill records
- Seeding Profile, Project, Assignment, or other related models
- Mission Board API integration
- Skill deactivation or soft-delete functionality during seeding
- Filtering the 138 skills to a smaller subset
- Custom discipline categorizations beyond skills-list.md mappings
- Internationalization or localization of skill names
- Skill descriptions, metadata, or additional attributes beyond schema fields
