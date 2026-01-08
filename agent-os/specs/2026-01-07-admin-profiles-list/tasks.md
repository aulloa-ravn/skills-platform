# Task Breakdown: Admin Profiles List

## Overview
Total Task Groups: 5
Estimated Total Tasks: ~40 individual tasks

## Task List

### Backend Layer - GraphQL Schema & Types

#### Task Group 1: GraphQL Schema Definitions
**Dependencies:** None

- [ ] 1.0 Complete GraphQL schema types and DTOs
  - [ ] 1.1 Write 2-8 focused tests for GraphQL types and enums
    - Limit to 2-8 highly focused tests maximum
    - Test only critical type validations (e.g., YearsInCompanyRange enum values, pagination input validation, sort field enum)
    - Skip exhaustive testing of all possible input combinations
  - [ ] 1.2 Create `YearsInCompanyRange` enum
    - Values: LESS_THAN_1, ONE_TO_TWO, TWO_TO_THREE, THREE_TO_FIVE, FIVE_PLUS
    - Add to backend GraphQL schema
  - [ ] 1.3 Create `ProfileSortField` enum
    - Values: NAME, EMAIL, SENIORITY, JOIN_DATE
    - Add to backend GraphQL schema
  - [ ] 1.4 Create `GetAllProfilesForAdminInput` input type
    - Fields: page (Int), pageSize (Int), searchTerm (String), seniorityLevels ([SeniorityLevel!]), skillIds ([String!]), yearsInCompanyRanges ([YearsInCompanyRange!]), sortBy (ProfileSortField), sortDirection (SortDirection)
    - Apply Zod validation rules for valid pagination values
  - [ ] 1.5 Create `ProfileListItemResponse` object type
    - Fields: id (String!), name (String!), email (String!), avatarUrl (String), currentSeniorityLevel (SeniorityLevel!), joinDate (DateTime!), currentAssignmentsCount (Int!), coreStackSkills ([String!]!), remainingSkillsCount (Int!)
  - [ ] 1.6 Create `PaginatedProfilesResponse` object type
    - Fields: profiles ([ProfileListItemResponse!]!), totalCount (Int!), currentPage (Int!), pageSize (Int!), totalPages (Int!)
  - [ ] 1.7 Ensure GraphQL schema tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify enums and types are correctly defined
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- All enums and types compile without errors
- Types match spec requirements exactly
- Validation rules enforce valid pagination parameters

---

### Backend Layer - Service & Resolver Logic

#### Task Group 2: Profile Service Implementation
**Dependencies:** Task Group 1

