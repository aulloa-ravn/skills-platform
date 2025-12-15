# Task Breakdown: Employee Profile UI

## Overview
Total Tasks: 4 Task Groups with 29 Sub-tasks

This breakdown follows a test-driven approach with strategic groupings by specialization (GraphQL integration, routing/navigation, UI components, and test coverage). Each task group limits test writing to 2-8 focused tests during development, with a final review phase adding up to 10 additional strategic tests if needed.

## Task List

### GraphQL & Data Layer

#### Task Group 1: GraphQL Integration
**Dependencies:** None

- [ ] 1.0 Complete GraphQL query integration
  - [ ] 1.1 Write 2-8 focused tests for GraphQL integration
    - Limit to 2-8 highly focused tests maximum
    - Test only critical query behaviors (e.g., successful profile fetch, loading state, error handling)
    - Skip exhaustive testing of all data transformations and edge cases
  - [ ] 1.2 Create queries.ts file in graphql directory
    - File path: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/graphql/queries.ts`
    - Follow pattern from mutations.ts
    - Use gql template tag from @apollo/client
  - [ ] 1.3 Define GET_PROFILE_QUERY with nested selection sets
    - Query name: `getProfile`
    - Query variable: `id: String!`
    - Include all ProfileResponse fields:
      - Profile fields: id, name, email, avatarUrl, currentSeniority
      - Skills nested fields: coreStack[], validatedInventory[], pending[]
      - Each skill: id, name, discipline, proficiencyLevel, validatedBy, validatedAt
      - SeniorityHistory nested fields: seniorityHistory[]
      - Each history entry: id, seniorityLevel, effectiveDate, createdBy
      - CurrentAssignments nested fields: currentAssignments[]
      - Each assignment: id, projectName, role, tags[], techLeadName, techLeadEmail
  - [ ] 1.4 Create TypeScript interfaces for query response types
    - Create types matching GraphQL schema
    - Place in queries.ts file or separate types file
    - Include: ProfileData, Skill, SeniorityHistoryEntry, Assignment
  - [ ] 1.5 Ensure GraphQL integration tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify query is properly structured
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- GET_PROFILE_QUERY is properly formatted with all nested fields
- TypeScript types correctly represent the expected data structure
- Query can be imported and used with Apollo Client useQuery hook

**Reuse Patterns:**
- Follow LOGIN_MUTATION structure from `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/graphql/mutations.ts`
- Use gql template tag for query definition
- Reference Employee Profile API spec for complete field list

---

### Routing & Navigation

#### Task Group 2: Route Setup and Navigation
**Dependencies:** Task Group 1

- [ ] 2.0 Complete routing and navigation setup
  - [ ] 2.1 Write 2-8 focused tests for routing and navigation
    - Limit to 2-8 highly focused tests maximum
    - Test only critical routing behaviors (e.g., protected route redirect, navigation from home, profile link visibility)
    - Skip exhaustive testing of all navigation scenarios
  - [ ] 2.2 Create Profile page component skeleton
    - File path: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/pages/Profile.tsx`
    - Import React and necessary hooks (useState, useQuery from Apollo)
    - Import useAuth hook from AuthContext
    - Export Profile component with basic structure
    - Add placeholder text for now
  - [ ] 2.3 Add /profile route to App.tsx
    - Import Profile component in App.tsx
    - Add new Route inside Routes component
    - Path: `/profile`
    - Wrap with ProtectedRoute component (same pattern as Home)
    - Place route before the catch-all `*` route
  - [ ] 2.4 Add navigation link to profile from Home component
    - Update Home component in App.tsx
    - Add "View My Profile" card or button in header area (near LogoutButton)
    - Use React Router's useNavigate hook for navigation
    - Style consistently with existing glassmorphism design
    - Consider placement: either in header next to logout or as stat card
  - [ ] 2.5 Ensure routing and navigation tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify protected route works correctly
    - Verify navigation to profile works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- Profile page is accessible at /profile route
