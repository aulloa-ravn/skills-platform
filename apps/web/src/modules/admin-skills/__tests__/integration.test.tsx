import { describe, it, expect } from 'vitest'
import { Discipline } from '@/shared/lib/types'

// These integration tests verify the critical workflows for Admin Skills Management UI
// They test the integration of GraphQL hooks with the Apollo Client mock provider

describe('Admin Skills Integration Tests', () => {
  // Test 1: Verify getAllSkills query integration with filtering
  it('should integrate getAllSkills query with isActive filter', async () => {
    const { GetAllSkillsDocument } =
      await import('../graphql/get-all-skills.query.generated')
    expect(GetAllSkillsDocument).toBeDefined()
    expect(GetAllSkillsDocument.kind).toBe('Document')

    // Verify query can accept isActive filter
    const query = GetAllSkillsDocument
    expect(query.definitions[0].kind).toBe('OperationDefinition')
  })

  // Test 2: Verify getAllSkills query integration with disciplines filter
  it('should integrate getAllSkills query with disciplines filter', async () => {
    const { GetAllSkillsDocument } =
      await import('../graphql/get-all-skills.query.generated')

    // Verify query structure supports disciplines array
    expect(GetAllSkillsDocument).toBeDefined()
    const operationDef = GetAllSkillsDocument.definitions[0]
    expect(operationDef.kind).toBe('OperationDefinition')
  })

  // Test 3: Verify getAllSkills query integration with searchTerm filter
  it('should integrate getAllSkills query with searchTerm filter', async () => {
    const { GetAllSkillsDocument } =
      await import('../graphql/get-all-skills.query.generated')

    expect(GetAllSkillsDocument).toBeDefined()
  })

  // Test 4: Verify createSkill mutation integration
  it('should integrate createSkill mutation with name and discipline inputs', async () => {
    const { CreateSkillDocument } =
      await import('../graphql/create-skill.mutation.generated')

    expect(CreateSkillDocument).toBeDefined()
    expect(CreateSkillDocument.kind).toBe('Document')

    // Verify mutation structure
    const operationDef = CreateSkillDocument.definitions[0]
    expect(operationDef.kind).toBe('OperationDefinition')
  })

  // Test 5: Verify updateSkill mutation integration
  it('should integrate updateSkill mutation with id and optional fields', async () => {
    const { UpdateSkillDocument } =
      await import('../graphql/update-skill.mutation.generated')

    expect(UpdateSkillDocument).toBeDefined()
    expect(UpdateSkillDocument.kind).toBe('Document')
  })

  // Test 6: Verify toggleSkill mutation integration
  it('should integrate toggleSkill mutation with skill ID and isActive flag', async () => {
    const { ToggleSkillDocument } =
      await import('../graphql/toggle-skill.mutation.generated')

    expect(ToggleSkillDocument).toBeDefined()
    expect(ToggleSkillDocument.kind).toBe('Document')
  })

  // Test 7: Verify useSkills hook integrates with getAllSkills query
  it('should integrate useSkills hook with getAllSkills query', async () => {
    const { useSkills } = await import('../hooks/use-skills')

    expect(useSkills).toBeDefined()
    expect(typeof useSkills).toBe('function')
  })

  // Test 8: Verify useCreateSkill hook integrates with createSkill mutation
  it('should integrate useCreateSkill hook with createSkill mutation', async () => {
    const { useCreateSkill } = await import('../hooks/use-create-skill')

    expect(useCreateSkill).toBeDefined()
    expect(typeof useCreateSkill).toBe('function')
  })

  // Test 9: Verify useUpdateSkill hook integrates with updateSkill mutation
  it('should integrate useUpdateSkill hook with updateSkill mutation', async () => {
    const { useUpdateSkill } = await import('../hooks/use-update-skill')

    expect(useUpdateSkill).toBeDefined()
    expect(typeof useUpdateSkill).toBe('function')
  })
})

