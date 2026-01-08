import { useQuery } from '@apollo/client/react'
import { useMemo } from 'react'
import { GetAllProfilesForAdminDocument } from '../graphql/get-all-profiles-for-admin.query.generated'
import type {
  ProfileSortField,
  SeniorityLevel,
  SortDirection,
  YearsInCompanyRange,
} from '@/shared/lib/types'
import { useDebounce } from '@/shared/hooks/use-debounce'

interface UseProfilesParams {
  page?: number
  pageSize?: number
  searchTerm?: string
  seniorityLevels?: SeniorityLevel[]
  skillIds?: string[]
  yearsInCompanyRanges?: YearsInCompanyRange[]
  sortBy?: ProfileSortField
  sortDirection?: SortDirection
}

/**
 * useProfiles Hook
 * Apollo Client query hook for fetching paginated profiles with filters
 */
export function useProfiles(params?: UseProfilesParams) {
  const {
    page = 1,
    pageSize = 25,
    searchTerm = '',
    seniorityLevels,
    skillIds,
    yearsInCompanyRanges,
    sortBy,
    sortDirection,
  } = params || {}

  // Debounce search term to avoid excessive queries
  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 300)

  // Construct input object
  const input = useMemo(() => {
    const variables: Record<string, unknown> = {
      page,
      pageSize,
    }

    if (debouncedSearchTerm) {
      variables.searchTerm = debouncedSearchTerm
    }

    if (seniorityLevels && seniorityLevels.length > 0) {
      variables.seniorityLevels = seniorityLevels
    }

    if (skillIds && skillIds.length > 0) {
      variables.skillIds = skillIds
    }

    if (yearsInCompanyRanges && yearsInCompanyRanges.length > 0) {
      variables.yearsInCompanyRanges = yearsInCompanyRanges
    }

    if (sortBy) {
      variables.sortBy = sortBy
    }

    if (sortDirection) {
      variables.sortDirection = sortDirection
    }

    return variables
  }, [
    page,
    pageSize,
    debouncedSearchTerm,
    seniorityLevels,
    skillIds,
    yearsInCompanyRanges,
    sortBy,
    sortDirection,
  ])

  const { data, loading, error, refetch } = useQuery(
    GetAllProfilesForAdminDocument,
    {
      variables: { input },
      fetchPolicy: 'cache-and-network',
    },
  )

  return {
    data: data?.getAllProfilesForAdmin,
    loading,
    error,
    refetch,
  }
}
