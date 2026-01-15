import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { SubmitSkillSuggestionDocument } from '../graphql/submit-skill-suggestion.mutation.generated'
import type { SubmitSkillSuggestionInput } from '@/shared/lib/types'
import { CombinedGraphQLErrors } from '@apollo/client'

/**
 * useSubmitSkillSuggestion Hook
 * Apollo Client mutation hook for submitting a skill suggestion for self-reporting
 */
export function useSubmitSkillSuggestion() {
  const [submitSkillSuggestionMutation, { loading, error }] = useMutation(
    SubmitSkillSuggestionDocument,
    {
      onCompleted: () => {
        toast.success('Skill suggestion submitted successfully', {
          description: 'Your tech lead will review your suggestion',
          position: 'bottom-right',
        })
      },
      onError: (error) => {
        if (CombinedGraphQLErrors.is(error)) {
          const errorCode = error.errors[0].extensions?.code as string

          switch (errorCode) {
            case 'SKILL_ALREADY_EXISTS':
              toast.error('You already have this skill in your profile', {
                position: 'bottom-right',
              })
              break
            case 'SKILL_NOT_FOUND':
              toast.error('This skill is not available in the taxonomy', {
                position: 'bottom-right',
              })
              break
            case 'SKILL_INACTIVE':
              toast.error('This skill is no longer active', {
                position: 'bottom-right',
              })
              break
            case 'UNAUTHORIZED':
              toast.error('You must be logged in to add skills', {
                position: 'bottom-right',
              })
              break
            default:
              toast.error('Failed to submit skill suggestion', {
                description: error.message,
                position: 'bottom-right',
              })
          }
        }
      },
      // Refetch profile data after successful submission
      refetchQueries: ['GetProfile'],
      awaitRefetchQueries: true,
    },
  )

  const submitSkillSuggestion = async (input: SubmitSkillSuggestionInput) => {
    return submitSkillSuggestionMutation({
      variables: {
        input,
      },
    })
  }

  return {
    submitSkillSuggestion,
    loading,
    error,
  }
}
