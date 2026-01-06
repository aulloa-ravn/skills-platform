# Manual Testing Guide: Stale Skill Flagging Feature

## Overview
This guide provides step-by-step instructions to manually verify the Stale Skill Flagging feature end-to-end.

## Prerequisites
- API server running in development mode
- Access to PostgreSQL database
- Tech Lead account available for testing
- Ability to execute GraphQL queries

## Test Scenarios

### Scenario 1: Create Stale Skill and Verify Suggestion Creation

#### Step 1: Set up test data
Execute the following SQL to create a test employee with a stale Core Stack skill:

```sql
-- 1. Create a test employee (if not exists)
INSERT INTO "Profile" (id, "missionBoardId", email, name, "currentSeniorityLevel", type, "createdAt", "updatedAt")
VALUES (
  'test-employee-stale-skill',
  'MB-TEST-STALE-001',
  'test-stale@example.com',
  'Test Employee Stale Skill',
  'MID_ENGINEER',
  'EMPLOYEE',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create or verify React skill exists
INSERT INTO "Skill" (id, name, discipline, "isActive", "createdAt", "updatedAt")
VALUES (
  999,
  'React',
  'FRONTEND',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO UPDATE SET id = 999;

-- 3. Create a project with Tech Lead
INSERT INTO "Project" (id, name, "missionBoardId", "techLeadId", "createdAt", "updatedAt")
VALUES (
  'test-project-stale-001',
  'Test Project for Stale Skills',
  'MB-PROJ-STALE-001',
  'YOUR_TECH_LEAD_ID_HERE', -- Replace with actual Tech Lead ID
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET name = 'Test Project for Stale Skills';

-- 4. Create assignment with React tag
INSERT INTO "Assignment" (id, "profileId", "projectId", "missionBoardId", role, tags, "createdAt", "updatedAt")
VALUES (
  'test-assignment-stale-001',
  'test-employee-stale-skill',
  'test-project-stale-001',
  'MB-ASSIGN-STALE-001',
  'Software Engineer',
  ARRAY['React', 'TypeScript'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET tags = ARRAY['React', 'TypeScript'];

-- 5. Create stale employee skill (lastValidatedAt > 12 months ago)
INSERT INTO "EmployeeSkill" ("profileId", "skillId", "proficiencyLevel", "lastValidatedAt", "createdAt", "updatedAt")
VALUES (
  'test-employee-stale-skill',
  999, -- React skill ID
  'INTERMEDIATE',
  NOW() - INTERVAL '400 days', -- 400 days ago (> 12 months)
  NOW(),
  NOW()
)
ON CONFLICT ("profileId", "skillId") DO UPDATE
SET "lastValidatedAt" = NOW() - INTERVAL '400 days';

-- 6. Clean up any existing PENDING suggestions for this test
DELETE FROM "Suggestion"
WHERE "profileId" = 'test-employee-stale-skill'
  AND "skillId" = 999
  AND status = 'PENDING';
```

#### Step 2: Trigger the cron job manually
You can manually trigger the cron job in one of two ways:

**Option A: Wait for scheduled execution (midnight)**
- The cron job runs automatically at 00:00 daily
- Check server logs the next day

**Option B: Manually invoke the service method**
Create a test controller or script:

```typescript
// In a NestJS controller or script
import { Controller, Post } from '@nestjs/common';
import { StaleSkillFlaggingService } from './stale-skill-flagging/stale-skill-flagging.service';

@Controller('test')
export class TestController {
  constructor(private staleSkillFlaggingService: StaleSkillFlaggingService) {}

  @Post('trigger-stale-skill-flagging')
  async triggerStaleSkillFlagging() {
    await this.staleSkillFlaggingService.handleCron();
    return { success: true };
  }
}
```

Then call: `POST http://localhost:3000/test/trigger-stale-skill-flagging`

