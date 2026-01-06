# Spec Requirements: Stale Skill Flagging

## Initial Description
Add background job or query logic to identify skills not validated in 12+ months and create re-validation suggestions.

## Requirements Discussion

### First Round Questions

**Q1:** I assume this should be implemented as a scheduled cron job (using NestJS @Cron decorator) that runs daily at midnight to check for stale Core Stack skills and create suggestions. Is that correct, or would you prefer a different schedule (e.g., weekly on Sundays, runs at a different time)?

**Answer:** Daily at midnight is approved.

**Q2:** I'm thinking the 12-month staleness threshold should be configurable (perhaps as an environment variable like `STALE_SKILL_MONTHS=12`), so it can be adjusted later without code changes. Should we make this configurable, or is 12 months a hard requirement?

**Answer:** 12 months is a hard requirement (not configurable).

**Q3:** When matching assignment tags to skills, I assume the match should be case-insensitive (so "react" in tags matches "React" skill name). Is that correct? Should we handle any other variations (e.g., trimming whitespace)?

**Answer:** Case-sensitive matching using `assignmentTags.has(empSkill.skill.name)`.

**Q4:** When creating re-validation suggestions for stale Core Stack skills, I assume we should:
- Set `source` to `SYSTEM_FLAG`
- Copy the current `proficiencyLevel` from EmployeeSkill as the `suggestedProficiency`
- Set `status` to `PENDING`
- Route to the Tech Lead of the project where that skill tag appeared

Is this the correct behavior?

**Answer:** Approved as described (SYSTEM_FLAG, copy proficiency, PENDING, route to Tech Lead).

**Q5:** If an employee has multiple active assignments on different projects that BOTH include the same skill tag (e.g., "React" on Project X and Project Y), and that skill is stale, should we:
- Create just ONE suggestion routed to the first/primary project's Tech Lead?
- Create MULTIPLE suggestions (one per project/Tech Lead)?
- Pick a specific Tech Lead based on some priority?

**Answer:** Create ONE suggestion, but have it appear as a suggestion in all projects where it's used. It only needs to be approved by one Tech Lead to no longer appear as a suggestion across all projects.

**Q6:** I assume we should NOT create duplicate suggestions - if a PENDING suggestion already exists for a given employee+skill combination (regardless of source), we should skip creating another one. Is that correct?

**Answer:** Correct - skip if PENDING suggestion exists.

**Q7:** Should the system send any notifications when stale skill suggestions are created, or will Tech Leads simply see them appear in their Validation Inbox the next time they log in?

**Answer:** Tech Leads just see them in their Validation Inbox (no notifications for now).

**Q8:** For logging and monitoring, I assume we should log:
- Total number of employees with active assignments checked
- Total number of Core Stack skills identified across all employees
- Total number of stale Core Stack skills found
- Number of suggestions created
- Number skipped due to existing pending suggestions

Should we include any additional metrics or reporting?

**Answer:** Approved as described.

**Q9:** Are there any specific scenarios we should EXCLUDE from stale skill flagging? For example:
- Should we skip employees with certain profile types (e.g., ADMIN)?
- Should we skip projects without a Tech Lead assigned?
- Should we skip inactive skills (`isActive = false`)?
- What if an assignment tag doesn't match any skill in the taxonomy - just skip it?

**Answer:**
- All projects have a Tech Lead (no need to check)
- If skill is inactive (`isActive = false`), do NOT create suggestion
- If assignment tag doesn't match any skill in taxonomy, just skip it

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

**Follow-up 1:** You mentioned: "Create ONE suggestion, but have it appear as a suggestion in all projects where it's used."

This is a bit different from the current data model. Currently, a Suggestion record doesn't have a direct link to a Project - it only links to a Profile and Skill.

To make ONE suggestion appear in MULTIPLE projects' validation inboxes, we have a few implementation options:

**Option A: Query-time filtering (no schema change)**
- Create ONE suggestion with no project association
- When Tech Leads view their Validation Inbox, the query logic filters suggestions to show any suggestion where:
  - The employee is on the Tech Lead's project(s), AND
  - The skill name appears in the assignment tags for that project

This means the same suggestion appears in multiple Tech Leads' inboxes if the employee is on multiple projects with that skill tag.

**Option B: Add project tracking to Suggestion model (schema change required)**
- Add a `projectId` field to the Suggestion model
- When creating the stale skill suggestion, pick one "primary" project (e.g., first assignment found)
- Other Tech Leads can still see it via query logic similar to Option A