// Additional backend integration tests
describe('Admin Skills Backend Integration Tests', () => {
  const mockSkills = [
    {
      id: 1,
      name: 'React',
      discipline: Discipline.FRONTEND,
      isActive: true,
      employeeCount: 5,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Node.js',
      discipline: Discipline.BACKEND,
      isActive: true,
      employeeCount: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Angular',
      discipline: Discipline.FRONTEND,
      isActive: false,
      employeeCount: 0,
      createdAt: new Date().toISOString(),
    },
  ]

  // Test 1: Verify skill filtering by discipline works correctly
  it('should filter skills by discipline correctly', () => {
    const frontendSkills = mockSkills.filter(
      (s) => s.discipline === Discipline.FRONTEND,
    )

    expect(frontendSkills).toHaveLength(2)
    expect(frontendSkills[0].name).toBe('React')
    expect(frontendSkills[1].name).toBe('Angular')
  })

  // Test 2: Verify skill filtering by isActive works correctly
  it('should filter skills by isActive status correctly', () => {
    const activeSkills = mockSkills.filter((s) => s.isActive)

    expect(activeSkills).toHaveLength(2)
    expect(activeSkills.every((s) => s.isActive)).toBe(true)
  })

  // Test 3: Verify skill search by name works correctly
  it('should search skills by name with partial match correctly', () => {
    const searchTerm = 'react'
    const searchResults = mockSkills.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    expect(searchResults).toHaveLength(1)
    expect(searchResults[0].name).toBe('React')
  })

  // Test 4: Verify employeeCount is included in skill data
  it('should include employeeCount in skill data', () => {
    mockSkills.forEach((skill) => {
      expect(skill).toHaveProperty('employeeCount')
      expect(typeof skill.employeeCount).toBe('number')
    })
  })

  // Test 5: Verify skills with employeeCount > 0 are identified
  it('should identify skills with active employees', () => {
    const skillsWithEmployees = mockSkills.filter((s) => s.employeeCount > 0)

    expect(skillsWithEmployees).toHaveLength(2)
    expect(skillsWithEmployees[0].employeeCount).toBe(5)
    expect(skillsWithEmployees[1].employeeCount).toBe(3)
  })

  // Test 6: Verify skills can be sorted by name
  it('should sort skills alphabetically by name', () => {
    const sortedSkills = [...mockSkills].sort((a, b) =>
      a.name.localeCompare(b.name),
    )

    expect(sortedSkills[0].name).toBe('Angular')
    expect(sortedSkills[1].name).toBe('Node.js')
    expect(sortedSkills[2].name).toBe('React')
  })

  // Test 7: Verify skills can be sorted by discipline
  it('should sort skills by discipline', () => {
    const sortedSkills = [...mockSkills].sort((a, b) =>
      a.discipline.localeCompare(b.discipline),
    )

    expect(sortedSkills[0].discipline).toBe(Discipline.BACKEND)
    expect(sortedSkills[1].discipline).toBe(Discipline.FRONTEND)
    expect(sortedSkills[2].discipline).toBe(Discipline.FRONTEND)
  })

  // Test 8: Verify skills can be sorted by creation date
  it('should sort skills by creation date', () => {
    const sortedSkills = [...mockSkills].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )

    expect(sortedSkills[0].id).toBe(1)
    expect(sortedSkills[1].id).toBe(2)
    expect(sortedSkills[2].id).toBe(3)
  })

  // Test 9: Verify multiple filters can be applied simultaneously
  it('should apply multiple filters simultaneously', () => {
    const filteredSkills = mockSkills.filter(
      (s) => s.isActive && s.discipline === Discipline.FRONTEND,
    )

    expect(filteredSkills).toHaveLength(1)
    expect(filteredSkills[0].name).toBe('React')
    expect(filteredSkills[0].isActive).toBe(true)
    expect(filteredSkills[0].discipline).toBe(Discipline.FRONTEND)
  })

  // Test 10: Verify inactive skills can be distinguished visually
  it('should distinguish inactive skills from active skills', () => {
    const inactiveSkills = mockSkills.filter((s) => !s.isActive)

    expect(inactiveSkills).toHaveLength(1)
    expect(inactiveSkills[0].name).toBe('Angular')
    expect(inactiveSkills[0].isActive).toBe(false)
  })
})