- [ ] 2.0 Complete ProfileService backend logic
  - [ ] 2.1 Write 2-8 focused tests for ProfileService.getAllProfilesForAdmin
    - Limit to 2-8 highly focused tests maximum
    - Test only critical service behaviors (e.g., ADMIN authorization check, search filtering, seniority filtering, pagination)
    - Skip exhaustive testing of all filter combinations and edge cases
  - [ ] 2.2 Create `getAllProfilesForAdmin` method in ProfileService
    - Method signature: `getAllProfilesForAdmin(input: GetAllProfilesForAdminInput, userId: string)`
    - Verify requesting user has ProfileType.ADMIN role
    - Throw ForbiddenException if not ADMIN
  - [ ] 2.3 Build base Prisma query excluding ADMIN users
    - Add where clause: `type: { not: ProfileType.ADMIN }`
    - Include relations: seniorityHistory, employeeSkills, assignments
  - [ ] 2.4 Implement search filter logic
    - Apply OR condition on name and email fields
    - Use Prisma `contains` with `mode: 'insensitive'` for case-insensitive search
    - Only apply if searchTerm provided
  - [ ] 2.5 Implement seniority level filter (OR operation)
    - Filter by currentSeniorityLevel in provided seniorityLevels array
    - Only apply if seniorityLevels array provided
  - [ ] 2.6 Implement skills filter (AND operation)
    - Join EmployeeSkill table
    - Filter profiles having ALL selected skillIds
    - Use Prisma aggregation to ensure count matches skillIds.length
    - Only apply if skillIds array provided
  - [ ] 2.7 Implement years in company filter (OR operation)
    - Calculate date ranges from current date based on YearsInCompanyRange enum
    - Filter by first SeniorityHistory startDate (ordered by startDate ASC)
    - Apply OR condition for multiple selected ranges
    - Only apply if yearsInCompanyRanges array provided
  - [ ] 2.8 Implement sorting logic
    - Support sorting by NAME, EMAIL, SENIORITY, JOIN_DATE
    - Map ProfileSortField to Prisma orderBy fields
    - Join date sorting uses first SeniorityHistory startDate
    - Apply sortDirection (ASC/DESC)
    - Default sort: NAME ASC if not provided
  - [ ] 2.9 Implement pagination
    - Calculate skip value: (page - 1) * pageSize
    - Use Prisma skip and take for pagination
    - Default values: page=1, pageSize=25
  - [ ] 2.10 Calculate join date from SeniorityHistory
    - Query first SeniorityHistory record ordered by startDate ASC
    - Use startDate as joinDate
    - Handle case where no SeniorityHistory exists (use createdAt fallback)
  - [ ] 2.11 Calculate core stack skills and remaining count
    - Fetch current Assignments (where endDate is null or > today)
    - Extract assignment tags from current assignments
    - Match assignment tags with EmployeeSkill.skill.name
    - Return first 3-4 matched skills as coreStackSkills array
    - Calculate remainingSkillsCount (total employee skills minus core stack shown)
  - [ ] 2.12 Format and return PaginatedProfilesResponse
    - Map results to ProfileListItemResponse array
    - Calculate totalPages: Math.ceil(totalCount / pageSize)
    - Return profiles, totalCount, currentPage, pageSize, totalPages
  - [ ] 2.13 Ensure ProfileService tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify ADMIN authorization, search, filtering, and pagination work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- ADMIN authorization enforced (ForbiddenException thrown for non-admins)
- Search filtering works (case-insensitive, OR operation)
- Seniority filtering works (OR operation)
- Skills filtering works (AND operation)
- Years in company filtering works (OR operation)
- Sorting works for all supported fields
- Pagination returns correct page and totalPages
- Join date calculated from first SeniorityHistory
- Core stack skills correctly identified from current assignments

---

#### Task Group 3: GraphQL Resolver Implementation
**Dependencies:** Task Group 2

- [ ] 3.0 Complete GraphQL resolver
  - [ ] 3.1 Write 2-8 focused tests for ProfileResolver.getAllProfilesForAdmin
    - Limit to 2-8 highly focused tests maximum
    - Test only critical resolver behaviors (e.g., ADMIN guard enforcement, successful query response, error handling)
    - Skip exhaustive testing of all resolver scenarios
  - [ ] 3.2 Create `getAllProfilesForAdmin` query in ProfileResolver
    - Add @Query decorator returning PaginatedProfilesResponse
    - Accept @Args('input') parameter of type GetAllProfilesForAdminInput
    - Apply @UseGuards(GqlAuthGuard) decorator for authentication
  - [ ] 3.3 Implement ADMIN role authorization check
    - Extract current user from GraphQL context
    - Check user.type === ProfileType.ADMIN
    - Throw ForbiddenException if not ADMIN
    - Pattern: Reuse from existing admin resolvers
  - [ ] 3.4 Call ProfileService.getAllProfilesForAdmin
    - Pass input and userId to service method
    - Return service response directly
  - [ ] 3.5 Add error handling
    - Wrap service call in try-catch
    - Handle common errors: ForbiddenException, BadRequestException
    - Return user-friendly error messages
  - [ ] 3.6 Ensure resolver tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify ADMIN guard works and query returns correct data
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Query only accessible to authenticated ADMIN users
- Non-admin users receive ForbiddenException
- Service integration works correctly
- Error handling provides clear messages

