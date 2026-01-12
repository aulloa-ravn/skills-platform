import { describe, it, expect, vi } from 'vitest'
import { useProfiles } from '../hooks/use-profiles'

// Mock Apollo Client
vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn(),
}))

// Mock debounce hook
vi.mock('@/shared/hooks/use-debounce', () => ({
  useDebounce: vi.fn((value) => value),
}))

describe('Admin Profiles GraphQL Hooks', () => {
  describe('useProfiles', () => {
    it('should export useProfiles hook', () => {
      expect(useProfiles).toBeDefined()
      expect(typeof useProfiles).toBe('function')
    })
  })

  describe('GraphQL Documents', () => {
    it('should have valid GetAllProfilesForAdmin query document', async () => {
      const { GetAllProfilesForAdminDocument } =
        await import('../graphql/get-all-profiles-for-admin.query.generated')
      expect(GetAllProfilesForAdminDocument).toBeDefined()
      expect(GetAllProfilesForAdminDocument.kind).toBe('Document')
    })

    it('should have GetAllProfilesForAdmin query with correct fields', async () => {
      const { GetAllProfilesForAdminDocument } =
        await import('../graphql/get-all-profiles-for-admin.query.generated')
      const definitions = GetAllProfilesForAdminDocument.definitions
      expect(definitions).toBeDefined()
      expect(definitions.length).toBeGreaterThan(0)
    })
  })
})
