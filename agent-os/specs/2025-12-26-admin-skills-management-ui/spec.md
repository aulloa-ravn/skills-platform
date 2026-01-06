# Specification: Admin Skills Management UI

## Goal
Create an admin-only interface at `/_authenticated/admin/skills` that enables ADMIN users to view, add, edit, and enable/disable skills in the canonical taxonomy with discipline assignment, employee usage tracking, and comprehensive filtering and sorting capabilities.

## User Stories
- As an admin, I want to view all skills in a filterable table so that I can manage the canonical skills taxonomy
- As an admin, I want to add and edit skills with discipline assignments so that the taxonomy stays organized and accurate
- As an admin, I want to see employee usage counts and warnings when editing in-use skills so that I understand the impact of my changes

## Specific Requirements

**Admin-Only Route with Role Guard**
- Create route at `/_authenticated/admin/skills` using Tanstack Router
- Apply role guard restricting access to ProfileType.ADMIN only
- Follow validation-inbox route pattern for module integration
- Display unauthorized message for non-admin users attempting access

**Skills Table Display**
- Use Shadcn Table component to display all skills
- Show columns: skill name, discipline badge, employee count, active status toggle, and edit action button
- Display discipline using Badge component with DisciplineMap color coding (follow validation-inbox pattern)
- Show employee usage count as simple number in dedicated column (e.g., "12 employees")
- Visually distinguish disabled skills with grayed-out text or inactive badge
- Include loading state with Spinner during data fetch
- Show empty state message when no skills match filters

**Filtering Capabilities**
- Implement show/hide inactive skills toggle (checkbox or switch) to filter by isActive status
- Provide multi-select discipline filter using Dropdown Menu with Checkboxes (not Combobox)
- Add search input field for filtering by skill name (case-insensitive partial match)
- Apply all filters simultaneously to narrow results
- Clear individual filters or all filters at once

**Sorting Options**
- Add sorting dropdown with three options: alphabetical (by name), by discipline, and by creation date
- Default sort to alphabetical ascending
- Apply sort after filters are applied
- Show current sort selection in UI

**Add New Skill Modal**
- Use AlertDialog component for modal (follow validation-inbox AlertDialog pattern)
- Trigger via "Add Skill" button positioned above table
- Form fields: skill name (Input component) and discipline (Select dropdown with all Discipline enum values)
- Validate name is required and not empty
- Validate discipline is required and valid enum value
- Check for duplicate skill names (case-insensitive) before submission
- Display error message if duplicate name detected
- Submit using createSkill mutation
- Close modal and refresh table on successful creation
- Show success toast notification using Sonner

**Edit Existing Skill Modal**
- Use AlertDialog component for modal (consistent with add modal)
- Trigger via "Edit" button in table row
- Pre-populate form with existing skill name and discipline
- Allow editing either name or discipline or both
- Validate name uniqueness (case-insensitive) excluding current skill ID
- If skill has active employee usage, display warning in modal before submission showing count of affected employees
- Submit using updateSkill mutation
- Close modal and refresh table on successful update
- Show success toast notification using Sonner

**Enable/Disable Skill Toggle**
- Use Switch component in table row for active/inactive status
- Toggle calls enableSkill or disableSkill mutation based on current state
- If skill has active employee usage, show warning in modal before disabling with count of affected employees
- Optimistically update UI while mutation is in progress
- Show error toast if mutation fails and revert optimistic update
- Show success toast on successful toggle

**Employee Usage Count Display**
- Query count of active EmployeeSkill records grouped by skillId where isActive = true
- Display count in dedicated table column (e.g., "5" or "0")
- Update count after skill edits or status changes
- Use this count to determine when to show warnings for editing/disabling in-use skills

