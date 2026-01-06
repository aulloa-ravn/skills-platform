# Spec Requirements: Admin Skills Management UI

## Initial Description
**Item 14: Admin Skills Management UI** - Create admin interface for viewing, adding, and editing skills in the taxonomy with discipline assignment

## Requirements Discussion

### First Round Questions

**Q1:** I assume the admin skills page should follow the existing module pattern (dedicated route at `/_authenticated/admin/skills` with role guard for ADMIN type only). Is that correct, or should it be accessible to Tech Leads as well?

**Answer:** Correct - dedicated route at `/_authenticated/admin/skills` with role guard for ADMIN type only

**Q2:** For the skills table/list view, I'm thinking we should display: skill name, discipline (with color coding similar to how the validation inbox uses badges), active status, and action buttons (Edit, Enable/Disable). Should we also show creation/update timestamps, or keep it minimal?

**Answer:** Keep minimal - skill name, discipline (with color coding/badges), active status, and action buttons (Edit, Enable/Disable). Do NOT show creation/update timestamps

**Q3:** I assume the interface should have filtering capabilities matching what the backend already supports (filter by isActive status, filter by disciplines using multi-select, and search by skill name). Should we also add sorting options (e.g., alphabetical, by discipline, by creation date)?

**Answer:** Yes, implement filtering (isActive status, disciplines multi-select, search by skill name) and add sorting options (alphabetical, by discipline, by creation date)

**Q4:** For adding/editing skills, I'm thinking we should use a modal dialog (similar to how Shadcn UI patterns work) with a form containing: skill name input field and discipline dropdown (using the existing Discipline enum). Is that the right approach, or would you prefer a dedicated page for create/edit?

**Answer:** Correct - use modal dialog with form containing skill name input and discipline dropdown

**Q5:** I assume that when a skill is "disabled" (isActive = false), it should still appear in the list but be visually distinguished (grayed out or with a badge), and there should be a toggle to show/hide inactive skills. Is that correct?

**Answer:** Correct - disabled skills appear in list with visual distinction (grayed out or badge), with toggle to show/hide inactive skills

**Q6:** The backend already has separate `disableSkill` and `enableSkill` mutations. Should the UI present this as a toggle switch in the table row, or as an action menu item that changes based on current state?

**Answer:** Use a toggle switch in the table row (not action menu item)

**Q7:** For validation, I'm assuming we should prevent duplicate skill names (case-insensitive) and require both name and discipline fields. Should we also prevent editing/disabling skills that are currently in use by employees or pending suggestions, or allow that with a warning?

**Answer:** Allow editing/disabling skills that are in use, but show a warning

**Q8:** Is there anything that should NOT be included in this interface? For example, should we avoid showing skill usage statistics (how many employees have each skill), or is the scope strictly limited to CRUD operations on the taxonomy itself?

**Answer:** ADD how many employees have each skill (this IS in scope - show skill usage statistics)

### Follow-up Questions

**Follow-up 1:** You mentioned showing how many employees have each skill (in scope). Should this be displayed as a simple count in a table column (e.g., "12 employees"), or would you prefer a more detailed breakdown showing the count by proficiency level (e.g., "2 Novice, 5 Intermediate, 3 Advanced, 2 Expert")?

**Answer:** Simple count in a table column (e.g., "12 employees")

**Follow-up 2:** When viewing disabled skills, should the employee count reflect all employees who have ever had that skill (including inactive ones), or only currently active employee skills?

**Answer:** Only currently active employee skills

**Follow-up 3:** You mentioned showing a warning when editing/disabling skills that are in use. Should this warning appear in the modal form before submission, or as a confirmation dialog after clicking save/disable? And should it show the specific count of affected employees?

**Answer:** Warning should appear in the modal form before submission, and it should show the specific count of affected employees

**Follow-up 4:** I noticed the codebase already has a Shadcn Table component and Badge component with DisciplineMap for color coding disciplines. However, I don't see a Dialog component (only AlertDialog). Should we use AlertDialog for the create/edit modal, or would you prefer I add a proper Dialog component from Shadcn UI first?

