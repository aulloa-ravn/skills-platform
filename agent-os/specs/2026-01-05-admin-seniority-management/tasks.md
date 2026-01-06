# Task Breakdown: Admin Seniority Management

## Overview

Total Tasks: 4 task groups with multiple sub-tasks each

## Task List

### Database Layer

#### Task Group 1: Database Migration for updatedAt Field

**Dependencies:** None

- [x] 1.0 Complete database migration
  - [x] 1.1 Write 2-4 focused tests for updatedAt field functionality
    - Test that updatedAt is set automatically on record creation
    - Test that updatedAt updates automatically when record is modified
    - Verify updatedAt defaults to now() for new records
  - [x] 1.2 Create Prisma migration for SeniorityHistory model
    - Add updatedAt DateTime field with @updatedAt decorator
    - Set default value to now() for consistency with other models
    - Update or remove existing comment about append-only model
    - Generate migration file using `npx prisma migrate dev`
  - [x] 1.3 Apply migration to database
    - Run migration in development environment
    - Verify migration runs successfully without errors
    - Confirm schema.prisma matches database state
  - [x] 1.4 Ensure database migration tests pass
    - Run ONLY the 2-4 tests written in 1.1
    - Verify updatedAt field works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 2-4 tests written in 1.1 pass
- updatedAt field added to SeniorityHistory table
- Field automatically updates on record modifications
- Migration runs successfully without errors

### Backend API Layer

#### Task Group 2: GraphQL API with Admin Authorization

**Dependencies:** Task Group 1

- [x] 2.0 Complete GraphQL API layer
  - [x] 2.1 Write 2-8 focused tests for GraphQL endpoints
    - Test getSeniorityHistory query returns records for valid profileId
    - Test updateSeniorityHistory mutation updates record correctly
    - Test createSeniorityHistory mutation creates new record
    - Test admin authorization requirement (non-admin gets ForbiddenException)
    - Test profile sync when updating record with endDate = null
    - Test validation: endDate cannot be before startDate
  - [x] 2.2 Create GraphQL DTOs (Input/Output types)
    - Create SeniorityHistoryRecord output type with fields: id, profileId, seniorityLevel, startDate, endDate, updatedAt
    - Create UpdateSeniorityHistoryInput with fields: id, seniorityLevel, startDate, endDate (optional)
    - Create CreateSeniorityHistoryInput with fields: profileId, seniorityLevel, startDate, endDate (optional)
    - Follow naming conventions from existing skills DTOs
  - [x] 2.3 Implement getSeniorityHistory query
    - Add query to SeniorityHistory resolver
    - Apply @UseGuards(JwtAuthGuard, RolesGuard) decorator
    - Apply @Roles(ProfileType.ADMIN) decorator for admin-only access
    - Accept profileId parameter
    - Return records ordered by startDate descending
    - Follow pattern from skills.resolver.ts
  - [x] 2.4 Implement updateSeniorityHistory mutation
    - Add mutation to SeniorityHistory resolver
    - Apply JwtAuthGuard and RolesGuard with ADMIN role
    - Validate endDate >= startDate when endDate is provided
    - If endDate is null, update Profile.currentSeniorityLevel in same transaction
    - Return updated record with updatedAt timestamp
    - Handle validation errors with clear error messages
  - [x] 2.5 Implement createSeniorityHistory mutation
    - Add mutation to SeniorityHistory resolver
    - Apply admin authorization guards
    - Validate date ranges (endDate >= startDate)
    - If endDate is null, sync Profile.currentSeniorityLevel
    - Return created record with all timestamps
  - [x] 2.6 Ensure API layer tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify all queries and mutations work correctly
    - Verify admin authorization enforced
    - Verify profile sync works for current seniority records
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 2-8 tests written in 2.1 pass
- All three GraphQL endpoints implemented and working
- Admin-only authorization enforced (non-admins cannot access)
- Profile.currentSeniorityLevel syncs automatically when editing current record
- Date validation prevents endDate before startDate
- Returns proper error messages for validation failures

### Frontend Page & Components

#### Task Group 3: Admin Seniority Management UI

**Dependencies:** Task Group 2

