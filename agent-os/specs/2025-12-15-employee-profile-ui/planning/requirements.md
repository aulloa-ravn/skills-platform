# Spec Requirements: Employee Profile UI

## Initial Description
Employee Profile UI — Create profile dashboard displaying employee header, seniority timeline visualization, and tiered skills display (Core Stack, Validated Inventory, Pending)

## Requirements Discussion

### First Round Questions

**Q1:** Routing & Navigation - I assume we'll create a new route `/profile/:id` accessible from the home page, with the logged-in user's profile link being most prominent (perhaps in the header next to the logout button or as a "View My Profile" card on the home page). Should we also support viewing other people's profiles through this route (subject to authorization), or should we only allow viewing your own profile for now?

**Answer:** Own profile for now - create route for viewing logged-in user's profile only.

**Q2:** Page Layout - I'm thinking we should follow the existing dark glassmorphism design from the Login and Home pages (backdrop-blur-xl bg-gray-800/40 with starry background). The profile page would have: (1) a header section with avatar, name, email, current seniority level badge, (2) a seniority timeline visualization section below that, and (3) a three-column tiered skills section (Core Stack | Validated Inventory | Pending). Does this layout sound right, or would you prefer a different arrangement?

**Answer:** Approved - follow dark glassmorphism design with header section, seniority timeline, and three-column tiered skills section.

**Q3:** Seniority Timeline Visualization - For displaying the seniority history timeline, should we create a horizontal timeline with date markers and seniority level badges (similar to a career progression chart), or would you prefer a simpler vertical list of seniority records sorted by date? If horizontal timeline, should it show all history entries or just the last 3-5 milestones?

**Answer:** Horizontal timeline showing last 3 milestones with an option to expand to show full history.

**Q4:** Skills Display Format - For the three tiers (Core Stack, Validated Inventory, Pending), I assume each tier should be a distinct card/section with skills displayed as badges/pills showing: skill name, discipline tag, proficiency level, and for validated skills the validator name and date. Should we display all skills in each tier, or paginate/limit the display (e.g., show top 10 with "View More")?

**Answer:** Top 10 skills per tier with "View More" button to expand and show all skills.

**Q5:** Current Assignments Section - The Employee Profile API returns current assignments with tech lead info. Should we display this information in a dedicated "Current Projects" section on the profile page (showing project name, role, and tech lead contact), or should we skip this for now since the main focus is skills?

**Answer:** Yes, include it - display "Current Projects" section with project name, role, and tech lead info.

**Q6:** Empty States - When a user has no skills in a tier (e.g., no pending suggestions), should we show an empty state message like "No pending skills" with an optional action button like "Suggest a new skill", or just hide that tier entirely?

**Answer:** Show optional action button (like "Suggest a new skill" for empty pending tier).

**Q7:** Responsive Design - I'm assuming mobile-first responsive design following Tailwind's responsive utilities, with the three-tier skills section stacking vertically on mobile and displaying side-by-side on larger screens. Is that correct?

**Answer:** Approved - mobile-first with vertical stacking on mobile, side-by-side on larger screens.

**Q8:** Data Loading & Error States - Should we display a loading skeleton (gray pulsing placeholders matching the layout) while fetching profile data, and a friendly error message with a retry button if the GraphQL query fails?

**Answer:** Yes - loading skeletons while fetching and friendly error messages with retry button.

**Q9:** Exclusions - Is there anything specific you want to explicitly exclude from this first version? For example, profile editing, skill actions (approve/reject/suggest), admin features, or profile search/listing?

**Answer:** Exclude profile editing from this first version.

### Existing Code to Reference

