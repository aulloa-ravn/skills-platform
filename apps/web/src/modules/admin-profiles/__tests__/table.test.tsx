import { describe, it, expect } from 'vitest'
import { ProfilesTable } from '../components/profiles-table'

describe('ProfilesTable Component', () => {
  it('should export ProfilesTable component', () => {
    expect(ProfilesTable).toBeDefined()
    expect(typeof ProfilesTable).toBe('function')
  })

  it('should accept required props', () => {
    const mockProps = {
      profiles: [],
      loading: false,
      onRowClick: () => {},
      sortBy: undefined,
      sortDirection: undefined,
      onSortChange: () => {},
    }

    const result = ProfilesTable(mockProps)
    expect(result).toBeDefined()
  })

  it('should handle empty profiles array', () => {
    const mockProps = {
      profiles: [],
      loading: false,
      onRowClick: () => {},
      sortBy: undefined,
      sortDirection: undefined,
      onSortChange: () => {},
    }

    const result = ProfilesTable(mockProps)
    expect(result).toBeDefined()
  })
})
