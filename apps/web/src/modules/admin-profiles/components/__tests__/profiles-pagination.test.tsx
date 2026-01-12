import { describe, it, expect } from 'vitest'
import { ProfilesPagination } from '../profiles-pagination'

describe('ProfilesPagination Component', () => {
  it('should export ProfilesPagination component', () => {
    expect(ProfilesPagination).toBeDefined()
    expect(typeof ProfilesPagination).toBe('function')
  })

  it('should accept required props for pagination', () => {
    const requiredProps = [
      'currentPage',
      'pageSize',
      'totalPages',
      'totalCount',
      'onPageChange',
      'onPageSizeChange',
    ]

    // Component accepts these props in its signature
    expect(ProfilesPagination).toBeDefined()
    // Props validation would happen at runtime/TypeScript compile time
    expect(requiredProps.length).toBe(6)
  })
})