**Similar Features Identified:**
- Page Structure: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/App.tsx` - Home component demonstrates the dark glassmorphism design pattern (backdrop-blur-xl bg-gray-800/40, starry background with gradient orbs, card layouts)
- Authentication Context: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/contexts/AuthContext.tsx` - Provides useAuth hook with profile data and authentication state
- Protected Route Pattern: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/App.tsx` - ProtectedRoute wrapper component for route guards
- Login Page: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/pages/Login.tsx` - Demonstrates consistent visual styling and form patterns
- Backend API: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/agent-os/specs/2025-12-15-employee-profile-api/spec.md` - Complete Employee Profile API specification with GraphQL query structure

**Components to potentially reuse:**
- Card layout patterns from Home component (stat cards with icons, backdrop-blur styling)
- Avatar display logic from Home component (gradient background with initials)
- Badge/pill components for displaying role (can be adapted for proficiency levels and disciplines)
- Loading and error state patterns from Login page
- Navigation patterns from App.tsx routing structure

**Backend logic to reference:**
- GraphQL `getProfile` query from Employee Profile API
- Three-tier skills organization logic (Core Stack, Validated Inventory, Pending)
- Authorization logic for profile access
- Profile response DTOs and type structures

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual assets to analyze.

## Requirements Summary

### Functional Requirements

**Routing & Navigation**
- Create new route `/profile` for viewing the logged-in user's own profile
- Add navigation link to profile page (in header or on home page)
- Use protected route pattern to ensure authentication
- Only support viewing own profile (no viewing other employees' profiles)

**Page Layout & Design**
- Follow existing dark glassmorphism design system:
  - Dark gradient background (from-gray-900 via-gray-800 to-gray-900)
  - Starry background effect with small white dots and gradient orbs
  - Backdrop-blur-xl bg-gray-800/40 for content cards
  - Border styling: border-gray-700/50
- Four main sections vertically stacked:
  1. Profile header with avatar, name, email, seniority badge
  2. Seniority timeline visualization
  3. Current projects section
  4. Three-tier skills display

**Profile Header Section**
- Display large circular avatar with gradient background and user initials
- Show user name prominently (large heading)
- Display email address with icon
- Show current seniority level as a badge (similar to role badge on home page)
- Optional: Show avatar image if avatarUrl exists in profile data

**Seniority Timeline Visualization**
- Horizontal timeline showing seniority progression
- Display last 3 milestones by default
- Each milestone shows: seniority level, effective date, creator name (if available)
- Include "Show Full History" button to expand and reveal all seniority records
- Timeline should be visually appealing (dots/nodes connected by lines)
- Collapse back to 3 milestones with "Show Less" when expanded

**Current Projects Section**
- Display all current assignments from profile data
- For each assignment show:
  - Project name (prominent)
  - Assignment role
  - Assignment tags (as skill badges)
  - Tech lead information: name and email (if available)
- Card-based layout consistent with other sections
- Handle case when no current assignments exist

**Three-Tier Skills Display**
- Three separate card sections displayed side-by-side on large screens, stacked on mobile
- **Tier 1 - Core Stack:** Validated skills matching current project tags
- **Tier 2 - Validated Inventory:** Other approved skills not in core stack
- **Tier 3 - Pending:** Skills awaiting validation

**Skills Display Format (Per Tier)**
- Show top 10 skills per tier by default
- Each skill displayed as card/badge with:
  - Skill name (prominent)
  - Discipline tag/badge
  - Proficiency level (for validated and pending)
  - For validated skills: validator name and validation date
- "View More" button at bottom of tier if more than 10 skills exist
- Expand to show all skills when "View More" clicked
- "View Less" button when expanded to collapse back to top 10

**Empty States**
- When a tier has no skills, display empty state message
- For Pending tier: Show "No pending skills" with "Suggest a new skill" button
- For Core Stack and Validated Inventory: Show appropriate empty message
- Empty state buttons should be styled as secondary actions (not primary)

**Data Loading States**
- Display loading skeleton placeholders while GraphQL query is in flight
- Skeleton should match the layout structure (header, timeline, projects, skills)
- Use gray pulsing animation for skeletons
- Maintain consistent card borders and spacing during loading

**Error States**
- Display friendly error message if GraphQL query fails
- Show error card with descriptive message
- Include "Retry" button to re-fetch data
- Error styling should be consistent with login error patterns

**Responsive Design**
- Mobile-first approach using Tailwind CSS responsive utilities
- Mobile (< 768px):
  - Stack all sections vertically
  - Skills tiers stack vertically
  - Horizontal timeline may need to scroll horizontally or adapt to vertical
- Tablet/Desktop (≥ 768px):
  - Skills tiers display side-by-side in three columns
  - Horizontal timeline displays fully
  - Maintain consistent spacing and card widths

**GraphQL Integration**
- Use Apollo Client to query `getProfile` endpoint
- Pass logged-in user's profile ID as argument
- Handle authentication via existing JWT mechanism
- Use Apollo's loading and error states
- Consider using Apollo's cache for optimized re-renders

### Reusability Opportunities
- Reuse card layout patterns from Home component for consistent styling
- Reuse avatar display logic (gradient background with initials)
- Reuse badge/pill components for roles, proficiency levels, and disciplines
- Leverage existing AuthContext to get logged-in user's profile ID
- Leverage existing ProtectedRoute wrapper for authentication guard
- Follow GraphQL query patterns from Employee Profile API spec
- Reuse starry background and glassmorphism styling patterns

### Scope Boundaries

**In Scope:**
- Profile page displaying logged-in user's own profile data
- Profile header with avatar, name, email, seniority badge
- Horizontal seniority timeline with expand/collapse functionality
- Current projects section with tech lead information
- Three-tier skills display (Core Stack, Validated Inventory, Pending)
- Top 10 skills per tier with expand/collapse to show all
- Empty states with action buttons
- Loading skeletons during data fetch
- Error states with retry functionality
- Fully responsive design (mobile-first)
- GraphQL integration with Employee Profile API
- Navigation from home page to profile page

**Out of Scope:**
- Profile editing capabilities
- Viewing other employees' profiles
- Skill actions (approve, reject, adjust proficiency)
- Suggesting new skills from profile page
- Admin features (managing taxonomy, seniority history)
- Profile search or listing all employees
- Pagination for large skill lists (using expand/collapse instead)
- Filtering or sorting skills within tiers
- Real-time updates or subscriptions
- Avatar image upload
- Exporting profile data
- Printing profile view
- Sharing profile externally

### Technical Considerations

**Tech Stack:**
- React 19 with TypeScript
- Vite 7 for build tooling
- Apollo Client for GraphQL queries
- Tailwind CSS for styling
- React Router for routing
- Zustand (if needed for component state)

**Integration Points:**
- Employee Profile API GraphQL endpoint: `getProfile(id: String!)`
- AuthContext for getting logged-in user's profile ID
- Existing protected route pattern for authentication
- Apollo Client instance configured in `/apps/client/src/apollo/client`

**Existing System Constraints:**
- Must follow JWT authentication pattern
- Must use existing dark glassmorphism design system
- Must integrate with Employee Profile API (already implemented)
- Must handle authorization failures gracefully (user can only view own profile)

**Similar Code Patterns to Follow:**
- Component structure from Login.tsx and Home component in App.tsx
- Protected routing from App.tsx
- GraphQL query usage with Apollo Client hooks (useQuery)
- Tailwind utility classes for glassmorphism and dark theme
- Error handling patterns from Login page
- Loading states and disabled button patterns from Login form
