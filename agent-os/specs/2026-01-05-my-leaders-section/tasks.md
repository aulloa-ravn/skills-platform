# Task Breakdown: My Leaders Section

## Overview
Total Task Groups: 2
Total Tasks: 9

## Task List

### Frontend Components

#### Task Group 1: My Leaders Section Component
**Dependencies:** None

- [x] 1.0 Complete My Leaders Section component
  - [x] 1.1 Write 2-8 focused tests for MyLeadersSection component
    - Limit to 2-8 highly focused tests maximum
    - Test only critical component behaviors:
      - Component renders correctly with deduplicated Tech Leads
      - Component hides when no current assignments exist
      - Avatar displays with correct fallback initials
      - Tech Lead name and email display correctly
    - Skip exhaustive testing of all edge cases and states
  - [x] 1.2 Create MyLeadersSection component file
    - File path: `/apps/web/src/modules/profile/components/my-leaders-section.tsx`
    - Component accepts `assignments: CurrentAssignmentResponse[]` prop
    - Import and reuse existing UI components:
      - `Card` from `@/shared/components/ui/card`
      - `Avatar`, `AvatarImage`, `AvatarFallback` from `@/shared/components/ui/avatar`
    - Import `getStringInitials` utility from `@/shared/utils`
    - Import `CurrentAssignmentResponse` type from `@/shared/lib/types`
  - [x] 1.3 Implement conditional rendering logic
    - Return `null` when `assignments.length === 0`
    - Hide entire section when no assignments exist (no empty state message)
  - [x] 1.4 Implement Tech Lead deduplication logic
    - Extract Tech Leads from `assignments[].techLead` field
    - Filter out null/undefined Tech Leads
    - Deduplicate by Tech Lead ID using Map or Set
    - Preserve first occurrence when duplicate IDs found
  - [x] 1.5 Build section header structure
    - Wrapper: `px-4 sm:px-6 py-6 sm:py-8`
    - Header container: `mb-4 sm:mb-6`
    - Title: "My Leaders" with styling `text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2`
    - Subtitle: "Tech Leads who can validate your skills" with styling `text-xs sm:text-sm text-muted-foreground`
    - Reuse pattern from `current-assignments.tsx` lines 18-26
  - [x] 1.6 Build Tech Lead cards layout
    - Single column vertical stack layout with `gap-3` or `gap-4`
    - Each card uses `Card` component with `p-4 sm:p-6 border border-border`
    - No grid layout at any breakpoint (vertical stack on all screen sizes)
    - Horizontal flex layout inside each card: Avatar on left, Name/Email on right
  - [x] 1.7 Implement Tech Lead card content
    - Avatar component:
      - Size: `h-8 w-8 border-2 border-background`
      - Image source: `techLead.avatarUrl || undefined`
      - Fallback: Use `getStringInitials(techLead.name)` or 'TL' if name is null
    - Name display:
      - Text: `techLead.name || 'Unknown'`
      - Styling: `text-sm font-medium text-foreground`
    - Email display:
      - Text: `techLead.email`
      - Styling: `text-xs text-muted-foreground truncate block`
      - Display-only (no mailto link, no hover effects)
    - Reuse pattern from `current-assignments.tsx` lines 72-96
  - [x] 1.8 Apply responsive design
    - Mobile (320px - 768px): Full width cards with compact spacing
    - Desktop (1024px+): Same vertical layout with increased padding
    - Use Tailwind responsive prefixes: `sm:` and `md:` as needed
    - Follow mobile-first approach consistent with existing profile components
  - [x] 1.9 Ensure component tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify component renders with deduplicated Tech Leads
    - Verify conditional rendering works (hides when no assignments)
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- Component displays deduplicated Tech Leads from current assignments
- Section hides completely when no assignments exist
- Avatar, name, and email display correctly
- Responsive design works on mobile and desktop
- Component follows existing design patterns from CurrentAssignments

### Integration

#### Task Group 2: Profile Page Integration
**Dependencies:** Task Group 1