**GraphQL Integration**
- Use getAllSkills query with GetAllSkillsInput filters (isActive, disciplines array, searchTerm)
- Extend Skill GraphQL response type to include employeeCount field (backend change required)
- Use createSkill mutation with CreateSkillInput (name, discipline)
- Use updateSkill mutation with UpdateSkillInput (id, name optional, discipline optional)
- Use enableSkill mutation with skill ID
- Use disableSkill mutation with skill ID
- Create custom hooks following validation-inbox pattern (useSkills, useCreateSkill, useUpdateSkill, useToggleSkill)
- Store hooks in `/modules/admin-skills/hooks/` directory
- Generate GraphQL types using GraphQL Code Generator in `/modules/admin-skills/graphql/` directory

**Module Structure**
- Create module at `/apps/web/src/modules/admin-skills/`
- Organize with subdirectories: components, hooks, graphql
- Main component: `/modules/admin-skills/admin-skills.tsx`
- Hook files: `use-skills.ts`, `use-create-skill.ts`, `use-update-skill.ts`, `use-toggle-skill.ts`
- GraphQL files: query and mutation .graphql files with generated .tsx files
- Follow validation-inbox module structure exactly

## Visual Design

No visual assets were provided for this specification.

## Existing Code to Leverage

**Backend Skills API**
- GraphQL resolver at `/apps/api/src/skills/skills.resolver.ts` with getAllSkills query and createSkill, updateSkill, disableSkill, enableSkill mutations
- SkillsService at `/apps/api/src/skills/skills.service.ts` with business logic for name uniqueness validation, filtering, and CRUD operations
- GetAllSkillsInput DTO with isActive, disciplines array, and searchTerm filters
- All endpoints protected with JwtAuthGuard and RolesGuard requiring ProfileType.ADMIN
- Need to extend to add employeeCount field to Skill response type by querying EmployeeSkill table

**Validation Inbox Module Structure**
- Module organization pattern with components, hooks, and graphql subdirectories at `/apps/web/src/modules/validation-inbox/`
- AlertDialog usage for confirm/reject actions with loading states
- Badge component with DisciplineMap for color-coded discipline display
- useQuery hook pattern (useValidationInbox) for data fetching with loading and error states
- useMutation hook pattern (useResolveSuggestions) with toast notifications, optimistic updates, and cache updates
- Responsive layout patterns and empty state handling

**DisciplineMap Utility**
- Located at `/apps/web/src/shared/utils/map-enums.ts`
- Maps Discipline enum values to human-readable labels
- Used with Badge component for consistent discipline display across validation-inbox

**Shadcn UI Components**
- Table component at `/apps/web/src/shared/components/ui/table.tsx` for data display
- Badge component at `/apps/web/src/shared/components/ui/badge.tsx` for discipline tags
- Switch component at `/apps/web/src/shared/components/ui/switch.tsx` for enable/disable toggle
- AlertDialog component at `/apps/web/src/shared/components/ui/alert-dialog.tsx` for modals
- Input, Select, Button, Dropdown Menu, Checkbox, Spinner all available in shared components

**Prisma Schema**
- Skill model with id, name, discipline, isActive, createdAt, updatedAt at `/apps/api/prisma/schema.prisma`
- EmployeeSkill junction table with profileId, skillId for counting active employee usage
- Discipline enum with 19 values (FRONTEND, BACKEND, LANGUAGES, DEVOPS, DATABASE, DESIGN, MOBILE, TESTING, CLOUD, OTHER, STYLING, TOOLS, API, PERFORMANCE, SECURITY, IOS, ANDROID, BUILD_TOOLS, NO_CODE)

## Out of Scope
- Deleting skills permanently (only enable/disable soft delete)
- Bulk operations (bulk edit, bulk disable, bulk create)
- Detailed proficiency-level breakdown of employee usage (only show total count)
- Skill usage history, analytics, or trending reports
- Exporting skills data to CSV or other formats
- Creating new disciplines or editing the Discipline enum values
- Showing creation/update timestamps in the table
- Preventing edits/disables on in-use skills (allow with warning instead)
- Email notifications to employees when their skills are edited or disabled
- Audit log or change history tracking for skill modifications
- Tech Lead access to this interface (ADMIN only)
- Skill categories, tags, or hierarchical grouping beyond disciplines
- Skill descriptions, documentation, or learning resources