**Option C: Use NestJS CLI to execute directly**
```bash
# In apps/api directory
pnpm nest start --watch

# Then in Node REPL or separate script:
# app.get(StaleSkillFlaggingService).handleCron()
```

#### Step 3: Verify logs
Check the application logs for the following output:

```
[StaleSkillFlaggingService] Starting stale skill flagging job at 2026-01-06T12:00:00.000Z
[StaleSkillFlaggingService] Completed stale skill flagging job at 2026-01-06T12:00:00.123Z
[StaleSkillFlaggingService] Job duration: 123ms
[StaleSkillFlaggingService] Employees with active assignments processed: X
[StaleSkillFlaggingService] Core Stack skills identified: Y
[StaleSkillFlaggingService] Stale Core Stack skills found (lastValidatedAt > 12 months): Z
[StaleSkillFlaggingService] Suggestions successfully created: 1 (or more)
[StaleSkillFlaggingService] Suggestions skipped due to existing PENDING suggestions: 0
[StaleSkillFlaggingService] Skills excluded due to isActive = false: 0
```

#### Step 4: Verify suggestion was created in database
```sql
-- Check that suggestion was created
SELECT
  s.id,
  s."profileId",
  s."skillId",
  sk.name AS skill_name,
  s."suggestedProficiency",
  s.status,
  s.source,
  s."createdAt"
FROM "Suggestion" s
JOIN "Skill" sk ON s."skillId" = sk.id
WHERE s."profileId" = 'test-employee-stale-skill'
  AND s."skillId" = 999
  AND s.status = 'PENDING'
  AND s.source = 'SYSTEM_FLAG';

-- Expected result:
-- | id | profileId | skillId | skill_name | suggestedProficiency | status | source | createdAt |
-- | 1  | test-employee-stale-skill | 999 | React | INTERMEDIATE | PENDING | SYSTEM_FLAG | 2026-01-06... |
```

#### Step 5: Query Tech Lead Validation Inbox
Execute the GraphQL query as the Tech Lead:

```graphql
query GetValidationInbox {
  validationInbox {
    projects {
      projectId
      projectName
      pendingSuggestionsCount
      employees {
        employeeId
        employeeName
        employeeEmail
        employeeCurrentSeniorityLevel
        employeeRole
        pendingSuggestionsCount
        suggestions {
          id
          skillName
          discipline
          suggestedProficiency
          source
          createdAt
          currentProficiency
        }
      }
    }
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "validationInbox": {
      "projects": [
        {
          "projectId": "test-project-stale-001",
          "projectName": "Test Project for Stale Skills",
          "pendingSuggestionsCount": 1,
          "employees": [
            {
              "employeeId": "test-employee-stale-skill",
              "employeeName": "Test Employee Stale Skill",
              "employeeEmail": "test-stale@example.com",
              "employeeCurrentSeniorityLevel": "MID_ENGINEER",
              "employeeRole": "Software Engineer",
              "pendingSuggestionsCount": 1,
              "suggestions": [
                {
                  "id": "1",
                  "skillName": "React",
                  "discipline": "FRONTEND",
                  "suggestedProficiency": "INTERMEDIATE",
                  "source": "SYSTEM_FLAG",
                  "createdAt": "2026-01-06T12:00:00.000Z",
                  "currentProficiency": "INTERMEDIATE"
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

✅ **Pass Criteria:**
- Suggestion with source="SYSTEM_FLAG" appears in Tech Lead's inbox
- Suggestion matches the stale skill (React, INTERMEDIATE proficiency)
- Suggestion appears alongside any existing SELF_REPORT suggestions

---

### Scenario 2: Test Duplicate Prevention

#### Step 1: Run the cron job twice
Trigger the cron job a second time (using same method as Scenario 1, Step 2)

#### Step 2: Verify logs show skipped suggestions
Check logs for:
```
[StaleSkillFlaggingService] Suggestions skipped due to existing PENDING suggestions: 1
[StaleSkillFlaggingService] Suggestions successfully created: 0
```

#### Step 3: Verify no duplicate suggestions in database
```sql
-- Count suggestions for test employee
SELECT COUNT(*)
FROM "Suggestion"
WHERE "profileId" = 'test-employee-stale-skill'
  AND "skillId" = 999
  AND status = 'PENDING';