- Route is protected (redirects to /login if not authenticated)
- Navigation link from Home to Profile works correctly
- Clicking profile link navigates to /profile

**Reuse Patterns:**
- Follow ProtectedRoute pattern from `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/App.tsx`
- Use useNavigate hook from react-router-dom
- Follow component structure from Login.tsx

---

### Frontend UI Components

#### Task Group 3: Profile Page UI Implementation
**Dependencies:** Task Groups 1-2

- [ ] 3.0 Complete Profile page UI components
  - [ ] 3.1 Write 2-8 focused tests for Profile UI components
    - Limit to 2-8 highly focused tests maximum
    - Test only critical UI behaviors (e.g., profile header rendering, expand/collapse functionality, empty states)
    - Skip exhaustive testing of all component states and visual variants
  - [ ] 3.2 Implement dark glassmorphism page layout
    - Use dark gradient background: `bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900`
    - Add starry background effect with scattered white dots (reuse from Login/Home)
    - Add gradient orbs: purple-600/5 and indigo-600/5 with blur-3xl
    - Container: `max-w-6xl mx-auto` with `px-4 py-8`
    - All sections use consistent spacing: `mb-6` or `gap-6`
  - [ ] 3.3 Build Profile Header section
    - Card styling: `backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8`
    - Large circular avatar: `w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full`
    - Display user initials: `profile.name.charAt(0).toUpperCase()`
    - User name: `text-3xl font-bold text-white`
    - Email with mail icon (reuse icon from Home component)
    - Current seniority badge: `bg-purple-500/20 text-purple-300 border border-purple-500/30`
    - Layout: flex with avatar on left, info on right
  - [ ] 3.4 Create Seniority Timeline visualization
    - Horizontal timeline with visual nodes/dots connected by lines
    - Display last 3 milestones by default using React useState for limit
    - Each milestone shows: seniority level (badge), effective date (formatted), creator name
    - "Show Full History" button to expand (toggle state)
    - "Show Less" button when expanded to collapse back to 3
    - Timeline nodes: gradient circles similar to avatar (`bg-gradient-to-br from-purple-500 to-indigo-500`)
    - Connecting lines: `border-t border-gray-600`
    - Empty state: "No seniority history available" message
    - Responsive: horizontal scroll on mobile (`overflow-x-auto`), full width on desktop
  - [ ] 3.5 Build Current Projects section
    - Grid layout: `grid-cols-1 md:grid-cols-2 gap-4`
    - Card for each assignment: `bg-gray-700/30 rounded-lg p-4 border border-gray-600/50`
    - Project name: `text-xl font-semibold text-white`
    - Assignment role: `text-gray-300`
    - Tags as small badges: `bg-blue-500/20 text-blue-300 rounded-full px-2 py-1 text-xs`
    - Tech lead info with person icon: name and email in `text-sm text-gray-400`
    - Empty state: "No current assignments" when assignments array is empty
  - [ ] 3.6 Create Three-Tier Skills Display structure
    - Three separate card sections: Core Stack, Validated Inventory, Pending
    - Layout: `grid-cols-1 md:grid-cols-3 gap-6`
    - Each tier card: `backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6`
    - Tier header: tier name + skill count badge
    - Show top 10 skills per tier by default using useState
    - "View More" button appears only if tier has >10 skills
    - "View Less" button when expanded
  - [ ] 3.7 Implement Skills display format within tiers
    - Each skill card: `bg-gray-700/30 rounded-lg p-4 border border-gray-600/50 hover:bg-gray-700/40 transition-colors`
    - Skill name: `font-semibold text-white`
    - Discipline badge with color coding:
      - Engineering: `bg-blue-500/20 text-blue-300`
      - Design: `bg-pink-500/20 text-pink-300`
      - Product: `bg-green-500/20 text-green-300`
      - Data: `bg-yellow-500/20 text-yellow-300`
    - Proficiency level badge: `bg-gray-600/30 text-gray-300 text-xs`
    - For validated skills: "Validated by [name] on [date]" in `text-xs text-gray-400`
    - Skills within tier: `flex flex-col gap-3`
  - [ ] 3.8 Add empty state messages and action buttons
    - Core Stack empty: "No core stack skills yet"
    - Validated Inventory empty: "No validated skills in inventory"
    - Pending empty: "No pending skills" with "Suggest a new skill" button
    - Empty state button style: `bg-gray-700/30 hover:bg-gray-600/30 border border-gray-600/50 px-4 py-2 rounded-lg text-sm text-gray-300`
    - Buttons should not perform actions (placeholder for future)
  - [ ] 3.9 Integrate GraphQL query with Apollo Client
    - Import GET_PROFILE_QUERY from graphql/queries
    - Use useQuery hook with query and variables: `{ id: profile.id }`
    - Get profile.id from useAuth context
    - Destructure: loading, error, data, refetch
    - Handle three states: loading, error, data
  - [ ] 3.10 Implement loading skeleton state
    - Display while useQuery loading === true
    - Skeleton structure: header skeleton, timeline skeleton (3 gray rectangles), projects skeleton, skills skeleton (3 columns)
    - Use `animate-pulse` utility on gray rectangles: `bg-gray-700/30 animate-pulse`
    - Maintain consistent card borders during loading
    - Match layout structure of actual content
  - [ ] 3.11 Create error state UI
    - Display when useQuery error exists
    - Error card: `bg-red-500/10 border border-red-500/20 rounded-lg p-6`
    - Error message: GraphQL error.message or fallback "Failed to load profile. Please try again."
    - "Retry" button that calls refetch() from useQuery
    - Button style: `bg-gray-700/50 hover:bg-gray-600/50 text-white px-6 py-3 rounded-lg`
  - [ ] 3.12 Implement responsive design adjustments
    - Mobile (default): stack all sections vertically, skills tiers stack, timeline scrolls horizontally
    - Tablet/Desktop (md breakpoint and up):
      - Skills tiers: `md:grid-cols-3`
      - Assignments: `md:grid-cols-2`
      - Timeline displays fully horizontal
    - Touch-friendly button sizes on mobile: `py-3` minimum
    - Use Tailwind responsive utilities: `hidden sm:block`, `md:flex`
  - [ ] 3.13 Ensure Profile UI tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify critical UI components render correctly
    - Verify expand/collapse functionality works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Profile page matches dark glassmorphism design system
