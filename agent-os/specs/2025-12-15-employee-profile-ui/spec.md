# Specification: Employee Profile UI

## Goal
Create a profile dashboard displaying employee header, seniority timeline visualization, current projects section, and tiered skills display (Core Stack, Validated Inventory, Pending) with responsive design following the existing dark glassmorphism theme.

## User Stories
- As an employee, I want to view my own profile so that I can see my validated skills, pending suggestions, seniority history, and current assignments
- As an employee, I want to expand skill tiers and seniority history so that I can view comprehensive information beyond the default summary view

## Specific Requirements

**Routing & Navigation**
- Create new protected route at `/profile` for viewing logged-in user's profile
- Add ProtectedRoute wrapper using existing pattern from App.tsx to ensure authentication
- Add navigation link to profile page from Home component (either in header near logout button or as prominent card)
- Use React Router's useNavigate hook for programmatic navigation

**Page Layout Structure**
- Follow existing dark glassmorphism design: dark gradient background (from-gray-900 via-gray-800 to-gray-900), starry background with white dots and gradient orbs, backdrop-blur-xl bg-gray-800/40 for cards
- Four vertically stacked main sections: profile header, seniority timeline, current projects, three-tier skills display
- Use max-w-6xl container with mx-auto for consistent width with Home page
- Apply consistent padding (px-4 py-8) and spacing between sections (mb-6 or gap-6)

**Profile Header Section**
- Large circular avatar (w-20 h-20) with gradient background (from-purple-500 to-indigo-500) displaying user initials
- User name displayed prominently as large heading (text-3xl font-bold text-white)
- Email address with mail icon (similar to Home component pattern)
- Current seniority level displayed as badge using existing role badge styling (bg-purple-500/20 text-purple-300 border border-purple-500/30)
- Card should use backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50 p-8

**Seniority Timeline Visualization**
- Horizontal timeline displaying seniority progression with visual markers (dots/nodes connected by lines)
- Display last 3 milestones by default, each showing seniority level, effective date (formatted as readable string), and creator name if available
- "Show Full History" button to expand and reveal all seniority records (toggle state using React useState)
- "Show Less" button when expanded to collapse back to 3 milestones
- Timeline nodes should use gradient circles similar to avatar styling, connected by border lines
- Empty state message if no seniority history exists

**Current Projects Section**
- Card-based layout displaying all current assignments from profile data
- Each assignment card shows project name (prominent heading), assignment role, assignment tags as skill badges, tech lead name and email with person icon
- Use grid layout for multiple assignments (grid-cols-1 md:grid-cols-2 gap-4)
- Empty state message "No current assignments" if assignments array is empty
- Tags displayed as small rounded badges similar to proficiency/discipline styling

**Three-Tier Skills Display**
- Three separate card sections for Core Stack, Validated Inventory, and Pending tiers
- Layout: stacked vertically on mobile (< 768px), side-by-side in three columns on tablet/desktop (md:grid-cols-3)
- Each tier card has header with tier name and skill count, body with skill list, and optional "View More/Less" button
- Show top 10 skills per tier by default, use useState to track expanded state per tier
- "View More" button appears only if tier has more than 10 skills, expands to show all
- "View Less" button when expanded to collapse back to top 10

**Skills Display Format**
- Each skill displayed as card within tier with skill name (font-semibold text-white), discipline badge (colored by type: bg-blue-500/20 text-blue-300 for Engineering, etc.)
- Proficiency level badge for validated and pending skills
- For validated skills: display validator name and validation date (formatted as "Validated by [name] on [date]") in smaller gray text
- Card styling: bg-gray-700/30 rounded-lg p-4 border border-gray-600/50 with hover effect
- Space skills within tier using flex or grid layout with consistent gaps

**Empty States**
- For Pending tier with no skills: show message "No pending skills" with secondary button "Suggest a new skill" (styled as bg-gray-700/30 hover:bg-gray-600/30)
- For Core Stack with no skills: show message "No core stack skills yet"
- For Validated Inventory with no skills: show message "No validated skills in inventory"
- Empty state buttons should not perform actions in this version, but should be styled consistently for future functionality