---

### Frontend Layer - GraphQL Query & Hooks

#### Task Group 4: Frontend GraphQL Setup
**Dependencies:** Task Group 3

- [ ] 4.0 Complete frontend GraphQL query and hooks
  - [ ] 4.1 Write 2-8 focused tests for useProfiles hook
    - Limit to 2-8 highly focused tests maximum
    - Test only critical hook behaviors (e.g., query execution with filters, loading state, error state)
    - Skip exhaustive testing of all hook scenarios
  - [ ] 4.2 Create GraphQL query file
    - Path: `/apps/web/src/modules/admin-profiles/graphql/get-all-profiles-for-admin.query.graphql`
    - Define getAllProfilesForAdmin query with input parameter
    - Request all fields from PaginatedProfilesResponse
    - Include all fields from ProfileListItemResponse
    - Follow pattern from get-all-skills.query.graphql
  - [ ] 4.3 Generate TypeScript types from GraphQL schema
    - Run codegen to generate types from query file
    - Verify generated types: GetAllProfilesForAdminQuery, GetAllProfilesForAdminInput, ProfileListItemResponse, etc.
  - [ ] 4.4 Create useProfiles custom hook
    - Path: `/apps/web/src/modules/admin-profiles/hooks/use-profiles.ts`
    - Accept parameters: page, pageSize, searchTerm, seniorityLevels, skillIds, yearsInCompanyRanges, sortBy, sortDirection
    - Use Apollo useQuery hook with GET_ALL_PROFILES_FOR_ADMIN query
    - Return: data, loading, error, refetch
    - Apply debounced searchTerm (300ms delay)
    - Follow pattern from use-skills.ts hook
  - [ ] 4.5 Ensure useProfiles hook tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify hook executes query and returns correct data structure
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- GraphQL query file correctly defined
- TypeScript types generated successfully
- useProfiles hook executes query with all parameters
- Search term debounced to avoid excessive queries
- Hook returns loading, error, and data states

---

### Frontend Layer - UI Components

#### Task Group 5: Admin Profiles Module Structure
**Dependencies:** Task Group 4

- [ ] 5.0 Complete admin-profiles module structure
  - [ ] 5.1 Write 2-8 focused tests for admin-profiles main component
    - Limit to 2-8 highly focused tests maximum
    - Test only critical component behaviors (e.g., initial render, filter state changes, pagination state changes)
    - Skip exhaustive testing of all component interactions
  - [ ] 5.2 Create module directory structure
    - Path: `/apps/web/src/modules/admin-profiles/`
    - Subdirectories: components/, hooks/, graphql/
    - Follow admin-skills module pattern
  - [ ] 5.3 Create admin-profiles.tsx main component
    - Manage state: searchTerm, seniorityFilters, skillFilters, yearsInCompanyFilters, sortBy, sortDirection, page, pageSize
    - Use useProfiles hook with current filter/sort/pagination state
    - Render ProfilesFilters, ProfilesSorting, ProfilesTable, ProfilesPagination components
    - Apply layout matching admin-skills.tsx pattern
  - [ ] 5.4 Implement state management for filters
    - searchTerm state with setter
    - seniorityFilters state (array of SeniorityLevel)
    - skillFilters state (array of skill IDs)
    - yearsInCompanyFilters state (array of YearsInCompanyRange)
    - Reset page to 1 when any filter changes
  - [ ] 5.5 Implement state management for sorting
    - sortBy state (ProfileSortField enum)
    - sortDirection state (ASC/DESC)
    - Reset page to 1 when sort changes
  - [ ] 5.6 Implement state management for pagination
    - page state (default: 1)
    - pageSize state (default: 25)
    - Update URL query params when pagination changes for shareable links
  - [ ] 5.7 Ensure admin-profiles component tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify state updates correctly when filters/sort/pagination change
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 5.1 pass
- Module directory structure follows admin-skills pattern
- Main component manages all necessary state
- Filter changes reset pagination to page 1
- URL query params updated for shareable links

