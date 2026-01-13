# Task Breakdown: Self-Report Skills UI

## Overview
Total Tasks: 4 task groups with 18 sub-tasks

## Task List

### GraphQL Layer

#### Task Group 1: GraphQL Integration
**Dependencies:** None (leverages existing Item 7 API)

- [ ] 1.0 Complete GraphQL integration layer
  - [ ] 1.1 Write 2-8 focused tests for GraphQL mutation integration
    - Limit to 2-8 highly focused tests maximum
    - Test only critical mutation behaviors (e.g., successful submission, error response handling, cache update)
    - Skip exhaustive testing of all error codes and edge cases
  - [ ] 1.2 Create submitSkillSuggestion mutation hook
    - Location: `/apps/web/src/modules/profile/graphql/submit-skill-suggestion.mutation.ts`
    - Use Apollo Client useMutation hook
    - Input: { skillId: number, proficiencyLevel: ProficiencyLevel }
    - Response: { suggestionId, status, suggestedProficiency, createdAt, skill { id, name, discipline } }
    - Generate TypeScript types from GraphQL schema
  - [ ] 1.3 Set up Apollo cache update logic
    - Refetch or update profile.skills query after successful mutation
    - Ensure Pending Validation section shows newly added skill without page refresh
    - Follow existing cache update patterns in codebase
  - [ ] 1.4 Verify getAllSkills query availability
    - Confirm query exists: `/apps/web/src/modules/admin-skills/graphql/get-all-skills.query.generated.tsx`
    - Ensure query accepts filter input: { isActive: true }
    - Verify response includes: id, name, discipline, isActive
  - [ ] 1.5 Ensure GraphQL integration tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify mutation hook works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- submitSkillSuggestion mutation hook created with proper TypeScript types
- Apollo cache updates correctly after successful submission
- getAllSkills query confirmed available with isActive filter

### Form State & Validation

#### Task Group 2: Form Management
**Dependencies:** Task Group 1

- [ ] 2.0 Complete form state and validation logic
  - [ ] 2.1 Write 2-8 focused tests for form validation logic
    - Limit to 2-8 highly focused tests maximum
    - Test only critical validation behaviors (e.g., required fields validation, duplicate skill check, form reset)
    - Skip exhaustive testing of all validation scenarios
  - [ ] 2.2 Create Zod validation schema
    - Location: Create alongside form component or in shared validators
    - Fields: selectedSkillId (number, required), proficiencyLevel (ProficiencyLevel enum, required)
    - Ensure both fields are required before submission
  - [ ] 2.3 Set up TanStack Form instance
    - Initialize form with validators using Zod schema
    - Track form state: values, errors, touched, isSubmitting
    - Reference pattern from: `/apps/web/src/modules/admin-skills/components/add-skill-modal.tsx`
  - [ ] 2.4 Implement duplicate prevention logic
    - Check selected skillId against profile.skills data structure
    - Validate against Core Stack (coreStack array)
    - Validate against Validated Inventory (validatedSkills array)
    - Validate against Pending Validation (pendingSkills array)
    - Show toast.error: "You already have this skill in your profile" if duplicate found
  - [ ] 2.5 Add form reset functionality
    - Clear selectedSkillId and proficiencyLevel on successful submission
    - Reset form state when modal closes (using handleOpenChange)
    - Reset touched and error states
  - [ ] 2.6 Ensure form validation tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify required field validation works
    - Verify duplicate prevention logic functions correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- Zod schema validates both required fields
- TanStack Form tracks state correctly
- Duplicate prevention checks all three skill sections
- Form resets on submission and modal close

### UI Components

#### Task Group 3: Modal & Form Components
**Dependencies:** Task Group 2

