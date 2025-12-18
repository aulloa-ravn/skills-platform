# Spec Requirements: Skill Resolution API

## Initial Description
Roadmap item 11: Skill Resolution API — Implement mutation for batch processing validation decisions (Approve, Adjust Level, Reject) with proper database updates

This is a GraphQL mutation API that will allow tech leads and admins to process pending skill suggestions by approving them, adjusting their proficiency level, or rejecting them. This needs to handle batch operations and update the database accordingly.

## Requirements Discussion

### First Round Questions

**Q1:** Mutation Structure - I assume we'll follow the existing pattern in `mutations.ts` where the mutation takes an input object (like `ResolveSuggestionsInput!`) and returns a response containing success status and processed suggestions. Should the mutation be named `resolveSuggestions` and return something like `{ success: Boolean!, processed: [ResolvedSuggestion!]!, errors: [ResolutionError!] }`?

**Answer:** Approved - `resolveSuggestions` returning `{ success: Boolean!, processed: [ResolvedSuggestion!]!, errors: [ResolutionError!] }`

**Q2:** Batch Input Format - I'm thinking the input should be an array of decision objects, where each contains `suggestionId`, `action` (APPROVE/ADJUST_LEVEL/REJECT), and optionally `adjustedProficiency` (for ADJUST_LEVEL actions). Should we structure it as: `input: { decisions: [{ suggestionId: String!, action: ResolutionAction!, adjustedProficiency: String }!]! }`?

**Answer:** Approved - `input: { decisions: [{ suggestionId: String!, action: ResolutionAction!, adjustedProficiency: String }!]! }`

**Q3:** Approve Action Database Changes - When approving a suggestion, I assume we should: (a) create a new ValidatedSkill record with the suggested proficiency, (b) set validator_id to the current user's ID, (c) delete the PendingSuggestion record, and (d) update validatedAt timestamp. Is that the complete flow, or are there other tables/fields to update?

**Answer:** Update Suggestion status (not delete), create EmployeeSkill record, validator = current tech lead

**Q4:** Adjust Level Action - For adjusting proficiency level, I assume the flow is the same as approval but uses the `adjustedProficiency` value instead of `suggestedProficiency`. Should we also track somewhere that this was adjusted (not just approved as-is), or is that distinction unnecessary?

**Answer:** Same as approval but use adjustedProficiency, no need to track adjustments

**Q5:** Reject Action - When rejecting, I assume we simply delete the PendingSuggestion record without creating any ValidatedSkill. Should we maintain an audit log of rejections somewhere, or is deletion sufficient?

**Answer:** Update Suggestion status to REJECTED (not delete)

**Q6:** Authorization - Based on the `GET_VALIDATION_INBOX_QUERY` comment, I assume TECH_LEAD users can only resolve suggestions for their own project team members, while ADMIN users can resolve any suggestion. Should the mutation enforce these same role-based permissions on the backend?

**Answer:** Same role-based permissions as inbox (TECH_LEAD for their team, ADMIN for all)

**Q7:** Core Stack Classification - Looking at the three-tier structure (coreStack, validatedInventory, pending), when a skill is approved/adjusted, how do we determine if it goes into coreStack vs validatedInventory? Is there a field on the Skill or Project that defines which skills are "core" for a team?

**Answer:** Core stack = skills mapped to current active assignments, validated inventory = other verified skills

**Q8:** Partial Failure Handling - If processing a batch of 10 suggestions and 2 fail (maybe due to concurrent updates or validation errors), should the mutation: (a) roll back the entire batch, or (b) process successfully what it can and return errors for the failed items? I'm assuming option (b) with individual error tracking per suggestion ID.

**Answer:** Option b - process what can be processed and return errors for failed items

**Q9:** Validation Rules - Should the mutation validate that: (a) the suggestion ID exists and is still pending, (b) the user has permission for that specific suggestion, (c) for ADJUST_LEVEL, the adjustedProficiency is a valid proficiency level? Are there proficiency level constraints we should enforce?

**Answer:** Approved - validate suggestion exists/pending, user has permission, adjustedProficiency is valid

**Q10:** Edge Cases - What should happen if: (a) a suggestion was already processed by another user before this request completes, (b) the employee associated with the suggestion no longer exists, or (c) multiple actions are submitted for the same suggestion ID in one batch?

**Answer:**
- (a) Only assigned TL can process suggestions for their project
- (b) Delete suggestions from non-existent employees
- (c) Multiple actions for same suggestion ID: process only first occurrence and ignore duplicates

**Q11:** Scope Boundaries - I assume this mutation ONLY handles the resolution logic and doesn't trigger any notifications, emails, or real-time updates to other users. Are there any side effects beyond database updates that should be in scope, or should those be handled separately?

**Answer:** Keep mutation focused on resolution logic and database updates only, no side effects like notifications

### Existing Code to Reference

**Similar Features Identified:**
- Mutation patterns: `LOGIN_MUTATION` and `REFRESH_TOKEN_MUTATION` in `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/graphql/mutations.ts`
- Query patterns and TypeScript interfaces: `/Users/anthonyulloa/Desktop/Projects/personal/skills-platform/apps/client/src/graphql/queries.ts`
- Authorization logic: Reference inbox role-based filtering logic from `GET_VALIDATION_INBOX_QUERY`
- Backend patterns: Prisma service patterns from the codebase

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
Not applicable - this is a backend GraphQL API feature without UI components.

## Requirements Summary

### Functional Requirements

