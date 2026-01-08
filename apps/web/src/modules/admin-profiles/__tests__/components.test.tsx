import { describe, it, expect } from 'vitest'

describe('AdminProfiles Component', () => {
  it('should export AdminProfiles component', async () => {
    const { AdminProfiles } = await import('../admin-profiles')
    expect(AdminProfiles).toBeDefined()
    expect(typeof AdminProfiles).toBe('function')
  })

  it('should have admin-profiles module structure', async () => {
    const module = await import('../admin-profiles')
    expect(module.AdminProfiles).toBeDefined()
  })
})
