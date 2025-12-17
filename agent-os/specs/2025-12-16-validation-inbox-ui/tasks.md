# Task Breakdown: Validation Inbox UI

## Overview
Total Tasks: 4 Task Groups

## Task List

### GraphQL Integration Layer

#### Task Group 1: GraphQL Query and TypeScript Types
**Dependencies:** None (leverages existing Validation Inbox API)

- [ ] 1.0 Complete GraphQL integration layer
  - [ ] 1.1 Write 2-8 focused tests for GraphQL query integration
    - Limit to 2-8 highly focused tests maximum
    - Test only critical query behaviors (e.g., successful data fetch, error handling, loading state)
    - Skip exhaustive coverage of all query variations and edge cases
  - [ ] 1.2 Create TypeScript interfaces in `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/graphql/queries.ts`
    - Add `PendingSuggestion` interface: id, skillName, discipline, suggestedProficiency, source, createdAt, currentProficiency (nullable)
    - Add `EmployeeInbox` interface: employeeId, employeeName, employeeEmail, pendingSuggestionsCount, suggestions array
    - Add `ProjectInbox` interface: projectId, projectName, pendingSuggestionsCount, employees array
    - Add `InboxResponse` interface: projects array of ProjectInbox
    - Add `GetValidationInboxResponse` interface: getValidationInbox property of InboxResponse type
    - Follow existing pattern from GET_PROFILE_QUERY interfaces (lines 7-69)
  - [ ] 1.3 Create GET_VALIDATION_INBOX_QUERY in `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/graphql/queries.ts`
    - Use gql template literal following GET_PROFILE_QUERY pattern (lines 80-137)
    - Query structure: `query GetValidationInbox { getValidationInbox { projects { ... } } }`
    - Include all ProjectInbox fields, nested EmployeeInbox fields, nested PendingSuggestion fields
    - No variables required (query filtered by role on backend)
  - [ ] 1.4 Ensure GraphQL integration tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify query structure is correct
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- TypeScript interfaces properly typed and exported
- GraphQL query compiles without errors
- Query structure matches backend API schema

### Routing and Access Control

#### Task Group 2: Protected Route with Role-Based Access
**Dependencies:** Task Group 1

- [ ] 2.0 Complete routing and access control
  - [ ] 2.1 Write 2-8 focused tests for protected route and role checks
    - Limit to 2-8 highly focused tests maximum
    - Test only critical behaviors (e.g., TECH_LEAD access granted, ADMIN access granted, EMPLOYEE redirected, unauthenticated redirected)
    - Skip exhaustive testing of all role combinations and edge cases
  - [ ] 2.2 Create stub Inbox page component at `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/pages/Inbox.tsx`
    - Create basic functional component structure returning simple div with "Validation Inbox" text
    - Add dark glassmorphism background matching Profile.tsx (lines 235-252)
    - Import necessary hooks: useAuth from contexts/AuthContext, useNavigate from react-router-dom
  - [ ] 2.3 Implement role-based access check in Inbox component
    - Use `useAuth` hook to get profile.role
    - Add useEffect to check if role is EMPLOYEE
    - If EMPLOYEE, navigate to "/" home page using useNavigate
    - If TECH_LEAD or ADMIN, render inbox content
  - [ ] 2.4 Add /inbox route to `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/App.tsx`
    - Import Inbox component
    - Add Route in Routes configuration (after /profile route, around line 165)
    - Wrap with ProtectedRoute component following existing pattern (lines 150-165)
    - Pattern: `<Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />`
  - [ ] 2.5 Ensure routing and access control tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify role checks work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- TECH_LEAD users can access /inbox
- ADMIN users can access /inbox
- EMPLOYEE users are redirected to home page
- Unauthenticated users are redirected to login via ProtectedRoute

### UI Components and Layout

#### Task Group 3: Master-Detail Interface Components
**Dependencies:** Task Groups 1-2

