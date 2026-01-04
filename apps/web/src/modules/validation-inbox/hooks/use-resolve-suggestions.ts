import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { ResolveSuggestionsDocument } from '../graphql/resolve-suggestions.mutation.generated'
import { GetValidationInboxDocument } from '../graphql/get-validation-inbox.query.generated'
import { ResolutionAction } from '@/shared/lib/types'
import type { DecisionInput, InboxResponse } from '@/shared/lib/types'

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
    const suggestionIds = decisions.map((d) => d.suggestionId)

    return resolveSuggestionsMutation({
      variables: {
        input: {
          decisions,
        },
      },
      // Optimistic update - immediately remove suggestions from cache
      optimisticResponse: {
        resolveSuggestions: {
          // __typename: 'ResolveSuggestionsResponse',
          success: true,
          processed: decisions.map((decision) => ({
            // __typename: 'ResolvedSuggestion',
            suggestionId: decision.suggestionId,
            action: decision.action,
            employeeName: '',
            skillName: '',
            proficiencyLevel: decision.adjustedProficiency || '',
          })),
          errors: [],
        },
      },
      // Update cache to remove processed suggestions
      update: (cache, { data }) => {
        if (!data?.resolveSuggestions.success) return

        const existingData = cache.readQuery<{
          getValidationInbox: InboxResponse
        }>({
          query: GetValidationInboxDocument,
        })

        if (!existingData) return

        // Remove processed suggestions from cache
        const updatedData = {
          getValidationInbox: {
            ...existingData.getValidationInbox,
            projects: existingData.getValidationInbox.projects.map(
              (project) => ({
                ...project,
                employees: project.employees.map((employee) => ({
                  ...employee,
                  suggestions: employee.suggestions.filter(
                    (suggestion) => !suggestionIds.includes(suggestion.id),
                  ),
                  pendingSuggestionsCount: Math.max(
                    0,
                    employee.pendingSuggestionsCount - suggestionIds.length,
                  ),
                })),
                pendingSuggestionsCount: Math.max(
                  0,
                  project.pendingSuggestionsCount - suggestionIds.length,
                ),
              }),
            ),
          },
        }

        cache.writeQuery({
          query: GetValidationInboxDocument,
          data: updatedData,
        })
      },
      // Refetch validation inbox after mutation to ensure data consistency
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
