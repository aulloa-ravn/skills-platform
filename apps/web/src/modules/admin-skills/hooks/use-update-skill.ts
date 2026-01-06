import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { UpdateSkillDocument } from '../graphql/update-skill.mutation.generated'
// import { GetAllSkillsDocument } from '../graphql/get-all-skills.query.generated'
import type { UpdateSkillInput } from '@/shared/lib/types'

/**
 * useUpdateSkill Hook
 * Apollo Client mutation hook for updating an existing skill
 */
export function useUpdateSkill() {
  const [updateSkillMutation, { loading, error }] = useMutation(
    UpdateSkillDocument,
    {
      onCompleted: (data) => {
        if (data.updateSkill) {
          toast.success('Skill updated', {
            description: `Successfully updated "${data.updateSkill.name}"`,
            position: 'bottom-right',
          })
        }
      },
      onError: (error) => {
        toast.error('Failed to update skill', {
          description: error.message,
          position: 'bottom-right',
        })
      },
      // Refetch getAllSkills after successful update
      refetchQueries: ['GetAllSkills'],
      awaitRefetchQueries: true,
    },
  )

  const updateSkill = async (input: UpdateSkillInput) => {
    return updateSkillMutation({
      variables: {
        input,
      },
    })
  }

  return {
    updateSkill,
    loading,
    error,
  }
}
