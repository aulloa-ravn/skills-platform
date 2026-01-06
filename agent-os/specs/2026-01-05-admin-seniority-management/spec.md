# Specification: Admin Seniority Management

## Goal

Enable admins to view and manually correct employee seniority history records through a dedicated admin page, with automatic synchronization to the employee's current seniority level when editing the active record.

## User Stories

- As an admin, I want to view a complete seniority history for an employee so that I can understand their career progression
- As an admin, I want to edit incorrect seniority records so that I can maintain accurate employee data
- As an admin, I want to add missing seniority records so that I can complete an employee's history

## Specific Requirements

**Dedicated Seniority Management Page**

- Create new route at `/admin/profiles/[id]/seniority`
- Implement admin-only access control using ProfileType.ADMIN check with redirect pattern
- Display employee name and current seniority level in page header
- Include breadcrumb or back navigation to employee list
- Use similar layout pattern as admin skills page

**Seniority History Table Display**

- Show table with columns: Seniority Level, Start Date, End Date, Last Updated
- Display seniority level as human-readable text using SeniorityLevelMap
- Format dates consistently using existing date formatting utilities
- Show "Present" or "Current" for records where endDate is null
- Order records by startDate descending (most recent first)
- Display empty state when no history exists

**Database Migration for updatedAt Field**

- Add updatedAt DateTime field to SeniorityHistory table
- Set default value to now() for consistency with other models
- Include @updatedAt decorator for automatic timestamp updates
- Remove or update existing comment about append-only model

**Edit Seniority Record Modal**

- Trigger modal via edit button on each table row
- Display form fields: Seniority Level (select dropdown), Start Date (date input), End Date (date input)
- Include "Current seniority level" checkbox that controls endDate field
- When checkbox is checked, hide or disable endDate input and set value to null
- When checkbox is unchecked, show endDate input with current value or empty
- Populate modal with existing record data when editing

**Create New Seniority Record Modal**

- Trigger via "Add Record" button above table
- Use same modal component as edit with empty initial values
- Default "Current seniority level" checkbox to unchecked
- Allow admin to set all fields manually

**Form Validation**

- Validate that endDate is not before startDate when endDate is provided
- Show clear error message when validation fails
- Disable form submission until validation passes
- Use existing form validation patterns from admin skills modals
- No validation for overlapping date ranges or gaps in history

**Profile Sync Logic**

- When saving a record where endDate is null (current seniority), automatically update Profile.currentSeniorityLevel
- Perform sync in the same database transaction as record update
- Only sync for records where endDate is null, not historical records
- No manual sync button needed

**GraphQL API Endpoints**

- Query: getSeniorityHistory(profileId: String!): [SeniorityHistoryRecord!]!
- Mutation: updateSeniorityHistory(input: UpdateSeniorityHistoryInput!): SeniorityHistoryRecord!
- Mutation: createSeniorityHistory(input: CreateSeniorityHistoryInput!): SeniorityHistoryRecord!
- Apply JwtAuthGuard and RolesGuard with ProfileType.ADMIN role requirement
- Return updated record with updatedAt timestamp

## Visual Design

No visual mockups provided. Follow existing admin UI patterns from Skills Management page for consistency.

## Existing Code to Leverage

**Admin Skills Page Layout and Structure**

- File: `/admin/skills.tsx` demonstrates admin page layout with header, description, and table
- Reuse admin-only route guard pattern with ProfileType.ADMIN check and redirect to /profile
- Follow same component organization with main page component, table component, and modal components
- Use similar filter/action button layout pattern

**Edit Modal Pattern from Admin Skills**

- File: `edit-skill-modal.tsx` shows modal form implementation with validation
- Reuse AlertDialog component for modal wrapper
- Apply same form validation approach using Tanstack Form with Zod schema
- Follow loading state and error handling patterns
- Use same AlertDialogFooter with Cancel and Submit buttons

**Table Component from Admin Skills**

- File: `skills-table.tsx` demonstrates table with actions column
- Reuse Table, TableHeader, TableBody, TableRow, TableCell components
- Follow same pattern for edit button with icon in actions column
- Apply similar loading and empty states
- Use Badge component for displaying seniority levels

**RolesGuard and Admin Authorization**

- File: `roles.guard.ts` shows role-based access control implementation
- Apply @UseGuards(JwtAuthGuard, RolesGuard) decorator pattern
- Use @Roles(ProfileType.ADMIN) decorator for admin-only endpoints
- Follow same error handling with ForbiddenException

**Skills Resolver Admin Patterns**

- File: `skills.resolver.ts` demonstrates admin-only GraphQL resolver setup
- Apply same guard and role decorator pattern to new seniority mutations and queries
- Use similar input/output DTO structure
- Follow naming conventions for queries and mutations

## Out of Scope

- Deleting seniority records
- System validation for overlapping date ranges between records
- System validation for gaps in seniority history
- "Reason for change" field or notes on records
- "Modified by" tracking field to record which admin made changes
- Separate audit table for tracking all changes
- Bulk operations to edit multiple records at once
- Filtering or search capabilities for seniority records
- Export functionality for seniority history data
- Manual sync button (sync is automatic when editing current record)
- Pagination for seniority history (assume reasonable record count per employee)
