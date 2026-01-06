# Task Breakdown: Admin Skills Management UI

## Overview
Total Tasks: 4 Task Groups

## Task List

### Backend Layer

#### Task Group 1: Employee Usage Count Integration
**Dependencies:** None

- [x] 1.0 Complete backend employee count integration
  - [x] 1.1 Write 2-8 focused tests for employeeCount field
    - Limit to 2-8 highly focused tests maximum
    - Test only critical behaviors (e.g., count returns correct number, count filters by isActive, count updates when employee skills change)
    - Skip exhaustive coverage of all edge cases
  - [x] 1.2 Extend Skill GraphQL type to include employeeCount field
    - Add @Field() employeeCount: number to SkillType
    - Located at `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/dto/skill.type.ts`
  - [x] 1.3 Update SkillsService to calculate employeeCount
    - Add method to count active EmployeeSkill records grouped by skillId
    - Filter by isActive = true only
    - Use Prisma aggregation: `_count` on EmployeeSkill where profileId matches active profiles
    - Located at `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/skills.service.ts`
  - [x] 1.4 Update getAllSkills resolver to include employeeCount
    - Map employeeCount to each Skill in response
    - Ensure count is calculated for all skills in result set
    - Located at `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/api/src/skills/skills.resolver.ts`
  - [x] 1.5 Ensure backend tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify employeeCount returns correct values
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- Skill GraphQL type includes employeeCount field
- getAllSkills query returns employeeCount for each skill
- Count reflects only active EmployeeSkill records

### GraphQL Integration Layer

#### Task Group 2: Frontend GraphQL Setup
**Dependencies:** Task Group 1

