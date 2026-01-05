# Product Roadmap

## Implementation Constraints

- **Iterative Sprints**: Each sprint must deliver functional improvements on **both** frontend (`/apps/web`) and backend (`/apps/api`).
- **Mission Board Integration**: Deferred to last - not yet possible. Use fake data seeding in interim.
- **Email Domain**: All emails must be from `ravn.com` domain.
- **Skill Seeding**: Initialize DB with top 50 tech skills with default disciplines (e.g., React → Frontend, Node.js → Backend, JavaScript/TypeScript → Languages).
- **Testing**: Skip testing for now - focus on core functionality first.

---

1. [x] Database Schema & Migrations — Set up Prisma with PostgreSQL, create all models (Profile, Skill, EmployeeSkill, Suggestion, Project, Assignment, SeniorityHistory), and run initial migrations `M`

2. [x] Skills Taxonomy Seeding — Seed the database with top 50 tech skills including discipline mappings (e.g., React/Frontend, Node.js/Backend, TypeScript/Languages) `S`

3. [x] Sample Data Seeding — Create fake data for Profiles, Projects, Assignments, and Suggestions to enable development without Mission Board integration `S`

4. [x] Authentication Foundation — Implement JWT-based authentication with login endpoint and auth guards for protected routes `M`

5. [x] Employee Profile API — Build GraphQL queries to fetch profile data including validated skills (tiered), seniority timeline, and current assignments `M`

6. [x] Employee Profile UI — Create profile dashboard displaying employee header, seniority timeline visualization, and tiered skills display (Core Stack, Validated Inventory, Pending) `M`

7. [ ] Self-Report Skills API — Implement mutation for employees to submit new skill suggestions with proficiency level, creating pending validation requests `S`

8. [ ] Self-Report Skills UI — Build skill suggestion form with taxonomy autocomplete, proficiency selector, and submission confirmation `S`

9. [x] Validation Inbox API — Create GraphQL queries returning hierarchical inbox data (projects -> members -> suggestions) filtered by logged-in Tech Lead `M`

10. [x] Validation Inbox UI — Build master-detail interface with project-grouped sidebar, person review cards, and navigation between team members `L`

11. [x] Skill Resolution API — Implement mutation for batch processing validation decisions (Approve, Adjust Level, Reject) with proper database updates `M`

12. [x] Skill Resolution UI — Add action buttons and proficiency adjustment controls to review cards with optimistic updates and success feedback `S`

13. [x] Admin Skills Management API — Build CRUD endpoints for managing the canonical skills taxonomy (add, edit, disable skills) `S`

14. [x] Admin Skills Management UI — Create admin interface for viewing, adding, and editing skills in the taxonomy with discipline assignment `S`

15. [ ] Admin Seniority Management — Implement API and UI for admins to view and manually correct employee seniority history records `M`

16. [ ] Stale Skill Flagging — Add background job or query logic to identify skills not validated in 12+ months and create re-validation suggestions `S`

17. [ ] My Leaders Section — Add sidebar component to employee profile showing which Tech Leads can validate them based on current assignments `XS`

18. [ ] Mission Board Sync Endpoint — Implement POST /sync webhook endpoint to receive and upsert Projects, Assignments, and People data from Mission Board `M`

19. [ ] Mission Board Integration — Connect sync endpoint to actual Mission Board system, validate data flow, and handle edge cases `L`

> Notes
>
> - Order reflects technical dependencies and product architecture (database first, then APIs, then UIs)
> - Items 1-17 form the core product that can run with seeded data
> - Items 18-19 are the Mission Board integration phase, intentionally last per project constraints
> - Each item represents an end-to-end functional and testable feature
> - Frontend items assume Vite, Tanstack tools (Router, Form), Shadcn UI, Tailwind CSS, Zustand, and Apollo Client v4 are installed as prerequisites