**Answer:** Use AlertDialog for the create/edit modal

**Follow-up 5:** For the enable/disable toggle in the table row, I don't see a Switch component in the shared UI components. Should I add the Shadcn Switch component, or would you prefer a different UI pattern (like a button that changes state)?

**Answer:** Use the Switch component at `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/components/ui/switch.tsx`

**Follow-up 6:** For filtering by multiple disciplines, I see there's a Combobox component. Should we use this for multi-select, or would you prefer a different pattern like checkboxes in a dropdown menu?

**Answer:** Use checkboxes in a dropdown menu

## Existing Code to Reference

**Similar Features Identified:**

Based on codebase analysis, the following existing patterns should be referenced:

- **Validation Inbox Module**: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/validation-inbox/`
  - Pattern for module structure (components, hooks, graphql folders)
  - Badge usage for disciplines with DisciplineMap color coding
  - Master-detail layout patterns
  - GraphQL query/mutation hooks pattern

- **Profile Module**: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/profile/`
  - Module organization pattern
  - Component composition approach
  - Loading and error state handling

- **Backend Skills API**: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/`
  - GraphQL resolver with getAllSkills, getSkillById, createSkill, updateSkill, disableSkill, enableSkill
  - GetAllSkillsInput with filtering (isActive, disciplines, searchTerm)
  - CreateSkillInput and UpdateSkillInput DTOs
  - Role-based guards (ADMIN only)

- **Shared UI Components**:
  - Table: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/components/ui/table.tsx`
  - Badge: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/components/ui/badge.tsx`
  - AlertDialog: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/components/ui/alert-dialog.tsx`
  - Switch: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/components/ui/switch.tsx`
  - Dropdown Menu: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/components/ui/dropdown-menu.tsx`
  - Checkbox: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/components/ui/checkbox.tsx`
  - Input: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/components/ui/input.tsx`
  - Select: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/components/ui/select.tsx`
  - Button: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/components/ui/button.tsx`
  - Spinner: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/components/ui/spinner.tsx`

- **Utility Functions**:
  - DisciplineMap: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/utils/map-enums.ts`
  - String utils: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/utils/string-utils.ts`
  - Style utils (cn): `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/utils/style-utils.ts`

- **Prisma Schema**: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/prisma/schema.prisma`
  - Skill model with id, name, discipline, isActive, createdAt, updatedAt
  - Discipline enum with all categories
  - EmployeeSkill junction table for usage counts

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual assets were provided for this specification.

## Requirements Summary

### Functional Requirements

**Core Functionality:**
- Admin-only interface for managing the canonical skills taxonomy
- View all skills in a table with filtering, searching, and sorting
- Add new skills with name and discipline assignment
- Edit existing skills (name and/or discipline)
- Enable/disable skills with toggle switch
- Display employee usage count for each skill
- Show warnings when editing/disabling in-use skills

**User Actions Enabled:**
- Browse complete skills taxonomy in table format
- Filter skills by active status (show/hide inactive)
- Filter skills by one or more disciplines (multi-select)
- Search skills by name (text search)
- Sort skills alphabetically, by discipline, or by creation date
- Create new skill with name and discipline
- Edit skill name and/or discipline
- Toggle skill active status (enable/disable)
- View how many employees currently have each skill

**Data Management:**
- CRUD operations on Skill model (id, name, discipline, isActive)
- Employee usage count based on active EmployeeSkill records only
- Validation: prevent duplicate skill names (case-insensitive)
- Validation: require both name and discipline fields
- Warning display: show count of affected employees when editing/disabling in-use skills

### Reusability Opportunities

**Frontend Patterns:**
- Follow validation-inbox module structure (components, hooks, graphql folders)
- Reuse Badge component with DisciplineMap for discipline display
- Reuse existing UI components (Table, Switch, AlertDialog, Dropdown, Checkbox, Input, Select, Button, Spinner)
- Follow profile module patterns for loading/error states
- Reuse utility functions (cn, DisciplineMap)

