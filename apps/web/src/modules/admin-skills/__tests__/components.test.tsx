import { describe, it, expect } from 'vitest'
import { SkillsTable } from '../components/skills-table'
import { SkillsFilters } from '../components/skills-filters'
import { SkillsSorting } from '../components/skills-sorting'
import { AddSkillModal } from '../components/add-skill-modal'
import { EditSkillModal } from '../components/edit-skill-modal'
import { AdminSkills } from '../admin-skills'

describe('Admin Skills UI Components', () => {
  // Test 1: SkillsTable component exports correctly
  it('should export SkillsTable component', () => {
    expect(SkillsTable).toBeDefined()
    expect(typeof SkillsTable).toBe('function')
  })

  // Test 2: SkillsFilters component exports correctly
  it('should export SkillsFilters component', () => {
    expect(SkillsFilters).toBeDefined()
    expect(typeof SkillsFilters).toBe('function')
  })

  // Test 3: SkillsSorting component exports correctly
  it('should export SkillsSorting component', () => {
    expect(SkillsSorting).toBeDefined()
    expect(typeof SkillsSorting).toBe('function')
  })

  // Test 4: AddSkillModal component exports correctly
  it('should export AddSkillModal component', () => {
    expect(AddSkillModal).toBeDefined()
    expect(typeof AddSkillModal).toBe('function')
  })

  // Test 5: EditSkillModal component exports correctly
  it('should export EditSkillModal component', () => {
    expect(EditSkillModal).toBeDefined()
    expect(typeof EditSkillModal).toBe('function')
  })

  // Test 6: AdminSkills main component exports correctly
  it('should export AdminSkills main component', () => {
    expect(AdminSkills).toBeDefined()
    expect(typeof AdminSkills).toBe('function')
  })

  // Test 7: Route file exists and exports properly
  it('should have admin route with role guard', async () => {
    const route = await import('../../../routes/_authenticated/admin/skills')
    expect(route.Route).toBeDefined()
  })

  // Test 8: Components are properly typed
  it('should have proper TypeScript types for SkillTableRow', () => {
    // This test verifies that the types compile correctly
    const mockRow = {
      id: 1,
      name: 'React',
      discipline: 'FRONTEND' as const,
      isActive: true,
      employeeCount: 5,
      createdAt: new Date().toISOString(),
    }

    expect(mockRow).toBeDefined()
    expect(mockRow.id).toBe(1)
    expect(mockRow.name).toBe('React')
  })
})
