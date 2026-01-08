# Spec Requirements: Admin Profiles List

## Initial Description

Build API query and UI to display searchable/filterable list of all employees with navigation to individual profile management pages.

This is for the Ravn Skills Platform. The feature should allow admins to view, search, and filter all employee profiles, and navigate to individual profile management pages (like the seniority management page that already exists at /admin/profiles/:profileId/seniority).

## Requirements Discussion

### First Round Questions

**Q1:** I assume the list should display basic employee information like name, email, current seniority level, and current project(s). Is that correct, or are there other fields you'd like to see in the list view (e.g., number of validated skills, department, join date)?

**Answer:** The list should show employee information such as avatar, name, email, current seniority level, join date (is the startDate of his first SeniorityHistory), number of current assignments, core stack and remaining skills (Display them like: React, TypeScript, Node, +5).

**Q2:** For search functionality, I'm thinking a single search input that filters by employee name and email. Should we also include other searchable fields like skills or project names?

**Answer:** Single search input that filters by employee name and email - approved.

**Q3:** For filtering, I assume we should include filters for seniority level (Junior, Mid, Senior, etc.) and possibly role/discipline. Are there other filters you'd like (e.g., by project, by skill, by validation status)?

**Answer:** Filters for:
- Seniority level (OR operation)
- Skills (AND operation)
- Years in the company based on the join date (OR operation, e.g.: less than 1 year, 1-2 years, 2-3 years, 3-5 years, 5+ years)

**Q4:** I'm assuming the table should be paginated (showing 25-50 employees per page) with sorting capabilities on key columns like name, seniority, and email. Is that correct, or would you prefer infinite scroll or a different approach?

**Answer:** Paginated table showing 25-50 employees per page with sorting capabilities on key columns - approved.

**Q5:** For navigation to individual profile management, I assume clicking on a row or a specific action button should take admins to a profile detail page where they can access seniority management and potentially other admin functions. Should this be a new admin profile overview page, or direct navigation to the existing seniority management page?

**Answer:** A new admin profile overview page where Profile component will be rendered.

**Q6:** I'm thinking this page should be at `/admin/profiles` and accessible only to users with the ADMIN role. Is that the correct route and access level?

**Answer:** /admin/profiles, accessible only to ADMIN role - approved.

**Q7:** Should the list show all employees (including admins and tech leads), or only employees with the EMPLOYEE role?

**Answer:** All users except admins.

**Q8:** Are there any features you explicitly DON'T want in this first version? For example: bulk actions, export to CSV, advanced multi-field filtering, employee status indicators (active/inactive)?

**Answer:** Not explicitly mentioned in first round.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Admin Skills Management - Path: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/`
  - Components: skills-table.tsx, skills-filters.tsx, skills-sorting.tsx
  - Hooks: use-skills.ts
  - GraphQL: get-all-skills.query.generated.tsx

- Feature: Validation Inbox - Path: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/validation-inbox/`
  - Components: validation-inbox.tsx
  - Hooks: use-validation-inbox.ts
  - GraphQL: get-validation-inbox.query.generated.tsx

- Feature: Employee Profile Component - Path: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/profile/`
  - Main component: profile.tsx (to be reused in admin profile overview page)
  - Subcomponents: profile-header.tsx
  - Hooks: use-profile.ts
  - GraphQL: get-profile.query.generated.tsx

- Feature: Admin Seniority Management - Path: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/routes/_authenticated/admin/profiles.$profileId.seniority.tsx`
  - Existing route pattern for admin profile management

### Follow-up Questions

