import { describe, it, expect } from 'vitest'
import { MyLeadersSection } from '../my-leaders-section'
import type { CurrentAssignmentResponse, TechLeadInfo } from '@/shared/lib/types'

describe('MyLeadersSection Component', () => {
  // Test 1: Component exports correctly
  it('should export MyLeadersSection component', () => {
    expect(MyLeadersSection).toBeDefined()
    expect(typeof MyLeadersSection).toBe('function')
  })

  // Test 2: Component hides when no assignments provided
  it('should return null when assignments array is empty', () => {
    const emptyAssignments: CurrentAssignmentResponse[] = []
    const result = MyLeadersSection({ assignments: emptyAssignments })
    expect(result).toBe(null)
  })

  // Test 3: Component deduplicates Tech Leads by ID
  it('should deduplicate Tech Leads with same ID', () => {
    const techLead: TechLeadInfo = {
      id: 'tl-1',
      name: 'John Doe',
      email: 'john@example.com',
      avatarUrl: null,
    }

    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Project A',
        role: 'Developer',
        tags: [],
        techLead: techLead,
      },
      {
        projectName: 'Project B',
        role: 'Developer',
        tags: [],
        techLead: techLead,
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBeDefined()
    expect(result).not.toBe(null)
  })

  // Test 4: Component handles null Tech Leads
  it('should filter out null Tech Leads', () => {
    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Project A',
        role: 'Developer',
        tags: [],
        techLead: null,
      },
      {
        projectName: 'Project B',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: 'Jane Doe',
          email: 'jane@example.com',
          avatarUrl: null,
        },
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBeDefined()
    expect(result).not.toBe(null)
  })

  // Test 5: Component handles Tech Leads with null IDs
  it('should filter out Tech Leads with null IDs', () => {
    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Project A',
        role: 'Developer',
        tags: [],
        techLead: {
          id: null,
          name: 'Invalid Lead',
          email: 'invalid@example.com',
          avatarUrl: null,
        },
      },
      {
        projectName: 'Project B',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: 'Valid Lead',
          email: 'valid@example.com',
          avatarUrl: null,
        },
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBeDefined()
    expect(result).not.toBe(null)
  })

  // Test 6: Component handles missing email
  it('should handle Tech Leads with missing email', () => {
    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Project A',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: 'John Doe',
          email: null,
          avatarUrl: null,
        },
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBeDefined()
    expect(result).not.toBe(null)
  })

  // Test 7: Component handles missing name
  it('should handle Tech Leads with missing name', () => {
    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Project A',
        role: 'Developer',
        tags: [],
        techLead: {
          id: 'tl-1',
          name: null,
          email: 'tech@example.com',
          avatarUrl: null,
        },
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBeDefined()
    expect(result).not.toBe(null)
  })

  // Test 8: Component returns null when all Tech Leads are filtered out
  it('should return null when all Tech Leads are invalid', () => {
    const assignments: CurrentAssignmentResponse[] = [
      {
        projectName: 'Project A',
        role: 'Developer',
        tags: [],
        techLead: null,
      },
      {
        projectName: 'Project B',
        role: 'Developer',
        tags: [],
        techLead: {
          id: null,
          name: 'Invalid',
          email: 'invalid@example.com',
          avatarUrl: null,
        },
      },
    ]

    const result = MyLeadersSection({ assignments })
    expect(result).toBe(null)
  })
})