- [ ] 3.0 Complete UI components and layout
  - [ ] 3.1 Write 2-8 focused tests for UI components
    - Limit to 2-8 highly focused tests maximum
    - Test only critical component behaviors (e.g., sidebar project expansion, team member selection, suggestion navigation, cross-person navigation)
    - Skip exhaustive testing of all component states and interactions
  - [ ] 3.2 Implement GraphQL data fetching in Inbox component
    - Import useQuery from @apollo/client/react
    - Import GET_VALIDATION_INBOX_QUERY and GetValidationInboxResponse type
    - Add useQuery hook destructuring loading, error, data, refetch
    - Follow pattern from Profile.tsx (lines 25-31)
    - No variables needed (backend filters by role)
  - [ ] 3.3 Implement loading skeleton state
    - Follow Profile.tsx loading skeleton pattern (lines 152-198)
    - Include starry background and gradient orbs
    - Create skeleton for two-column layout: sidebar (30% width) and content area (70% width)
    - Use `h-{size} bg-gray-700/30 animate-pulse rounded-lg` for placeholders
  - [ ] 3.4 Implement error state with retry functionality
    - Follow Profile.tsx error state pattern (lines 201-224)
    - Red-themed error box: bg-red-500/10 border border-red-500/20
    - Display error message and Retry button calling refetch
  - [ ] 3.5 Implement client-side state management
    - Add useState for `expandedProjects: Set<string>` to track which project IDs are expanded
    - Add useState for `selectedProjectId: string | null` for currently selected project
    - Add useState for `selectedEmployeeId: string | null` for currently selected team member
    - Add useState for `currentSuggestionIndex: number` (default: 0) for current suggestion being viewed
    - Initialize first project as expanded on mount using useEffect
  - [ ] 3.6 Create helper functions for navigation logic
    - `toggleProject(projectId: string)` - adds/removes from expandedProjects Set
    - `selectEmployee(projectId: string, employeeId: string)` - sets selected IDs and resets suggestion index to 0
    - `goToNextSuggestion()` - increments currentSuggestionIndex if not at last suggestion
    - `goToPreviousSuggestion()` - decrements currentSuggestionIndex if not at 0
    - `goToNextPerson()` - navigates to next employee in list (cross-project), wraps or disables at end
    - `goToPreviousPerson()` - navigates to previous employee in list (cross-project), wraps or disables at start
    - Create flattened employees list for cross-project navigation
  - [ ] 3.7 Build two-column responsive layout structure
    - Outer container: `flex flex-col md:flex-row gap-6` for responsive stacking
    - Left sidebar: `w-full md:w-[30%] overflow-y-auto` with max-height for scrolling
    - Right content: `w-full md:w-[70%] overflow-y-auto` with max-height for scrolling
    - Use Tailwind md breakpoint (768px) for desktop two-column layout
  - [ ] 3.8 Implement sidebar navigation component
    - Display hierarchical projects list from `data.getValidationInbox.projects`
    - Each project header shows: project name + count badge `(pendingSuggestionsCount)`
    - Project header clickable, calls `toggleProject(projectId)` on click
    - Use chevron icon (down when expanded, right when collapsed) from Profile.tsx pattern
    - Conditionally render team members list when project ID in expandedProjects Set
    - Each team member shows: small avatar (w-8 h-8), name + count badge `(pendingSuggestionsCount)`
    - Team member clickable, calls `selectEmployee(projectId, employeeId)` on click
    - Highlight selected team member with border or background color (e.g., border-l-4 border-purple-500)
  - [ ] 3.9 Implement person review card component
    - Display empty state "Select a team member to review suggestions" when no employee selected
    - Find selected employee from data using selectedProjectId and selectedEmployeeId
    - Display current suggestion using currentSuggestionIndex from employee.suggestions array
    - Card header: skill name as h3 text-2xl font-bold
    - Display current proficiency badge (if exists, nullable field): use Profile.tsx badge pattern (lines 82-86)
    - Display suggested proficiency badge: same badge styling
    - Display suggestion source badge: create `getSourceColor` helper similar to getDisciplineColor (lines 46-54)
      - SELF_REPORT: bg-blue-500/20 text-blue-300
      - SYSTEM_FLAG: bg-yellow-500/20 text-yellow-300
    - Display created date using formatDate helper (lines 36-43)
    - Add Previous/Next Suggestion arrow buttons at bottom
    - Disable Previous when currentSuggestionIndex === 0
    - Disable Next when currentSuggestionIndex === suggestions.length - 1
  - [ ] 3.10 Implement cross-person navigation controls
    - Add "Previous Person" and "Next Person" buttons below suggestion card
    - Call goToPreviousPerson and goToNextPerson respectively
    - Disable buttons at start/end of flattened employees list
    - Update sidebar selection indicator when buttons clicked
  - [ ] 3.11 Apply dark glassmorphism design system
    - Background: min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
    - Starry background effect from Profile.tsx (lines 238-248)
    - Gradient orbs from Profile.tsx (lines 250-251)
    - Cards: backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50
    - Consistent padding p-6 or p-8
    - Follow existing button styles: bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50
  - [ ] 3.12 Implement empty states
    - Sidebar empty state: "No pending validations at this time" when projects array is empty
    - Right panel empty state: "Select a team member to review suggestions" when no employee selected
    - Edge case: empty suggestions array for selected employee (should not happen per backend logic but add fallback)
  - [ ] 3.13 Add avatar components for team members
    - Follow Profile.tsx avatar pattern (lines 261-265)
    - Smaller size: w-8 h-8 or w-10 h-10 for sidebar
    - Gradient background: bg-gradient-to-br from-purple-500 to-indigo-500
    - Display first letter of employee name capitalized
  - [ ] 3.14 Ensure UI component tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify critical component behaviors work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Two-column layout renders correctly on desktop, stacks on mobile
