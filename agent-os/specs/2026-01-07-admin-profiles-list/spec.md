# Specification: Admin Profiles List

## Goal
Build a searchable, filterable, paginated list of all employee profiles with navigation to individual admin profile management pages, enabling admins to efficiently browse and manage employee data.

## User Stories
- As an admin, I want to view a list of all employees with key information so that I can quickly assess the team's composition and access individual profiles
- As an admin, I want to search and filter employees by name, email, seniority, skills, and tenure so that I can find specific employees or groups matching certain criteria

## Specific Requirements

**GraphQL Query - Get All Profiles for Admin**
- Create `getAllProfilesForAdmin` query that returns paginated list of profiles excluding ADMIN role users
- Support pagination with `page` and `pageSize` parameters (pageSize options: 25, 50, 100)
- Support search parameter filtering by name and email (case-insensitive)
- Support filter parameters: seniority levels (OR operation), skills (AND operation), years in company ranges (OR operation)
- Support sorting by name, email, seniority, and join date (ascending/descending)
- Return total count of profiles matching filters for pagination display
- Join date calculated as `startDate` of first `SeniorityHistory` record (ordered by startDate ASC)
- Core stack skills identified by matching skill names with assignment tags from current assignments
- Return employee data: id, name, email, avatarUrl, currentSeniorityLevel, joinDate, currentAssignmentsCount, coreStackSkills (first 3-4), remainingSkillsCount

**GraphQL Types and DTOs**
- Create `GetAllProfilesForAdminInput` with fields: page, pageSize, searchTerm, seniorityLevels array, skillIds array, yearsInCompanyRanges array, sortBy, sortDirection
- Create `ProfileListItemResponse` type with fields matching return data above
- Create `PaginatedProfilesResponse` with profiles array, totalCount, currentPage, pageSize, totalPages
- Create `YearsInCompanyRange` enum: LESS_THAN_1, ONE_TO_TWO, TWO_TO_THREE, THREE_TO_FIVE, FIVE_PLUS
- Create `ProfileSortField` enum: NAME, EMAIL, SENIORITY, JOIN_DATE

**Backend Service Logic**
- In ProfileService, create `getAllProfilesForAdmin` method with authorization check (ADMIN role only)
- Build Prisma query with where clause excluding type ADMIN
- Apply search filter using OR condition on name and email with case-insensitive contains
- Apply seniority filter using OR condition if seniorityLevels provided
- For skills filter (AND operation), join EmployeeSkill and filter profiles having ALL selected skillIds
- For years in company filter, calculate date ranges from current date and apply OR condition on first SeniorityHistory startDate
- Apply sorting based on sortBy and sortDirection parameters
- Use Prisma skip and take for pagination
- Fetch core stack skills by joining current Assignments and matching Assignment tags with Skill names
- Return formatted response with pagination metadata

**Admin Profiles Module - Frontend Structure**
- Create `/apps/web/src/modules/admin-profiles/` directory following admin-skills module pattern
- Create `admin-profiles.tsx` main component managing state for search, filters, sorting, and pagination
- Create `components/profiles-table.tsx` for table display with Avatar, name, email, seniority badge, join date, assignments count, skills display
- Create `components/profiles-filters.tsx` for search input and filter dropdowns (seniority, skills, years in company)
- Create `components/profiles-sorting.tsx` for sort dropdown selector
- Create `hooks/use-profiles.ts` Apollo query hook for getAllProfilesForAdmin
- Create `graphql/get-all-profiles-for-admin.query.graphql` file

**Profiles Table Component**
- Use Shadcn Table component with columns: Avatar + Name, Email, Seniority, Join Date, Assignments, Skills, Actions
- Avatar column displays avatarUrl if present, otherwise initials-based avatar using `getStringInitials` utility
- Name displayed alongside avatar, row clickable to navigate to profile detail
- Seniority displayed as Badge component with SeniorityLevelMap for display text
- Join date formatted as readable date string (e.g., "Jan 15, 2023")
- Assignments count displayed as number (e.g., "2")
- Skills display format: "React, TypeScript, Node, +5" (show first 3 core stack skills, then +N for remaining)
- Include loading state with Spinner component
- Include empty state when no profiles match filters
- Responsive design hiding less critical columns on mobile (assignments, join date)

