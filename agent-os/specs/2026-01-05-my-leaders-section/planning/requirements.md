# Spec Requirements: My Leaders Section

## Initial Description
Add sidebar component to employee profile showing which Tech Leads can validate them based on current assignments.

## Requirements Discussion

### First Round Questions

**Q1:** I assume this should be a card/sidebar component positioned in the profile page's layout, similar to how "Current Assignments" is displayed. Should it appear above, below, or alongside the Current Assignments section?
**Answer:** Choose the best option (you decide based on the existing profile page layout)

**Q2:** I'm thinking the "My Leaders" section should display the unique Tech Leads extracted from the employee's current assignments (since the data already exists in `currentAssignments.techLead`). Should we show just the Tech Lead's avatar, name, and email, or do you want additional information like which projects they lead for this employee?
**Answer:** Only avatar, name, and email

**Q3:** I assume the section should be titled "My Leaders" with a subtitle like "Tech Leads who can validate your skills". Is that correct, or would you prefer different wording like "Your Validators" or "Tech Leads"?
**Answer:** "My Leaders" with subtitle "Tech Leads who can validate your skills" - approved

**Q4:** I'm thinking that if an employee has multiple assignments under the same Tech Lead, that Tech Lead should only appear once in the list (deduplicated). Is that the desired behavior?
**Answer:** Yes, deduplicate Tech Leads - approved

**Q5:** I assume this should display Tech Lead information in a card format similar to the Current Assignments component, using Avatar + Name + Email with consistent styling. Should each Tech Lead be clickable (maybe showing their profile or opening an email) or just display information?
**Answer:** Just display information (no clickable actions)

**Q6:** I'm thinking the section should show an empty state if there are no current assignments (and thus no Tech Leads). Should it say something like "No Tech Leads - You have no active assignments" or just hide the section entirely?
**Answer:** Hide the section entirely if no current assignments

**Q7:** I assume this feature is frontend-only since the data is already available through the existing `GetProfile` query's `currentAssignments.techLead` field. We won't need any new GraphQL queries or backend changes, correct?
**Answer:** Correct - frontend-only, use existing data from GetProfile query

**Q8:** For responsive design, I'm assuming we follow the same mobile-first approach as Current Assignments with proper spacing adjustments for small screens. Should the Tech Lead cards stack vertically on mobile and display in a grid on larger screens, or always stack vertically given it's a "leaders list"?
**Answer:** Your recommendation is approved (you decide the best approach)

**Q9:** Is there anything you explicitly want to EXCLUDE from this feature? For example, should we NOT show Tech Leads from past/completed projects, only current ones?
**Answer:** Only show Tech Leads from current assignments, not past/completed projects

### Existing Code to Reference

No similar existing features identified for reference.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual assets to analyze.

## Requirements Summary

### Functional Requirements

**Core Functionality:**
- Extract unique Tech Leads from employee's current assignments
- Display deduplicated list of Tech Leads who can validate the employee's skills
- Show Tech Lead avatar, name, and email for each leader
- Hide entire section if employee has no current assignments (no Tech Leads to display)

**User Actions Enabled:**
- View which Tech Leads can validate their skill suggestions
- Identify their validators at a glance
- No interactive actions (display-only component)

**Data to be Managed:**
- Data source: Existing `GetProfile` query's `currentAssignments.techLead` field
- Data processing: Client-side deduplication of Tech Leads by ID
- No new API calls or backend changes required

### Reusability Opportunities

**Components to Reuse:**
- `Card` component from `@/shared/components/ui/card`
- `Avatar`, `AvatarImage`, `AvatarFallback` from `@/shared/components/ui/avatar`
- Utility function `getStringInitials` from `@/shared/utils`
- Existing styling patterns from `CurrentAssignments` component

