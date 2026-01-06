# Specification: Validation Inbox UI

## Goal
Build a master-detail interface for TECH_LEAD and ADMIN roles to review pending skill suggestions, organized hierarchically by Projects → Team Members → Pending Suggestions, with navigation controls for efficient review workflows.

## User Stories
- As a Tech Lead, I want to view all pending skill suggestions for my projects organized by team member so that I can efficiently review and prepare for validation decisions
- As an Admin, I want to view all pending skill suggestions across all projects so that I can monitor validation workload and assist with review processes
- As a Tech Lead or Admin, I want to navigate between team members and their suggestions using keyboard-friendly controls so that I can quickly move through my validation queue

## Specific Requirements

**Protected Route with Role-Based Access**
- Create route at `/inbox` accessible only to TECH_LEAD and ADMIN roles
- Use existing ProtectedRoute wrapper pattern from App.tsx for authentication guard
- Implement role check using useAuth hook to verify profile.role is TECH_LEAD or ADMIN
- Redirect EMPLOYEE role users to home page or display forbidden message when attempting access
- Add route to App.tsx Routes configuration with ProtectedRoute wrapper

**Master-Detail Layout Structure**
- Implement two-column layout: left sidebar (25-30% width) and right content area (70-75% width) on desktop
- Use responsive design with Tailwind breakpoints: stack vertically on mobile, two-column on md breakpoint and above
- Left sidebar contains project-grouped navigation with expandable/collapsible project sections
- Right panel displays person review cards showing one pending suggestion at a time
- Follow dark glassmorphism design pattern with backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50
- Include starry background effect and gradient orbs matching Employee Profile UI and Home page styling

**GraphQL Integration with getValidationInbox Query**
- Create GraphQL query in client/src/graphql/queries.ts following GET_PROFILE_QUERY pattern
- Query structure: getValidationInbox returns InboxResponse with projects array containing ProjectInbox objects
- ProjectInbox contains: projectId, projectName, pendingSuggestionsCount, employees array
- EmployeeInbox contains: employeeId, employeeName, employeeEmail, pendingSuggestionsCount, suggestions array
- PendingSuggestion contains: id, skillName, discipline, suggestedProficiency, source, createdAt, currentProficiency (nullable)
- Use Apollo Client useQuery hook with loading, error, and data states following Profile.tsx pattern
- Implement automatic refetch on component mount, no manual refetch needed for this read-only view

**Sidebar Navigation with Expandable Projects**
- Display hierarchical list: Projects containing Team Members with pending suggestions counts
- Each project name displays pending suggestion count badge (e.g., "Project Alpha (5)")
- Clicking project header expands/collapses to show/hide team members list
- Use local state to track which projects are expanded (expandedProjects: Set or object)
- First project in list should be auto-expanded on page load
- Each team member entry displays name with pending suggestion count badge (e.g., "John Doe (3)")
- Clicking team member navigates to their review cards in right panel
- Show visual indicator (border, background highlight, or icon) for currently selected team member
- Style expanded project section with subtle background color or border to indicate active state

**Person Review Cards Display**
- Display ONE pending suggestion at a time for the selected team member in right panel
- Review card shows: skill name as header, current proficiency badge (if exists), suggested proficiency badge, suggestion source badge, created date
- Use existing badge styling patterns from Profile.tsx for proficiency levels and disciplines
- Add badge color coding for suggestion source: SELF_REPORT (blue tones), SYSTEM_FLAG (yellow/orange tones)
- Format created date using readable format (e.g., "December 15, 2025") following Profile.tsx formatDate helper
- Display "No current proficiency" or leave field empty when currentProficiency is null
- Include navigation arrows (Previous/Next Suggestion) to move between suggestions for selected person
- Track current suggestion index in local state, disable Previous at index 0 and Next at last index

**Cross-Person Navigation Controls**
- Implement "Previous Person" and "Next Person" buttons that automatically navigate across team members and projects
- Navigation should follow alphabetical order: move through employees within project, then to next project's first employee
- When at last person in last project, disable Next Person button (or wrap to first person if wrapping behavior preferred)
- When at first person in first project, disable Previous Person button (or wrap to last person if wrapping behavior preferred)
- Auto-select first team member of first expanded project on initial page load
- Update selected team member visual indicator in sidebar when using navigation buttons

**Loading, Error, and Empty States**
- Implement loading skeleton matching Profile.tsx pattern with animated pulse effects for sidebar and card areas
- Display error state with red-themed message box and Retry button when GraphQL query fails
- Show empty state in sidebar when no projects have pending suggestions with message "No pending validations at this time"
- Show empty state in right panel when no team member is selected with message "Select a team member to review suggestions"
- Show empty state when selected team member has no suggestions (edge case fallback)

