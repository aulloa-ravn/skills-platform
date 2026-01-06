import { useQuery } from '@apollo/client/react'
import { useStore } from '@/shared/store'
import { GetProfileDocument } from '../graphql/get-profile.query.generated'

/**
 * useProfile Hook
 * Apollo Client query hook for fetching user profile data
 */
export function useProfile() {
  const currentUser = useStore((state) => state.currentUser)

  const { data, loading, error, refetch } = useQuery(GetProfileDocument, {
    variables: {
      id: currentUser?.id || '',
    },
    skip: !currentUser?.id,
  })

  return {
    profile: data?.getProfile,
    loading,
    error,
    refetch,
  }
}