- [x] 3.0 Complete seniority management UI
  - [x] 3.1 Write 2-8 focused tests for UI components
    - Test main page renders with employee name and seniority level in header
    - Test table displays seniority records with correct columns
    - Test edit button opens modal with pre-populated data
    - Test "Add Record" button opens modal with empty form
    - Test "Current seniority level" checkbox controls endDate field visibility
    - Test form validation prevents endDate before startDate
  - [x] 3.2 Create main seniority management page at /admin/profiles/[id]/seniority
    - Implement admin-only route guard using ProfileType.ADMIN check
    - Redirect to /profile if user is not admin
    - Display employee name and current seniority level in page header
    - Include breadcrumb or back navigation to employee list
    - Use similar layout pattern as admin skills page (/admin/skills.tsx)
    - Add "Add Record" button above table
  - [x] 3.3 Build SeniorityHistoryTable component
    - Create table with columns: Seniority Level, Start Date, End Date, Last Updated, Actions
    - Display seniority level as human-readable text using SeniorityLevelMap
    - Format dates consistently using existing date formatting utilities
    - Show "Present" or "Current" for records where endDate is null
    - Order records by startDate descending (most recent first)
    - Add edit button with icon in actions column
    - Display empty state when no history exists
    - Follow pattern from skills-table.tsx
    - Use Badge component for displaying seniority levels
  - [x] 3.4 Create EditSeniorityModal component
    - Use AlertDialog component for modal wrapper
    - Display form fields: Seniority Level (select dropdown), Start Date (date input), End Date (date input)
    - Include "Current seniority level" checkbox
    - When checkbox is checked, hide or disable endDate input and set value to null
    - When checkbox is unchecked, show endDate input with current value
    - Populate modal with existing record data when editing
    - Follow pattern from edit-skill-modal.tsx
    - Use Tanstack Form with Zod schema for validation
  - [x] 3.5 Create CreateSeniorityModal component
    - Reuse same modal component structure as EditSeniorityModal
    - Initialize with empty form values
    - Default "Current seniority level" checkbox to unchecked
    - Allow admin to set all fields manually
    - Share validation logic with edit modal
  - [x] 3.6 Implement form validation
    - Validate that endDate is not before startDate when endDate is provided
    - Show clear error message when validation fails
    - Disable form submission until validation passes
    - Use Zod schema for validation rules
    - Follow validation patterns from admin skills modals
  - [x] 3.7 Integrate GraphQL queries and mutations
    - Add getSeniorityHistory query to fetch records
    - Add updateSeniorityHistory mutation for editing
    - Add createSeniorityHistory mutation for creating
    - Handle loading states during API calls
    - Handle error states with user-friendly messages
    - Refresh table data after successful create/update
  - [x] 3.8 Apply responsive design
    - Mobile: 320px - 768px (stack table or use horizontal scroll)
    - Tablet: 768px - 1024px
    - Desktop: 1024px+
    - Ensure modals are mobile-friendly
    - Follow responsive patterns from existing admin pages
  - [x] 3.9 Ensure UI component tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify page renders correctly with admin access
    - Verify table displays and sorts records properly
    - Verify modals open and form validation works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 2-8 tests written in 3.1 pass
- Page accessible at /admin/profiles/[id]/seniority with admin-only access
- Table displays seniority history with proper formatting and sorting
- Edit modal opens with pre-populated data
- Create modal opens with empty form
- "Current seniority level" checkbox controls endDate field behavior
- Form validation prevents invalid date ranges
- Page matches visual design of existing admin pages
- Responsive design works across all screen sizes

### Testing & Integration

#### Task Group 4: Test Review & Gap Analysis

**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 2-4 tests written for database migration (Task 1.1)
    - Review the 2-8 tests written for GraphQL API (Task 2.1)
    - Review the 2-8 tests written for UI components (Task 3.1)
    - Total existing tests: approximately 6-20 tests
  - [x] 4.2 Analyze test coverage gaps for THIS feature only
    - Identify critical end-to-end workflows that lack test coverage
    - Focus on integration points between frontend, API, and database
    - Check for gaps in profile sync functionality testing
    - Prioritize testing the complete create/edit workflow from UI to database
    - Do NOT assess entire application test coverage
  - [x] 4.3 Write up to 10 additional strategic tests maximum
    - Add integration test for complete edit workflow (UI -> GraphQL -> Database -> Profile sync)
    - Add integration test for complete create workflow
    - Add test for admin authorization on frontend routes
    - Add test for date validation across full stack
    - Add test for "Current seniority level" checkbox behavior end-to-end
    - Focus on critical user workflows specific to this feature
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases unless business-critical
  - [x] 4.4 Run feature-specific tests only
    - Run ONLY tests related to seniority management feature
    - Expected total: approximately 16-30 tests maximum
    - Verify all critical workflows pass
    - Verify profile sync works correctly
    - Verify admin authorization enforced at all layers
    - Do NOT run the entire application test suite

**Acceptance Criteria:**

- All feature-specific tests pass (approximately 16-30 tests total)
- Critical user workflows for seniority management are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this spec's feature requirements
- Profile sync functionality fully tested and working
- Admin authorization verified at all application layers

## Execution Order

Recommended implementation sequence:

1. Database Layer (Task Group 1) - Add updatedAt field via migration
2. Backend API Layer (Task Group 2) - Implement GraphQL queries/mutations with admin auth
3. Frontend Page & Components (Task Group 3) - Build UI with table and modals
4. Testing & Integration (Task Group 4) - Review tests and fill critical gaps

## Key Technical Notes

**Profile Sync Logic:**

- Sync only occurs when editing/creating records where endDate = null
- Sync must happen in the same database transaction as the record update
- Update Profile.currentSeniorityLevel to match the seniority level of the current record

**Admin Authorization Pattern:**

- Apply @UseGuards(JwtAuthGuard, RolesGuard) to all GraphQL resolvers
- Use @Roles(ProfileType.ADMIN) decorator for admin-only access
- Frontend route guard checks ProfileType.ADMIN and redirects to /profile if not admin
- Follow patterns from existing admin features (skills.resolver.ts, roles.guard.ts)

**Form Validation Rules:**

- endDate must be >= startDate when endDate is provided
- "Current seniority level" checkbox sets endDate to null when checked
- Client-side validation using Zod schema with Tanstack Form
- Server-side validation in GraphQL mutations with clear error messages

**Reusable Patterns:**

- Admin page layout: Follow /admin/skills.tsx structure
- Edit modal: Follow edit-skill-modal.tsx pattern
- Table component: Follow skills-table.tsx pattern
- GraphQL resolver: Follow skills.resolver.ts pattern
- Date formatting: Use existing date formatting utilities
- Seniority display: Use existing SeniorityLevelMap for human-readable text
