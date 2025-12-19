# Task Breakdown: Skill Resolution UI

## Overview
Total Task Groups: 5
Estimated Total Tasks: ~35 sub-tasks

## Task List

### Foundation Layer

#### Task Group 1: Toast Notification System
**Dependencies:** None

- [ ] 1.0 Complete global toast notification system
  - [ ] 1.1 Write 2-8 focused tests for ToastNotification functionality
    - Limit to 2-8 highly focused tests maximum
    - Test only critical behaviors (e.g., toast appears, auto-dismiss works, stacking multiple toasts, variant rendering)
    - Skip exhaustive coverage of all edge cases
  - [ ] 1.2 Create ToastNotificationContext provider
    - Follow pattern from: `/apps/client/src/contexts/AuthContext.tsx`
    - State: array of active toasts with id, title, message, variant, timestamp
    - Methods: addToast, removeToast
    - Auto-dismiss logic with setTimeout (3-5 seconds)
  - [ ] 1.3 Create ToastNotification component
    - Accept props: id, title, message, variant (success, error, info, warning)
    - Position: fixed top-right corner of viewport
    - Styling: Tailwind CSS with variant-based colors
      - Success: green background/border
      - Error: red background/border
      - Info: blue background/border
      - Warning: yellow/orange background/border
    - Stack multiple toasts vertically with gap spacing
    - Slide-in animation on mount, slide-out on dismiss
  - [ ] 1.4 Create useToast hook
    - Export custom hook for easy access: `const { showToast } = useToast()`
    - Wrap helper methods around context functions
    - Type-safe interface for toast options
  - [ ] 1.5 Integrate ToastNotificationProvider in App.tsx
    - Wrap provider at root level alongside AuthProvider
    - Render ToastNotification components from context state
    - Ensure z-index is high enough to appear above all content
  - [ ] 1.6 Ensure toast notification tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify toasts appear and auto-dismiss
    - Verify multiple toasts stack correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- ToastNotificationProvider works globally
- Toasts auto-dismiss after 3-5 seconds
- Multiple toasts stack vertically in top-right corner
- Variant-based styling (success, error, info, warning) renders correctly

---

### Component Layer

#### Task Group 2: RadioGroup Component for Proficiency Selection
**Dependencies:** None

- [ ] 2.0 Complete RadioGroup component
  - [ ] 2.1 Write 2-8 focused tests for RadioGroup functionality
    - Limit to 2-8 highly focused tests maximum
    - Test only critical behaviors (e.g., selection changes, keyboard navigation, disabled state, accessibility)
    - Skip exhaustive testing of all visual states
  - [ ] 2.2 Create RadioGroup component
    - File: `/apps/client/src/components/RadioGroup.tsx`
    - Props: label, value, onChange, options (array of {value, label}), disabled (optional)
    - Render radio inputs with proper label associations
    - Support both vertical and horizontal layout via layout prop
    - Default to vertical stack for proficiency options
  - [ ] 2.3 Implement accessibility features
    - Proper ARIA labels and roles
    - Keyboard navigation (arrow keys to navigate options)
    - Focus management and visible focus indicators
    - Screen reader support with descriptive labels
  - [ ] 2.4 Apply Tailwind CSS styling
    - Match existing application design system
    - Selected state: accent color (purple/indigo) with filled circle
    - Unselected state: gray border with empty circle
    - Hover state: subtle background change
    - Disabled state: reduced opacity
    - Spacing: consistent gap between radio options
  - [ ] 2.5 Ensure RadioGroup tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify selection changes work
    - Verify keyboard navigation works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- RadioGroup renders all proficiency options (Novice, Intermediate, Advanced, Expert)
- Selection changes trigger onChange callback
- Keyboard navigation works (arrow keys)
- Accessibility features pass basic screen reader testing
- Styling matches application design system

---

### Integration Layer

#### Task Group 3: Action Buttons in Suggestion Cards
**Dependencies:** Task Group 1 (for error/success toasts)

