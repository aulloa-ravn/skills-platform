# Specification: Skill Resolution UI

## Goal
Add interactive action buttons and proficiency adjustment controls to the Validation Inbox review cards, enabling tech leads and admins to approve, adjust, or reject skill suggestions with optimistic updates and success feedback.

## User Stories
- As a tech lead, I want to quickly approve skill suggestions so that team members can see their validated skills without delays
- As a tech lead, I want to adjust proficiency levels before approval so that I can ensure accurate skill assessments
- As an admin, I want to reject invalid skill suggestions so that the skill inventory remains accurate

## Specific Requirements

**Action Button Layout Per Suggestion**
- Each individual skill suggestion card displays three horizontal action buttons at the bottom
- Button order from left to right: Reject, Adjust Level, Approve
- Reject button uses destructive styling with red outline/border on white/transparent background
- Adjust Level button uses neutral styling with gray outline
- Approve button uses primary styling with solid colored background (green or blue) emphasized as the positive action
- All buttons use the existing Button component with appropriate variant props
- Buttons are horizontally aligned with consistent spacing using flex layout

**Inline Proficiency Adjustment Controls**
- Clicking "Adjust Level" expands inline controls within the suggestion card without opening a modal
- Hides "Approve" and "Reject" buttons while adjustment controls are visible
- Displays four radio buttons or segmented control options: Novice, Intermediate, Advanced, Expert
- Shows the employee's originally suggested proficiency level with a subtle text indicator or badge (e.g., "Suggested: Advanced")
- Includes a "Confirm" button to submit the adjusted proficiency level
- Includes a "Cancel" button to collapse controls and restore the original button layout
- Pre-selects the suggested proficiency level as the default option when controls expand
- Uses consistent styling with the application's Tailwind CSS design system

**Optimistic Update Loading States**
- Clicking any action button (Approve, Reject, or Confirm adjustment) immediately shows a processing state
- Disables all interactive elements within the suggestion card during processing
- Displays a spinner or loading indicator within the card
- Uses the Button component's isLoading prop for loading state management
- Prevents duplicate submissions by disabling buttons during mutation execution

**Success Handling and Navigation**
- On successful mutation, immediately remove the resolved suggestion from the view
- Navigate automatically to the next team member with pending suggestions in the same project
- If no more team members in the current project, navigate to the next project with pending suggestions
- If no more pending suggestions exist across all projects, show an empty state message
- Preserve the master-detail interface structure during navigation transitions
- Update the sidebar project and employee counts after successful resolution

**Toast Notification System**
- Implement a new global ToastNotification context provider wrapping the application
- Position toasts in the top-right corner of the viewport by default
- Toast component accepts props: title, message, variant (success, error, info, warning)
- Auto-dismiss toasts after 3-5 seconds using setTimeout
- Stack multiple toasts vertically when they appear simultaneously
- Use Tailwind CSS for styling with appropriate colors per variant (green for success, red for error)
- Success toast displays message like "Successfully approved [Skill Name] for [Person Name]"
- Success toast for adjustments shows "Adjusted [Skill Name] to [New Level] for [Person Name]"
- Success toast for rejections shows "Rejected [Skill Name] for [Person Name]"

**Error Handling with Revert**
- On mutation failure, Apollo Client automatically reverts the optimistic update
- Display an error toast notification with the error message from the API
- Restore the suggestion card to its original interactive state
- Re-enable all action buttons allowing the user to retry
- Error toast shows specific error messages from the ResolutionError response if available
- Generic error message fallback: "Failed to resolve suggestion. Please try again."

**GraphQL Mutation Integration**
- Use the RESOLVE_SUGGESTIONS_MUTATION from the existing mutations file
- Send a single DecisionInput per action with suggestionId, action, and optional adjustedProficiency
- For "Approve" action: set action to APPROVE without adjustedProficiency
- For "Adjust Level" action: set action to ADJUST_LEVEL with adjustedProficiency field
- For "Reject" action: set action to REJECT without adjustedProficiency
- Handle the ResolveSuggestionsResponse with success, processed, and errors fields
- Extract employeeName and skillName from processed results for toast messages

**Optimistic Response Configuration**
- Configure optimistic response to immediately remove the suggestion from Apollo cache
- Update the GET_VALIDATION_INBOX_QUERY cache to reflect the resolved suggestion removal
- Decrement pendingSuggestionsCount for the employee and project in the cache
- Remove the employee from the project if they have no more pending suggestions
- Remove the project from the inbox if it has no more employees with pending suggestions

**Navigation Logic Implementation**
- Leverage existing flattenedEmployees array to determine next team member
- Use existing selectEmployee function to navigate to the next team member
- Implement project-level navigation when no more team members in current project
- Use React Router's navigate function for programmatic navigation if needed
- Maintain the current URL structure during navigation for deep linking support

**Radio Button Component for Proficiency Selection**
- Create a reusable RadioGroup component with label, value, onChange, and options props
- Style radio buttons with Tailwind CSS matching the application's design system
- Use accent color styling for selected state (purple or indigo)
- Display options in a vertical stack or horizontal row based on space constraints
- Ensure proper accessibility with label associations and keyboard navigation
- Support disabled state for the entire radio group if needed

## Visual Design

No visual mockups provided. UI design should follow existing Validation Inbox patterns and Tailwind CSS styling conventions.

## Existing Code to Leverage

**Button Component (/apps/client/src/components/Button.tsx)**
- Reuse existing Button component with variant prop (primary, secondary, danger, ghost)
- Utilize isLoading prop for loading states with built-in spinner
- Apply size prop (sm, md, lg) for consistent button sizing
- Use disabled prop to prevent interactions during processing
- Extend with new variant if needed for the Adjust Level neutral styling

**Card Component (/apps/client/src/components/Card.tsx)**
- Use Card component for suggestion card layout consistency
- Apply existing backdrop-blur and glass morphism styling
- Leverage noPadding prop for custom internal padding control

**Inbox Page Structure (/apps/client/src/pages/Inbox.tsx)**
- Extend the existing suggestion card rendering logic around line 377-462
- Leverage flattenedEmployees array for cross-person navigation
- Reuse selectEmployee function for navigation between team members
- Apply existing helper functions like formatDate, getDisciplineColor, getSourceColor
- Integrate action buttons within the suggestion card section after the "Created" field

**RESOLVE_SUGGESTIONS_MUTATION (/apps/client/src/graphql/mutations.ts)**
- Use existing GraphQL mutation with ResolveSuggestionsInput type
- Access ResolutionAction enum values (APPROVE, ADJUST_LEVEL, REJECT)
- Parse ResolveSuggestionsResponse with processed and errors fields
- Extract employeeName, skillName, proficiencyLevel from processed results

**AuthContext Pattern (/apps/client/src/contexts/AuthContext.tsx)**
- Follow the same context provider pattern for ToastNotification provider
- Use createContext and useContext hooks for global state management
- Create a custom useToast hook similar to useAuth for accessing toast functions
- Wrap the provider at the App component level alongside AuthProvider
- Implement state management for active toasts array with add/remove methods

## Out of Scope
- Batch processing multiple suggestions at once (approve all, reject all)
- Undo functionality after resolving suggestions
- Comment or reason field when rejecting suggestions
- Manual toast dismissal via close button (auto-dismiss only)
- Confirmation dialog before rejecting suggestions
- Keyboard shortcuts for quick approval/rejection actions
- Mobile-specific touch optimizations or gesture controls
- Analytics or event tracking for resolution actions
- Filtering or sorting suggestions within the inbox
- Search functionality for finding specific skills or team members