- Projects expand/collapse correctly
- Team member selection updates right panel
- Suggestion navigation arrows work
- Cross-person navigation works across projects
- Loading, error, and empty states display correctly
- Dark glassmorphism design applied consistently
- All interactive elements have proper hover states

### Testing

#### Task Group 4: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-3

- [ ] 4.0 Review existing tests and fill critical gaps only
  - [ ] 4.1 Review tests from Task Groups 1-3
    - Review the 2-8 tests written by graphql-integration-engineer (Task 1.1)
    - Review the 2-8 tests written by routing-access-control-engineer (Task 2.1)
    - Review the 2-8 tests written by ui-component-engineer (Task 3.1)
    - Total existing tests: approximately 6-24 tests
  - [ ] 4.2 Analyze test coverage gaps for Validation Inbox UI feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to this feature's requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
    - Key workflows to verify:
      - Complete navigation flow: select project -> select employee -> navigate suggestions -> navigate to next person
      - Role-based access control flow: EMPLOYEE redirect, TECH_LEAD access, ADMIN access
      - State management: expandedProjects, selectedEmployee, suggestionIndex coordination
      - Empty states: no projects, no employee selected
      - Error and loading states
  - [ ] 4.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points and end-to-end workflows
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases, performance tests, and accessibility tests unless business-critical
    - Recommended test areas (if gaps exist):
      - Integration test: complete review workflow from project selection through cross-person navigation
      - Integration test: role-based redirect for EMPLOYEE users
      - Integration test: GraphQL loading and error states with UI feedback
      - Integration test: state synchronization between sidebar and review card
  - [ ] 4.4 Run feature-specific tests only
    - Run ONLY tests related to Validation Inbox UI feature (tests from 1.1, 2.1, 3.1, and 4.3)
    - Expected total: approximately 16-34 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 16-34 tests total)
- Critical user workflows for Validation Inbox UI are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this feature's requirements

## Execution Order

Recommended implementation sequence:
1. GraphQL Integration Layer (Task Group 1) - Establish data contracts and query structure
2. Routing and Access Control (Task Group 2) - Set up protected route with role checks
3. UI Components and Layout (Task Group 3) - Build master-detail interface with navigation
4. Test Review & Gap Analysis (Task Group 4) - Verify complete workflows and fill critical gaps

## Technical Notes

**Existing Patterns to Reuse:**
- ProtectedRoute wrapper: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/App.tsx` (lines 19-29)
- useAuth hook for role checking: imported from contexts/AuthContext
- Apollo Client useQuery pattern: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/pages/Profile.tsx` (lines 25-31)
- Loading skeleton: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/pages/Profile.tsx` (lines 152-198)
- Error state: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/pages/Profile.tsx` (lines 201-224)
- Dark glassmorphism background: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/pages/Profile.tsx` (lines 235-252)
- Badge styling: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/pages/Profile.tsx` (lines 46-54, 74-79, 82-86)
- Avatar component: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/pages/Profile.tsx` (lines 261-265)
- Date formatting: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/pages/Profile.tsx` (lines 36-43)

**State Management Strategy:**
- Client-side state only (no global state management needed)
- Track expanded projects, selected employee, and suggestion index in component state
- Use Set for expandedProjects for O(1) lookup
- Flatten employees across projects for cross-person navigation
- Auto-expand first project and auto-select first employee on mount

**Navigation Logic:**
- Cross-person navigation flattens employees from all projects into single array
- Navigation respects project order and employee order within projects
- Buttons disabled at boundaries (first/last person) - no wrapping behavior
- Selecting employee resets suggestion index to 0
- Sidebar selection indicator updates when using Previous/Next Person buttons

**Responsive Breakpoints:**
- Mobile (default): Stacked layout, both sections full width
- Desktop (md: 768px+): Two-column layout with 30% sidebar, 70% content
- Independent scrolling for sidebar and content area
- Touch-friendly tap targets (minimum 44px height) for mobile

**Data Structure from API:**
```
InboxResponse {
  projects: ProjectInbox[] {
    projectId: string
    projectName: string
    pendingSuggestionsCount: number
    employees: EmployeeInbox[] {
      employeeId: string
      employeeName: string
      employeeEmail: string
      pendingSuggestionsCount: number
      suggestions: PendingSuggestion[] {
        id: string
        skillName: string
        discipline: string
        suggestedProficiency: string
        source: "SELF_REPORT" | "SYSTEM_FLAG"
        createdAt: string
        currentProficiency: string | null
      }
    }
  }
}
```