**Mutation Structure:**
- Mutation name: `resolveSuggestions`
- Input type: `ResolveSuggestionsInput!` containing `decisions: [DecisionInput!]!`
- Each DecisionInput contains:
  - `suggestionId: String!`
  - `action: ResolutionAction!` (enum: APPROVE, ADJUST_LEVEL, REJECT)
  - `adjustedProficiency: String` (optional, required only for ADJUST_LEVEL)
- Return type: `ResolveSuggestionsResponse` containing:
  - `success: Boolean!`
  - `processed: [ResolvedSuggestion!]!`
  - `errors: [ResolutionError!]!`

**Action Behaviors:**

1. **APPROVE Action:**
   - Update Suggestion record status to APPROVED (do not delete)
   - Create new EmployeeSkill record with:
     - Skill name and discipline from suggestion
     - Proficiency level = suggestedProficiency from suggestion
     - validator_id = current user's ID (tech lead or admin)
     - validatedAt = current timestamp
   - Classification: Skill automatically goes to coreStack if mapped to employee's current active assignments, otherwise to validatedInventory

2. **ADJUST_LEVEL Action:**
   - Same flow as APPROVE
   - Use `adjustedProficiency` from input instead of `suggestedProficiency`
   - No need to track that adjustment occurred (treat same as approval)

3. **REJECT Action:**
   - Update Suggestion record status to REJECTED (do not delete)
   - Do not create EmployeeSkill record
   - Maintain audit trail by keeping rejected suggestion in database

**Batch Processing:**
- Process multiple decisions in a single mutation call
- Use partial failure handling: process what can be processed successfully
- Return individual errors for failed items with suggestionId reference
- Continue processing remaining items even if some fail

**Authorization Rules:**
- TECH_LEAD role: Can only process suggestions for employees on their assigned projects
- ADMIN role: Can process any suggestion across all projects
- Enforce same role-based permissions as `GET_VALIDATION_INBOX_QUERY`
- Validate per-suggestion authorization (user has permission for that specific suggestion)

**Validation Requirements:**
- Verify suggestion ID exists in database
- Verify suggestion status is PENDING (not already processed)
- Verify user has permission for the specific suggestion
- For ADJUST_LEVEL action: validate that adjustedProficiency is a valid proficiency level value
- Handle duplicate suggestion IDs in batch: process only first occurrence, ignore subsequent duplicates

**Edge Case Handling:**
- Concurrent processing: Only the assigned tech lead for a project can process suggestions, reducing race conditions
- Non-existent employees: Delete suggestions associated with employees who no longer exist
- Duplicate suggestion IDs in single batch: Process first occurrence only, silently ignore duplicates
- Already processed suggestions: Return error for that suggestion, continue with others

### Reusability Opportunities

**Patterns to Follow:**
- GraphQL mutation structure from `mutations.ts` (LOGIN_MUTATION, REFRESH_TOKEN_MUTATION)
- TypeScript interface patterns from `queries.ts` for type safety
- Authorization logic patterns from GET_VALIDATION_INBOX_QUERY implementation

**Backend Components:**
- Prisma service patterns for database operations
- Role-based authorization middleware/helpers
- Transaction handling for batch operations

### Scope Boundaries

**In Scope:**
- GraphQL mutation definition (`resolveSuggestions`)
- Input/output type definitions (ResolveSuggestionsInput, ResolveSuggestionsResponse, etc.)
- Backend resolver implementation
- Database updates for Suggestion and EmployeeSkill tables
- Authorization enforcement (TECH_LEAD vs ADMIN permissions)
- Validation logic for suggestion IDs, proficiency levels, and permissions
- Error handling and partial failure reporting
- Batch processing logic with individual error tracking
- Edge case handling (duplicates, concurrent updates, non-existent employees)

**Out of Scope:**
- Notification system (emails, push notifications, etc.)
- Real-time updates to other connected users
- UI components for invoking this mutation
- Audit logging beyond status updates in Suggestion table
- Analytics or reporting on resolution patterns
- Undo/rollback functionality for processed suggestions
- Bulk selection or filtering helpers (frontend concern)

### Technical Considerations

**Technology Stack:**
- Frontend: React 19.2.0, TypeScript, Apollo Client 4.0.10
- GraphQL for API layer
- Backend: Prisma ORM (inferred from existing patterns)
- Database: Relational database with Suggestion and EmployeeSkill tables

**Database Schema Implications:**
- Suggestion table must have status field (values: PENDING, APPROVED, REJECTED)
- Suggestion table must reference employee and skill information
- EmployeeSkill table must have validator_id field for tracking who validated
- EmployeeSkill table must have validatedAt timestamp field
- Need to determine core stack vs validated inventory based on employee's current assignments

**Integration Points:**
- Must integrate with existing authorization system (role-based access control)
- Must work with existing GET_VALIDATION_INBOX_QUERY data structure
- Must update data that feeds into GET_PROFILE_QUERY (skills sections)
- Should follow existing GraphQL schema conventions and naming patterns

**Error Handling:**
- Individual error tracking per suggestion ID
- Clear error messages for validation failures
- Graceful degradation (partial success scenarios)
- Type-safe error responses with ResolutionError type

**Similar Code Patterns:**
- Follow mutation input pattern: `mutation(input: XyzInput!)`
- Follow response wrapper pattern with success boolean
- Use TypeScript interfaces for all types (similar to queries.ts)
- Maintain consistency with existing GraphQL naming conventions