**Option C: Junction table (more complex schema change)**
- Create a SuggestionProject junction table to track which projects a suggestion relates to
- When creating the suggestion, link it to ALL projects where that skill tag appears
- Tech Leads only see suggestions explicitly linked to their projects

Which approach aligns best with your vision?

**Answer:** Option A: Query-time filtering (no schema change).

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A

## Requirements Summary

### Functional Requirements

**Core Stack Definition:**
- "Core Stack" skills = skills that appear in BOTH:
  - The employee's active assignment tags (Assignment.tags array)
  - The employee's EmployeeSkills records
- Match assignment tags to EmployeeSkills by exact skill name (case-sensitive)
- Example: Employee A assigned to Project X with tags ["React", "TypeScript"] - these are Core Stack skills if they exist in Employee A's EmployeeSkills

**Staleness Detection:**
- A Core Stack skill is "stale" if `EmployeeSkill.lastValidatedAt` is older than 12 months from current date
- 12 months is a hard-coded requirement (not configurable)

**Suggestion Creation:**
- Create ONE suggestion per stale Core Stack skill per employee
- Set `source` to `SYSTEM_FLAG`
- Set `suggestedProficiency` to the current `EmployeeSkill.proficiencyLevel`
- Set `status` to `PENDING`
- No direct project association (relies on query-time filtering for Validation Inbox)

**Multi-Project Visibility:**
- If the same stale skill appears in multiple projects for the same employee, ONE suggestion is created
- That suggestion appears in ALL Tech Leads' Validation Inboxes where the employee has an assignment with that skill tag
- Once approved by ANY Tech Lead, the suggestion status changes and it disappears from all Tech Leads' inboxes

**Duplicate Prevention:**
- Before creating a suggestion, check if a PENDING suggestion already exists for the same (profileId, skillId) combination
- Skip creation if a PENDING suggestion exists (regardless of source: SELF_REPORT or SYSTEM_FLAG)

**Execution Schedule:**
- Implemented as a NestJS scheduled cron job using @Cron decorator
- Runs daily at midnight (00:00)

**Logging Requirements:**
- Total number of employees with active assignments checked
- Total number of Core Stack skills identified across all employees
- Total number of stale Core Stack skills found
- Number of suggestions created
- Number skipped due to existing pending suggestions

**Notifications:**
- No notifications sent when suggestions are created
- Tech Leads discover new suggestions when they visit their Validation Inbox

### Reusability Opportunities

No existing features identified for reuse. This is a new background job pattern for the application.

### Scope Boundaries

**In Scope:**
- NestJS scheduled cron job running daily at midnight
- Query logic to identify employees with active assignments
- Logic to extract and match assignment tags to skill names (case-sensitive)
- Filter EmployeeSkills to find stale Core Stack skills (lastValidatedAt > 12 months)
- Create Suggestion records with source=SYSTEM_FLAG
- Duplicate prevention (skip if PENDING suggestion exists)
- Comprehensive logging of job execution metrics
- Exclude inactive skills (isActive = false) from suggestions
- Skip assignment tags that don't match any skill in the taxonomy

**Out of Scope:**
- Email or push notifications when suggestions are created
- Configurable staleness threshold (hard-coded at 12 months)
- Schema changes to Suggestion model (no project association)
- Admin UI to manually trigger the job or view job history
- Handling employees without Tech Leads (all projects have Tech Leads per user clarification)
- Case-insensitive or fuzzy matching of assignment tags to skill names
- Creating suggestions for skills not in active use (Validated Inventory only)

### Technical Considerations

**Data Model:**
- Leverages existing `SuggestionSource.SYSTEM_FLAG` enum value
- No schema changes required
- Relies on existing Validation Inbox query logic to filter suggestions by project/assignment context

**Matching Logic:**
- Assignment tags (string array) matched to Skill.name (case-sensitive exact match)
- Example: `assignmentTags.has(empSkill.skill.name)`

**Date Calculation:**
- Compare `EmployeeSkill.lastValidatedAt` to current date minus 12 months
- Example: `lastValidatedAt < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)` (approximate, accounting for leap years)

**Technology Stack:**
- NestJS @Cron decorator for scheduled tasks
- Prisma ORM for database queries
- GraphQL not required (backend-only background job)
- No frontend changes needed

**Query-time Filtering:**
- Existing Validation Inbox query logic should handle filtering suggestions where:
  - Employee is on Tech Lead's project(s), AND
  - Skill name appears in assignment tags for that project
- This allows ONE suggestion to appear in multiple Tech Leads' inboxes without schema changes