- [x] 2.0 Complete profile page integration
  - [x] 2.1 Write 2-8 focused tests for profile page integration
    - Limit to 2-8 highly focused tests maximum
    - Test only critical integration behaviors:
      - MyLeadersSection component appears in correct position
      - Component receives correct props from profile data
      - Profile page renders all sections in correct order
    - Skip exhaustive testing of all profile page scenarios
  - [x] 2.2 Import MyLeadersSection component
    - File: `/apps/web/src/modules/profile/profile.tsx`
    - Add import: `import { MyLeadersSection } from '@/modules/profile/components/my-leaders-section'`
    - Place import with other component imports (lines 1-4)
  - [x] 2.3 Integrate component into profile layout
    - Position: Between `<CurrentAssignments />` and `<SkillsSection />` (after line 40)
    - Pass prop: `assignments={profile.currentAssignments}`
    - Maintain existing component spacing and structure
    - Updated component order:
      1. ProfileHeader
      2. SeniorityTimeline
      3. CurrentAssignments
      4. MyLeadersSection (NEW)
      5. SkillsSection
  - [x] 2.4 Verify integration in browser
    - Test with profile that has multiple assignments with same Tech Lead (verify deduplication)
    - Test with profile that has no assignments (verify section hides)
    - Test with profile that has assignments with different Tech Leads
    - Verify responsive behavior on mobile and desktop viewports
  - [x] 2.5 Ensure integration tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify component appears in correct position
    - Verify correct data flow from profile to component
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- MyLeadersSection appears between CurrentAssignments and SkillsSection
- Component receives correct assignment data from profile
- Integration maintains existing profile page functionality
- No TypeScript errors or warnings

### Testing

#### Task Group 3: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-2

- [x] 3.0 Review existing tests and fill critical gaps only
  - [x] 3.1 Review tests from Task Groups 1-2
    - Review the 2-8 tests written by ui-designer (Task 1.1)
    - Review the 2-8 tests written by integration-engineer (Task 2.1)
    - Total existing tests: approximately 4-16 tests
  - [x] 3.2 Analyze test coverage gaps for My Leaders Section feature only
    - Identify critical user workflows that lack test coverage:
      - Tech Lead deduplication logic edge cases (e.g., multiple assignments with same Tech Lead ID)
      - Handling of null/undefined Tech Lead data
      - Avatar fallback behavior when no name or avatarUrl provided
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize component behavior tests over unit test gaps
  - [x] 3.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on:
      - Deduplication logic with various edge cases
      - Handling of incomplete Tech Lead data (missing email, name, avatar)
      - Component behavior with empty/null assignments array
    - Do NOT write comprehensive coverage for all scenarios
    - Skip performance tests and accessibility tests unless business-critical
  - [x] 3.4 Run feature-specific tests only
    - Run ONLY tests related to My Leaders Section feature (tests from 1.1, 2.1, and 3.3)
    - Expected total: approximately 14-26 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 14-26 tests total)
- Critical user workflows for My Leaders Section are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:
1. Frontend Components (Task Group 1) - Create MyLeadersSection component
2. Integration (Task Group 2) - Integrate component into profile page
3. Test Review & Gap Analysis (Task Group 3) - Fill critical test coverage gaps

## Implementation Notes

### Deduplication Strategy
Use this approach to deduplicate Tech Leads by ID:
```typescript
const uniqueLeaders = Array.from(
  new Map(
    assignments
      .map(a => a.techLead)
      .filter((tl): tl is TechLeadInfo => tl !== null && tl !== undefined && tl.id !== null)
      .map(tl => [tl.id, tl])
  ).values()
)
```

### Reusable Patterns
- **Section Header**: Copy from `current-assignments.tsx` lines 18-26
- **Avatar Display**: Copy from `current-assignments.tsx` lines 72-96
- **Card Layout**: Copy from `current-assignments.tsx` lines 36-39
- **Responsive Wrapper**: Copy from `current-assignments.tsx` line 18

### Component Props Interface
```typescript
interface MyLeadersSectionProps {
  assignments: CurrentAssignmentResponse[]
}
```

### Key Design Decisions
1. **Vertical Stack Layout**: Single column on all screen sizes (no grid layout)
2. **Conditional Rendering**: Hide entire section when no assignments (no empty state)
3. **Display-Only**: No clickable elements or interactions (plain text email, no mailto link)
4. **Client-Side Processing**: All deduplication logic happens in the component (no GraphQL changes)

### Testing Focus Areas
- Component renders and hides correctly based on assignments
- Deduplication works with multiple assignments under same Tech Lead
- Avatar fallback initials display correctly
- Integration maintains proper component order in profile page