**Follow-up 1:** Avatar/Profile Image - You mentioned displaying employee avatars in the list. Does the Profile model currently have an avatar/photo field, or should we display initials-based avatars (using the employee's name to generate colored circle with initials)?

**Answer:** The profile has avatarUrl field. If it's empty, display initials-based avatar.

**Follow-up 2:** Core Stack Definition - For the skills display (e.g., "React, TypeScript, Node, +5"), how do we determine which skills are "core stack" vs "remaining skills"? Should we show skills from their current project assignments as core stack, show the most recently validated skills, or use a specific tier/category from the EmployeeSkill model?

**Answer:** Skills from their current project assignments are considered core stack.

**Follow-up 3:** Skills Filter - AND Operation - When you mentioned skills filter uses AND operation, do you mean an employee must have ALL selected skills to appear in the results? (e.g., if I filter by "React" AND "TypeScript", only show employees who have both)

**Answer:** That's correct - an employee must have ALL selected skills to appear in the results.

**Follow-up 4:** Table Features from Visual - The shadcn-table-example.png shows row checkboxes for bulk selection. Should we include row selection checkboxes? If yes, what bulk actions would you want (or is this out of scope for v1)?

**Answer:** Do NOT include row selection checkboxes.

**Follow-up 5:** Out of Scope Confirmation - To ensure we're aligned, are these explicitly OUT of scope for this first version: bulk actions on selected employees, export to CSV, employee status indicators (active/inactive), inline editing of employee data?

**Answer:** Confirmed out of scope for v1:
- Bulk actions on selected employees
- Export to CSV
- Employee status indicators (active/inactive)
- Inline editing of employee data

## Visual Assets

### Files Provided:
- `shadcn-table-example.png`: Shadcn UI table reference design showing dark theme table layout with filtering, sorting, and pagination

### Visual Insights:
- **Table Layout**: Clean, modern table with clear column headers and row separation
- **Filter Pattern**: Top-aligned filter input field for search, with dropdown filters for categorical data (Status, Priority in example)
- **Sorting**: Column headers with sort indicators (arrows) for sortable columns
- **Pagination**: Bottom-aligned pagination controls with:
  - Rows per page selector (dropdown)
  - Page count display (e.g., "Page 1 of 10")
  - Previous/Next navigation buttons
  - Row selection count display (note: we're NOT implementing row selection)
- **Action Menu**: Three-dot menu on each row for row-specific actions
- **Visual Hierarchy**: Good use of spacing, borders, and typography to create scannable data table
- **Fidelity Level**: High-fidelity design reference (production-quality Shadcn UI example)

## Requirements Summary

### Functional Requirements

**Data Display:**
- Display list of all users EXCEPT those with ADMIN role
- Show the following columns for each employee:
  - Avatar (from avatarUrl field, or initials-based fallback)
  - Name
  - Email
  - Current seniority level
  - Join date (calculated as startDate of first SeniorityHistory record)
  - Number of current assignments
  - Skills display (format: "React, TypeScript, Node, +5")
    - Show core stack skills first (skills from current project assignments)
    - Show count of remaining skills as "+N"

**Search Functionality:**
- Single search input field
- Filters by employee name (case-insensitive)
- Filters by employee email (case-insensitive)
- Real-time filtering as user types

**Filter Functionality:**
- Seniority Level filter (OR operation):
  - Multi-select dropdown
  - Shows employees matching ANY selected seniority level

- Skills filter (AND operation):
  - Multi-select dropdown with autocomplete
  - Shows employees who have ALL selected skills

- Years in Company filter (OR operation):
  - Multi-select dropdown or radio group
  - Options: Less than 1 year, 1-2 years, 2-3 years, 3-5 years, 5+ years
  - Calculated based on join date (startDate of first SeniorityHistory)
  - Shows employees matching ANY selected year range

**Sorting:**
- Sortable columns: Name, Email, Seniority, Join Date
- Click column header to toggle ascending/descending sort
- Visual indicator showing current sort column and direction

**Pagination:**
- Configurable rows per page (options: 25, 50, 100)
- Page navigation controls (Previous, Next, page numbers)
- Display total count and current page (e.g., "Page 1 of 10")
- Display total rows (e.g., "245 employees")

**Navigation:**
- Clicking on an employee row navigates to new admin profile overview page
- Route pattern: `/admin/profiles/:profileId`
- Admin profile overview page will render the existing Profile component
- Integration with existing admin routes (e.g., seniority management at `/admin/profiles/:profileId/seniority`)

**Access Control:**
- Page accessible only to users with ADMIN role
- Route: `/admin/profiles`
- Unauthorized users should be redirected or shown access denied

### Reusability Opportunities

**Frontend Components to Reference:**
- Admin Skills Management module pattern (`apps/web/src/modules/admin-skills/`)
  - Table component structure (skills-table.tsx)
  - Filter components pattern (skills-filters.tsx)
  - Sorting logic pattern (skills-sorting.tsx)
  - Custom hooks pattern (use-skills.ts)

- Profile component for reuse (`apps/web/src/modules/profile/profile.tsx`)
  - Will be rendered in new admin profile overview page

- Existing route patterns:
  - Admin route structure (`/admin/profiles/:profileId/seniority`)
  - Authentication wrapper patterns

**Backend Patterns to Follow:**
- GraphQL query patterns similar to get-all-skills.query
- Profile data fetching patterns from existing profile queries
- Role-based access control patterns used in admin resolvers

**UI/UX Patterns:**
- Shadcn UI table component
- Filter and search patterns from admin skills page
- Pagination controls
- Dark theme consistency with existing admin pages

### Scope Boundaries

**In Scope:**
- API query to fetch all employee profiles with necessary fields
- GraphQL schema types for profile list data
- Frontend table component with avatar, name, email, seniority, join date, assignments count, skills display
- Search functionality (name and email)
- Filter functionality (seniority, skills, years in company)
- Column sorting (name, email, seniority, join date)
- Pagination controls (configurable rows per page, page navigation)
- Navigation to admin profile overview page
- New admin profile overview page with Profile component
- Role-based access control (ADMIN only)
- Avatar display with fallback to initials
- Core stack skills identification based on current assignments

**Out of Scope:**
- Bulk actions on selected employees
- Row selection checkboxes
- Export to CSV functionality
- Employee status indicators (active/inactive)
- Inline editing of employee data
- Advanced multi-field filtering beyond specified filters
- Department or team-based filtering
- Project-based filtering
- Validation status filtering
- Employee performance metrics
- Skills proficiency levels display in table
- Direct navigation to other admin functions from table rows (only profile overview)

### Technical Considerations

**Integration Points:**
- GraphQL API endpoint for fetching paginated, filtered, sorted employee list
- Existing Profile model and SeniorityHistory model
- Assignment model for current assignments count
- EmployeeSkill model for skills display and filtering
- Existing authentication and authorization system
- Existing Profile component reuse in new admin overview page

**Existing System Constraints:**
- Must use GraphQL with NestJS backend
- Must use React with TanStack Router for frontend routing
- Must use Apollo Client for GraphQL data fetching
- Must use Shadcn UI components for table, filters, pagination
- Must use Tailwind CSS for styling
- Must follow existing admin page patterns and layouts

**Technology Stack:**
- Backend: NestJS, GraphQL, Prisma ORM, PostgreSQL
- Frontend: React 19, Vite, TanStack Router, Apollo Client v4
- UI: Shadcn UI (Radix UI + Tailwind), Lucide React icons
- Validation: Zod (for filter/search inputs if needed)

**Similar Code Patterns to Follow:**
- Query structure similar to admin skills GraphQL queries
- Component architecture similar to admin-skills module
- Hook patterns for data fetching and state management
- Filter and search state management patterns
- Pagination logic patterns
- Route guard patterns for ADMIN-only access
