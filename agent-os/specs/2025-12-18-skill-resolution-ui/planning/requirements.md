# Spec Requirements: Skill Resolution UI

## Initial Description
Roadmap item 12: Skill Resolution UI — Add action buttons and proficiency adjustment controls to review cards with optimistic updates and success feedback

This is a UI feature that will add interactive controls to the existing Validation Inbox review cards, allowing tech leads and admins to approve, adjust proficiency levels, or reject skill suggestions. It needs to integrate with the Skill Resolution API (item 11 which was just completed) and provide a smooth user experience with optimistic updates.

## Requirements Discussion

### First Round Questions

**Q1:** Action Button Layout - I recommend a horizontal layout at the bottom of each review card with clear visual hierarchy: Reject (left side, secondary/destructive styling - red outline/border), Adjust Level (center, neutral/secondary styling - gray outline), Approve (right side, primary styling - solid green/blue background, emphasized as the positive action). Does this approach work for you?

**Answer:** User confirmed this approach works.

**Q2:** Proficiency Adjustment UI - I recommend an inline interaction that keeps the user in flow: clicking "Adjust Level" expands inline controls within the card (no modal popup), show radio buttons or segmented control with all four options (Novice, Intermediate, Advanced, Expert), display the employee's originally suggested level with a subtle indicator, include "Confirm" button to submit the adjustment or "Cancel" to collapse back. Does this work?

**Answer:** User confirmed this approach works.

**Q3:** Batch vs Individual Actions - I assume each person's card handles their suggestions individually, so clicking "Approve" processes all pending suggestions for that person at once. Is that correct, or should users be able to approve/reject individual skills within a person's card?

**Answer:** One suggestion at a time for now (individual skills have their own action buttons).

**Q4:** Optimistic Update Behavior - I'm thinking that after clicking an action button, the card should immediately show a "processing" state (disabled buttons, maybe a spinner), then the person should disappear from the inbox once the mutation succeeds. Should we keep them visible with a success state for a moment, or immediately remove them from the list?

**Answer:** Loading state, then disappear on success with a success toast notification.

**Q5:** Success Feedback - I assume we should show a toast notification like "Successfully validated 3 skills for John Doe" after resolution. Should this toast be dismissible, auto-disappear after a few seconds, or include an "undo" action?

**Answer:** Toast notification with title, message, variant props and auto-disappear after a few seconds. Implement a ToastNotification provider for global use.

**Q6:** Navigation After Action - When a user resolves suggestions for a person, should we automatically navigate to the next person in the same project, stay on the now-empty detail view, or collapse back to the master list?

**Answer:** Navigate to next team member.

**Q7:** Error Handling - If the mutation fails (network error, server error), should we revert the optimistic update and show the card in its original state with an error message, or keep the card visible with a "Retry" button?

**Answer:** Revert the optimistic update and show the card in its original state with an error toast notification.

**Q8:** Rejection Flow - When rejecting skills, should we require a reason/comment field, or is a simple "Reject" action sufficient for this version?

**Answer:** Simple "Reject" action is sufficient for now (no reason/comment field).

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

**Follow-up 1:** When the user clicks "Adjust Level" and the inline controls appear, should the "Approve" and "Reject" buttons remain visible (but perhaps disabled), or should they be hidden until the user either confirms or cancels the adjustment?

**Answer:** Hide "Approve" and "Reject" buttons until user confirms or cancels the adjustment.

**Follow-up 2:** You mentioned implementing a ToastNotification provider for global use. Should this be a new reusable component, or do you already have a toast/notification system in your codebase that we should extend? If it's new, do you have preferences for positioning (top-right, bottom-right, etc.) and stacking behavior when multiple toasts appear?

**Answer:** New reusable component with position top-right by default.

**Follow-up 3:** Since actions are "one suggestion at a time," how should each suggestion be displayed within the person's card? Should each skill suggestion have its own action buttons, or should there be a "current suggestion" focus with navigation to cycle through multiple suggestions for the same person?

**Answer:** Each skill suggestion has its own action buttons.

**Follow-up 4:** When navigating to the next team member after resolving a suggestion, what should happen if there are no more team members with pending suggestions in that project? Should we show an empty state, navigate to the next project with pending items, or return to the master list view?

**Answer:** Navigate to the next project.

**Follow-up 5:** For the "Adjust Level" flow with Confirm/Cancel buttons, should clicking "Confirm" show the same loading state as the direct "Approve" action, or should it transition differently since it's technically approving with a modified proficiency level?

**Answer:** User indicated to implement as seen fit. Recommendation: Clicking "Confirm" should show the same loading state as direct "Approve" action for consistency.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
Not applicable.

## Requirements Summary

### Functional Requirements