-- Expected result: 1 (not 2 or more)
```

✅ **Pass Criteria:**
- Only ONE PENDING suggestion exists after running job twice
- Logs show suggestion was skipped on second run

---

### Scenario 3: Test Inactive Skill Exclusion

#### Step 1: Create an inactive stale skill
```sql
-- Create inactive skill
INSERT INTO "Skill" (id, name, discipline, "isActive", "createdAt", "updatedAt")
VALUES (
  998,
  'AngularJS',
  'FRONTEND',
  false, -- Inactive skill
  NOW(),
  NOW()
)
ON CONFLICT (name) DO UPDATE SET "isActive" = false;

-- Update assignment to include AngularJS tag
UPDATE "Assignment"
SET tags = ARRAY['React', 'TypeScript', 'AngularJS']
WHERE id = 'test-assignment-stale-001';

-- Create stale employee skill for AngularJS
INSERT INTO "EmployeeSkill" ("profileId", "skillId", "proficiencyLevel", "lastValidatedAt", "createdAt", "updatedAt")
VALUES (
  'test-employee-stale-skill',
  998,
  'ADVANCED',
  NOW() - INTERVAL '400 days',
  NOW(),
  NOW()
)
ON CONFLICT ("profileId", "skillId") DO UPDATE
SET "lastValidatedAt" = NOW() - INTERVAL '400 days';
```

#### Step 2: Run cron job
Trigger the cron job

#### Step 3: Verify inactive skill was excluded
Check logs:
```
[StaleSkillFlaggingService] Skills excluded due to isActive = false: 1
```

Check database:
```sql
-- Verify NO suggestion was created for AngularJS
SELECT COUNT(*)
FROM "Suggestion"
WHERE "profileId" = 'test-employee-stale-skill'
  AND "skillId" = 998;