**Backend Patterns:**
- Backend API already exists with all required queries and mutations
- Use getAllSkills query with GetAllSkillsInput filters
- Use createSkill, updateSkill, disableSkill, enableSkill mutations
- All endpoints already have ADMIN role guard implemented
- May need to extend getAllSkills response to include employee usage count

**GraphQL Integration:**
- Follow validation-inbox pattern for GraphQL hooks (useQuery, useMutation)
- Apollo Client v4 for data fetching
- GraphQL Code Generator for type generation

### Scope Boundaries

**In Scope:**
- Admin skills management interface at `/_authenticated/admin/skills` route
- Table view with all skills and their metadata
- Filtering by active status, disciplines (multi-select), and search term
- Sorting by name (alphabetical), discipline, and creation date
- Add new skill via AlertDialog modal form
- Edit existing skill via AlertDialog modal form
- Enable/disable skill via Switch toggle in table row
- Display employee usage count (count of active EmployeeSkill records)
- Warning in modal form when editing/disabling in-use skills (showing affected employee count)
- Role guard restricting access to ADMIN type only
- Visual distinction for disabled skills (grayed out or badge)
- Toggle to show/hide inactive skills in table
- Form validation (duplicate names, required fields)

**Out of Scope:**
- Detailed proficiency-level breakdown of employee usage (only show total count)
- Deleting skills (only enable/disable)
- Bulk operations (bulk edit, bulk disable)
- Skill usage history or analytics
- Exporting skills data
- Creating new disciplines (use existing Discipline enum)
- Showing creation/update timestamps in table
- Preventing edits/disables on in-use skills (allow with warning)
- Email notifications to employees when their skills are edited/disabled
- Audit log of skill changes
- Tech Lead access (ADMIN only)

### Technical Considerations

**Frontend Architecture:**
- React 19 with Vite 7 build tool
- Tanstack Router for routing with role-based guards
- Tanstack React Form for modal form handling
- Shadcn UI components (Radix UI + Tailwind CSS)
- Apollo Client v4 for GraphQL queries/mutations
- Zustand for client state (if needed for UI state like filters)
- Zod for form validation
- Sonner for toast notifications

**Backend Integration:**
- GraphQL API already implemented at `/apps/api/src/skills/`
- Queries: getAllSkills (with optional GetAllSkillsInput), getSkillById
- Mutations: createSkill, updateSkill, disableSkill, enableSkill
- All endpoints protected with JwtAuthGuard and RolesGuard (ADMIN only)
- May need to extend Skill response type to include employeeCount field

**Database Constraints:**
- Skill model: id (autoincrement), name (unique), discipline (enum), isActive (boolean)
- EmployeeSkill junction table for counting active employee skills
- Need to query EmployeeSkill count grouped by skillId where isActive = true

**UI Component Patterns:**
- Use existing Table component for skills list
- Use Badge with DisciplineMap for discipline color coding
- Use Switch component for enable/disable toggle
- Use AlertDialog for create/edit modal forms
- Use Dropdown Menu with Checkboxes for multi-select discipline filter
- Use Input for search and skill name fields
- Use Select for discipline dropdown in forms
- Use Button for actions (Add Skill, Submit, Cancel)
- Use Spinner for loading states

**Validation Rules:**
- Skill name required (non-empty string)
- Discipline required (must be valid Discipline enum value)
- Skill name must be unique (case-insensitive check)
- Show warning in form when editing/disabling skill with active employee usage (include count)

**Existing Code to Leverage:**
- Backend skills resolver and service already complete
- DisciplineMap for human-readable discipline labels
- Badge component for discipline display
- Switch component for active/inactive toggle
- AlertDialog for modal forms
- Table component for data display
- Validation-inbox module as structural reference
- Profile module for loading/error patterns
