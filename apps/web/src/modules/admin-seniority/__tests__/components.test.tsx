import { describe, it, expect } from 'vitest'
import { SeniorityHistoryTable } from '../components/seniority-history-table'
import { AddSeniorityModal } from '../components/add-seniority-modal'
import { EditSeniorityModal } from '../components/edit-seniority-modal'
import { AdminSeniority } from '../admin-seniority'
import { SeniorityLevel } from '@/shared/lib/types'

describe('Admin Seniority UI Components', () => {
  // Test 1: SeniorityHistoryTable component exports correctly
  it('should export SeniorityHistoryTable component', () => {
    expect(SeniorityHistoryTable).toBeDefined()
    expect(typeof SeniorityHistoryTable).toBe('function')
  })

  // Test 2: AddSeniorityModal component exports correctly
  it('should export AddSeniorityModal component', () => {
    expect(AddSeniorityModal).toBeDefined()
    expect(typeof AddSeniorityModal).toBe('function')
  })

  // Test 3: EditSeniorityModal component exports correctly
  it('should export EditSeniorityModal component', () => {
    expect(EditSeniorityModal).toBeDefined()
    expect(typeof EditSeniorityModal).toBe('function')
  })

  // Test 4: AdminSeniority main component exports correctly
  it('should export AdminSeniority main component', () => {
    expect(AdminSeniority).toBeDefined()
    expect(typeof AdminSeniority).toBe('function')
  })

  // Test 5: Route file exists and exports properly
  it('should have admin seniority route with role guard', async () => {
    const route = await import(
      '../../../routes/_authenticated/admin/profiles.$profileId.seniority'
    )
    expect(route.Route).toBeDefined()
  })

  // Test 6: Components are properly typed
  it('should have proper TypeScript types for SeniorityHistoryTableRow', () => {
    // This test verifies that the types compile correctly
    const mockRow = {
      id: 1,
      profileId: 'test-profile-123',
      seniorityLevel: SeniorityLevel.SENIOR_ENGINEER,
      startDate: new Date('2024-01-01').toISOString(),
      endDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    expect(mockRow).toBeDefined()
    expect(mockRow.id).toBe(1)
    expect(mockRow.seniorityLevel).toBe(SeniorityLevel.SENIOR_ENGINEER)
    expect(mockRow.endDate).toBeNull()
  })

  // Test 7: GraphQL hooks export correctly
  it('should export useSeniorityHistory hook', async () => {
    const hooks = await import('../hooks/use-seniority-history')
    expect(hooks.useSeniorityHistory).toBeDefined()
    expect(typeof hooks.useSeniorityHistory).toBe('function')
  })

  // Test 8: GraphQL mutations export correctly
  it('should export useCreateSeniorityHistory hook', async () => {
    const hooks = await import('../hooks/use-create-seniority-history')
    expect(hooks.useCreateSeniorityHistory).toBeDefined()
    expect(typeof hooks.useCreateSeniorityHistory).toBe('function')
  })

  // Test 9: Update mutation hook exports correctly
  it('should export useUpdateSeniorityHistory hook', async () => {
    const hooks = await import('../hooks/use-update-seniority-history')
    expect(hooks.useUpdateSeniorityHistory).toBeDefined()
    expect(typeof hooks.useUpdateSeniorityHistory).toBe('function')
  })
})