- [ ] 3.0 Complete UI components
  - [ ] 3.1 Write 2-8 focused tests for UI component rendering
    - Limit to 2-8 highly focused tests maximum
    - Test only critical component behaviors (e.g., modal opens/closes, form submission, autocomplete interaction)
    - Skip exhaustive testing of all component states
  - [ ] 3.2 Create AddSkillModal component
    - Location: `/apps/web/src/modules/profile/components/add-skill-modal.tsx`
    - Use Shadcn Dialog component structure (Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter)
    - Modal title: "Add Skill to Your Profile"
    - Modal description: "Search for a skill from our taxonomy and select your proficiency level"
    - Include close button (X) in top-right corner using showCloseButton prop
    - Reference pattern from: `/apps/web/src/modules/admin-skills/components/add-skill-modal.tsx`
  - [ ] 3.3 Build skill autocomplete with Combobox
    - Use Shadcn Combobox component: Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty
    - Fetch all active skills using getAllSkills query with filter: { isActive: true }
    - Display format: "Skill Name - Discipline" (e.g., "React - Frontend")
    - Implement client-side filtering: filter skills array based on input value matching name or discipline
    - Limit displayed results to 10 items with scrolling using ComboboxList
    - Show "No skills found" using ComboboxEmpty when search yields no matches
    - Add clear button (X) using showClear prop
    - Field label: "Skill"
    - Placeholder: "Search for a skill..."
    - Integrate with TanStack Form field for selectedSkillId
  - [ ] 3.4 Build proficiency selector with RadioGroup
    - Use Shadcn RadioGroup component: RadioGroup, RadioGroupItem
    - Display all four levels: NOVICE, INTERMEDIATE, ADVANCED, EXPERT (in this order)
    - Use enum values from ProficiencyLevel type
    - Each level as radio button with level name only (no descriptions)
    - Field label: "Proficiency Level"
    - Default: no selection (user must explicitly choose)
    - Integrate with TanStack Form field for proficiencyLevel
  - [ ] 3.5 Implement field-level error display
    - Use FieldError component to show validation errors
    - Display errors below each field when form is touched and invalid
    - Follow existing form field rendering pattern with Field, FieldLabel, FieldError
  - [ ] 3.6 Create submit button with loading state
    - Button label: "Add Skill"
    - Disabled when: form is invalid, isSubmitting is true, or either field is empty
    - Show Spinner component with text "Submitting..." when mutation in progress
    - Use existing Spinner component from: `/apps/web/src/shared/components/ui`
  - [ ] 3.7 Add cancel button
    - Button label: "Cancel"
    - Place in DialogFooter alongside submit button
    - Close modal when clicked without form submission
  - [ ] 3.8 Integrate "Add Skill" button in profile
    - Location: `/apps/web/src/modules/profile/components/skill-sections.tsx`
    - Add button to PendingSkillsSection component
    - Use Button component with PlusIcon from lucide-react
    - Button text: "Add Skill"
    - Show button only when viewing own profile (not other profiles)
    - Button opens AddSkillModal when clicked using DialogTrigger
  - [ ] 3.9 Ensure UI component tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify modal opens and closes correctly
    - Verify autocomplete and radio group render correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Modal displays with correct title, description, and close button
- Skill autocomplete searches and displays up to 10 results with format "Name - Discipline"
- Proficiency selector shows all four levels as radio buttons
- Submit button disabled appropriately and shows loading state
- "Add Skill" button appears in Pending section of own profile only

### Error Handling & Success Flow

#### Task Group 4: User Feedback & Integration
**Dependencies:** Task Group 3

- [ ] 4.0 Complete error handling and success flow
  - [ ] 4.1 Write 2-8 focused tests for error handling and success flow
    - Limit to 2-8 highly focused tests maximum
    - Test only critical feedback scenarios (e.g., success toast, error toast, modal close on success)
    - Skip exhaustive testing of all error codes
  - [ ] 4.2 Implement submission handler
    - Create handleSubmit function using TanStack Form
    - Perform duplicate check before calling mutation
    - Call submitSkillSuggestion mutation with form values
    - Wrap mutation call in try-catch for error handling
    - Handle loading state during mutation
  - [ ] 4.3 Add success flow logic
    - On successful mutation, display toast.success: "Skill suggestion submitted successfully"
    - Success toast description: "Your tech lead will review your suggestion"
    - Close modal automatically after success
    - Reset form to initial state (clear all fields)
    - Verify Pending Validation section updates with new skill (via Apollo cache)
  - [ ] 4.4 Implement error handling for all API error codes
    - Use toast.error from sonner for all errors
    - SKILL_ALREADY_EXISTS: "You already have this skill in your profile"
    - SKILL_NOT_FOUND: "This skill is not available in the taxonomy"
    - SKILL_INACTIVE: "This skill is no longer active"
    - UNAUTHORIZED: "You must be logged in to add skills"
    - Network/unknown errors: "Failed to submit skill suggestion" with description: error.message
    - Parse GraphQL error extensions for error codes
  - [ ] 4.5 Add error handling for duplicate prevention
    - Show toast.error: "You already have this skill in your profile"
    - Display toast before mutation call when duplicate detected
    - Do not proceed with mutation if duplicate found
  - [ ] 4.6 Test end-to-end flow in browser
    - Open Employee Profile page
    - Click "Add Skill" button
    - Search for skill using autocomplete
    - Select proficiency level
    - Submit form
    - Verify success toast appears
    - Verify modal closes
    - Verify new skill appears in Pending section
    - Test error scenarios (duplicate skill, network error)
  - [ ] 4.7 Ensure error handling and success flow tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify success flow works correctly
    - Verify error handling displays appropriate toasts
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- Success toast displays with correct message and description
- Modal closes and form resets after successful submission
- All API error codes display appropriate toast messages
- Duplicate prevention shows toast before mutation
- End-to-end flow works correctly in browser
- Pending section updates without page refresh