- [ ] 3.0 Complete action buttons integration
  - [ ] 3.1 Write 2-8 focused tests for action button functionality
    - Limit to 2-8 highly focused tests maximum
    - Test only critical behaviors (e.g., approve button triggers mutation, reject button triggers mutation, loading states)
    - Skip exhaustive testing of all button combinations and states
  - [ ] 3.2 Identify suggestion card structure in Inbox.tsx
    - File: `/apps/client/src/pages/Inbox.tsx`
    - Locate suggestion card rendering around lines 377-462
    - Understand existing card layout and data structure
    - Note: Each suggestion has its own card with action buttons
  - [ ] 3.3 Add Button component imports and variants
    - Import Button from: `/apps/client/src/components/Button.tsx`
    - Verify existing variants: primary, secondary, danger, ghost
    - Check if "neutral" variant exists for "Adjust Level" button
    - If neutral variant doesn't exist, use secondary variant with gray styling
  - [ ] 3.4 Implement three action buttons per suggestion card
    - Position: bottom of each suggestion card (after "Created" field)
    - Layout: horizontal flex with consistent spacing (gap-3 or gap-4)
    - Button order left to right: Reject, Adjust Level, Approve
    - Reject button: variant="danger" (red outline/border)
    - Adjust Level button: variant="secondary" or neutral (gray outline)
    - Approve button: variant="primary" (solid green/blue background)
    - All buttons: size="md" for consistency
  - [ ] 3.5 Add loading state management
    - Track loading state per suggestion (e.g., `loadingSuggestionId`)
    - Use Button component's isLoading prop
    - Disable all three buttons when any action is processing
    - Show spinner within the clicked button
  - [ ] 3.6 Wire up Approve button click handler
    - Create handleApprove function accepting suggestionId
    - Call RESOLVE_SUGGESTIONS_MUTATION with action: APPROVE
    - Implement in next task group (mutation integration)
    - For now, add onClick handler scaffolding
  - [ ] 3.7 Wire up Reject button click handler
    - Create handleReject function accepting suggestionId
    - Call RESOLVE_SUGGESTIONS_MUTATION with action: REJECT
    - Implement in next task group (mutation integration)
    - For now, add onClick handler scaffolding
  - [ ] 3.8 Ensure action button tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify buttons render correctly
    - Verify click handlers are called
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Three action buttons render at the bottom of each suggestion card
- Button layout is horizontal with consistent spacing
- Button variants and styling match requirements (Reject: danger, Adjust Level: neutral, Approve: primary)
- Loading states work with Button component's isLoading prop
- Click handlers are scaffolded for Approve and Reject buttons

---

### Mutation Layer

#### Task Group 4: GraphQL Mutation Integration with Optimistic Updates
**Dependencies:** Task Group 1 (ToastNotification), Task Group 3 (Action Buttons)

