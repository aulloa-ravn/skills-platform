import { describe, it, expect, vi } from 'vitest'

// Mock the navigation hooks
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useSearch: () => ({ page: 1, pageSize: 25 }),
}))

describe('Admin Profiles List - Frontend Integration', () => {
  it('should verify AdminProfiles component exports correctly', async () => {
    const { AdminProfiles } = await import('../admin-profiles')
    expect(AdminProfiles).toBeDefined()
    expect(typeof AdminProfiles).toBe('function')
  })

  it('should verify all subcomponents are properly exported', async () => {
    const profilesTable = await import('../components/profiles-table')
    const profilesFilters = await import('../components/profiles-filters')
    const profilesPagination = await import('../components/profiles-pagination')

    expect(profilesTable.ProfilesTable).toBeDefined()
    expect(profilesFilters.ProfilesFilters).toBeDefined()
    expect(profilesPagination.ProfilesPagination).toBeDefined()
  })

  it('should verify useProfiles hook is properly exported', async () => {
    const { useProfiles } = await import('../hooks/use-profiles')
    expect(useProfiles).toBeDefined()
    expect(typeof useProfiles).toBe('function')
  })
})