---

#### Task Group 6: Profiles Table Component
**Dependencies:** Task Group 5

- [ ] 6.0 Complete ProfilesTable component
  - [ ] 6.1 Write 2-8 focused tests for ProfilesTable component
    - Limit to 2-8 highly focused tests maximum
    - Test only critical table behaviors (e.g., row rendering, click navigation, loading state, empty state)
    - Skip exhaustive testing of all table scenarios
  - [ ] 6.2 Create ProfilesTable component
    - Path: `/apps/web/src/modules/admin-profiles/components/profiles-table.tsx`
    - Accept props: profiles, loading, onRowClick
    - Use Shadcn Table component
    - Follow skills-table.tsx pattern
  - [ ] 6.3 Define table columns
    - Columns: Avatar + Name, Email, Seniority, Join Date, Assignments, Skills, Actions
    - Make Name, Email, Seniority, Join Date sortable (add sort indicators)
    - Reference visual: planning/visuals/shadcn-table-example.png
  - [ ] 6.4 Implement Avatar + Name column
    - Use Avatar component from @/shared/components/ui/avatar
    - Display avatarUrl in AvatarImage if present
    - Fallback: Use AvatarFallback with initials from getStringInitials(name)
    - Display name next to avatar
    - Follow validation-inbox.tsx pattern for avatar with initials
  - [ ] 6.5 Implement Email column
    - Display email as plain text
  - [ ] 6.6 Implement Seniority column
    - Display currentSeniorityLevel as Badge component
    - Use SeniorityLevelMap for display text (e.g., "Junior I" → "Junior I")
    - Apply appropriate badge variant/color
  - [ ] 6.7 Implement Join Date column
    - Format joinDate as readable string (e.g., "Jan 15, 2023")
    - Use date formatting utility (e.g., format from date-fns)
  - [ ] 6.8 Implement Assignments column
    - Display currentAssignmentsCount as number (e.g., "2")
  - [ ] 6.9 Implement Skills column
    - Display format: "React, TypeScript, Node, +5"
    - Show first 3-4 coreStackSkills comma-separated
    - Append "+N" if remainingSkillsCount > 0
    - Handle empty skills case
  - [ ] 6.10 Implement Actions column (placeholder)
    - Reserve space for future three-dot menu
    - Leave empty for v1 (out of scope)
  - [ ] 6.11 Add loading state
    - Show Spinner component when loading prop is true
    - Center spinner in table area
  - [ ] 6.12 Add empty state
    - Display when profiles array is empty
    - Message: "No employees found matching your filters"
    - Include Clear Filters button if filters active
  - [ ] 6.13 Implement row click navigation
    - Make entire row clickable
    - Call onRowClick(profileId) handler
    - Apply hover state styling
  - [ ] 6.14 Implement responsive design
    - Hide Assignments and Join Date columns on mobile (< 768px)
    - Ensure table scrolls horizontally on small screens
    - Follow responsive patterns from existing tables
  - [ ] 6.15 Ensure ProfilesTable component tests pass
    - Run ONLY the 2-8 tests written in 6.1
    - Verify table renders correctly with data, loading, and empty states
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 6.1 pass
- All columns render correctly with proper formatting
- Avatar displays image or initials fallback
- Seniority badge styled appropriately
- Skills display format matches spec
- Loading state shows spinner
- Empty state shows helpful message
- Row click triggers navigation
- Table responsive on mobile devices

---

#### Task Group 7: Profiles Filters Component
**Dependencies:** Task Group 5