- [ ] 4.0 Complete GraphQL mutation integration
  - [ ] 4.1 Write 2-8 focused tests for mutation integration
    - Limit to 2-8 highly focused tests maximum
    - Test only critical behaviors (e.g., successful approve mutation, successful reject mutation, error handling, optimistic update)
    - Skip exhaustive testing of all mutation scenarios
  - [ ] 4.2 Import RESOLVE_SUGGESTIONS_MUTATION
    - File: `/apps/client/src/graphql/mutations.ts`
    - Import mutation and types: ResolveSuggestionsInput, DecisionInput, ResolutionAction
    - Review mutation structure: decisions array, each with suggestionId, action, adjustedProficiency (optional)
  - [ ] 4.3 Set up useMutation hook in Inbox.tsx
    - Use Apollo Client's useMutation hook
    - Configure mutation with optimistic response
    - Configure cache updates for GET_VALIDATION_INBOX_QUERY
  - [ ] 4.4 Implement optimistic response for suggestion removal
    - Optimistic response: return success: true, processed array with suggestion data
    - Cache update: remove resolved suggestion from inbox query
    - Update pendingSuggestionsCount for employee (decrement by 1)
    - Remove employee from project if pendingSuggestionsCount reaches 0
    - Remove project from inbox if no employees remain with pending suggestions
  - [ ] 4.5 Implement handleApprove mutation logic
    - Build DecisionInput: { suggestionId, action: APPROVE }
    - Execute mutation with decisions: [DecisionInput]
    - On success: trigger navigation to next team member/project
    - On success: show success toast with message "Successfully approved [Skill Name] for [Person Name]"
    - Extract skillName and employeeName from mutation response (processed array)
  - [ ] 4.6 Implement handleReject mutation logic
    - Build DecisionInput: { suggestionId, action: REJECT }
    - Execute mutation with decisions: [DecisionInput]
    - On success: trigger navigation to next team member/project
    - On success: show success toast with message "Rejected [Skill Name] for [Person Name]"
    - Extract skillName and employeeName from mutation response
  - [ ] 4.7 Implement error handling with revert
    - On mutation error: Apollo Client automatically reverts optimistic update
    - Display error toast with error message from API (if available)
    - Fallback error message: "Failed to resolve suggestion. Please try again."
    - Check response.errors array for ResolutionError messages
    - Re-enable action buttons for retry
  - [ ] 4.8 Ensure mutation integration tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify successful approve mutation works
    - Verify error handling reverts optimistic update
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- RESOLVE_SUGGESTIONS_MUTATION executes for Approve action
- RESOLVE_SUGGESTIONS_MUTATION executes for Reject action
- Optimistic response removes suggestion from view immediately
- Cache updates correctly (decrement counts, remove empty employees/projects)
- Success toasts display with correct skill name and person name
- Error toasts display on mutation failure
- Optimistic updates revert on error

---

### UI Enhancement Layer

#### Task Group 5: Inline Proficiency Adjustment UI
**Dependencies:** Task Group 2 (RadioGroup), Task Group 4 (Mutation Integration)

- [ ] 5.0 Complete inline proficiency adjustment controls
  - [ ] 5.1 Write 2-8 focused tests for proficiency adjustment flow
    - Limit to 2-8 highly focused tests maximum
    - Test only critical behaviors (e.g., clicking Adjust Level expands controls, Confirm triggers mutation with adjusted proficiency, Cancel collapses controls)
    - Skip exhaustive testing of all UI states
  - [ ] 5.2 Add state management for adjustment UI
    - Track which suggestion is in "adjustment mode" (e.g., `adjustingSuggestionId`)
    - Track selected proficiency level during adjustment (e.g., `adjustedProficiency`)
    - Pre-select suggested proficiency level when controls expand
  - [ ] 5.3 Implement "Adjust Level" button click handler
    - Set `adjustingSuggestionId` to current suggestion's id
    - Initialize `adjustedProficiency` to suggestion's original suggested level
    - Hide "Approve" and "Reject" buttons for this suggestion
    - Expand inline controls within suggestion card
  - [ ] 5.4 Render inline adjustment controls
    - Conditionally render when `adjustingSuggestionId` matches current suggestion
    - Display subtle text indicator showing original suggested level
      - Example: "Suggested: Advanced" with muted text color
      - Position above or near radio buttons
    - Render RadioGroup component with proficiency options
      - Options: Novice, Intermediate, Advanced, Expert
      - Value: `adjustedProficiency` state
      - onChange: update `adjustedProficiency` state
      - Layout: vertical stack or horizontal row based on space
    - Render "Confirm" and "Cancel" buttons below radio group
      - Confirm button: variant="primary", size="sm"
      - Cancel button: variant="ghost" or "secondary", size="sm"
      - Horizontal layout with gap spacing
  - [ ] 5.5 Implement "Confirm" button mutation logic
    - Build DecisionInput: { suggestionId, action: ADJUST_LEVEL, adjustedProficiency }
    - Execute RESOLVE_SUGGESTIONS_MUTATION with DecisionInput
    - Show same loading state as direct "Approve" action
    - On success: show toast "Adjusted [Skill Name] to [New Level] for [Person Name]"
    - On success: navigate to next team member/project
    - Extract skillName, employeeName, and new proficiencyLevel from response
  - [ ] 5.6 Implement "Cancel" button handler
    - Reset `adjustingSuggestionId` to null
    - Reset `adjustedProficiency` to null
    - Collapse inline controls
    - Restore original three-button layout (Reject, Adjust Level, Approve)
  - [ ] 5.7 Apply consistent styling with Tailwind CSS
    - Match application's design system
    - Subtle background or border for adjustment controls section
    - Adequate padding and spacing within controls
    - Responsive layout for different screen sizes
  - [ ] 5.8 Ensure proficiency adjustment tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify Adjust Level button expands controls
    - Verify Confirm triggers mutation with adjusted proficiency
    - Verify Cancel collapses controls
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 5.1 pass
- Clicking "Adjust Level" expands inline controls within suggestion card
- "Approve" and "Reject" buttons hide during adjustment mode
- RadioGroup displays all four proficiency options with original suggestion pre-selected
- Original suggested proficiency level shown with subtle text indicator
- "Confirm" button triggers mutation with adjustedProficiency
- "Cancel" button collapses controls and restores original button layout
- Success toast shows adjusted proficiency level in message
- Styling matches application design system

