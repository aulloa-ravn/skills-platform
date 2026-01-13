# Spec Requirements: Self-Report Skills API

## Initial Description
Implement mutation for employees to submit new skill suggestions with proficiency level, creating pending validation requests.

This feature is for the Ravn Skills Platform. The feature should allow employees to self-report skills they have, which will create pending suggestions that need to be validated by their Tech Leads. This is part of the skill validation workflow where employees can add skills to their profile that will go through an approval process.

## Requirements Discussion

### First Round Questions

**Q1:** I assume employees can only suggest skills that already exist in the canonical skills taxonomy (no free-text entry), and they'll use an autocomplete search to select from the 131+ existing skills. Is that correct, or should employees be able to request brand-new skills that aren't in the taxonomy yet?
**Answer:** That's correct - employees can only suggest skills from the existing taxonomy (no free-text entry).

**Q2:** I'm thinking employees should only be able to self-report a skill once - meaning if they already have a pending, approved, or rejected suggestion for a particular skill, they can't create another suggestion for that same skill. Should we enforce this rule, or allow re-submissions (for example, if a previous suggestion was rejected)?
**Answer:** Allow suggestions to be resubmitted only if a previous suggestion was REJECTED.

**Q3:** When an employee submits a skill suggestion, I assume the system should automatically route it to their current project's Tech Lead based on their active assignments from the seeded data. Is that correct, or should employees be able to choose which Tech Lead reviews it?
**Answer:** That's correct - system automatically routes to current project's Tech Lead.

**Q4:** I assume the mutation should return the newly created Suggestion object with its ID, status (PENDING), skill details, and proficiency level so the frontend can show immediate confirmation. Is that the expected response structure?
**Answer:** That's correct - return the newly created Suggestion object.

**Q5:** For proficiency levels, I assume we're using the four-tier system mentioned in the product mission (Novice, Intermediate, Advanced, Expert). Should these be enforced as an enum, or is there a different proficiency structure?
**Answer:** That's correct - use the four-tier system (Novice, Intermediate, Advanced, Expert).

**Q6:** Should employees be able to submit multiple skills at once (batch submission), or is this strictly one skill suggestion at a time?
**Answer:** One skill suggestion at a time (no batch submission).

**Q7:** I assume there are no special permissions needed beyond being authenticated as an EMPLOYEE role. Is that correct, or should we add any additional restrictions (like only employees with active assignments can suggest skills)?
**Answer:** That's correct - just need to be authenticated as EMPLOYEE role.

**Q8:** Are there any edge cases or scenarios we should explicitly exclude from this feature? For example, what should happen if an employee has no current project assignment - should they still be able to submit skill suggestions?
**Answer:** Exclude edge cases.

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

**Follow-up 1:** You mentioned allowing re-submissions only if a previous suggestion was REJECTED. Should we automatically allow creating a new suggestion (treating the rejected one as closed), or should employees be able to see their rejection reason and explicitly choose to re-submit with a different proficiency level?
**Answer:** Employees should only be able to self-report a skill once.

**Follow-up 2:** You mentioned excluding edge cases, but I want to confirm one important scenario: If an employee has no current project assignment (or their assignment has no Tech Lead), should the mutation fail with a clear error message ("You must have an active project assignment to suggest skills"), or create the suggestion anyway but leave it unassigned/in limbo until they get a project?
**Answer:** All employees have assignments and their respective technical leader - no edge case handling needed.

**Follow-up 3:** When checking if an employee can suggest a skill, should we block suggestions if they already have that skill as PENDING (awaiting review), already have that skill as APPROVED (validated skill in their profile), or only block PENDING and APPROVED, but allow if REJECTED or ADJUSTED?
**Answer:** The employee will only be able to submit skills that are NOT in their EmployeeSkills OR Suggestions tables. This means block if:
- They already have the skill as a validated skill (EmployeeSkill record exists, regardless of status)
- They already have ANY suggestion for that skill (Suggestion record exists, regardless of status - PENDING, APPROVED, REJECTED, ADJUSTED)

**Follow-up 4:** Since you didn't mention existing code, let me ask specifically: Are there existing GraphQL mutations in your codebase that create Suggestion records or interact with the Suggestion model? For example, the skill resolution mutation that processes validation decisions, any admin mutations that create suggestions, or any service files like `SuggestionsService` or similar?
**Answer:** Not provided by user - implementation team should discover existing patterns during development.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual assets provided.

## Requirements Summary

### Functional Requirements
- Employees can submit skill suggestions by selecting from the existing canonical skills taxonomy (131+ skills across 16 disciplines)
- Each skill submission requires a proficiency level selection from four-tier system: Novice, Intermediate, Advanced, Expert
- System creates a new Suggestion record with status PENDING upon successful submission
- Suggestion is automatically routed to the Tech Lead of the employee's current project based on their active assignment
- Mutation returns the newly created Suggestion object including ID, status, skill details, and proficiency level
- Single skill submission only (no batch operations)
- Employees can only submit a skill once - blocked if they have ANY existing record for that skill

### Reusability Opportunities
- Implementation team should explore existing GraphQL mutation patterns in the codebase
- Look for existing service objects that interact with the Suggestion model
- Reference skill resolution mutation for similar validation decision handling patterns
- Check for existing proficiency level enum definitions
- Investigate current Tech Lead routing logic from active assignments

### Scope Boundaries
**In Scope:**
- GraphQL mutation for creating skill suggestions
- Validation to prevent duplicate skill submissions (check both EmployeeSkills and Suggestions tables)
- Proficiency level selection (four-tier enum)
- Automatic Tech Lead routing based on current project assignment
- Return newly created Suggestion object
- Authentication requirement (EMPLOYEE role)

**Out of Scope:**
- Batch submission of multiple skills at once
- Free-text skill entry (only existing taxonomy skills allowed)
- Re-submission of rejected suggestions
- Manual Tech Lead selection by employee
- Edge case handling for employees without assignments (system assumes all employees have assignments)
- Creating new skills in the taxonomy
- UI implementation (covered in separate spec: Item 8 - Self-Report Skills UI)

### Technical Considerations
- GraphQL API using NestJS backend with Apollo Server
- Prisma ORM for database operations (PostgreSQL)
- JWT authentication with role-based access control (EMPLOYEE role required)
- Suggestion model has status field with enum values: PENDING, APPROVED, REJECTED, ADJUSTED
- Must query both EmployeeSkills and Suggestions tables to check for duplicates
- Must query current Assignment to determine Tech Lead for routing
- Proficiency levels should be enforced as enum: NOVICE, INTERMEDIATE, ADVANCED, EXPERT
- System assumes all employees have active project assignments with assigned Tech Leads