**Layout Patterns to Follow:**
- Section header structure: title (text-xl sm:text-2xl font-bold) + subtitle (text-xs sm:text-sm text-muted-foreground)
- Card-based layout with consistent padding (p-4 sm:p-6)
- Responsive spacing using px-4 sm:px-6 py-6 sm:py-8 wrapper
- Avatar sizing and border styling (h-8 w-8 border-2 border-background)

**Similar Component Structure:**
- Reference `apps/web/src/modules/profile/components/current-assignments.tsx` for:
  - Section layout and header styling
  - Avatar + Name + Email display pattern
  - Responsive card grid structure
  - Empty state handling approach

### Scope Boundaries

**In Scope:**
- New component: `MyLeadersSection` (or similar name)
- Display deduplicated Tech Leads from current assignments
- Show avatar, name, and email for each Tech Lead
- Conditional rendering (hide if no assignments)
- Responsive design following existing patterns
- Integration into employee profile page layout

**Out of Scope:**
- Backend API changes (no new GraphQL queries/mutations)
- Tech Leads from past/completed projects
- Interactive features (clicking Tech Lead cards, sending emails, viewing profiles)
- Showing which projects each Tech Lead manages
- Filtering or sorting Tech Leads
- Any form of Tech Lead selection or interaction
- Email validation workflow integration

### Technical Considerations

**Integration Points:**
- Insert component into `apps/web/src/modules/profile/profile.tsx`
- Use existing `useProfile` hook for data access
- Access data via `profile.currentAssignments[].techLead`
- No changes to `GetProfile` GraphQL query required

**Existing System Constraints:**
- Frontend-only implementation using React 19
- Must use Shadcn UI components and Tailwind CSS
- Follow mobile-first responsive design patterns
- Maintain consistency with existing profile page sections

**Technology Stack (from tech-stack.md):**
- React 19 with TypeScript
- Tailwind CSS for styling
- Shadcn UI components (Radix UI + Tailwind)
- Lucide React for icons
- No state management needed (data from Apollo Client via useProfile hook)

**Design Decisions:**

**1. Placement Decision:**
Based on analysis of existing profile page (`apps/web/src/modules/profile/profile.tsx`), the current order is:
1. ProfileHeader
2. SeniorityTimeline
3. CurrentAssignments
4. SkillsSection

**Recommended placement:** Between CurrentAssignments and SkillsSection

**Rationale:**
- "My Leaders" is contextually related to assignments (the source of Tech Lead data)
- Placing it immediately after CurrentAssignments creates a logical flow: "Here are your projects → Here are the leaders who validate you → Here are your skills"
- Keeps related content grouped together before transitioning to the skills display
- Creates a narrative: assignments → validators → validated skills

**2. Responsive Design Decision:**

**Recommended approach:** Vertical stack on all screen sizes

**Rationale:**
- Analysis of existing components shows:
  - CurrentAssignments: 2-column grid on md+ screens
  - Core Stack skills: 2-4 column grid
  - Pending skills: 3-column grid on md+
- However, "My Leaders" is typically a shorter list (1-3 Tech Leads in most cases)
- A vertical list provides better readability for contact information (name + email)
- Prevents awkward single-item rows on larger screens when only 1-2 leaders exist
- Consistent with "list of people" UI pattern vs "grid of items" pattern
- Allows for potential future expansion (e.g., adding a note about which projects each Tech Lead manages)

**Layout specification:**
- Single column layout on all screen sizes
- Cards stack vertically with gap-3 or gap-4
- Each card: Avatar on left, Name/Email on right (flex row layout)
- Mobile: Full width cards with compact spacing
- Desktop: Same layout, just more breathing room with larger padding

**3. Empty State Decision:**

**Recommended approach:** Hide section entirely (conditional rendering)

**Rationale:**
- User specified: "Hide the section entirely if no current assignments"
- Cleaner UI when not applicable
- Prevents unnecessary visual clutter
- Implementation: Wrap entire section in conditional check for `currentAssignments.length > 0`