- [ ] 7.0 Complete ProfilesFilters component
  - [ ] 7.1 Write 2-8 focused tests for ProfilesFilters component
    - Limit to 2-8 highly focused tests maximum
    - Test only critical filter behaviors (e.g., search input change, filter selection, clear filters)
    - Skip exhaustive testing of all filter interactions
  - [ ] 7.2 Create ProfilesFilters component
    - Path: `/apps/web/src/modules/admin-profiles/components/profiles-filters.tsx`
    - Accept props: searchTerm, onSearchChange, seniorityFilters, onSeniorityChange, skillFilters, onSkillChange, yearsInCompanyFilters, onYearsInCompanyChange, onClearFilters
    - Follow SkillsFilters.tsx pattern
  - [ ] 7.3 Implement search input
    - Use Input component from Shadcn
    - Left-aligned at top of table
    - Placeholder: "Search by name or email..."
    - Debounced input handler (300ms)
    - Icon: Search icon from lucide-react
  - [ ] 7.4 Implement Seniority Level filter dropdown
    - Use DropdownMenu component from Shadcn
    - Multi-select with checkboxes for each SeniorityLevel
    - Options: JUNIOR_I, JUNIOR_II, JUNIOR_III, MID_I, MID_II, MID_III, SENIOR_I, SENIOR_II, SENIOR_III
    - Display text using SeniorityLevelMap
    - Show active filter count badge on button (e.g., "Seniority (2)")
  - [ ] 7.5 Implement Skills filter dropdown
    - Use DropdownMenu component from Shadcn
    - Multi-select with checkboxes
    - Fetch active skills list using existing skills query
    - Searchable/filterable dropdown for large skills list
    - Show active filter count badge on button (e.g., "Skills (3)")
  - [ ] 7.6 Implement Years in Company filter dropdown
    - Use DropdownMenu component from Shadcn
    - Multi-select with checkboxes
    - Options: "Less than 1 year", "1-2 years", "2-3 years", "3-5 years", "5+ years"
    - Map display text to YearsInCompanyRange enum values
    - Show active filter count badge on button (e.g., "Years (2)")
  - [ ] 7.7 Implement Clear Filters button
    - Display button when any filters active (searchTerm OR any filter arrays not empty)
    - Button text: "Clear all filters"
    - Calls onClearFilters handler
    - Resets all filter state
  - [ ] 7.8 Apply filters immediately on change
    - No "Apply" button needed
    - Each filter change triggers immediate re-query
    - Page resets to 1 on filter change (handled in parent component)
  - [ ] 7.9 Ensure ProfilesFilters component tests pass
    - Run ONLY the 2-8 tests written in 7.1
    - Verify filters update state correctly and clear filters works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 7.1 pass
- Search input debounced and triggers filter
- All filter dropdowns multi-select with checkboxes
- Active filter count badges display correctly
- Clear Filters button appears when filters active
- Filters apply immediately on change
- Filter dropdowns styled consistently with design system

---

#### Task Group 8: Profiles Sorting Component
**Dependencies:** Task Group 5

- [ ] 8.0 Complete ProfilesSorting component
  - [ ] 8.1 Write 2-8 focused tests for ProfilesSorting component
    - Limit to 2-8 highly focused tests maximum
    - Test only critical sorting behaviors (e.g., sort field change, sort direction toggle)
    - Skip exhaustive testing of all sorting scenarios
  - [ ] 8.2 Create ProfilesSorting component
    - Path: `/apps/web/src/modules/admin-profiles/components/profiles-sorting.tsx`
    - Accept props: sortBy, sortDirection, onSortChange
    - Can be integrated into table column headers OR separate dropdown
    - Follow skills-sorting.tsx pattern if separate component
  - [ ] 8.3 Implement column header sort indicators
    - Add clickable sort icons to Name, Email, Seniority, Join Date column headers
    - Show up/down arrow based on sortDirection when column active
    - Click toggles sort direction (ASC → DESC → ASC)
    - Clicking different column switches sortBy field
  - [ ] 8.4 Apply visual styling for active sort
    - Highlight active sort column header
    - Show sort direction arrow icon (ArrowUp/ArrowDown from lucide-react)
    - Inactive columns show neutral sort icon or no icon
  - [ ] 8.5 Ensure ProfilesSorting component tests pass
    - Run ONLY the 2-8 tests written in 8.1
    - Verify sorting state changes correctly on column header clicks
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 8.1 pass
- Column headers clickable for sorting
- Sort direction toggles correctly
- Active sort column visually indicated
- Sort icons display correctly (up/down arrows)

