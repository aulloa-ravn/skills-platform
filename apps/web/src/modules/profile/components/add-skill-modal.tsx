import { useState, useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@apollo/client/react'
import * as z from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
} from '@/shared/components/ui/combobox'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import { Spinner } from '@/shared/components/ui/spinner'
import { PlusIcon } from 'lucide-react'
import { GetAllSkillsDocument } from '@/modules/admin-skills/graphql/get-all-skills.query.generated'
import { useSubmitSkillSuggestion } from '../hooks/use-submit-skill-suggestion'
import {
  Discipline,
  ProficiencyLevel,
  type SkillsTiersResponse,
} from '@/shared/lib/types'

const formSchema = z.object({
  selectedSkillId: z.number().positive({
    message: 'Please select a skill',
  }),
  proficiencyLevel: z.enum(ProficiencyLevel, {
    message: 'Please select a proficiency level',
  }),
})

type ComboboxSkillItem = {
  id: number
  name: string
}

type ComboboxSkillGroup = {
  discipline: Discipline
  items: ComboboxSkillItem[]
}

type AddSkillModalProps = {
  profileSkills: SkillsTiersResponse
}

export function AddSkillModal({ profileSkills }: AddSkillModalProps) {
  const [open, setOpen] = useState(false)
  const { submitSkillSuggestion, loading: submitting } =
    useSubmitSkillSuggestion()
  const { data: skillsData, loading: loadingSkills } = useQuery(
    GetAllSkillsDocument,
    {
      variables: {
        input: { isActive: true },
      },
    },
  )

  const addSkillForm = useForm({
    defaultValues: {
      selectedSkillId: 0,
      proficiencyLevel: '' as ProficiencyLevel,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      // Check for duplicate skill
      const isDuplicate = checkDuplicateSkill(value.selectedSkillId)
      if (isDuplicate) {
        toast.error('You already have this skill in your profile')
        return
      }

      try {
        await submitSkillSuggestion({
          skillId: value.selectedSkillId,
          proficiencyLevel: value.proficiencyLevel,
        })

        // Reset form and close modal on success
        addSkillForm.reset()
        setOpen(false)
      } catch (error) {
        // Error is handled by the hook with toast
      }
    },
  })

  const checkDuplicateSkill = (skillId: number): boolean => {
    const selectedSkill = skillsData?.getAllSkills.find(
      (skill) => skill.id === skillId,
    )
    if (!selectedSkill) return false

    const coreStackSkills = profileSkills.coreStack.map((s) => s.skillName)
    const validatedSkills = profileSkills.validatedInventory.map(
      (s) => s.skillName,
    )
    const pendingSkills = profileSkills.pending.map((s) => s.skillName)

    return (
      coreStackSkills.includes(selectedSkill.name) ||
      validatedSkills.includes(selectedSkill.name) ||
      pendingSkills.includes(selectedSkill.name)
    )
  }

  const groupedSkills = useMemo(() => {
    if (!skillsData?.getAllSkills) return []

    return skillsData.getAllSkills.reduce((acc, skill) => {
      const discipline = skill.discipline
      if (!acc.some((item) => item.discipline === discipline)) {
        acc.push({ discipline, items: [] })
      }
      acc
        .find((item) => item.discipline === discipline)
        ?.items.push({ id: skill.id, name: skill.name })
      return acc
    }, [] as ComboboxSkillGroup[])
  }, [skillsData])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !submitting) {
      // Reset form when closing
      addSkillForm.reset()
    }
    setOpen(newOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addSkillForm.handleSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4" />
          <span className="sr-only">Add Skill</span>
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Add Skill to Your Profile</DialogTitle>
          <DialogDescription>
            Search for a skill from our taxonomy and select your proficiency
            level
          </DialogDescription>
        </DialogHeader>

        <form id="add-skill-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <addSkillForm.Field
              name="selectedSkillId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Skill</FieldLabel>
                    <Combobox
                      items={groupedSkills}
                      itemToStringLabel={(item: ComboboxSkillItem) => item.name}
                      onValueChange={(newValue: ComboboxSkillItem | null) => {
                        const skillId = newValue?.id || 0
                        field.handleChange(skillId)
                      }}
                      disabled={submitting || loadingSkills}
                    >
                      <ComboboxInput
                        id={field.name}
                        name={field.name}
                        placeholder="Search for a skill..."
                        showClear
                        disabled={submitting || loadingSkills}
                        aria-invalid={isInvalid}
                      />
                      <ComboboxContent
                        className="z-50 pointer-events-auto"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <ComboboxEmpty>No skills found</ComboboxEmpty>
                        <ComboboxList>
                          {(group: ComboboxSkillGroup) => (
                            <ComboboxGroup
                              key={group.discipline}
                              items={group.items}
                            >
                              <ComboboxLabel>{group.discipline}</ComboboxLabel>
                              <ComboboxCollection>
                                {(item: ComboboxSkillItem) => (
                                  <ComboboxItem key={item.id} value={item}>
                                    {item.name}
                                  </ComboboxItem>
                                )}
                              </ComboboxCollection>
                            </ComboboxGroup>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <addSkillForm.Field
              name="proficiencyLevel"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Proficiency Level
                    </FieldLabel>
                    <RadioGroup
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value as ProficiencyLevel)
                      }
                      disabled={submitting}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={ProficiencyLevel.NOVICE}
                          id="novice"
                        />
                        <label
                          htmlFor="novice"
                          className="text-sm font-medium cursor-pointer"
                        >
                          NOVICE
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={ProficiencyLevel.INTERMEDIATE}
                          id="intermediate"
                        />
                        <label
                          htmlFor="intermediate"
                          className="text-sm font-medium cursor-pointer"
                        >
                          INTERMEDIATE
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={ProficiencyLevel.ADVANCED}
                          id="advanced"
                        />
                        <label
                          htmlFor="advanced"
                          className="text-sm font-medium cursor-pointer"
                        >
                          ADVANCED
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={ProficiencyLevel.EXPERT}
                          id="expert"
                        />
                        <label
                          htmlFor="expert"
                          className="text-sm font-medium cursor-pointer"
                        >
                          EXPERT
                        </label>
                      </div>
                    </RadioGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-skill-form"
            disabled={submitting}
            onClick={(e) => {
              e.preventDefault()
              addSkillForm.handleSubmit()
            }}
          >
            {submitting ? (
              <>
                <Spinner className="mr-2" />
                Submitting...
              </>
            ) : (
              'Add Skill'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
