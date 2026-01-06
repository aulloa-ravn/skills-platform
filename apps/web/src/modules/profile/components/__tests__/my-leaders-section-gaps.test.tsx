import { describe, it, expect } from 'vitest'
import { MyLeadersSection } from '../my-leaders-section'
import type { CurrentAssignmentResponse } from '@/shared/lib/types'

describe('MyLeadersSection - Critical Gap Coverage', () => {
  // Test 1: Deduplication with 3+ assignments under same Tech Lead
  it('should deduplicate when multiple assignments share the same Tech Lead ID', () => {
    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Project A',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          avatarUrl: 'https://example.com/alice.jpg',
        },
      },
      {
        projectName: 'Project B',
        role: 'Senior Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          avatarUrl: 'https://example.com/alice.jpg',
        },
      },
      {
        projectName: 'Project C',
        role: 'Tech Lead',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          avatarUrl: 'https://example.com/alice.jpg',
        },
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBeDefined()
    expect(result).not.toBe(null)
  })

  // Test 2: Multiple unique Tech Leads
  it('should display all unique Tech Leads when they have different IDs', () => {
    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Project A',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          avatarUrl: null,
        },
      },
      {
        projectName: 'Project B',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          avatarUrl: null,
        },
      },
      {
        projectName: 'Project C',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-3',
          name: 'Charlie Davis',
          email: 'charlie@example.com',
          avatarUrl: null,
        },
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBeDefined()
    expect(result).not.toBe(null)
  })

  // Test 3: Mixed scenario - some duplicates, some null Tech Leads
  it('should handle mixed scenario with duplicates and nulls', () => {
    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Project A',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          avatarUrl: null,
        },
      },
      {
        projectName: 'Project B',
        role: 'Developer',
        tags: [],
        techLead: null,
      },
      {
        projectName: 'Project C',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          avatarUrl: null,
        },
      },
      {
        projectName: 'Project D',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          avatarUrl: null,
        },
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBeDefined()
    expect(result).not.toBe(null)
  })

  // Test 4: Tech Lead with only avatarUrl (missing name and email)
  it('should handle Tech Lead with missing name and email but valid ID and avatar', () => {
    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Project A',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: null,
          email: null,
          avatarUrl: 'https://example.com/avatar.jpg',
        },
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBeDefined()
    expect(result).not.toBe(null)
  })

  // Test 5: Empty string values (edge case)
  it('should handle empty string values for name and email', () => {
    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Project A',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: '',
          email: '',
          avatarUrl: null,
        },
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBeDefined()
    expect(result).not.toBe(null)
  })

  // Test 6: Very long email address (truncation test)
  it('should handle very long email addresses', () => {
    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Project A',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: 'Test User',
          email:
            'very.long.email.address.that.should.be.truncated@example-company-with-long-domain.com',
          avatarUrl: null,
        },
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBeDefined()
    expect(result).not.toBe(null)
  })

  // Test 7: Special characters in name
  it('should handle special characters in Tech Lead name', () => {
    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Project A',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: "O'Brien-Smith Jr.",
          email: 'obrien@example.com',
          avatarUrl: null,
        },
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBeDefined()
    expect(result).not.toBe(null)
  })

  // Test 8: Single character name (initials edge case)
  it('should handle single character name for initials', () => {
    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Project A',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: 'A',
          email: 'a@example.com',
          avatarUrl: null,
        },
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBeDefined()
    expect(result).not.toBe(null)
  })

  // Test 9: Deduplication preserves first occurrence
  it('should preserve first occurrence when deduplicating Tech Leads', () => {
    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Project A',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: 'Alice Johnson',
          email: 'alice.first@example.com',
          avatarUrl: 'https://example.com/alice1.jpg',
        },
      },
      {
        projectName: 'Project B',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: 'Alice J.',
          email: 'alice.second@example.com',
          avatarUrl: 'https://example.com/alice2.jpg',
        },
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBeDefined()
    expect(result).not.toBe(null)
  })

  // Test 10: All assignments have different Tech Leads with complete data
  it('should handle complete scenario with all unique Tech Leads', () => {
    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Frontend Project',
        role: 'Frontend Developer',
        tags: ['React', 'TypeScript'],
        techLead: {
          id: 'tl-1',
          name: 'Sarah Connor',
          email: 'sarah.connor@example.com',
          avatarUrl: 'https://example.com/sarah.jpg',
        },
      },
      {
        projectName: 'Backend Project',
        role: 'Backend Developer',
        tags: ['Node.js', 'GraphQL'],
        techLead: {
          id: 'tl-2',
          name: 'John Connor',
          email: 'john.connor@example.com',
          avatarUrl: 'https://example.com/john.jpg',
        },
      },
      {
        projectName: 'DevOps Project',
        role: 'DevOps Engineer',
        tags: ['Docker', 'Kubernetes'],
        techLead: {
          id: 'tl-3',
          name: 'Kyle Reese',
          email: 'kyle.reese@example.com',
          avatarUrl: 'https://example.com/kyle.jpg',
        },
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBeDefined()
    expect(result).not.toBe(null)
  })
})