**Filters Component**
- Search input filtering by name and email with debounced input handler
- Seniority Level multi-select DropdownMenu with checkboxes for each SeniorityLevel
- Skills multi-select DropdownMenu with checkboxes, fetching active skills list for options
- Years in Company multi-select DropdownMenu with predefined range options
- Clear filters button appearing when any filters active
- Display active filter count badges on dropdown buttons
- Filters applied immediately on change, resetting pagination to page 1

**Pagination Controls**
- Bottom-aligned pagination UI following shadcn-table-example.png pattern
- Rows per page selector dropdown (25, 50, 100 options)
- Page count display (e.g., "Page 1 of 10")
- Total rows display (e.g., "245 employees")
- Previous/Next navigation buttons using Pagination components
- Disable Previous on first page, disable Next on last page
- Update URL query params for pagination state (page, pageSize) for shareable links

**Admin Profiles List Route**
- Create route file `/apps/web/src/routes/_authenticated/admin/profiles.index.tsx`
- Use TanStack Router createFileRoute with beforeLoad guard checking ProfileType.ADMIN
- Redirect non-admin users to /profile route
- Render AdminProfiles component

**Admin Profile Overview Route**
- Create route file `/apps/web/src/routes/_authenticated/admin/profiles.$profileId.index.tsx`
- Use TanStack Router with ADMIN role guard
- Render existing Profile component passing profileId param
- Integrate with existing admin profile subroutes (e.g., seniority at `/admin/profiles/:profileId/seniority`)
- Add navigation links or tabs to access admin-specific profile management features

**Authorization and Error Handling**
- Backend resolver checks user type is ADMIN before executing query, throws ForbiddenException otherwise
- Frontend route guards redirect unauthorized users
- Display error states for failed queries with user-friendly messages
- Handle edge cases: no employees found, network errors, invalid filter combinations

## Visual Design

**`planning/visuals/shadcn-table-example.png`**
- Use dark theme table layout with clean row separation and column headers
- Implement filter controls at top of table (search input left-aligned, filter dropdowns right-aligned)
- Add column header sort indicators (arrows) for sortable columns
- Include pagination controls at bottom with rows per page dropdown, page info, and prev/next buttons
- Maintain visual hierarchy with proper spacing, borders, and typography for data scannability
- Action menu (three-dot icon) on each row for future actions (out of scope for v1, but reserve space)
- Exclude row selection checkboxes from reference design (not needed for v1)

## Existing Code to Leverage

**Admin Skills Module Pattern (`apps/web/src/modules/admin-skills/`)**
- Replicate component structure: main module file, components folder, hooks folder, graphql folder
- Follow state management pattern for filters, search, and sorting in main admin-skills.tsx file
- Reuse SkillsFilters.tsx pattern for dropdown multi-select filters with badges showing active count
- Apply SkillsTable.tsx pattern for table loading and empty states
- Use use-skills.ts hook pattern for Apollo query hook with input variables

**Profile Component (`apps/web/src/modules/profile/profile.tsx`)**
- Reuse entire Profile component in new admin profile overview route
- Leverage existing useProfile hook and ProfileHeader, SeniorityTimeline, SkillsSection, CurrentAssignments components
- Maintain consistency with existing profile display for admin view

**Admin Seniority Route Pattern (`/admin/profiles/:profileId/seniority`)**
- Follow same route guard pattern with beforeLoad checking ProfileType.ADMIN
- Use redirect to /profile for unauthorized users
- Apply same route structure for new admin profile overview route

**Avatar Component with Initials Fallback**
- Use Avatar, AvatarImage, AvatarFallback from `@/shared/components/ui/avatar`
- Display avatarUrl in AvatarImage, fallback to initials using getStringInitials utility
- Follow validation-inbox.tsx pattern for avatar display with name initials

**GraphQL Query Pattern from get-all-skills.query.graphql**
- Follow same query structure with input object pattern
- Apply similar filtering and optional parameters approach
- Maintain consistent naming convention for generated types

## Out of Scope
- Bulk actions on selected employees (e.g., bulk seniority changes, bulk skill assignments)
- Row selection checkboxes in table
- Export to CSV functionality
- Employee status indicators (active/inactive/on leave)
- Inline editing of employee data in table rows
- Advanced multi-field filtering beyond specified filters (department, project, validation status)
- Skills proficiency levels display in table (only show skill names in list view)
- Direct navigation to admin functions other than profile overview from table rows
- Employee performance metrics or ratings display
- Filtering by specific projects or departments
