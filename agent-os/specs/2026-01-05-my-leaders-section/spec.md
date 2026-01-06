# Specification: My Leaders Section

## Goal
Add a sidebar section to the employee profile page that displays deduplicated Tech Leads from current assignments, showing users which Tech Leads can validate their skill suggestions.

## User Stories
- As an employee, I want to see which Tech Leads can validate my skills so that I know who my validators are
- As an employee, I want to quickly identify my Tech Leads at a glance without navigating through my assignments

## Specific Requirements

**Extract and Display Tech Leads**
- Extract Tech Leads from `profile.currentAssignments[].techLead` data
- Deduplicate Tech Leads by ID to show each unique Tech Lead only once
- Display Tech Lead avatar, name, and email for each leader
- Use read-only display format (no clickable actions or interactions)

**Component Structure and Layout**
- Create new component `MyLeadersSection` in `/apps/web/src/modules/profile/components/`
- Position component between `CurrentAssignments` and `SkillsSection` in profile layout
- Use vertical stack layout on all screen sizes (single column)
- Wrap component with responsive padding wrapper: `px-4 sm:px-6 py-6 sm:py-8`

**Section Header Design**
- Title: "My Leaders" with styling `text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2`
- Subtitle: "Tech Leads who can validate your skills" with styling `text-xs sm:text-sm text-muted-foreground`
- Header container with spacing `mb-4 sm:mb-6`

**Tech Lead Card Layout**
- Single column layout with `gap-3` or `gap-4` between cards
- Each card uses `Card` component with `p-4 sm:p-6 border border-border` styling
- Horizontal flex layout inside card: Avatar on left, Name/Email on right
- Avatar size: `h-8 w-8 border-2 border-background`
- Name styling: `text-sm font-medium text-foreground`
- Email styling: `text-xs text-muted-foreground truncate block`

**Conditional Rendering**
- Hide entire section when `currentAssignments.length === 0`
- Wrap component in conditional check before rendering
- No empty state message needed (section completely hidden when no assignments)

**Data Integration**
- Use existing `useProfile` hook for data access
- Access data via `profile.currentAssignments` array
- Frontend-only implementation (no new GraphQL queries or backend changes)
- Process deduplication client-side using Tech Lead ID

**Responsive Behavior**
- Mobile: Full width cards with compact spacing
- Desktop: Same vertical layout with increased padding
- No grid layout at any breakpoint (always vertical stack)
- Follow mobile-first responsive design patterns

## Visual Design
No visual mockups provided.

## Existing Code to Leverage

**`apps/web/src/modules/profile/components/current-assignments.tsx`**
- Reuse section header structure (title + subtitle pattern with responsive text sizing)
- Copy Tech Lead avatar display pattern from lines 72-96
- Follow card layout structure with `Card` component and consistent padding
- Use same Avatar + Name + Email display format already implemented
- Reference responsive spacing approach (`px-4 sm:px-6 py-6 sm:py-8`)

**`apps/web/src/modules/profile/profile.tsx`**
- Import and integrate new `MyLeadersSection` component between lines 40-41
- Pass `profile.currentAssignments` as prop to component
- Follow existing component integration pattern (ProfileHeader, SeniorityTimeline, etc.)

**`apps/web/src/modules/profile/hooks/use-profile.ts`**
- Use existing `useProfile` hook to access profile data
- No modifications needed to the hook itself
- Profile data structure already includes `currentAssignments` with `techLead` field

**`@/shared/components/ui/card`, `@/shared/components/ui/avatar`**
- Use existing Shadcn UI components (Card, Avatar, AvatarImage, AvatarFallback)
- Follow established component patterns from CurrentAssignments
- No custom styling needed beyond Tailwind classes

**`@/shared/utils/string-utils.ts`**
- Use `getStringInitials` utility function for avatar fallbacks
- Pass Tech Lead name to generate 2-letter initials
- Handle null/undefined names with fallback to 'TL'

## Out of Scope
- Backend API changes or new GraphQL queries/mutations
- Displaying Tech Leads from past or completed projects
- Any interactive features (clicking cards, sending emails, viewing Tech Lead profiles)
- Showing which specific projects each Tech Lead manages for the employee
- Filtering or sorting Tech Leads by any criteria
- Any form of Tech Lead selection or interaction mechanisms
- Email validation workflow integration or triggers
- Multi-column grid layout for Tech Lead cards
- Empty state message or placeholder content when no assignments exist
- Adding new fields to GetProfile query or TechLeadInfo type
