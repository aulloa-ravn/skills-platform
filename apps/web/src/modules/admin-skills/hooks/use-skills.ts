import { useQuery } from '@apollo/client/react'
import { GetAllSkillsDocument } from '../graphql/get-all-skills.query.generated'
import type { GetAllSkillsInput } from '@/shared/lib/types'

/**
 * useSkills Hook
 * Apollo Client query hook for fetching all skills with optional filters
 */
export function useSkills(input?: GetAllSkillsInput) {
  const { data, loading, error, refetch } = useQuery(GetAllSkillsDocument, {
    variables: input ? { input } : undefined,
  })

  return {
    skills: data?.getAllSkills,
    loading,
    error,
    refetch,
  }
}
