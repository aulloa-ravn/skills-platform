import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { ToggleSkillDocument } from '../graphql/toggle-skill.mutation.generated'
import { GetAllSkillsDocument } from '../graphql/get-all-skills.query.generated'
import type { GetAllSkillsQuery } from '../graphql/get-all-skills.query.generated'
import type { Discipline } from '@/shared/lib/types'

/**
 * useToggleSkill Hook
 * Apollo Client mutation hook for toggling skill active status with optimistic updates
 */
export function useToggleSkill() {
  const [toggleSkillMutation, { loading }] = useMutation(ToggleSkillDocument, {
    onCompleted: (data) => {
      if (data.toggleSkill) {
        const status = data.toggleSkill.isActive ? 'enabled' : 'disabled'
        toast.success(`Skill ${status}`, {
          description: `"${data.toggleSkill.name}" is now ${data.toggleSkill.isActive ? 'active' : 'inactive'}`,
          position: 'bottom-right',
        })
      }
    },
    onError: (error) => {
      toast.error('Failed to toggle skill', {
        description: error.message,
        position: 'bottom-right',
      })
    },
    refetchQueries: ['GetAllSkills'],
    awaitRefetchQueries: true,
  })

  const toggleSkill = async (
    skillId: number,
    currentIsActive: boolean,
    skillName: string,
    discipline: Discipline,
    employeeCount: number,
    createdAt: string,
  ) => {
    const newIsActive = !currentIsActive

    return toggleSkillMutation({
      variables: {
        id: skillId,
        isActive: newIsActive,
      },
      // Optimistic update - immediately update UI before mutation completes
      optimisticResponse: {
        toggleSkill: {
          // __typename: 'Skill',
          id: skillId,
          name: skillName,
          discipline,
          isActive: newIsActive,
          employeeCount,
          createdAt,
        },
      },
      // Update cache immediately
      update: (cache, { data }) => {
        const updatedSkill = data?.toggleSkill
        if (!updatedSkill) return

        const existingData = cache.readQuery<GetAllSkillsQuery>({
          query: GetAllSkillsDocument,
        })

        if (!existingData) return

        // Update the skill in the cache
        const updatedSkills = existingData.getAllSkills.map((skill) =>
          skill.id === skillId ? { ...skill, isActive: newIsActive } : skill,
        )

        cache.writeQuery({
          query: GetAllSkillsDocument,
          data: {
            getAllSkills: updatedSkills,
          },
        })
      },
    })
  }

  return {
    toggleSkill,
    loading,
  }
}
