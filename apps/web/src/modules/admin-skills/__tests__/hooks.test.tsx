import { describe, it, expect, vi } from 'vitest'
import { useSkills } from '../hooks/use-skills'
import { useCreateSkill } from '../hooks/use-create-skill'
import { useUpdateSkill } from '../hooks/use-update-skill'
import { useToggleSkill } from '../hooks/use-toggle-skill'

// Mock Apollo Client
vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Admin Skills GraphQL Hooks', () => {
  describe('useSkills', () => {
    it('should export useSkills hook', () => {
      expect(useSkills).toBeDefined()
      expect(typeof useSkills).toBe('function')
    })
  })

  describe('useCreateSkill', () => {
    it('should export useCreateSkill hook', () => {
      expect(useCreateSkill).toBeDefined()
      expect(typeof useCreateSkill).toBe('function')
    })
  })

  describe('useUpdateSkill', () => {
    it('should export useUpdateSkill hook', () => {
      expect(useUpdateSkill).toBeDefined()
      expect(typeof useUpdateSkill).toBe('function')
    })
  })

  describe('useToggleSkill', () => {
    it('should export useToggleSkill hook', () => {
      expect(useToggleSkill).toBeDefined()
      expect(typeof useToggleSkill).toBe('function')
    })
  })

  describe('GraphQL Documents', () => {
    it('should have valid GetAllSkills query document', async () => {
      const { GetAllSkillsDocument } =
        await import('../graphql/get-all-skills.query.generated')
      expect(GetAllSkillsDocument).toBeDefined()
      expect(GetAllSkillsDocument.kind).toBe('Document')
    })

    it('should have valid CreateSkill mutation document', async () => {
      const { CreateSkillDocument } =
        await import('../graphql/create-skill.mutation.generated')
      expect(CreateSkillDocument).toBeDefined()
      expect(CreateSkillDocument.kind).toBe('Document')
    })

    it('should have valid UpdateSkill mutation document', async () => {
      const { UpdateSkillDocument } =
        await import('../graphql/update-skill.mutation.generated')
      expect(UpdateSkillDocument).toBeDefined()
      expect(UpdateSkillDocument.kind).toBe('Document')
    })

    it('should have valid ToggleSkill mutation document', async () => {
      const { ToggleSkillDocument } =
        await import('../graphql/toggle-skill.mutation.generated')
      expect(ToggleSkillDocument).toBeDefined()
      expect(ToggleSkillDocument.kind).toBe('Document')
    })
  })
})
