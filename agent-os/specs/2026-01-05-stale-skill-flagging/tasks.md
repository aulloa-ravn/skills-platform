# Task Breakdown: Stale Skill Flagging

## Overview
Total Tasks: 4 Task Groups
Feature Type: Backend-only scheduled cron job
Estimated Complexity: Medium

## Task List

### Background Job Infrastructure

#### Task Group 1: Cron Job Setup and Module Configuration
**Dependencies:** None

- [ ] 1.0 Complete background job infrastructure
  - [ ] 1.1 Write 2-8 focused tests for cron job infrastructure
    - Limit to 2-8 highly focused tests maximum
    - Test only critical infrastructure behaviors:
      - Cron job is registered and configured correctly
      - Job executes on schedule (mock @Cron decorator behavior)
      - Error handling prevents application crashes
      - Logger is called with expected format
    - Skip exhaustive testing of all edge cases and timing scenarios
  - [ ] 1.2 Install and configure @nestjs/schedule module
    - Run: `pnpm add @nestjs/schedule` in apps/api directory
    - Verify package is added to package.json dependencies
    - Run: `pnpm install` to ensure lock file is updated
  - [ ] 1.3 Register ScheduleModule in app.module.ts
    - Import ScheduleModule from '@nestjs/schedule'
    - Add ScheduleModule.forRoot() to imports array in AppModule
    - Verify module registration follows existing patterns in app.module.ts
  - [ ] 1.4 Create StaleSkillFlagging module
    - Create directory: apps/api/src/stale-skill-flagging/
    - Create file: stale-skill-flagging.module.ts
    - Define StaleSkillFlaggingModule with @Module decorator
    - Import PrismaModule for database access
    - Register StaleSkillFlaggingService as provider
  - [ ] 1.5 Import StaleSkillFlaggingModule in app.module.ts
    - Add StaleSkillFlaggingModule to AppModule imports array
    - Ensure module is loaded on application startup
  - [ ] 1.6 Ensure infrastructure tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify module registration works correctly
    - Verify cron decorator is applied
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- @nestjs/schedule package is installed and configured
- ScheduleModule is registered in AppModule
- StaleSkillFlaggingModule is created and imported
- Module follows NestJS architectural patterns

### Core Business Logic

#### Task Group 2: Stale Skill Detection Service
**Dependencies:** Task Group 1

- [ ] 2.0 Complete stale skill detection logic
  - [ ] 2.1 Write 2-8 focused tests for stale skill detection
    - Limit to 2-8 highly focused tests maximum
    - Test only critical detection behaviors:
      - Core Stack skills are correctly identified from assignment tags
      - Staleness calculation (12 months = 365 days) works correctly
      - Inactive skills (isActive = false) are excluded
      - Case-sensitive tag matching works as expected
      - Duplicate PENDING suggestions are not created
    - Skip exhaustive testing of all combinations and scenarios
  - [ ] 2.2 Create StaleSkillFlaggingService
    - Create file: apps/api/src/stale-skill-flagging/stale-skill-flagging.service.ts
    - Inject PrismaService and Logger
    - Add @Injectable() decorator
    - Set up NestJS Logger instance with 'StaleSkillFlaggingService' context
  - [ ] 2.3 Implement @Cron decorator method
    - Add method: handleCron() with @Cron('0 0 * * *') decorator (runs daily at midnight)
    - Add try-catch block for error handling
    - Log job start timestamp
    - Call main processing method
    - Log job completion timestamp
    - Log any errors without crashing application
  - [ ] 2.4 Implement Core Stack skills identification
    - Query all employees with active assignments using Prisma
    - Include relations: assignments, employeeSkills, skills
    - Extract tags from Assignment.tags arrays for each employee
    - Create Set of assignment tags for O(1) lookup (case-sensitive)
    - Reference pattern from ProfileService.getSkillsTiers() method
    - Filter employeeSkills to match: assignmentTags.has(empSkill.skill.name)
  - [ ] 2.5 Implement staleness detection logic
    - Calculate cutoff date: current date minus 12 months (365 days)
    - Filter Core Stack skills where lastValidatedAt < cutoffDate
    - Exclude skills where skill.isActive = false
    - Track count of stale skills found for logging
  - [ ] 2.6 Ensure detection logic tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify Core Stack identification works correctly
    - Verify staleness calculation is accurate
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- StaleSkillFlaggingService is created with proper DI
- Cron job runs daily at midnight (00:00)
- Core Stack skills are correctly identified from assignment tags
- Staleness threshold of 12 months (365 days) is enforced
- Inactive skills are excluded from processing

### Suggestion Creation

#### Task Group 3: Suggestion Management Logic
**Dependencies:** Task Group 2

- [ ] 3.0 Complete suggestion creation logic
  - [ ] 3.1 Write 2-8 focused tests for suggestion creation
    - Limit to 2-8 highly focused tests maximum
    - Test only critical creation behaviors:
      - Suggestion is created with correct fields (source=SYSTEM_FLAG, status=PENDING)
      - suggestedProficiency matches current EmployeeSkill.proficiencyLevel
      - Duplicate PENDING suggestions are prevented
      - Suggestions are created in database transaction
      - Multiple suggestions are created for multiple stale skills
    - Skip exhaustive testing of all field combinations
  - [ ] 3.2 Implement duplicate prevention check
    - Before creating each suggestion, query for existing PENDING suggestion
    - Use Prisma findFirst with where: { profileId, skillId, status: PENDING }
    - Skip suggestion creation if PENDING exists (regardless of source)
    - Track skipped count for logging
    - Reference pattern from ResolutionService suggestion handling
  - [ ] 3.3 Implement suggestion creation
    - For each stale Core Stack skill without existing PENDING suggestion:
      - Create Suggestion record with Prisma
      - Set source to SuggestionSource.SYSTEM_FLAG
      - Set suggestedProficiency to current EmployeeSkill.proficiencyLevel
      - Set status to SuggestionStatus.PENDING
      - Set createdAt to current timestamp
      - No projectId field (query-time filtering handles visibility)
    - Track created count for logging
    - Use Prisma transaction pattern for batch creation if needed
  - [ ] 3.4 Ensure suggestion creation tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify suggestions are created with correct fields
    - Verify duplicate prevention works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Duplicate PENDING suggestions are prevented
