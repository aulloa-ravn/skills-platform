# Spec Requirements: Self-Report Skills UI

## Initial Description

Build skill suggestion form with taxonomy autocomplete, proficiency selector, and submission confirmation.

This is for the Ravn Skills Platform. The feature should provide the frontend UI for the Self-Report Skills API (Item 7) that was just completed. Employees should be able to search for skills from the taxonomy using an autocomplete input, select their proficiency level, and submit the skill suggestion. The UI should show confirmation when the submission is successful and handle errors appropriately.

The system already has:
- Self-Report Skills API (Item 7) with submitSkillSuggestion mutation that accepts skillId and proficiencyLevel
- Skills taxonomy with 131+ skills across 16 disciplines
- Four-tier proficiency system (NOVICE, INTERMEDIATE, ADVANCED, EXPERT)
- Error codes: SKILL_ALREADY_EXISTS, SKILL_NOT_FOUND, SKILL_INACTIVE, UNAUTHORIZED
- React frontend with TanStack Router, Apollo Client, Shadcn UI, Tailwind CSS
- Authentication system with EMPLOYEE, TECH_LEAD, ADMIN roles

## Requirements Discussion

### First Round Questions

**Q1:** I assume this skill suggestion form should be added as a section or modal within the existing Employee Profile page (Item 6) where employees can see their current skills. Is that correct, or should this be a separate standalone page?

**Answer:** That's correct - as a modal within the existing Employee Profile page.

**Q2:** For the taxonomy autocomplete, I'm thinking we should fetch all active skills from the backend and filter client-side for instant search results, similar to how modern autocomplete components work. Should we show the discipline (e.g., "React - Frontend") alongside the skill name in the dropdown to help users distinguish similar skills?

**Answer:** That's correct - show discipline alongside skill name. Use Combobox component for skill autocomplete.

**Q3:** For the proficiency selector, I assume we should display all four levels (NOVICE, INTERMEDIATE, ADVANCED, EXPERT) as radio buttons or a select dropdown with descriptions for each level. Should we provide guidance text explaining what each proficiency level means, or keep it simple with just the level names?

**Answer:** That's correct - display all four levels with just the level names (no descriptions).

**Q4:** When a user successfully submits a skill suggestion, I'm thinking we should show a toast notification and either close the form (if modal) or reset it (if inline), and immediately update the "Pending" section of their profile to show the new suggestion. Is that the expected behavior?

**Answer:** That's correct - toast notification, close modal/reset form, update Pending section.

**Q5:** For error handling, I assume we should show user-friendly messages for the API error codes: SKILL_ALREADY_EXISTS ("You already have this skill in your profile"), SKILL_NOT_FOUND ("This skill is not available"), SKILL_INACTIVE ("This skill is no longer active"), and UNAUTHORIZED ("You need to be logged in"). Should these be displayed as toast notifications or inline form errors?

**Answer:** That's correct - display as toast notifications.

**Q6:** I'm thinking the form should validate that both a skill and proficiency level are selected before allowing submission, with the submit button disabled until both fields are filled. Should we also prevent users from submitting duplicate skills that are already in their "Pending" or "Validated" sections?

**Answer:** That's correct - validate both fields, disable submit button, prevent duplicate submissions.

**Q7:** For the autocomplete UX, should we show a "No results found" message if the user's search doesn't match any skills in the taxonomy? And should we limit the displayed results to a reasonable number (e.g., 10 skills) with scrolling?

**Answer:** That's correct - show "No results found" message, limit to ~10 results with scrolling.

**Q8:** Are there any specific scenarios or edge cases we should NOT handle in this iteration? For example, should we skip features like: bulk skill submission, skill filtering by discipline before autocomplete, or the ability to add notes/context to skill suggestions?

**Answer:** That's correct - skip bulk submission, discipline filtering, notes/context.

### Existing Code to Reference

**Similar Features Identified:**

Based on codebase analysis, the following existing code should be referenced:

- **Modal Pattern**: `/apps/web/src/modules/admin-skills/components/add-skill-modal.tsx` and `/apps/web/src/modules/admin-skills/components/edit-skill-modal.tsx` - Existing modal implementations for skill management forms
- **Combobox Component**: `/apps/web/src/shared/components/ui/combobox.tsx` - Available Shadcn UI component for autocomplete functionality
- **Dialog Component**: `/apps/web/src/shared/components/ui/dialog.tsx` - Available Shadcn UI component for modal structure
- **Radio Group Component**: `/apps/web/src/shared/components/ui/radio-group.tsx` - Available Shadcn UI component for proficiency selector
- **Skills Query**: `/apps/web/src/modules/admin-skills/graphql/get-all-skills.query.generated.tsx` - Existing GraphQL query for fetching skills taxonomy
- **Profile Components**: `/apps/web/src/modules/profile/components/skill-sections.tsx` - Where the "Add Skill" button should be placed and Pending section should be updated
- **Profile Page**: `/apps/web/src/modules/profile/profile.tsx` - Main profile page where modal will be integrated
- **Toast Notifications**: `/apps/web/src/shared/components/ui/sonner.tsx` - Available Sonner component for toast notifications