---

### Navigation & Polish Layer

#### Task Group 6: Navigation Logic Implementation
**Dependencies:** Task Group 4 (Mutation Integration)

- [ ] 6.0 Complete navigation logic after resolution
  - [ ] 6.1 Write 2-8 focused tests for navigation logic
    - Limit to 2-8 highly focused tests maximum
    - Test only critical navigation scenarios (e.g., navigate to next team member in same project, navigate to next project, show empty state)
    - Skip exhaustive testing of all navigation permutations
  - [ ] 6.2 Review existing navigation infrastructure
    - File: `/apps/client/src/pages/Inbox.tsx`
    - Locate `flattenedEmployees` array (used for cross-person navigation)
    - Locate `selectEmployee` function for navigating between team members
    - Understand current URL structure and routing
  - [ ] 6.3 Implement findNextTeamMember helper function
    - Accept current employeeId and current projectId
    - Use `flattenedEmployees` array to find next employee in same project
    - Return next employee object or null if no more in project
  - [ ] 6.4 Implement findNextProject helper function
    - Accept current projectId
    - Search inbox data for next project with pending suggestions
    - Return next project object with first employee or null if no more projects
  - [ ] 6.5 Implement handleNavigationAfterResolution function
    - Called after successful mutation
    - First attempt: navigate to next team member in same project
      - Use findNextTeamMember helper
      - If found, call selectEmployee with next employee
    - Second attempt: navigate to next project if no more team members
      - Use findNextProject helper
      - If found, navigate to first employee in next project
    - Fallback: show empty state if no more pending suggestions
      - Could be empty state message in detail panel
      - Or collapse to master list view
  - [ ] 6.6 Integrate navigation into mutation success handlers
    - Call handleNavigationAfterResolution in handleApprove success callback
    - Call handleNavigationAfterResolution in handleReject success callback
    - Call handleNavigationAfterResolution in handleConfirmAdjustment success callback
    - Ensure navigation happens after cache updates complete
  - [ ] 6.7 Implement empty state UI
    - Display when no more pending suggestions exist
    - Message: "All suggestions resolved! Great work." or similar
    - Optional: Add illustration or icon
    - Provide link back to projects list or dashboard
  - [ ] 6.8 Ensure navigation logic tests pass
    - Run ONLY the 2-8 tests written in 6.1
    - Verify navigation to next team member works
    - Verify navigation to next project works
    - Verify empty state shows when no more suggestions
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 6.1 pass
- After resolving a suggestion, user navigates to next team member in same project
- If no more team members in project, user navigates to next project
- If no more projects with pending suggestions, empty state displays
- Navigation maintains master-detail interface structure
- URL updates correctly during navigation
- Sidebar project and employee counts update after resolution

---

### Testing & Quality Assurance Layer