**Action Buttons for Each Suggestion:**
- Each individual skill suggestion within a person's review card has its own set of action buttons
- Three action buttons arranged horizontally at the bottom of each suggestion card:
  - **Reject** (left): Secondary/destructive styling with red outline/border, white background
  - **Adjust Level** (middle): Neutral/secondary styling with gray outline
  - **Approve** (right): Primary styling with solid green/blue background (emphasized as positive action)

**Proficiency Adjustment Flow:**
- Clicking "Adjust Level" expands inline controls within the suggestion card (no modal)
- "Approve" and "Reject" buttons are hidden while adjustment controls are visible
- Display all four proficiency options: Novice, Intermediate, Advanced, Expert (using radio buttons or segmented control)
- Show the employee's originally suggested proficiency level with a subtle indicator (e.g., "Suggested: Advanced" text or badge)
- Provide "Confirm" button to submit the adjusted proficiency level
- Provide "Cancel" button to collapse back to the original button layout without changes
- Clicking "Confirm" triggers the same loading state as the direct "Approve" action

**Optimistic Updates:**
- Upon clicking any action button (Approve, Reject, or Confirm adjustment), immediately show a loading/processing state
- Disable all buttons and show a spinner or loading indicator
- After successful mutation, remove the suggestion from the view
- Display a success toast notification

**Success Feedback:**
- Implement a global ToastNotification provider component (new reusable component)
- Position toasts in the top-right corner by default
- Toast should have configurable props: title, message, variant (success, error, info, etc.)
- Auto-disappear after a few seconds (e.g., 3-5 seconds)
- Success toast message example: "Successfully approved [Skill Name] for [Person Name]" or similar contextual message

**Error Handling:**
- If the resolution mutation fails (network error, server error), revert the optimistic update
- Restore the suggestion card to its original state
- Display an error toast notification with appropriate error message
- User can retry the action

**Navigation Flow:**
- After successfully resolving a suggestion, automatically navigate to the next team member with pending suggestions in the same project
- If no more team members have pending suggestions in the current project, navigate to the next project that has pending suggestions
- Maintain the master-detail interface structure during navigation

**Integration with Skill Resolution API:**
- Use the `resolveSuggestions` mutation from the completed Skill Resolution API (item 11)
- Support three action types: APPROVE, ADJUST_LEVEL, REJECT
- Handle one suggestion at a time (not batch processing)

### Reusability Opportunities

**ToastNotification Provider:**
- Create a new global toast notification system that can be reused across the application
- Implement as a React context provider for easy access throughout component tree
- Support multiple toast variants (success, error, warning, info)
- Handle stacking behavior when multiple toasts need to appear

**Action Button Patterns:**
- The three-button layout (destructive-left, neutral-middle, primary-right) could become a reusable pattern for other approval workflows
- Button styling conventions (red outline for destructive, gray outline for neutral, solid color for primary) can be documented for consistency

### Scope Boundaries

**In Scope:**
- Action buttons (Approve, Reject, Adjust Level) for each individual skill suggestion
- Inline proficiency adjustment UI with radio buttons/segmented control
- Optimistic update behavior with loading states
- Success and error toast notifications
- Global ToastNotification provider implementation
- Automatic navigation to next team member or next project after resolution
- Integration with existing Skill Resolution API mutation
- Error handling with revert to original state

**Out of Scope:**
- Batch processing multiple suggestions at once (future enhancement)
- Undo functionality for resolved suggestions
- Comment/reason field for rejections (simple reject action only for now)
- Manual toast dismissal (auto-disappear only)
- Confirmation dialogs before rejection (direct action)
- Keyboard shortcuts for quick actions
- Mobile-specific optimizations for touch interactions
- Analytics/tracking for resolution actions

### Technical Considerations

**Integration Points:**
- Connects to the Skill Resolution API (item 11) using the `resolveSuggestions` GraphQL mutation
- Extends the existing Validation Inbox UI (item 10) master-detail interface
- Uses Apollo Client for GraphQL mutations with optimistic response handling
- Requires reading current user context to determine if user is a Tech Lead or Admin

**Tech Stack Alignment:**
- Frontend: React 19 with TypeScript
- Styling: Tailwind CSS utility classes
- State Management: Apollo Client for server state, Zustand if needed for toast state
- GraphQL: Apollo Client mutations with optimistic UI

**Navigation Considerations:**
- Must maintain existing master-detail URL structure and routing
- Need to programmatically navigate to next team member or project
- Should preserve selected project context in the sidebar during navigation

**Component Structure:**
- Each suggestion card component needs to manage its own action button state
- ToastNotification provider wraps the application at a high level
- Inline adjustment controls conditionally render within suggestion card

**Data Flow:**
- Optimistic update removes suggestion from Apollo cache immediately
- On mutation success, cache update is confirmed
- On mutation failure, Apollo automatically reverts the optimistic update
- Toast notifications are triggered based on mutation result