---

#### Task Group 9: Profiles Pagination Component
**Dependencies:** Task Group 5

- [ ] 9.0 Complete ProfilesPagination component
  - [ ] 9.1 Write 2-8 focused tests for ProfilesPagination component
    - Limit to 2-8 highly focused tests maximum
    - Test only critical pagination behaviors (e.g., page change, page size change, button disable states)
    - Skip exhaustive testing of all pagination scenarios
  - [ ] 9.2 Create ProfilesPagination component
    - Path: `/apps/web/src/modules/admin-profiles/components/profiles-pagination.tsx`
    - Accept props: currentPage, pageSize, totalPages, totalCount, onPageChange, onPageSizeChange
    - Bottom-aligned below table
    - Follow pattern from planning/visuals/shadcn-table-example.png
  - [ ] 9.3 Implement Rows per page selector
    - Use Select component from Shadcn
    - Options: 25, 50, 100
    - Label: "Rows per page"
    - Calls onPageSizeChange handler
    - Resets to page 1 when page size changes
  - [ ] 9.4 Implement page count display
    - Format: "Page X of Y" (e.g., "Page 1 of 10")
    - Use currentPage and totalPages props
  - [ ] 9.5 Implement total rows display
    - Format: "X employees" (e.g., "245 employees")
    - Use totalCount prop
  - [ ] 9.6 Implement Previous/Next navigation buttons
    - Use Button component from Shadcn
    - Previous button: Disabled on page 1
    - Next button: Disabled on last page (currentPage === totalPages)
    - Icons: ChevronLeft and ChevronRight from lucide-react
    - Calls onPageChange handler with new page number
  - [ ] 9.7 Optional: Add page number buttons
    - Display clickable page numbers (e.g., 1, 2, 3, ..., 10)
    - Highlight current page
    - Truncate with ellipsis for large page counts
    - Out of scope if time constrained (Previous/Next sufficient)
  - [ ] 9.8 Update URL query params on pagination change
    - Use TanStack Router navigate to update URL with page and pageSize params
    - Enables shareable links to specific pages
    - Pattern: ?page=2&pageSize=50
  - [ ] 9.9 Ensure ProfilesPagination component tests pass
    - Run ONLY the 2-8 tests written in 9.1
    - Verify pagination controls work and buttons disable correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 9.1 pass
- Rows per page selector changes page size
- Page count and total rows display correctly
- Previous/Next buttons work and disable appropriately
- URL query params updated on pagination change
- Pagination UI matches visual reference

---

### Frontend Layer - Routing & Navigation

#### Task Group 10: Admin Profiles List Route
**Dependencies:** Task Group 6, 7, 8, 9

- [ ] 10.0 Complete admin profiles list route
  - [ ] 10.1 Write 2-8 focused tests for admin profiles list route
    - Limit to 2-8 highly focused tests maximum
    - Test only critical route behaviors (e.g., ADMIN guard redirect, component renders)
    - Skip exhaustive testing of all route scenarios
  - [ ] 10.2 Create route file
    - Path: `/apps/web/src/routes/_authenticated/admin/profiles.index.tsx`
    - Use TanStack Router createFileRoute
    - Follow admin route patterns
  - [ ] 10.3 Implement beforeLoad guard
    - Check user profile type === ProfileType.ADMIN
    - Redirect non-admin users to /profile route
    - Pattern: Reuse from existing admin routes (e.g., admin/profiles.$profileId.seniority.tsx)
  - [ ] 10.4 Render AdminProfiles component
    - Import AdminProfiles from @/modules/admin-profiles/admin-profiles
    - Render in route component
  - [ ] 10.5 Parse URL query params for initial state
    - Read page and pageSize from URL query params
    - Set initial state in AdminProfiles component
    - Enables shareable links to specific pages
  - [ ] 10.6 Ensure admin profiles list route tests pass
    - Run ONLY the 2-8 tests written in 10.1
    - Verify ADMIN guard redirects non-admin users
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 10.1 pass
- Route accessible at /admin/profiles
- ADMIN guard enforced (non-admins redirected)
- AdminProfiles component renders
- URL query params parsed for page and pageSize

