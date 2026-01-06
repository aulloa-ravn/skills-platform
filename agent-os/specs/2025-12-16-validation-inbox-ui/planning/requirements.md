# Spec Requirements: Validation Inbox UI

## Initial Description
Validation Inbox UI — Build master-detail interface with project-grouped sidebar, person review cards, and navigation between team members

## Requirements Discussion

### First Round Questions

**Q1:** I assume the Validation Inbox page should be accessible at `/inbox` route and only visible to TECH_LEAD and ADMIN roles, with EMPLOYEE role being redirected or showing a forbidden message. Is that correct, or should it have a different route or access pattern?
**Answer:** Approved - `/inbox` route, TECH_LEAD and ADMIN only, EMPLOYEE role redirected.

**Q2:** For the master-detail interface layout, I'm thinking the project-grouped sidebar should be on the left (25-30% width) with the person review cards taking the remaining space on the right, using a two-column layout on desktop and stacking vertically on mobile. Should we follow this pattern, or would you prefer a different layout approach?
**Answer:** Approved - Sidebar on the left (25-30% width), person review cards on the right, two-column on desktop, stacking vertically on mobile.

**Q3:** I assume clicking on a project in the sidebar expands it to show the list of team members with pending suggestions, and clicking on a team member navigates to their review cards on the right panel. Should the first project be auto-expanded on page load, or should they all start collapsed?
**Answer:** Approved - Clicking project expands to show team members, clicking team member navigates to review cards. First project auto-expanded on page load.

**Q4:** For the person review cards on the right panel, I'm thinking each card should display one pending suggestion at a time with skill name, current proficiency (if any), suggested proficiency, suggestion source, created date, and navigation arrows to move between suggestions for that person. Is this the right approach, or should we display all pending suggestions for a person simultaneously in a vertical list?
**Answer:** One pending suggestion at a time with navigation arrows to move between suggestions for that person.

**Q5:** I assume the sidebar should show counts next to each project name (e.g., "Project Alpha (5)") and each team member name (e.g., "John Doe (3)") to indicate pending suggestion counts. Should we also show visual indicators for which team member is currently selected?
**Answer:** Approved - Show counts next to project names and team member names, show visual indicators for selected team member.

**Q6:** For navigation between team members, should there be "Next Person" / "Previous Person" buttons that automatically move to the next team member across projects, or should users manually select each person from the sidebar?
**Answer:** Previous/Next person buttons that automatically move to the next team member across projects.

**Q7:** I'm assuming we should follow the same dark glassmorphism design pattern from the Employee Profile UI (dark gradient background, backdrop-blur cards, starry background, consistent badges and styling). Is that correct?
**Answer:** Approved - Follow dark glassmorphism design pattern from Employee Profile UI.

**Q8:** Should the page include any filtering or sorting options (e.g., filter by suggestion source SELF_REPORT vs SYSTEM_FLAG, sort by date created, filter by proficiency level), or should we keep it simple with just the hierarchical project/person/suggestion structure for now?
**Answer:** Keep it simple with just the hierarchical structure for now (no filtering/sorting).

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

No follow-up questions were needed.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual assets to analyze.

## Requirements Summary

### Functional Requirements
- Protected route at `/inbox` accessible only to TECH_LEAD and ADMIN roles
- EMPLOYEE role should be redirected or shown forbidden message when attempting to access
- Master-detail interface with left sidebar (25-30% width) and right content area (70-75% width)
- Left sidebar displays hierarchical list: Projects containing Team Members with pending suggestions
- Clicking a project expands/collapses to show team members under that project
- Clicking a team member navigates to their review cards in the right panel
- First project auto-expanded on page load
- Project names display pending suggestion count (e.g., "Project Alpha (5)")
- Team member names display pending suggestion count (e.g., "John Doe (3)")
- Visual indicator shows which team member is currently selected in sidebar
- Right panel displays person review cards showing ONE pending suggestion at a time
- Each review card displays: skill name, current proficiency (if exists), suggested proficiency, suggestion source, created date
- Navigation arrows on review card to move between suggestions for the selected person
- "Previous Person" and "Next Person" buttons to automatically navigate across team members and projects
- Responsive design: two-column layout on desktop, stacked vertically on mobile
- Data fetched from getValidationInbox GraphQL query (already implemented in Validation Inbox API)

### Reusability Opportunities
- ProtectedRoute wrapper pattern from App.tsx for authentication
- Dark glassmorphism design system from Employee Profile UI and Home page
- Badge components for proficiency levels, disciplines, and suggestion sources
- Avatar display logic from Home and Profile components
- Apollo Client GraphQL integration patterns from Employee Profile UI
- Loading skeleton and error state patterns from Profile page
- useAuth hook for role-based access control

### Scope Boundaries

**In Scope:**
- Validation inbox page at `/inbox` route with role-based access (TECH_LEAD and ADMIN only)
- Master-detail interface with expandable/collapsible sidebar navigation
- Hierarchical display: Projects → Team Members → Pending Suggestions
- One-at-a-time suggestion review cards with navigation between suggestions
- Cross-person and cross-project navigation with Previous/Next buttons
- Pending suggestion counts displayed on projects and team members
- Visual selection indicators in sidebar
- Responsive layout (desktop two-column, mobile stacked)
- GraphQL integration with getValidationInbox query
- Loading states and error handling
- Empty states when no projects, team members, or suggestions exist

**Out of Scope:**
- Mutation operations to approve, reject, or adjust suggestions (handled in future spec #11 "Skill Resolution API" and #12 "Skill Resolution UI")
- Filtering options (by suggestion source, proficiency level, date range)
- Sorting options (by date, suggestion count, alphabetical beyond API default)
- Search functionality within inbox
- Bulk selection or batch operations on multiple suggestions
- Real-time updates or GraphQL subscriptions for new pending suggestions
- Email notifications or alerts for new suggestions
- Keyboard shortcuts for navigation
- Pagination or virtualization for large datasets
- Export functionality (CSV, PDF)
- Admin-specific features beyond viewing all projects (no tech lead filtering)
- Profile editing or viewing from inbox interface
- Analytics or metrics dashboard
- Suggestion detail modal or expanded views
- Comments or notes on suggestions
- Suggestion history or audit trail display

### Technical Considerations
- Use existing getValidationInbox GraphQL query which returns hierarchical data structure (InboxResponse → ProjectInbox[] → EmployeeInbox[] → PendingSuggestion[])
- Query returns data filtered by role: TECH_LEAD sees only their projects, ADMIN sees all projects
- EMPLOYEE role should be prevented from accessing route (either via redirect or forbidden message)
- Follow Apollo Client useQuery pattern with loading, error, and data states
- Implement client-side state management for:
  - Currently selected project (for expansion state)
  - Currently selected team member (for review card display)
  - Current suggestion index within selected team member's suggestions
- Navigation logic must handle edge cases:
  - Next person when at last person in last project (wrap to first or disable)
  - Previous person when at first person in first project (wrap to last or disable)
  - Auto-select first team member of first project on page load
- Responsive breakpoints using Tailwind: mobile-first, md breakpoint for desktop layout
- Dark glassmorphism design tokens from existing components
- Badge color coding: proficiency levels, disciplines, suggestion sources (SELF_REPORT vs SYSTEM_FLAG)
- DateTime formatting for created dates (use readable format like "Dec 15, 2025")
- Empty state messaging for no pending suggestions scenario
