# Specification: Self-Report Skills UI

## Goal
Enable employees to suggest skills for their profile through a modal interface on their Employee Profile page, using taxonomy autocomplete and proficiency selection, with immediate feedback and profile updates.

## User Stories
- As an employee, I want to search for skills from the canonical taxonomy and add them to my profile with my self-assessed proficiency level, so that my tech lead can review and validate my skills
- As an employee, I want clear feedback when my skill suggestion is submitted successfully or if there are any errors, so that I know whether my suggestion was recorded

## Specific Requirements

**Add Skill Button in Profile**
- Place "Add Skill" button in the Pending Validation section of the Skills page component
- Button opens a Dialog modal when clicked
- Button should be visible only when viewing own profile (not when viewing other profiles)
- Use existing Button component with PlusIcon from lucide-react

**Modal Dialog Structure**
- Use Shadcn Dialog component (Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter)
- Modal title: "Add Skill to Your Profile"
- Modal description: "Search for a skill from our taxonomy and select your proficiency level"
- Include close button (X) in top-right corner
- Modal should close on successful submission or when cancel is clicked

**Skill Autocomplete Input**
- Use Shadcn Combobox component for skill search with autocomplete
- Fetch all active skills using getAllSkills query with input filter: { isActive: true }
- Display skills in format: "Skill Name - Discipline" (e.g., "React - Frontend")
- Client-side filtering based on user input matching skill name or discipline
- Limit displayed results to 10 items with scrolling using ComboboxList
- Show "No skills found" message using ComboboxEmpty when search yields no matches
- Clear button (X) to reset the autocomplete field
- Field label: "Skill"
- Placeholder text: "Search for a skill..."

**Proficiency Level Selector**
- Use Shadcn RadioGroup component with RadioGroupItem for each proficiency level
- Display all four levels: NOVICE, INTERMEDIATE, ADVANCED, EXPERT (in this order)
- Each level shown as a radio button with just the level name (no descriptions)
- Use enum values from ProficiencyLevel type
- Field label: "Proficiency Level"
- Default: no selection (user must explicitly choose)

**Form State Management**
- Use TanStack Form for form state management
- Form fields: selectedSkillId (number), proficiencyLevel (ProficiencyLevel enum)
- Implement Zod validation schema requiring both fields to be filled
- Track form touched state and validation errors
- Display field-level validation errors using FieldError component

**Submit Button State**
- Submit button labeled "Add Skill"
- Button disabled when: form is invalid, loading state is active, or either field is empty
- Show loading spinner with text "Submitting..." when mutation is in progress
- Use existing Spinner component from shared/components/ui

**Duplicate Prevention**
- Check selected skill against existing skills in profile data before submission
- Prevent submission if skill exists in either Core Stack, Validated Inventory, or Pending sections
- Show toast error: "You already have this skill in your profile" using toast.error from sonner
- Implement check client-side by filtering profile.skills data structure

**GraphQL Mutation Integration**
- Create submitSkillSuggestion mutation hook using Apollo Client useMutation
- Mutation input: { skillId: number, proficiencyLevel: ProficiencyLevel }
- Mutation response: { suggestionId, status, suggestedProficiency, createdAt, skill { id, name, discipline } }
- Handle mutation errors with try-catch and display appropriate toast messages
- Update Apollo cache after successful mutation to refresh profile pending skills

**Success Flow**
- On successful submission, display toast.success: "Skill suggestion submitted successfully" with description: "Your tech lead will review your suggestion"
- Close the modal automatically
- Reset form to initial state (clear all fields)
- Update Pending Validation section to show newly added skill without page refresh

**Error Handling**
- SKILL_ALREADY_EXISTS: toast.error "You already have this skill in your profile"
- SKILL_NOT_FOUND: toast.error "This skill is not available in the taxonomy"
- SKILL_INACTIVE: toast.error "This skill is no longer active"
- UNAUTHORIZED: toast.error "You must be logged in to add skills"
- Network/unknown errors: toast.error "Failed to submit skill suggestion" with description: error.message

## Visual Design

No visual assets provided in planning folder.

## Existing Code to Leverage

**apps/web/src/shared/components/ui/dialog.tsx**
- Reuse Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter components for modal structure
- Follow pattern of showCloseButton prop for X button in corner
- Use DialogFooter with Cancel and Submit buttons

**apps/web/src/shared/components/ui/combobox.tsx**
- Use Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty components
- Follow pattern with showTrigger and showClear props
- Implement client-side filtering by mapping skills array and filtering based on input value
- Use ComboboxCollection for rendering filtered skill options

**apps/web/src/modules/admin-skills/components/add-skill-modal.tsx**
- Reference modal form structure using TanStack Form with validators
- Follow pattern of form submission with loading state and error handling
- Replicate pattern of handleOpenChange to reset form on modal close
- Use similar form field rendering with Field, FieldLabel, FieldError components

**apps/web/src/modules/admin-skills/graphql/get-all-skills.query.generated.tsx**
- Use getAllSkills query to fetch taxonomy skills for autocomplete
- Query returns: id, name, discipline, isActive, employeeCount, createdAt
- Filter for isActive: true when fetching

**apps/web/src/modules/profile/components/skill-sections.tsx**
- Add "Add Skill" button to PendingSkillsSection component
- Reference profile.skills structure to check for duplicate skills across all three sections
- Update component to accept modal toggle handler
- Follow existing card layout patterns for consistency

## Out of Scope
- Bulk skill submission (adding multiple skills at once)
- Filtering skills by discipline before using autocomplete
- Adding notes or context to skill suggestions
- Proficiency level descriptions or guidance tooltips
- Email notifications when suggestion is submitted
- Editing or deleting pending suggestions
- Admin approval workflow UI (covered in separate Item 10: Validation Inbox)
- Standalone page for skill submission (modal only)
- Skill suggestion history or audit log
- Custom skill creation (must select from existing taxonomy)