---

#### Task Group 11: Admin Profile Overview Route
**Dependencies:** Task Group 10

- [ ] 11.0 Complete admin profile overview route
  - [ ] 11.1 Write 2-8 focused tests for admin profile overview route
    - Limit to 2-8 highly focused tests maximum
    - Test only critical route behaviors (e.g., ADMIN guard redirect, Profile component renders with correct profileId)
    - Skip exhaustive testing of all route scenarios
  - [ ] 11.2 Create route file
    - Path: `/apps/web/src/routes/_authenticated/admin/profiles.$profileId.index.tsx`
    - Use TanStack Router createFileRoute with profileId param
    - Follow admin route patterns
  - [ ] 11.3 Implement beforeLoad guard
    - Check user profile type === ProfileType.ADMIN
    - Redirect non-admin users to /profile route
    - Pattern: Reuse from admin/profiles.$profileId.seniority.tsx
  - [ ] 11.4 Render existing Profile component
    - Import Profile from @/modules/profile/profile
    - Pass profileId param from route
    - Reuse entire Profile component without modifications
    - Pattern: Leverage existing useProfile hook and all profile subcomponents
  - [ ] 11.5 Add navigation/tabs to admin-specific features (optional)
    - Add tabs or navigation links to access:
      - Profile overview (current route)
      - Seniority management (/admin/profiles/:profileId/seniority)
    - Out of scope if time constrained (can access via direct URL)
  - [ ] 11.6 Ensure admin profile overview route tests pass
    - Run ONLY the 2-8 tests written in 11.1
    - Verify Profile component renders with correct profileId
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 11.1 pass
- Route accessible at /admin/profiles/:profileId
- ADMIN guard enforced (non-admins redirected)
- Profile component renders with correct profileId
- Integration with existing admin subroutes works

---

### Testing & Quality Assurance

#### Task Group 12: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-11

- [ ] 12.0 Review existing tests and fill critical gaps only
  - [ ] 12.1 Review tests from Task Groups 1-11
    - Review the 2-8 tests written by backend schema engineer (Task 1.1)
    - Review the 2-8 tests written by backend service engineer (Task 2.1)
    - Review the 2-8 tests written by backend resolver engineer (Task 3.1)
    - Review the 2-8 tests written by frontend GraphQL engineer (Task 4.1)
    - Review the 2-8 tests written by frontend module engineer (Task 5.1)
    - Review the 2-8 tests written by table component engineer (Task 6.1)
    - Review the 2-8 tests written by filters component engineer (Task 7.1)
    - Review the 2-8 tests written by sorting component engineer (Task 8.1)
    - Review the 2-8 tests written by pagination component engineer (Task 9.1)
    - Review the 2-8 tests written by list route engineer (Task 10.1)
    - Review the 2-8 tests written by overview route engineer (Task 11.1)
    - Total existing tests: approximately 22-88 tests
  - [ ] 12.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage:
      - End-to-end workflow: Admin searches for employee by name, filters by seniority, navigates to profile
      - End-to-end workflow: Admin filters by multiple skills (AND operation), verifies correct results
      - End-to-end workflow: Admin changes page size, navigates to next page, URL params update
      - Integration: GraphQL query with all filters applied returns correct results
      - Integration: Pagination state persists via URL query params
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
  - [ ] 12.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points and end-to-end workflows:
      - Test complete search and filter workflow (search + seniority + skills filter)
      - Test pagination workflow with URL params
      - Test skills AND operation filtering (employee must have ALL selected skills)
      - Test years in company filter with date range calculations
      - Test sort direction toggle on column headers
      - Test clear all filters resets state
      - Test ADMIN authorization end-to-end (non-admin redirected)
      - Test navigation from table row to profile overview page
      - Test empty state when no employees match filters
      - Test core stack skills calculation from current assignments
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases, performance tests, and accessibility tests unless business-critical
  - [ ] 12.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, and 12.3)
    - Expected total: approximately 32-98 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass
  - [ ] 12.5 Fix any failing tests
    - Investigate and resolve failing tests
    - Focus on feature-specific failures
    - Do not scope-creep into unrelated test fixes

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 32-98 tests total)
- Critical user workflows for this feature are covered:
  - Search and filter workflows
  - Pagination and URL param persistence
  - Skills AND operation filtering
  - ADMIN authorization
  - Navigation to profile overview
  - Core stack skills calculation
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this spec's feature requirements

