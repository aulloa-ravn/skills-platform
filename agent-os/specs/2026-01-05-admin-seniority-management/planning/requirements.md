# Spec Requirements: Admin Seniority Management

## Initial Description

Item 15: Admin Seniority Management — Implement API and UI for admins to view and manually correct employee seniority history records

## Requirements Discussion

### First Round Questions

**Q1:** I assume this will be a new page in the admin section at a route like `/admin/employees/[id]/seniority` or `/admin/seniority/[employeeId]`. Should this be a dedicated page, or would you prefer it as a modal/drawer accessible from an existing admin employee management page?
**Answer:** Dedicated page at `/admin/profiles/[id]/seniority`

**Q2:** For viewing seniority history, I'm thinking we'll display a table showing: employee name, seniority level, start date, end date (null for current), and perhaps who last modified each record. Should we include any additional fields like "reason for change" or "modified by" tracking?
**Answer:** Table should show: seniority level, start date, end date, and updatedAt timestamp. No "reason for change" or "modified by" fields needed.

**Q3:** For manual corrections, I assume admins will be able to edit existing records and create new ones. Should they also be able to delete records, or just edit them? And should there be any validation (e.g., preventing overlapping date ranges, ensuring no gaps in history)?
**Answer:** Admins can edit existing records and create new ones. Deletion is not required. No validation for overlaps or gaps needed.

**Q4:** I'm thinking the edit interface would be a modal with form fields for level, start date, and end date. Does this sound right, or would you prefer inline editing in the table?
**Answer:** Modal with form fields is the right approach.

**Q5:** Should there be any integration with the profile sync system, or is this purely for manual data correction? For instance, if an admin changes the current seniority level, should it automatically update the employee's main profile?
**Answer:** System should automatically sync with profile when editing current seniority (the record with endDate = null).

**Q6:** Are there any specific permissions or role checks needed beyond "is admin"? For example, should only certain admin roles be able to modify seniority history?
**Answer:** Standard admin check is sufficient.

**Q7:** What about audit logging? Should we track who made changes and when, either in a separate audit table or as fields on the seniority records themselves?
**Answer:** Use updatedAt field on the seniority records (no separate audit table needed).

**Q8:** Is there anything you explicitly want to exclude from this feature? For example, bulk operations, filtering/search capabilities, or export functionality?
**Answer:** No additional features beyond core view and edit functionality.

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Admin Skills Management - Path: `/admin/skills`
  - Similar table-based listing interface
  - Modal editing patterns
  - Admin role checks

- Feature: Profile Management
  - Reference for Profile.currentSeniorityLevel sync logic
  - Understanding existing profile data structure

### Follow-up Questions

**Follow-up 1:** For the updatedAt tracking, should this be added as a new field to the existing SeniorityHistory table via a database migration?
**Answer:** Add updatedAt field via a database migration to track when records are manually corrected.

**Follow-up 2:** In the edit modal, should both the level and dates be editable, or just the dates? And should there be any date validation (e.g., preventing endDate from being before startDate)?
**Answer:** Both level and dates are editable. Prevent edits like making endDate earlier than startDate. Include a checkbox "Current seniority level" that when checked makes the endDate input empty (null).

**Follow-up 3:** For record validation, should the system prevent admins from creating overlapping date ranges or gaps in the history, or is it the admin's responsibility to manage that correctly?
**Answer:** It's the admin's responsibility to manage correctly (no system validation for overlapping date ranges or gaps).

**Follow-up 4:** When syncing with Profile.currentSeniorityLevel, should this happen automatically when an admin edits the most recent record (where endDate = null), or should there be a manual sync button?
**Answer:** Automatically update the Profile.currentSeniorityLevel field to match when editing the most recent record (where endDate = null).

## Visual Assets

### Files Provided:

No visual files found.

### Visual Insights:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- **View Seniority History**: Display a table of all seniority records for a specific employee showing level, start date, end date, and updatedAt timestamp
- **Edit Records**: Allow admins to modify existing seniority records (level and dates) via a modal form
- **Create Records**: Allow admins to add new seniority history records
- **Current Level Checkbox**: Include a "Current seniority level" checkbox in the edit modal that sets endDate to null when checked
- **Profile Sync**: Automatically update Profile.currentSeniorityLevel when editing records where endDate = null
- **Date Validation**: Prevent endDate from being earlier than startDate in the edit form
- **Timestamp Tracking**: Track when records are modified using updatedAt field
- **Dedicated Page**: Accessible at route `/admin/profiles/[id]/seniority`

### Reusability Opportunities

- **Admin UI Patterns**: Reference `/admin/skills` for table layout and modal editing patterns
- **Profile Data Structure**: Reference existing Profile model for currentSeniorityLevel sync logic
- **Admin Authorization**: Use existing admin role checking middleware/patterns

### Scope Boundaries

**In Scope:**

- Viewing employee seniority history in a table
- Editing existing seniority records (level and dates)
- Creating new seniority records
- Database migration to add updatedAt field to SeniorityHistory
- Automatic sync with Profile.currentSeniorityLevel for current records
- Basic form validation (endDate >= startDate)
- "Current seniority level" checkbox functionality
- Admin-only access control

**Out of Scope:**

- Deleting seniority records
- System validation for overlapping date ranges
- System validation for gaps in history
- "Reason for change" or "modified by" tracking fields
- Bulk operations on multiple records
- Filtering or search capabilities
- Export functionality
- Audit logging in separate table
- Manual sync buttons (sync is automatic)

### Technical Considerations

- **Database Migration**: Add `updatedAt` field to SeniorityHistory table
- **Authorization**: Apply standard admin role checks (reference existing admin routes)
- **Data Sync**: When updating a record with `endDate = null`, automatically update the corresponding `Profile.currentSeniorityLevel`
- **Validation**: Client-side and server-side validation to ensure `endDate >= startDate` when endDate is provided
- **UI Pattern**: Modal-based editing (reference patterns from `/admin/skills`)
- **Routing**: New page at `/admin/profiles/[id]/seniority`
