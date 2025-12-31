# Validation Inbox - Missing Data (Hardcoded)

This document lists the data required by the UI that is not available from the `getValidationInbox` GraphQL query and has been hardcoded.

## ✅ Available from API

The following data is successfully retrieved from the API:

### Project Level
- `projectId` - Unique identifier
- `projectName` - Project name
- `pendingSuggestionsCount` - Total pending suggestions

### Employee Level
- `employeeId` - Unique identifier
- `employeeName` - Employee's full name
- `employeeEmail` - Employee's email
- `employeeCurrentSeniorityLevel` - Current seniority (JUNIOR_ENGINEER, MID_ENGINEER, SENIOR_ENGINEER, STAFF_ENGINEER)
- `employeeAvatarUrl` - Avatar image URL
- `pendingSuggestionsCount` - Employee's pending suggestions count

### Suggestion Level
- `id` - Suggestion unique identifier
- `skillName` - Name of the skill
- `discipline` - Skill category (FRONTEND, BACKEND, etc.)
- `suggestedProficiency` - Suggested proficiency level (NOVICE, INTERMEDIATE, ADVANCED, EXPERT)
- `currentProficiency` - Current proficiency level (if skill already exists)
- `source` - Suggestion source (SELF_REPORT, SYSTEM_FLAG)
- `createdAt` - When the suggestion was created

---

## ❌ Missing from API (Hardcoded)

### 1. **Project Technology/Specialty**
**Location**: `validation-inbox.tsx:80`
```typescript
tech: 'General', // Hardcoded - API doesn't provide project tech/specialty
```

**Why Missing:**
- The API returns `ProjectInbox` with `projectName` but doesn't include a tech stack or specialty field (e.g., "Frontend", "Backend", "Mobile")
- The UI displays a badge showing the project's technology focus

**Current Solution:**
- All projects show "General" as their tech specialty
- This is displayed as a secondary badge in the sidebar next to the project name

**To Make Dynamic:**
Add a `technology` or `specialty` field to the `Project` model in Prisma and expose it in the `ProjectInbox` GraphQL type.

---

### 2. **Employee Job Role/Title**
**Location**: `validation-inbox.tsx:106`
```typescript
role: SeniorityLevelMap[employee.employeeCurrentSeniorityLevel], // Using seniority as role
```

**Why Missing:**
- The API provides `employeeCurrentSeniorityLevel` (e.g., SENIOR_ENGINEER) but not a specific job title (e.g., "Backend Engineer", "Frontend Developer")
- The UI previously showed role like "Backend Engineer" separate from seniority

**Current Solution:**
- Using formatted seniority level as the role display
- Example: `SENIOR_ENGINEER` → "Senior Engineer"

**To Make Dynamic:**
Add a `jobTitle` or `role` field to the `Profile` model and include it in the `EmployeeInbox` type.

---

### 3. **Project Assignment Details**
**Location**: `validation-inbox.tsx:108`
```typescript
currentProject: project.projectName, // Hardcoded - API doesn't provide project specialty detail
```

**Why Missing:**
- The UI previously showed detailed project assignment like "Project Alpha (Backend)"
- The API only returns the `projectName` without assignment-specific details

**Current Solution:**
- Displaying just the project name without specialty suffix
- Example: "Project Alpha" instead of "Project Alpha (Backend)"

**To Make Dynamic:**
Include assignment role or specialty in the `EmployeeInbox` type, potentially from the `Assignment` relationship.

---

### 4. **Suggestion Source Person Name**
**Location**: `validation-inbox.tsx:89-94`
```typescript
suggestedBy:
  suggestion.source === 'SELF_REPORT'
    ? 'Self'
    : suggestion.source === 'SYSTEM_FLAG'
      ? 'System'
      : 'Unknown', // Hardcoded mapping - API doesn't provide specific suggester name
```