---

## Execution Order

Recommended implementation sequence:

**Phase 1: Backend Foundation**
1. Task Group 1: GraphQL Schema Definitions
2. Task Group 2: Profile Service Implementation
3. Task Group 3: GraphQL Resolver Implementation

**Phase 2: Frontend Data Layer**
4. Task Group 4: Frontend GraphQL Setup

**Phase 3: Frontend UI Components**
5. Task Group 5: Admin Profiles Module Structure
6. Task Group 6: Profiles Table Component
7. Task Group 7: Profiles Filters Component
8. Task Group 8: Profiles Sorting Component
9. Task Group 9: Profiles Pagination Component

**Phase 4: Frontend Routing**
10. Task Group 10: Admin Profiles List Route
11. Task Group 11: Admin Profile Overview Route

**Phase 5: Quality Assurance**
12. Task Group 12: Test Review & Gap Analysis

---

## Key Dependencies

- Task Group 2 depends on Task Group 1 (service needs schema types)
- Task Group 3 depends on Task Group 2 (resolver needs service)
- Task Group 4 depends on Task Group 3 (frontend needs backend API)
- Task Groups 5-9 depend on Task Group 4 (components need data hooks)
- Task Group 10 depends on Task Groups 6-9 (route needs components)
- Task Group 11 depends on Task Group 10 (profile overview extends list route)
- Task Group 12 depends on all previous groups (testing after implementation)

---

## Reusable Patterns

**Backend:**
- GraphQL schema patterns from existing admin queries
- Service authorization patterns from admin resolvers
- Prisma query patterns for filtering, sorting, pagination

**Frontend:**
- Module structure from `/apps/web/src/modules/admin-skills/`
- Table component from skills-table.tsx
- Filter component from SkillsFilters.tsx
- Hook patterns from use-skills.ts
- Avatar with initials from validation-inbox.tsx
- Route guards from admin/profiles.$profileId.seniority.tsx

**Visual:**
- Table design from `planning/visuals/shadcn-table-example.png`
- Dark theme consistency with existing admin pages
- Shadcn UI components throughout

---

## Notes

- All file paths are absolute paths from project root: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/`
- Each task group includes focused test writing (2-8 tests maximum) at the start and test verification at the end
- Testing verification runs ONLY the newly written tests, not the entire test suite
- Task Group 12 adds maximum 10 additional tests to fill critical gaps
- Total expected tests: approximately 32-98 tests maximum for this feature
- ADMIN authorization enforced at both backend (resolver) and frontend (route guards) layers
- URL query params enable shareable links to specific filtered/paginated views
- Core stack skills calculated from current assignment tags matching employee skill names
- Skills filter uses AND operation (employee must have ALL selected skills)
- Seniority and years in company filters use OR operation (employee matches ANY selected value)