#### Task Group 7: Integration Testing & Gap Analysis
**Dependencies:** Task Groups 1-6

- [ ] 7.0 Review existing tests and fill critical gaps only
  - [ ] 7.1 Review tests from Task Groups 1-6
    - Review the 2-8 tests written by foundation-engineer (Task 1.1 - ToastNotification)
    - Review the 2-8 tests written by component-engineer (Task 2.1 - RadioGroup)
    - Review the 2-8 tests written by integration-engineer (Task 3.1 - Action Buttons)
    - Review the 2-8 tests written by mutation-engineer (Task 4.1 - GraphQL Integration)
    - Review the 2-8 tests written by ui-engineer (Task 5.1 - Proficiency Adjustment)
    - Review the 2-8 tests written by navigation-engineer (Task 6.1 - Navigation Logic)
    - Total existing tests: approximately 12-48 tests
  - [ ] 7.2 Analyze test coverage gaps for Skill Resolution UI feature only
    - Identify critical end-to-end workflows that lack test coverage
      - Complete approve flow (click Approve -> mutation -> toast -> navigation)
      - Complete reject flow (click Reject -> mutation -> toast -> navigation)
      - Complete adjust flow (Adjust Level -> select proficiency -> Confirm -> mutation -> toast -> navigation)
      - Error handling flow (mutation fails -> revert -> error toast -> retry)
      - Navigation flow (resolve last suggestion in project -> navigate to next project)
    - Focus ONLY on gaps related to this feature's requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
  - [ ] 7.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new integration/E2E tests to fill identified critical gaps
    - Focus on full user workflows across component boundaries
    - Test integration between ToastNotification, mutation logic, and navigation
    - Test optimistic update behavior and cache updates
    - Test error scenarios and revert behavior
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases, performance tests, and accessibility tests unless business-critical
  - [ ] 7.4 Run feature-specific tests only
    - Run ONLY tests related to Skill Resolution UI feature
    - Tests from 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, and 7.3
    - Expected total: approximately 22-58 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass
  - [ ] 7.5 Fix any test failures
    - Address failing tests identified in 7.4
    - Debug and fix issues in implementation code
    - Re-run tests to confirm fixes
  - [ ] 7.6 Verify feature completeness
    - Manually test each requirement from spec.md
    - Verify action buttons work correctly
    - Verify proficiency adjustment flow works
    - Verify toast notifications appear and auto-dismiss
    - Verify optimistic updates and error handling
    - Verify navigation logic across team members and projects

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 22-58 tests total)
- Critical user workflows for Skill Resolution UI are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this feature's requirements
- All 10 spec requirements verified through testing
- Manual verification confirms feature works end-to-end

---

## Execution Order

Recommended implementation sequence:
1. **Foundation Layer** (Task Group 1) - ToastNotification system provides global infrastructure
2. **Component Layer** (Task Group 2) - RadioGroup component needed for proficiency adjustment
3. **Integration Layer** (Task Group 3) - Action buttons integrated into existing Inbox UI
4. **Mutation Layer** (Task Group 4) - GraphQL mutations with optimistic updates power core functionality
5. **UI Enhancement Layer** (Task Group 5) - Inline proficiency adjustment builds on action buttons and RadioGroup
6. **Navigation & Polish Layer** (Task Group 6) - Navigation logic completes the user workflow
7. **Testing & Quality Assurance Layer** (Task Group 7) - Final integration testing and gap analysis

---

## Notes

- **Reusable Components Created:** ToastNotificationProvider, RadioGroup component can be used in future features
- **Existing Code Leveraged:** Button component, Card component, Inbox.tsx structure, AuthContext pattern, RESOLVE_SUGGESTIONS_MUTATION
- **Testing Approach:** Each task group writes 2-8 focused tests and runs only those tests, with final integration testing phase to fill critical gaps (max 10 additional tests)
- **Total Expected Tests:** Approximately 22-58 tests for the entire feature
- **Key Integration Points:** Apollo Client mutations, cache updates, navigation between team members/projects, toast notifications
