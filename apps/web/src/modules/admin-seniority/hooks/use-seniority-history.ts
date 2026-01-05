import { useQuery } from '@apollo/client/react'
import { GetSeniorityHistoryDocument } from '../graphql/get-seniority-history.query.generated'

/**
 * useSeniorityHistory Hook
 * Apollo Client query hook for fetching seniority history for a profile
 */
export function useSeniorityHistory(profileId: string) {
  const { data, loading, error, refetch } = useQuery(
    GetSeniorityHistoryDocument,
    {
      variables: { profileId },
      skip: !profileId,
    },
  )

  return {
    seniorityHistory: data?.getSeniorityHistory,
    loading,
    error,
    refetch,
  }
}