**Why Missing:**
- The API provides `source` enum (SELF_REPORT, SYSTEM_FLAG) but not who specifically suggested it
- The old UI showed names like "Sarah" or "Manager" who suggested the skill

**Current Solution:**
- Mapping source enum to generic labels:
  - `SELF_REPORT` → "Self"
  - `SYSTEM_FLAG` → "System"
- No specific person name is shown

**To Make Dynamic:**
Add a `suggestedById` field to the `Suggestion` model to track who created the suggestion, and include the suggester's profile info in the query response.

---

### 5. **Suggestion Status**
**Location**: `validation-inbox.tsx:87`
```typescript
status: 'pending' as const, // Hardcoded - API doesn't track approval status
```

**Why Missing:**
- The `Suggestion` model doesn't have a status field for tracking approval/rejection
- Suggestions are either pending (exist in table) or resolved (deleted/updated to EmployeeSkill)

**Current Solution:**
- All suggestions are marked as "pending" status
- No visual distinction for approved/rejected states

**To Make Dynamic:**
The current architecture doesn't store approval history. Options:
1. Add a `status` enum field to `Suggestion` model
2. Create a separate `SuggestionHistory` table to track state changes
3. Keep current approach where pending = exists, approved/rejected = deleted

---

### 6. **~~Revalidation Suggestions~~** ✅ FIXED
**Status**: Now properly implemented using `source` field

The `source` field from the API correctly maps to suggestion types:
- `SELF_REPORT` → type: "suggestion" (new skill claim)
- `SYSTEM_FLAG` → type: "revalidation" (re-validation required)

The UI now properly displays:
- Different card titles ("New Skill Claim" vs "Re-validation Required")
- Different badges ("Pending Review" vs "Clarification Needed")
- Different descriptions and context
- Type indicator in the Review tab ("New Claim" vs "Re-validation")

---

## 📊 Summary of Hardcoded Values

| Data Point | Hardcoded Value | Impact | Priority |
|------------|----------------|--------|----------|
| Project tech specialty | "General" | Low - informational only | Low |
| Employee job role | Uses seniority level | Low - seniority is displayed | Low |
| Project assignment detail | Just project name | Low - still shows project | Low |
| Suggester person name | "Self" / "System" | Medium - less context | Medium |
| Suggestion status | Always "pending" | Low - accurate for inbox | Low |
| ~~Revalidation vs new~~ | ~~All "suggestion"~~ | ✅ **FIXED** - Now uses `source` field | ~~Medium~~ |

---

## 🎯 Recommendations

### High Priority
None - current implementation works well with available data

### Medium Priority
1. **Add suggester tracking** - Helps Tech Leads understand who specifically flagged the skill (currently shows "Self" or "System")

### Low Priority
1. **Add project tech stack** - Nice visual categorization (currently shows "General")
2. **Add job titles** - Already have seniority level which serves similar purpose

---

## 🔄 Data Transformation

The transformation function (`transformInboxData`) maps API data to UI format:

```typescript
API Response (GetValidationInboxQuery)
  └─ projects: ProjectInbox[]
      ├─ projectId, projectName, pendingSuggestionsCount
      └─ employees: EmployeeInbox[]
          ├─ employeeId, employeeName, employeeEmail
          ├─ employeeCurrentSeniorityLevel, employeeAvatarUrl
          └─ suggestions: PendingSuggestion[]
              ├─ id, skillName, discipline
              ├─ suggestedProficiency, currentProficiency
              └─ source, createdAt

↓ transforms to ↓

UI Format (Project[])
  └─ id, name, tech (hardcoded), pendingCount
      └─ employees: Employee[]
          ├─ id, name, email, role (from seniority)
          ├─ avatar, currentProject (hardcoded)
          └─ allSkills: SkillValidation[]
              ├─ id, skill, discipline
              ├─ status (hardcoded), type (hardcoded)
              ├─ suggestedBy (hardcoded mapping)
              ├─ suggestedProficiency, currentProficiency
              └─ createdAt
```
