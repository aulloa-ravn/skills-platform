import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { UpdateSeniorityHistoryDocument } from '../graphql/update-seniority-history.mutation.generated'
import type { UpdateSeniorityHistoryInput } from '@/shared/lib/types'

/**
 * useUpdateSeniorityHistory Hook
 * Apollo Client mutation hook for updating an existing seniority history record
 */
export function useUpdateSeniorityHistory() {
  const [updateSeniorityHistoryMutation, { loading, error }] = useMutation(
    UpdateSeniorityHistoryDocument,
    {
      onCompleted: () => {
        toast.success('Seniority record updated', {
          description: 'Successfully updated seniority history record',
          position: 'bottom-right',
        })
      },
      onError: (error) => {
        toast.error('Failed to update record', {
          description: error.message,
          position: 'bottom-right',
        })
      },
      // Refetch seniority history after successful update
      refetchQueries: ['GetSeniorityHistory'],
      awaitRefetchQueries: true,
    },
  )

  const updateSeniorityHistory = async (input: UpdateSeniorityHistoryInput) => {
    return updateSeniorityHistoryMutation({
      variables: {
        input,
      },
    })
  }

  return {
    updateSeniorityHistory,
    loading,
    error,
  }
}