- Suggestions are created with source=SYSTEM_FLAG
- suggestedProficiency matches current proficiency level
- Suggestions have status=PENDING
- No projectId association (multi-project visibility via query-time filtering)

### Logging and Integration

#### Task Group 4: Comprehensive Logging and Validation
**Dependencies:** Task Groups 1-3

- [ ] 4.0 Complete logging and validate integration
  - [ ] 4.1 Write 2-8 focused tests for logging and integration
    - Limit to 2-8 highly focused tests maximum
    - Test only critical logging and integration behaviors:
      - All required metrics are logged (employees processed, skills identified, suggestions created, etc.)
      - Logger is called with correct context and format
      - Job completes successfully end-to-end
      - Created suggestions appear in Validation Inbox query (integration test)
    - Skip exhaustive testing of all log message variations
  - [ ] 4.2 Implement comprehensive logging
    - Log job start timestamp
    - Log total number of employees with active assignments processed
    - Log total number of Core Stack skills identified across all employees
    - Log total number of stale Core Stack skills found (lastValidatedAt > 12 months)
    - Log number of suggestions successfully created
    - Log number of suggestions skipped due to existing PENDING suggestions
    - Log number of skills excluded due to isActive = false
    - Log job completion timestamp
    - Use NestJS Logger for consistent format: this.logger.log(), this.logger.error()
  - [ ] 4.3 Verify integration with existing Validation Inbox
    - Manually test: Create a test employee with stale Core Stack skill
    - Run cron job manually or wait for scheduled execution
    - Query Validation Inbox as Tech Lead using InboxService.getValidationInbox()
    - Verify SYSTEM_FLAG suggestion appears alongside SELF_REPORT suggestions
    - Verify suggestion appears in all relevant Tech Leads' inboxes (multi-project visibility)
    - Confirm no changes to InboxService are needed (query-time filtering works)
  - [ ] 4.4 Run feature-specific tests only
    - Run ONLY tests related to stale skill flagging feature (tests from 1.1, 2.1, 3.1, and 4.1)
    - Expected total: approximately 8-32 tests maximum
    - Do NOT run the entire application test suite
    - Verify all feature-specific tests pass
  - [ ] 4.5 Manual testing and verification
    - Test cron job execution in local development environment
    - Verify job runs without crashing application
    - Check logs for all required metrics
    - Confirm suggestions appear in Tech Lead Validation Inbox
    - Test duplicate prevention (run job twice, verify no duplicates)
    - Test inactive skill exclusion
    - Test case-sensitive tag matching

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- All required metrics are logged with proper format
- Job execution logs include start/completion timestamps
- Suggestions created by cron job appear in Tech Lead Validation Inboxes
- Multi-project visibility works (one suggestion appears in multiple inboxes)
- No modifications needed to InboxService or existing inbox queries
- All feature-specific tests pass (approximately 8-32 tests total)
- Manual testing confirms end-to-end functionality

## Execution Order

Recommended implementation sequence:
1. Background Job Infrastructure (Task Group 1) - Set up NestJS scheduling and module structure
2. Core Business Logic (Task Group 2) - Implement Core Stack identification and staleness detection
3. Suggestion Creation (Task Group 3) - Build suggestion creation with duplicate prevention
4. Logging and Integration (Task Group 4) - Add comprehensive logging and verify integration

## Important Notes

**Testing Strategy:**
- Each task group writes 2-8 focused tests maximum during development
- Tests cover only critical behaviors, not exhaustive scenarios
- Test verification runs ONLY newly written tests, not entire suite
- Task Group 4 may add up to 10 additional integration tests if needed
- Total expected tests: approximately 8-32 tests for entire feature

**No UI Changes:**
- This is a backend-only feature
- No GraphQL resolvers needed
- No frontend components needed
- No visual design required

**Integration Points:**
- Leverages existing InboxService.getValidationInbox() for query-time filtering
- Uses existing SuggestionSource.SYSTEM_FLAG enum value
- Uses existing SuggestionStatus.PENDING enum value
- No schema changes required

**Code Patterns to Reference:**
- ProfileService.getSkillsTiers() - Pattern for assignment tag extraction and Set-based matching
- InboxService.getValidationInbox() - Understanding multi-project visibility without direct association
- ResolutionService - Prisma transaction patterns and suggestion handling
- Existing NestJS services - DI patterns, error handling, logging

**Key Technical Details:**
- Staleness threshold: 12 months = 365 days (hard-coded)
- Tag matching: Case-sensitive exact match using assignmentTags.has(empSkill.skill.name)
- Cron schedule: Daily at midnight (00:00) using @Cron('0 0 * * *')
- Error handling: Try-catch blocks to prevent application crashes
- Duplicate prevention: Check for PENDING status before creation

**Out of Scope:**
- Email/push/in-app notifications when suggestions are created
- Configurable staleness threshold (must be 12 months)
- Admin UI to manually trigger job or view execution history
- Database schema changes to Suggestion model
- Retry logic or job queue management for failures
- Performance optimization for very large datasets
