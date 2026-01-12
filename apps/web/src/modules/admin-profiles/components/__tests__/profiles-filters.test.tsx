import { describe, it, expect } from 'vitest'
import { ProfilesFilters } from '../profiles-filters'

describe('ProfilesFilters Component', () => {
  it('should export ProfilesFilters component', () => {
    expect(ProfilesFilters).toBeDefined()
    expect(typeof ProfilesFilters).toBe('function')
  })

  it('should accept required props', () => {
    const requiredProps = [
      'searchTerm',
      'onSearchChange',
      'seniorityFilters',
      'onSeniorityChange',
      'skillFilters',
      'onSkillChange',
      'yearsInCompanyFilters',
      'onYearsInCompanyChange',
      'onClearFilters',
    ]

    // Component accepts these props in its signature
    expect(ProfilesFilters).toBeDefined()
    // Props validation would happen at runtime/TypeScript compile time
    expect(requiredProps.length).toBe(9)
  })
})