- [x] 2.0 Complete GraphQL integration for admin-skills module
  - [x] 2.1 Write 2-8 focused tests for GraphQL hooks
    - Limit to 2-8 highly focused tests maximum
    - Test only critical hook behaviors (e.g., useSkills fetches data, useCreateSkill submits mutation, error handling works)
    - Skip exhaustive testing of all hook states and scenarios
  - [x] 2.2 Create admin-skills module directory structure
    - Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/`
    - Create subdirectories: `components/`, `hooks/`, `graphql/`
    - Follow validation-inbox module pattern exactly
  - [x] 2.3 Write getAllSkills GraphQL query
    - Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/graphql/get-all-skills.graphql`
    - Query fields: id, name, discipline, isActive, employeeCount, createdAt
    - Accept GetAllSkillsInput: isActive, disciplines array, searchTerm
    - Follow validation-inbox query pattern
  - [x] 2.4 Write createSkill GraphQL mutation
    - Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/graphql/create-skill.graphql`
    - Mutation input: CreateSkillInput with name and discipline
    - Return created Skill with all fields including employeeCount
  - [x] 2.5 Write updateSkill GraphQL mutation
    - Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/graphql/update-skill.graphql`
    - Mutation input: UpdateSkillInput with id, optional name, optional discipline
    - Return updated Skill with all fields including employeeCount
  - [x] 2.6 Write enableSkill and disableSkill GraphQL mutations
    - Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/graphql/toggle-skill.graphql`
    - Both mutations accept skill ID
    - Return updated Skill with all fields including employeeCount
  - [x] 2.7 Generate TypeScript types using GraphQL Code Generator
    - Run codegen to generate `.tsx` files for all `.graphql` files
    - Verify types are generated in `graphql/` directory
    - Command: `npm run codegen` (or equivalent)
  - [x] 2.8 Create useSkills hook
    - Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/hooks/use-skills.ts`
    - Use Apollo Client useQuery with getAllSkills
    - Accept filters: isActive, disciplines array, searchTerm
    - Handle loading, error, and data states
    - Follow validation-inbox useValidationInbox pattern
  - [x] 2.9 Create useCreateSkill hook
    - Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/hooks/use-create-skill.ts`
    - Use Apollo Client useMutation with createSkill
    - Refetch getAllSkills on success
    - Show success toast using Sonner
    - Handle error states with error toast
    - Follow validation-inbox useResolveSuggestions pattern
  - [x] 2.10 Create useUpdateSkill hook
    - Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/hooks/use-update-skill.ts`
    - Use Apollo Client useMutation with updateSkill
    - Refetch getAllSkills on success
    - Show success toast using Sonner
    - Handle error states with error toast
  - [x] 2.11 Create useToggleSkill hook
    - Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/hooks/use-toggle-skill.ts`
    - Use Apollo Client useMutation with both enableSkill and disableSkill
    - Accept skill ID and current isActive state to determine which mutation to call
    - Optimistically update cache before mutation completes
    - Revert on error and show error toast
    - Show success toast on success
    - Refetch getAllSkills on success
  - [x] 2.12 Ensure GraphQL integration tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify hooks fetch and mutate data correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- Module directory structure matches validation-inbox pattern
- All GraphQL query and mutation files created
- TypeScript types generated successfully
- All four hooks (useSkills, useCreateSkill, useUpdateSkill, useToggleSkill) implemented
- Hooks follow validation-inbox patterns for error handling and cache updates

### Frontend UI Components

#### Task Group 3: Admin Skills Interface Components
**Dependencies:** Task Group 2

- [x] 3.0 Complete admin skills UI components
  - [x] 3.1 Write 2-8 focused tests for UI components
    - Limit to 2-8 highly focused tests maximum
    - Test only critical component behaviors (e.g., table renders skills, filters work, modal opens/closes, toggle switches state)
    - Skip exhaustive testing of all component states and user interactions
  - [x] 3.2 Create admin route with role guard
    - Create route file at `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/routes/_authenticated/admin/skills.tsx`
    - Use Tanstack Router createFileRoute
    - Add beforeLoad hook with role guard checking ProfileType.ADMIN
    - Display unauthorized message for non-admin users
    - Follow validation-inbox route pattern
  - [x] 3.3 Create SkillsTable component
    - Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/components/skills-table.tsx`
    - Use Shadcn Table component from `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/components/ui/table.tsx`
    - Columns: skill name, discipline badge, employee count, active status toggle, edit button
    - Use Badge component with DisciplineMap for discipline display
    - Use Switch component for isActive toggle
    - Display employee count as simple number (e.g., "12")
    - Visually distinguish disabled skills with grayed-out text
    - Show Spinner during loading state
    - Show empty state message when no skills match filters
  - [x] 3.4 Create SkillsFilters component
    - Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/components/skills-filters.tsx`
    - Show/hide inactive skills toggle (Checkbox or Switch)
    - Multi-select discipline filter using Dropdown Menu with Checkboxes
    - Search input field for skill name (case-insensitive partial match)
    - Clear filters button
    - Apply all filters simultaneously to narrow results
  - [x] 3.5 Create SkillsSorting component
    - Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/components/skills-sorting.tsx`
    - Sorting dropdown with three options: alphabetical (by name), by discipline, by creation date
    - Default sort to alphabetical ascending
    - Show current sort selection in UI
    - Use Select component from `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/components/ui/select.tsx`
  - [x] 3.6 Create AddSkillModal component
    - Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/components/add-skill-modal.tsx`
    - Use AlertDialog component from `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/shared/components/ui/alert-dialog.tsx`
    - Form fields: skill name (Input) and discipline (Select with all Discipline enum values)
    - Use Tanstack React Form for form handling
    - Use Zod for validation (name required, discipline required)
    - Check for duplicate skill names (case-insensitive) before submission
    - Display error message if duplicate detected
    - Call useCreateSkill hook on submit
    - Close modal and show success toast on successful creation
    - Follow validation-inbox AlertDialog pattern
  - [x] 3.7 Create EditSkillModal component
    - Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/components/edit-skill-modal.tsx`
    - Use AlertDialog component (consistent with AddSkillModal)
    - Pre-populate form with existing skill name and discipline
    - Allow editing name and/or discipline
    - Use Tanstack React Form with Zod validation
    - Validate name uniqueness (case-insensitive) excluding current skill ID
    - If skill has employeeCount > 0, display warning in modal showing count of affected employees
    - Call useUpdateSkill hook on submit
    - Close modal and show success toast on successful update
  - [x] 3.8 Create main AdminSkills component
    - Create `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/modules/admin-skills/admin-skills.tsx`
    - Compose all components: SkillsFilters, SkillsSorting, SkillsTable, AddSkillModal, EditSkillModal
    - Add "Add Skill" button positioned above table
    - Use useSkills hook to fetch data with current filters
    - Pass filter/sort state to child components
    - Handle loading and error states
    - Apply responsive layout patterns from validation-inbox
  - [x] 3.9 Integrate AdminSkills component into route
    - Import AdminSkills component in `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/web/src/routes/_authenticated/admin/skills.tsx`
    - Render AdminSkills as main route component
    - Ensure role guard is applied before component loads
  - [x] 3.10 Implement toggle skill functionality in SkillsTable
    - Wire Switch component onChange to useToggleSkill hook
    - If skill has employeeCount > 0 when disabling, show warning in modal/confirmation dialog with count of affected employees
    - Optimistically update UI while mutation is in progress
    - Revert on error and show error toast
    - Show success toast on successful toggle
  - [x] 3.11 Apply responsive design
    - Mobile: 320px - 768px (stack filters, single column table)
    - Tablet: 768px - 1024px (condensed table layout)
    - Desktop: 1024px+ (full table with all columns)
    - Follow validation-inbox responsive patterns
  - [x] 3.12 Ensure UI component tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify critical component behaviors work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Admin route created with ADMIN role guard at `/_authenticated/admin/skills`