- All four main sections render correctly with proper data
- Loading skeleton displays during data fetch
- Error state displays with retry functionality
- Empty states show appropriate messages and buttons
- Skills tier expansion/collapse works correctly
- Seniority timeline expansion/collapse works correctly
- Responsive design works on mobile, tablet, and desktop
- Page matches visual consistency with Login and Home pages

**Reuse Patterns:**
- Dark glassmorphism design from `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/App.tsx` (Home component)
- Starry background from `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/pages/Login.tsx`
- Avatar display logic from Home component
- Badge styling from Home component (role badge)
- Card layouts and spacing from Home component
- Error handling patterns from Login page

---

### Testing & Quality Assurance

#### Task Group 4: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-3

- [ ] 4.0 Review existing tests and fill critical gaps only
  - [ ] 4.1 Review tests from Task Groups 1-3
    - Review the 2-8 tests written by graphql-integration-engineer (Task 1.1)
    - Review the 2-8 tests written by routing-engineer (Task 2.1)
    - Review the 2-8 tests written by ui-designer (Task 3.1)
    - Total existing tests: approximately 6-24 tests
  - [ ] 4.2 Analyze test coverage gaps for Employee Profile UI feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to this spec's feature requirements:
      - End-to-end profile viewing workflow
      - Data loading and error recovery flows
      - Interactive elements (expand/collapse, navigation)
      - Empty state handling
      - Responsive behavior (if critical to functionality)
    - Do NOT assess entire application test coverage
    - Prioritize integration tests over unit test gaps
  - [ ] 4.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on:
      - Integration between GraphQL query and UI rendering
      - Navigation flow from Home → Profile → back to Home
      - Error recovery: error state → retry → success
      - Edge cases: empty skills tiers, no seniority history, no assignments
      - Expand/collapse state management for timeline and skills
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases like: avatar with/without URL, various proficiency levels, different disciplines unless business-critical
    - Skip accessibility tests, performance tests, visual regression tests
  - [ ] 4.4 Run feature-specific tests only
    - Run ONLY tests related to Employee Profile UI feature
    - Tests from 1.1 (GraphQL integration): ~2-8 tests
    - Tests from 2.1 (Routing): ~2-8 tests
    - Tests from 3.1 (UI components): ~2-8 tests
    - Tests from 4.3 (Gap filling): up to 10 tests
    - Expected total: approximately 16-34 tests maximum
    - Do NOT run the entire application test suite
    - Verify all feature-specific tests pass
    - Verify critical user workflows work end-to-end

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 16-34 tests total)
- Critical user workflows for Employee Profile UI are covered:
  - User can navigate from Home to Profile
  - Profile data loads and displays correctly
  - Error states are handled gracefully with retry functionality
  - Empty states display appropriate messages
  - Timeline and skills expand/collapse functionality works
  - Responsive design functions correctly across breakpoints