### Final Integration Testing

#### Task Group 5: Comprehensive Testing & Polish
**Dependencies:** Task Groups 1-4

- [ ] 5.0 Perform final testing and validation
  - [ ] 5.1 Review tests from Task Groups 1-4
    - Review the 2-8 tests written by graphql-engineer (Task 1.1)
    - Review the 2-8 tests written by form-engineer (Task 2.1)
    - Review the 2-8 tests written by ui-engineer (Task 3.1)
    - Review the 2-8 tests written by integration-engineer (Task 4.1)
    - Total existing tests: approximately 8-32 tests
  - [ ] 5.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
    - Key scenarios to verify: complete submission flow, all error paths, duplicate prevention across all sections
  - [ ] 5.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points: Apollo cache updates, profile section refresh, modal state management
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases unless business-critical
  - [ ] 5.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1, 2.1, 3.1, 4.1, and 5.3)
    - Expected total: approximately 18-42 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass
  - [ ] 5.5 Verify accessibility compliance
    - Check modal keyboard navigation (Tab, Enter, Escape)
    - Verify screen reader compatibility for form fields
    - Ensure focus management when modal opens/closes
    - Validate color contrast for error messages
  - [ ] 5.6 Test responsive behavior
    - Verify modal displays correctly on mobile (320px - 768px)
    - Test autocomplete dropdown on smaller screens
    - Ensure touch interactions work for mobile devices
  - [ ] 5.7 Perform cross-browser testing
    - Test in Chrome, Firefox, Safari
    - Verify form submission works in all browsers
    - Check toast notification display consistency
  - [ ] 5.8 Code review and cleanup
    - Remove any console.log statements
    - Ensure consistent code formatting
    - Verify TypeScript types are properly defined
    - Check for unused imports and variables
    - Add any necessary code comments for complex logic

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 18-42 tests total)
- No more than 10 additional tests added when filling in testing gaps
- Modal is keyboard accessible and screen reader compatible
- Form works correctly on mobile and desktop screens
- Feature works consistently across Chrome, Firefox, and Safari
- Code is clean, well-formatted, and properly typed

## Execution Order

Recommended implementation sequence:
1. GraphQL Layer (Task Group 1) - Set up mutation hook and cache logic
2. Form State & Validation (Task Group 2) - Build form management and validation
3. UI Components (Task Group 3) - Create modal, autocomplete, and form UI
4. Error Handling & Success Flow (Task Group 4) - Implement feedback and integration
5. Final Integration Testing (Task Group 5) - Comprehensive testing and polish

## Notes

**Key Technical Decisions:**
- Use TanStack Form for form state management (following existing codebase patterns)
- Use Shadcn UI components (Dialog, Combobox, RadioGroup) for consistency
- Implement client-side filtering for instant autocomplete results
- Use Sonner toast notifications for all user feedback
- Leverage Apollo Client cache updates for immediate UI refresh

**Integration Points:**
- Employee Profile page: `/apps/web/src/modules/profile/profile.tsx`
- Skill sections component: `/apps/web/src/modules/profile/components/skill-sections.tsx`
- getAllSkills query: `/apps/web/src/modules/admin-skills/graphql/get-all-skills.query.generated.tsx`
- Self-Report Skills API: submitSkillSuggestion mutation from Item 7

**Reference Patterns:**
- Modal structure: `/apps/web/src/modules/admin-skills/components/add-skill-modal.tsx`
- Form validation: Existing TanStack Form patterns with Zod
- Combobox usage: `/apps/web/src/shared/components/ui/combobox.tsx`
- Dialog usage: `/apps/web/src/shared/components/ui/dialog.tsx`

**Testing Strategy:**
- Each task group writes 2-8 focused tests during implementation
- Final testing group adds maximum 10 additional tests for critical gaps
- Total expected tests: approximately 18-42 tests for this feature
- Focus on integration testing and end-to-end workflows
- Do NOT aim for exhaustive unit test coverage