- All components render correctly (table, filters, sorting, modals)
- Add skill modal validates and submits successfully
- Edit skill modal pre-populates, validates, and submits successfully
- Toggle switch enables/disables skills with optimistic updates
- Warnings display when editing/disabling skills with employeeCount > 0
- Responsive design works across mobile, tablet, and desktop
- UI matches existing design system patterns

### Testing

#### Task Group 4: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 2-8 tests written by backend-engineer (Task 1.1)
    - Review the 2-8 tests written by graphql-engineer (Task 2.1)
    - Review the 2-8 tests written by ui-designer (Task 3.1)
    - Total existing tests: approximately 6-24 tests
  - [x] 4.2 Analyze test coverage gaps for Admin Skills Management UI feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
    - Critical workflows to verify:
      * Admin can view all skills with filters applied
      * Admin can create new skill and see it in table
      * Admin can edit existing skill and see changes reflected
      * Admin can toggle skill active status
      * Warning displays when editing/disabling skill with employee usage
      * Duplicate skill name validation prevents submission
      * Non-admin user cannot access admin skills route
  - [x] 4.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points and end-to-end workflows
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases, performance tests, and accessibility tests unless business-critical
    - Suggested priority tests (if gaps exist):
      * End-to-end: Create skill, verify it appears in table with correct employeeCount
      * End-to-end: Edit skill name, verify update reflected in table
      * End-to-end: Toggle skill to inactive, verify visual distinction in table
      * Integration: Filter by discipline, verify only matching skills shown
      * Integration: Search by name, verify partial match filtering works
      * Integration: Sort by discipline, verify correct ordering
      * Authorization: Non-admin redirected from admin skills route
      * Validation: Duplicate skill name shows error and prevents submission
      * Warning: Editing skill with employeeCount > 0 displays warning modal
      * Warning: Disabling skill with employeeCount > 0 displays warning modal
  - [x] 4.4 Run feature-specific tests only
    - Run ONLY tests related to Admin Skills Management UI feature (tests from 1.1, 2.1, 3.1, and 4.3)
    - Expected total: approximately 16-34 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 16-34 tests total)
- Critical user workflows for Admin Skills Management UI are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:
1. Backend Layer (Task Group 1) - Add employeeCount field to backend
2. GraphQL Integration Layer (Task Group 2) - Set up frontend GraphQL queries, mutations, and hooks
3. Frontend UI Components (Task Group 3) - Build admin interface with table, filters, modals, and interactions
4. Test Review & Gap Analysis (Task Group 4) - Review tests and fill critical gaps

## Notes

- This feature builds on existing backend skills API that already has getAllSkills, createSkill, updateSkill, disableSkill, and enableSkill endpoints
- Follow validation-inbox module structure exactly for consistency
- Reuse existing Shadcn UI components (Table, Badge, Switch, AlertDialog, Dropdown, Checkbox, Input, Select, Button, Spinner)
- Use DisciplineMap utility for discipline color coding with Badge component
- All mutations should refetch getAllSkills to keep UI in sync
- Optimistic updates for toggle switch to provide immediate feedback
- Display warnings (not blockers) when editing/disabling skills with active employee usage
- Focus testing on critical user workflows and integration points, not exhaustive coverage