### Follow-up Questions

**Follow-up 1:** For preventing duplicate skill submissions (question 6), should we check against skills that are already in both the "Pending" section AND the "Core Stack/Validated Inventory" sections of the user's profile? Or just prevent duplicates within the Pending section? This will help determine if we need to disable certain skills in the autocomplete or just show an error message when they try to submit.

**Answer:** Check against skills that are already in both the "Pending" section AND the "Core Stack/Validated Inventory" sections. This means we should prevent submission if the skill exists in either: Pending section (suggestions awaiting approval) or Core Stack/Validated Inventory (already validated skills). This aligns with the backend API validation from Item 7 that checks both EmployeeSkill and Suggestion tables.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

No visual assets provided.

## Requirements Summary

### Functional Requirements

**Core Functionality:**
- Modal dialog on Employee Profile page for submitting skill suggestions
- Skill search with autocomplete using Combobox component
- Display skills with format: "Skill Name - Discipline" in autocomplete dropdown
- Proficiency level selector with four options (NOVICE, INTERMEDIATE, ADVANCED, EXPERT)
- Submit button that creates skill suggestion via submitSkillSuggestion mutation
- Success confirmation via toast notification
- Automatic modal close and form reset on successful submission
- Error handling via toast notifications for all API error codes

**User Actions Enabled:**
- Open "Add Skill" modal from profile page
- Search and select skill from taxonomy autocomplete
- Select proficiency level from four options
- Submit skill suggestion
- View success/error feedback
- Close modal manually or automatically after success

**Data Management:**
- Fetch all active skills from taxonomy for autocomplete
- Client-side filtering of skills based on search input
- Submit skillId and proficiencyLevel to backend API
- Update profile data to reflect new pending suggestion
- Validate against existing skills (both pending and validated)

**Form Validation:**
- Both skill and proficiency level required before submission
- Submit button disabled until both fields populated
- Prevent duplicate submissions for skills already in Pending or Validated sections
- Show "No results found" when search yields no matches
- Limit autocomplete results to approximately 10 items with scrolling

**Error Handling:**
- SKILL_ALREADY_EXISTS: "You already have this skill in your profile"
- SKILL_NOT_FOUND: "This skill is not available"
- SKILL_INACTIVE: "This skill is no longer active"
- UNAUTHORIZED: "You need to be logged in"
- All errors displayed as toast notifications (not inline)

### Reusability Opportunities

**Components to Reuse:**
- Shadcn UI Dialog component for modal structure
- Shadcn UI Combobox component for skill autocomplete
- Shadcn UI Radio Group component for proficiency selector
- Shadcn UI Button component for submit/cancel actions
- Sonner toast component for notifications

**Backend Patterns to Reference:**
- Self-Report Skills API mutation: submitSkillSuggestion(skillId, proficiencyLevel)
- getAllSkills query for taxonomy data
- Error code handling from Item 7 API implementation

**Similar Features to Model After:**
- Admin Skills Management modals (add-skill-modal.tsx, edit-skill-modal.tsx) for modal structure and form patterns
- Profile page skill sections component for integration point and data refresh

### Scope Boundaries

**In Scope:**
- Single skill submission modal on Employee Profile page
- Skill autocomplete with taxonomy search
- Proficiency level selection (4 options, names only)
- Form validation (required fields, duplicate prevention)
- Success toast notification and modal close
- Error toast notifications for all API error codes
- Profile Pending section update after successful submission
- Client-side filtering with ~10 result limit
- "No results found" message for empty searches

**Out of Scope:**
- Bulk skill submission (multiple skills at once)
- Skill filtering by discipline before autocomplete
- Notes or context fields for skill suggestions
- Proficiency level descriptions or guidance text
- Standalone page for skill submission (modal only)
- Email notifications
- Admin approval workflow UI (handled in Validation Inbox, Item 10)

### Technical Considerations

**Integration Points:**
- Employee Profile page (/apps/web/src/modules/profile/profile.tsx)
- Profile skill sections component for "Add Skill" button placement
- Self-Report Skills API submitSkillSuggestion mutation
- getAllSkills query for taxonomy data
- Apollo Client for GraphQL mutations and cache updates

**Technology Stack:**
- React 19 with TypeScript
- TanStack Form for form state management
- Apollo Client v4 for GraphQL mutations
- Shadcn UI components (Dialog, Combobox, Radio Group, Button)
- Sonner for toast notifications
- Tailwind CSS for styling
- Zod for form validation

**Existing System Constraints:**
- Must use existing submitSkillSuggestion mutation from Item 7
- Must align with four-tier proficiency system (NOVICE, INTERMEDIATE, ADVANCED, EXPERT)
- Must handle all defined error codes from backend API
- Must check duplicates against both EmployeeSkill and Suggestion data
- Must maintain authentication context (EMPLOYEE role access)

**Similar Code Patterns to Follow:**
- Modal implementation pattern from admin-skills module
- GraphQL mutation patterns with Apollo Client
- Toast notification patterns using Sonner
- Form validation patterns with TanStack Form and Zod
- Combobox usage patterns from existing Shadcn UI components
