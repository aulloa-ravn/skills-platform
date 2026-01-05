import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { CreateSeniorityHistoryDocument } from '../graphql/create-seniority-history.mutation.generated'
import type { CreateSeniorityHistoryInput } from '@/shared/lib/types'

/**
 * useCreateSeniorityHistory Hook
 * Apollo Client mutation hook for creating a new seniority history record
 */
export function useCreateSeniorityHistory() {
  const [createSeniorityHistoryMutation, { loading, error }] = useMutation(
    CreateSeniorityHistoryDocument,
    {
      onCompleted: () => {
        toast.success('Seniority record created', {
          description: 'Successfully added seniority history record',
          position: 'bottom-right',
        })
      },
      onError: (error) => {
        toast.error('Failed to create record', {
          description: error.message,
          position: 'bottom-right',
        })
      },
      // Refetch seniority history after successful creation
      refetchQueries: ['GetSeniorityHistory'],
      awaitRefetchQueries: true,
    },
  )

  const createSeniorityHistory = async (input: CreateSeniorityHistoryInput) => {
    return createSeniorityHistoryMutation({
      variables: {
        input,
      },
    })
  }

  return {
    createSeniorityHistory,
    loading,
    error,
  }
}
