import { useQuery } from '@apollo/client/react'
import { GetValidationInboxDocument } from '../graphql/get-validation-inbox.query.generated'

/**
 * useValidationInbox Hook
 * Apollo Client query hook for fetching validation inbox data
 */
export function useValidationInbox() {
  const { data, loading, error, refetch } = useQuery(GetValidationInboxDocument)

  return {
    inbox: data?.getValidationInbox,
    loading,
    error,
    refetch,
  }
}
