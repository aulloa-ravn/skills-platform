# Specification: Stale Skill Flagging

## Goal
Automatically identify skills not validated in 12+ months from employees' Core Stack and create system-flagged re-validation suggestions that appear in Tech Leads' Validation Inboxes for review.

## User Stories
- As a Tech Lead, I want to automatically receive re-validation suggestions for team members' stale Core Stack skills so that I can ensure their skill records remain current without manual tracking.
- As a system administrator, I want a daily automated job to identify stale skills so that skill validation stays up-to-date across all projects without manual intervention.

## Specific Requirements

**Daily Cron Job Implementation**
- Create a NestJS scheduled task using @Cron decorator to run daily at midnight (00:00)
- Install and configure @nestjs/schedule module if not already present
- Register ScheduleModule in app.module.ts imports
- Create a dedicated service (e.g., StaleSkillFlaggingService) in a new module for this background job
- Use proper error handling and logging to ensure job failures don't crash the application

**Core Stack Skills Identification**
- Query all employees with active assignments using Prisma
- Extract tags from Assignment.tags arrays for each employee's assignments
- Create a Set of assignment tags for efficient O(1) lookup (case-sensitive matching)
- Match assignment tags to EmployeeSkill records by exact skill name (assignmentTags.has(empSkill.skill.name))
- Only process skills where assignmentTags contains the exact skill name (Core Stack definition)

**Staleness Detection Logic**
- Check EmployeeSkill.lastValidatedAt against current date minus 12 months (hard-coded threshold)
- Calculate 12 months as 365 days for consistency (accounting for leap years if needed)
- Filter to only include skills where lastValidatedAt is older than 12 months
- Exclude skills where skill.isActive = false (do not create suggestions for inactive skills)

**Suggestion Creation**
- Create one Suggestion record per stale Core Stack skill per employee
- Set source to SuggestionSource.SYSTEM_FLAG
- Set suggestedProficiency to the current EmployeeSkill.proficiencyLevel
- Set status to SuggestionStatus.PENDING
- Set createdAt to current timestamp
- No projectId field needed (query-time filtering handles multi-project visibility)

**Duplicate Prevention**
- Before creating each suggestion, check if a PENDING suggestion already exists for the (profileId, skillId) combination
- Use Prisma findFirst with where clause filtering by profileId, skillId, and status = PENDING
- Skip suggestion creation if a PENDING suggestion exists, regardless of source (SELF_REPORT or SYSTEM_FLAG)
- Track skipped count for logging purposes

**Multi-Project Visibility**
- Do not associate suggestions with specific projects in the database
- Rely on existing InboxService query-time filtering logic to display suggestions across multiple projects
- When Tech Leads query their Validation Inbox, suggestions appear if the employee is on their project(s) AND the skill appears in assignment tags
- Once any Tech Lead approves/rejects the suggestion, it disappears from all Tech Leads' inboxes (shared suggestion model)

**Comprehensive Logging**
- Log job start timestamp and completion timestamp
- Log total number of employees with active assignments processed
- Log total number of Core Stack skills identified across all employees
- Log total number of stale Core Stack skills found (lastValidatedAt > 12 months)
- Log number of suggestions successfully created
- Log number of suggestions skipped due to existing PENDING suggestions
- Log number of skills excluded due to isActive = false
- Use NestJS Logger for consistent logging format

**Integration with Existing Validation Inbox**
- No changes required to InboxService or inbox queries
- Newly created suggestions with source = SYSTEM_FLAG will automatically appear in Tech Leads' Validation Inboxes
- Tech Leads will see these suggestions alongside SELF_REPORT suggestions
- No notifications sent when suggestions are created (Tech Leads discover them on next inbox visit)

## Visual Design
No visual assets provided for this feature. This is a backend-only scheduled job with no UI changes.

## Existing Code to Leverage

**ProfileService.getSkillsTiers() method (profile.service.ts)**
- Demonstrates the pattern for fetching assignments and extracting tags into a Set for O(1) lookup
- Shows case-sensitive matching: assignmentTags.has(empSkill.skill.name) for Core Stack identification
- Use similar Prisma query structure to fetch assignments with tags
- Replicate the Set-based tag matching logic for efficient Core Stack skill detection

**InboxService.getValidationInbox() method (inbox.service.ts)**
- Handles query-time filtering to show suggestions based on project assignments and skill tags
- Supports multi-project visibility without direct project association on Suggestion model
- No modifications needed, but reference this logic to understand how suggestions appear across multiple projects
- Confirms that PENDING suggestions are filtered by status in the query

**ResolutionService suggestion handling (resolution.service.ts)**
- Shows Prisma transaction patterns for creating/updating suggestions and EmployeeSkill records
- Use similar findUnique and update patterns for checking existing PENDING suggestions
- Reference error handling patterns for graceful failure management in background jobs

**Prisma Schema (schema.prisma)**
- SuggestionSource enum already includes SYSTEM_FLAG value
- SuggestionStatus enum includes PENDING value
- Suggestion model has all required fields (profileId, skillId, suggestedProficiency, status, source)
- EmployeeSkill model has lastValidatedAt field for staleness checking
- Assignment model has tags field (String[]) for Core Stack identification

**Existing service patterns**
- Follow NestJS service patterns from existing services (PrismaService injection, async methods)
- Use similar error handling and logging patterns from other services
- Structure the cron service similar to other feature services with clear method separation

## Out of Scope
- Email, push, or in-app notifications when suggestions are created
- Configurable staleness threshold (must be hard-coded at 12 months / 365 days)
- Admin UI to manually trigger the job or view job execution history
- Database schema changes to Suggestion model (no projectId field)
- Creating a junction table for Suggestion-Project relationships
- Handling projects without Tech Leads (all projects have Tech Leads per requirements)
- Case-insensitive or fuzzy matching of assignment tags to skill names
- Creating suggestions for skills not in active use (only Core Stack skills from assignments)
- Retry logic or job queue management for failed suggestion creations
- Performance optimization for very large datasets (assume reasonable employee counts)