- No more than 10 additional tests added when filling testing gaps
- Testing focused exclusively on Employee Profile UI feature requirements
- No regression in existing Login or Home functionality

**Test Coverage Focus:**
- GraphQL query execution and data fetching
- Protected route authentication check
- Navigation between pages
- Loading state skeleton display
- Error state and retry functionality
- Empty state rendering
- Expand/collapse interactions
- Responsive layout changes

---

## Execution Order

Recommended implementation sequence:

1. **GraphQL & Data Layer (Task Group 1)** - Establish data fetching foundation
2. **Routing & Navigation (Task Group 2)** - Set up page structure and navigation
3. **Frontend UI Components (Task Group 3)** - Build complete profile page with all sections
4. **Test Review & Gap Analysis (Task Group 4)** - Ensure comprehensive test coverage

## Key Dependencies

- **Task Group 2** depends on **Task Group 1**: Need GraphQL query defined before using it in Profile component
- **Task Group 3** depends on **Task Groups 1-2**: Need route set up and query available before building full UI
- **Task Group 4** depends on **Task Groups 1-3**: Need all features implemented before conducting test review

## Testing Strategy

This breakdown follows a focused test-driven approach:

- **During Development (Task Groups 1-3):** Each group writes 2-8 focused tests covering only critical behaviors
- **Test Verification:** Each group runs ONLY their own tests, not the entire suite
- **Gap Analysis (Task Group 4):** Final review adds maximum 10 strategic tests to fill critical coverage gaps
- **Total Tests:** Approximately 16-34 tests for the entire feature
- **Focus:** Integration tests and user workflows over exhaustive unit testing

## Design Consistency Checklist

Ensure the following patterns are consistently applied:

- [ ] Dark gradient background: `from-gray-900 via-gray-800 to-gray-900`
- [ ] Card styling: `backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50`
- [ ] Starry background with white dots and gradient orbs
- [ ] Avatar gradient: `from-purple-500 to-indigo-500`
- [ ] Badge styling with appropriate color schemes
- [ ] Hover effects: `hover:bg-gray-800/50 transition-colors`
- [ ] Consistent spacing: `px-4 py-8` for containers, `mb-6` or `gap-6` between sections
- [ ] Max width container: `max-w-6xl mx-auto`

## References

- **Spec:** `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/agent-os/specs/2025-12-15-employee-profile-ui/spec.md`
- **Requirements:** `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/agent-os/specs/2025-12-15-employee-profile-ui/planning/requirements.md`
- **Existing Patterns:**
  - App.tsx (Home component): `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/App.tsx`
  - Login.tsx: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/pages/Login.tsx`
  - AuthContext: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/contexts/AuthContext.tsx`
  - GraphQL mutations: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/graphql/mutations.ts`
  - Apollo Client: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/apollo/client.ts`
