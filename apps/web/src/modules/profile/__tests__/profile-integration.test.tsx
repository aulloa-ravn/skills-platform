import { describe, it, expect } from 'vitest'
import { Profile } from '../profile'

describe('Profile Page Integration', () => {
  // Test 1: Profile component exports correctly
  it('should export Profile component', () => {
    expect(Profile).toBeDefined()
    expect(typeof Profile).toBe('function')
  })

  // Test 2: MyLeadersSection component imports correctly
  it('should import MyLeadersSection component', async () => {
    const myLeadersModule = await import('../components/my-leaders-section')
    expect(myLeadersModule.MyLeadersSection).toBeDefined()
    expect(typeof myLeadersModule.MyLeadersSection).toBe('function')
  })

  // Test 3: All profile components are available
  it('should import all profile components', async () => {
    const profileHeader = await import('../components/profile-header')
    const seniorityTimeline = await import('../components/seniority-timeline')
    const currentAssignments = await import('../components/current-assignments')
    const myLeaders = await import('../components/my-leaders-section')
    const skills = await import('../components/skill-sections')

    expect(profileHeader.ProfileHeader).toBeDefined()
    expect(seniorityTimeline.SeniorityTimeline).toBeDefined()
    expect(currentAssignments.CurrentAssignments).toBeDefined()
    expect(myLeaders.MyLeadersSection).toBeDefined()
    expect(skills.SkillsSection).toBeDefined()
  })

  // Test 4: Profile hook is available
  it('should import useProfile hook', async () => {
    const profileHook = await import('../hooks/use-profile')
    expect(profileHook.useProfile).toBeDefined()
    expect(typeof profileHook.useProfile).toBe('function')
  })
})