-- Expected result: 0
```

✅ **Pass Criteria:**
- No suggestion created for inactive skill (AngularJS)
- Logs show 1 skill excluded due to isActive = false

---

### Scenario 4: Test Case-Sensitive Tag Matching

#### Step 1: Create skill with mismatched case
```sql
-- Create skill named "react" (lowercase)
INSERT INTO "Skill" (id, name, discipline, "isActive", "createdAt", "updatedAt")
VALUES (
  997,
  'react',
  'FRONTEND',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO UPDATE SET id = 997;

-- Assignment has tag "React" (capital R)
-- Employee skill has name "react" (lowercase)
INSERT INTO "EmployeeSkill" ("profileId", "skillId", "proficiencyLevel", "lastValidatedAt", "createdAt", "updatedAt")
VALUES (
  'test-employee-stale-skill',
  997,
  'EXPERT',
  NOW() - INTERVAL '400 days',
  NOW(),
  NOW()
)
ON CONFLICT ("profileId", "skillId") DO UPDATE
SET "lastValidatedAt" = NOW() - INTERVAL '400 days';
```

#### Step 2: Run cron job
Trigger the cron job

#### Step 3: Verify case-sensitive matching
```sql
-- Verify NO suggestion was created for lowercase "react" skill
SELECT COUNT(*)
FROM "Suggestion"
WHERE "profileId" = 'test-employee-stale-skill'
  AND "skillId" = 997;

-- Expected result: 0 (because "react" != "React")
```

✅ **Pass Criteria:**
- No suggestion created for "react" skill (lowercase doesn't match "React" tag)
- Case-sensitive matching is enforced

---

### Scenario 5: Test Multi-Project Visibility

#### Step 1: Create second project with same employee
```sql
-- Create second project with different Tech Lead
INSERT INTO "Project" (id, name, "missionBoardId", "techLeadId", "createdAt", "updatedAt")
VALUES (
  'test-project-stale-002',
  'Test Project 2 for Stale Skills',
  'MB-PROJ-STALE-002',
  'DIFFERENT_TECH_LEAD_ID_HERE', -- Different Tech Lead
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET name = 'Test Project 2 for Stale Skills';

-- Assign same employee to second project with React tag
INSERT INTO "Assignment" (id, "profileId", "projectId", "missionBoardId", role, tags, "createdAt", "updatedAt")
VALUES (
  'test-assignment-stale-002',
  'test-employee-stale-skill',
  'test-project-stale-002',
  'MB-ASSIGN-STALE-002',
  'Senior Engineer',
  ARRAY['React'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET tags = ARRAY['React'];
```

#### Step 2: Query both Tech Leads' inboxes
Execute the GraphQL query `validationInbox` as:
1. Tech Lead 1 (from Project 1)
2. Tech Lead 2 (from Project 2)

#### Step 3: Verify same suggestion appears in both inboxes
Both Tech Leads should see the SAME suggestion (same ID) in their respective inboxes.

```sql
-- Verify only ONE suggestion exists across both projects
SELECT COUNT(*)
FROM "Suggestion"
WHERE "profileId" = 'test-employee-stale-skill'
  AND "skillId" = 999
  AND status = 'PENDING';

-- Expected result: 1 (not 2)
```

✅ **Pass Criteria:**
- Same suggestion appears in both Tech Leads' inboxes
- Only ONE suggestion exists in database
- Multi-project visibility works via query-time filtering

---

## Cleanup

After testing, clean up test data:

```sql
-- Delete test suggestions
DELETE FROM "Suggestion" WHERE "profileId" = 'test-employee-stale-skill';

-- Delete test employee skills
DELETE FROM "EmployeeSkill" WHERE "profileId" = 'test-employee-stale-skill';

-- Delete test assignments
DELETE FROM "Assignment" WHERE "profileId" = 'test-employee-stale-skill';

-- Delete test employee
DELETE FROM "Profile" WHERE id = 'test-employee-stale-skill';

-- Delete test projects
DELETE FROM "Project" WHERE id IN ('test-project-stale-001', 'test-project-stale-002');

-- Delete test skills (optional)
DELETE FROM "Skill" WHERE id IN (997, 998, 999);
```

---

## Summary Checklist

- [ ] Scenario 1: Stale skill suggestion is created with source=SYSTEM_FLAG
- [ ] Scenario 1: Suggestion appears in Tech Lead Validation Inbox
- [ ] Scenario 1: All required metrics are logged
- [ ] Scenario 2: Duplicate PENDING suggestions are prevented
- [ ] Scenario 3: Inactive skills are excluded from suggestions
- [ ] Scenario 4: Case-sensitive tag matching works correctly
- [ ] Scenario 5: Multi-project visibility works (one suggestion appears in multiple inboxes)
- [ ] Logs show start/completion timestamps and job duration
- [ ] Job completes without crashing application
- [ ] SYSTEM_FLAG suggestions appear alongside SELF_REPORT suggestions

---

## Expected Log Output Example

```
[StaleSkillFlaggingService] Starting stale skill flagging job at 2026-01-06T12:00:00.000Z
[StaleSkillFlaggingService] Completed stale skill flagging job at 2026-01-06T12:00:00.145Z
[StaleSkillFlaggingService] Job duration: 145ms
[StaleSkillFlaggingService] Employees with active assignments processed: 15
[StaleSkillFlaggingService] Core Stack skills identified: 45
[StaleSkillFlaggingService] Stale Core Stack skills found (lastValidatedAt > 12 months): 8
[StaleSkillFlaggingService] Suggestions successfully created: 6
[StaleSkillFlaggingService] Suggestions skipped due to existing PENDING suggestions: 2
[StaleSkillFlaggingService] Skills excluded due to isActive = false: 0
```