**Client-Side State Management**
- Track expandedProjects: object or Set storing which project IDs are expanded
- Track selectedEmployeeId: string for currently selected team member
- Track selectedProjectId: string for currently selected project context
- Track currentSuggestionIndex: number for which suggestion is being viewed for selected employee
- Implement helper functions for navigation: goToNextPerson, goToPreviousPerson, goToNextSuggestion, goToPreviousSuggestion
- Calculate total employees list flattened from all projects for cross-project navigation logic

**Responsive Design Breakpoints**
- Mobile (default): Stack sidebar above content area, both full width, collapse sidebar sections by default except first project
- Tablet/Desktop (md breakpoint 768px+): Two-column layout with 30% sidebar and 70% content area
- Sidebar should be scrollable independently if content exceeds viewport height
- Review card area should be scrollable independently for long content
- Ensure touch-friendly tap targets for mobile (minimum 44px height for buttons and clickable elements)

## Visual Design

No visual assets provided. Follow existing dark glassmorphism design system from Employee Profile UI and Home page.

## Existing Code to Leverage

**ProtectedRoute pattern from App.tsx (lines 19-29)**
- Wrapper component that checks isAuthenticated from useAuth hook
- Redirects to /login if not authenticated using Navigate component
- Extend this pattern to add role-based check for TECH_LEAD and ADMIN only

**Dark glassmorphism design from Profile.tsx and App.tsx Home component**
- Background: min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
- Starry background with absolute positioned white/opacity dots (lines 237-247 Profile.tsx)
- Gradient orbs: bg-purple-600/5 and bg-indigo-600/5 with blur-3xl (lines 250-251 Profile.tsx)
- Cards: backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50
- Use consistent padding p-6 or p-8 for card interiors

**Badge components from Profile.tsx**
- Proficiency level badges: inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600/30 text-gray-300
- Discipline badges: getDisciplineColor helper function (lines 46-54) maps ENGINEERING (blue), DESIGN (pink), PRODUCT (green), DATA (yellow)
- Follow pattern: bg-{color}-500/20 text-{color}-300 for badge styling
- Add similar helper for suggestion source badges: SELF_REPORT (blue), SYSTEM_FLAG (yellow/orange)

**Avatar display from Profile.tsx and App.tsx Home (lines 261-265 Profile.tsx)**
- Circular gradient avatar: w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full
- Display first letter of name capitalized in white text
- Can be scaled down for sidebar team member entries (w-8 h-8 or w-10 h-10)

**Apollo Client useQuery pattern from Profile.tsx (lines 25-31)**
- Import useQuery from @apollo/client/react
- Destructure loading, error, data from useQuery hook
- Pass variables object and skip option if needed
- Handle loading state with skeleton UI, error state with error message and refetch button, success state with data rendering

**Loading skeleton from Profile.tsx (lines 152-198)**
- Use same background and starry effect as main page
- Create placeholder divs with h-{size} bg-gray-700/30 animate-pulse rounded-lg
- Match layout structure of actual content (sidebar skeleton and card skeleton)

**Error state pattern from Profile.tsx (lines 201-224)**
- Red-themed error box: bg-red-500/10 border border-red-500/20 rounded-lg
- Error title in text-red-300, message in text-sm text-red-300
- Retry button with onClick refetch handler

**Date formatting from Profile.tsx (lines 36-43)**
- Use Date.toLocaleDateString with options: { year: 'numeric', month: 'long', day: 'numeric' }
- Apply to createdAt field from PendingSuggestion

## Out of Scope
- Mutation operations to approve, reject, or adjust suggestions (future spec: Skill Resolution API and UI)
- Filtering options by suggestion source, proficiency level, or date range
- Sorting options beyond API default alphabetical sorting
- Search functionality within inbox
- Bulk selection or batch operations on multiple suggestions
- Real-time updates or GraphQL subscriptions for new pending suggestions
- Email notifications or alerts for new suggestions
- Keyboard shortcuts for navigation beyond standard tab/enter accessibility
- Pagination or virtualization for large datasets (assume reasonable dataset size)
- Export functionality (CSV, PDF reports)
- Admin-specific features beyond viewing all projects (no tech lead filtering UI controls)
- Profile editing or viewing from inbox interface (use existing /profile route)
- Analytics or metrics dashboard
- Suggestion detail modal or expanded views beyond single card display
- Comments or notes on suggestions (future feature)
- Suggestion history or audit trail display
