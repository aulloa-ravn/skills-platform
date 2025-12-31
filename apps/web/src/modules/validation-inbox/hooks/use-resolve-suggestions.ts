import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { ResolveSuggestionsDocument } from '../graphql/resolve-suggestions.mutation.generated'
import { ResolutionAction } from '@/shared/lib/types'
import type { DecisionInput } from '@/shared/lib/types'

/**
 * useResolveSuggestions Hook
 * Apollo Client mutation hook for approving/rejecting skill suggestions
 */
export function useResolveSuggestions() {
  const [resolveSuggestionsMutation, { loading, error }] = useMutation(
    ResolveSuggestionsDocument,
    {
      onCompleted: (data) => {
        if (data.resolveSuggestions.success) {
          const processedCount = data.resolveSuggestions.processed.length
          const errorCount = data.resolveSuggestions.errors.length

          if (errorCount === 0) {
            toast.success('Suggestions resolved', {
              description: `Successfully processed ${processedCount} suggestion${processedCount > 1 ? 's' : ''}`,
              position: 'bottom-right',
            })
          } else {
            toast.warning('Partially successful', {
              description: `Processed ${processedCount}, ${errorCount} error${errorCount > 1 ? 's' : ''}`,
              position: 'bottom-right',
            })

            // Show individual errors
            data.resolveSuggestions.errors.forEach((error) => {
              toast.error('Resolution error', {
                description: error.message,
                position: 'bottom-right',
              })
            })
          }
        } else {
          toast.error('Failed to resolve suggestions', {
            position: 'bottom-right',
          })
        }
      },
      onError: (error) => {
        toast.error('Failed to resolve suggestions', {
          description: error.message,
          position: 'bottom-right',
        })
      },
    },
  )

  const resolveSuggestions = async (decisions: DecisionInput[]) => {
    return resolveSuggestionsMutation({
      variables: {
        input: {
          decisions,
        },
      },
      // Refetch validation inbox after mutation
      refetchQueries: ['GetValidationInbox'],
      awaitRefetchQueries: true,
    })
  }

  const approveSuggestion = async (suggestionId: number) => {
    return resolveSuggestions([
      {
        suggestionId,
        action: ResolutionAction.APPROVE,
      },
    ])
  }

  const rejectSuggestion = async (suggestionId: number) => {
    return resolveSuggestions([
      {
        suggestionId,
        action: ResolutionAction.REJECT,
      },
    ])
  }

  const adjustSuggestion = async (
    suggestionId: number,
    adjustedProficiency: string,
  ) => {
    return resolveSuggestions([
      {
        suggestionId,
        action: ResolutionAction.ADJUST_LEVEL,
        adjustedProficiency,
      },
    ])
  }

  return {
    resolveSuggestions,
    approveSuggestion,
    rejectSuggestion,
    adjustSuggestion,
    loading,
    error,
  }
}
