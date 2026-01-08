import { useQuery } from '@apollo/client/react'
import { GetProfileDocument } from '../graphql/get-profile.query.generated'

/**
 * useProfile Hook
 * Apollo Client query hook for fetching user profile data
 */
export function useProfile(profileId: string) {
  const { data, loading, error, refetch } = useQuery(GetProfileDocument, {
    variables: {
      id: profileId,
    },
    skip: !profileId,
  })

  return {
    profile: data?.getProfile,
    loading,
    error,
    refetch,
  }
}