**GraphQL Integration**
- Create getProfile query in new queries.ts file following pattern from mutations.ts (use gql template tag)
- Query should request all fields from ProfileResponse type including nested skills (coreStack, validatedInventory, pending), seniorityHistory, and currentAssignments
- Use Apollo Client's useQuery hook in Profile component with profileId from useAuth context
- Pass profile.id from AuthContext as query variable
- Handle query loading, error, and data states using Apollo's return values

**Data Loading State**
- Display loading skeleton placeholders while useQuery loading is true
- Skeleton should match layout structure: header skeleton, timeline skeleton with 3 gray pulsing rectangles, projects skeleton, skills skeleton with 3 columns
- Use Tailwind animate-pulse utility on gray rectangles (bg-gray-700/30) to create pulsing effect
- Maintain consistent card borders and spacing during loading state

**Error State**
- Display error card with friendly message when useQuery returns error
- Error card styling: bg-red-500/10 border border-red-500/20 rounded-lg p-6
- Show error message from GraphQL error or fallback: "Failed to load profile. Please try again."
- Include "Retry" button that calls refetch function from useQuery hook
- Button styled consistently with primary action buttons

**Responsive Design**
- Mobile-first approach: all sections stack vertically, skills tiers stack vertically, horizontal timeline scrolls horizontally if needed (overflow-x-auto)
- Tablet/Desktop (md breakpoint): skills tiers display in three-column grid (grid-cols-3), timeline displays fully horizontally, assignments use two-column grid
- Use Tailwind responsive utilities: hidden sm:block for selective visibility, md:grid-cols-2 and md:grid-cols-3 for responsive grids
- Ensure touch-friendly button sizes on mobile (min height py-3) and adequate spacing

## Visual Design
No visual mockups provided for this feature.

## Existing Code to Leverage

**ProtectedRoute Pattern from App.tsx**
- Reuse ProtectedRoute component wrapper that checks isAuthenticated from useAuth hook
- Redirects to /login if not authenticated using Navigate component
- Apply to Profile page route in App.tsx Routes configuration

**Dark Glassmorphism Design from Home and Login**
- Reuse starry background effect with scattered white dots (absolute positioned divs with bg-white/40 rounded-full)
- Reuse gradient orbs (purple-600/5 and indigo-600/5 with blur-3xl)
- Reuse card styling: backdrop-blur-xl bg-gray-800/40 rounded-2xl border border-gray-700/50
- Reuse dark gradient background: bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900

**Avatar Display Logic from Home and LogoutButton**
- Reuse circular avatar with gradient background (w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full)
- Display user initials using profile.name.charAt(0).toUpperCase()
- Center initials with flex items-center justify-center and font-bold text styling

**Badge Components from Home Component**
- Reuse role badge styling for seniority level: inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30
- Adapt for discipline badges and proficiency levels with different color schemes (blue, green, yellow variations)

**AuthContext Integration**
- Use useAuth hook to get profile.id for GraphQL query variable
- Ensure profile data exists before rendering (auth should guarantee this after protected route)
- Access isAuthenticated for route protection logic

**Apollo Client GraphQL Pattern**
- Follow LOGIN_MUTATION pattern from mutations.ts to create GET_PROFILE_QUERY in queries.ts
- Use gql template tag to define query with nested selection sets for skills, history, and assignments
- Import apolloClient from apollo/client.ts for cache management if needed
- Use useQuery hook with query, variables, and destructure loading, error, data, refetch

## Out of Scope
- Profile editing capabilities (updating name, email, avatar, seniority)
- Viewing other employees' profiles (only own profile in this version)
- Skill actions from profile page (approve, reject, adjust proficiency for pending skills)
- Suggesting new skills from profile page (empty state button does not perform action)
- Filtering or sorting skills within tiers beyond default ordering
- Pagination for skills beyond expand/collapse to show all
- Real-time updates or GraphQL subscriptions for profile changes
- Avatar image upload or external avatar URL rendering
- Exporting or sharing profile data
- Printing optimized view
- Search or autocomplete within skill lists
- Skill detail modal or drill-down views
- Analytics or metrics visualization beyond what API provides
- Admin features or tech lead specific views
