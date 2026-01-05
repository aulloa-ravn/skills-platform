import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { CreateSkillDocument } from '../graphql/create-skill.mutation.generated'
import { GetAllSkillsDocument } from '../graphql/get-all-skills.query.generated'
import type { CreateSkillInput } from '@/shared/lib/types'

/**
 * useCreateSkill Hook
 * Apollo Client mutation hook for creating a new skill
 */
export function useCreateSkill() {
  const [createSkillMutation, { loading, error }] = useMutation(
    CreateSkillDocument,
    {
      onCompleted: (data) => {
        if (data.createSkill) {
          toast.success('Skill created', {
            description: `Successfully created "${data.createSkill.name}"`,
            position: 'bottom-right',
          })
        }
      },
      onError: (error) => {
        toast.error('Failed to create skill', {
          description: error.message,
          position: 'bottom-right',
        })
      },
      // Refetch getAllSkills after successful creation
      refetchQueries: ['GetAllSkills'],
      awaitRefetchQueries: true,
    },
  )

  const createSkill = async (input: CreateSkillInput) => {
    return createSkillMutation({
      variables: {
        input,
      },
    })
  }

  return {
    createSkill,
    loading,
    error,
  }
}
