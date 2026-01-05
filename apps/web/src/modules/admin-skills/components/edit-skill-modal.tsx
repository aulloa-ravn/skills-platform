import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import * as z from 'zod'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import { Spinner } from '@/shared/components/ui/spinner'
import { DisciplineMap } from '@/shared/utils'
import { Discipline } from '@/shared/lib/types'
import { AlertCircleIcon } from 'lucide-react'
import { useUpdateSkill } from '../hooks/use-update-skill'
import type { SkillTableRow } from './skills-table'

const formSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  discipline: z.enum(Discipline, {
    error: () => 'Please select a discipline',
  }),
})

type EditSkillModalProps = {
  skill: SkillTableRow | null
  existingSkills: SkillTableRow[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditSkillModal({
  skill,
  existingSkills,
  open,
  onOpenChange,
}: EditSkillModalProps) {
  const [customError, setCustomError] = useState<string | null>(null)
  const { updateSkill, loading } = useUpdateSkill()

  const editSkillForm = useForm({
    defaultValues: {
      name: skill?.name || '',
      discipline: (skill?.discipline || '') as Discipline,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!skill) return

      setCustomError(null)

      // Check for duplicate skill name (case-insensitive), excluding current skill
      const duplicateSkill = existingSkills.find(
        (s) =>
          s.id !== skill.id &&
          s.name.toLowerCase() === value.name.trim().toLowerCase(),
      )

      if (duplicateSkill) {
        setCustomError(
          `A skill named "${duplicateSkill.name}" already exists. Please choose a different name.`,
        )
        return
      }

      try {
        await updateSkill({
          id: skill.id,
          name: value.name.trim(),
          discipline: value.discipline,
        })

        // Close modal on success
        onOpenChange(false)
      } catch (error) {
        // Error is handled by the hook with toast
        console.error('Failed to update skill:', error)
      }
    },
  })

  // Reset form when skill changes
  useEffect(() => {
    if (skill) {
      editSkillForm.reset()
      editSkillForm.setFieldValue('name', skill.name)
      editSkillForm.setFieldValue('discipline', skill.discipline)
      setCustomError(null)
    }
  }, [skill])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      setCustomError(null)
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    editSkillForm.handleSubmit()
  }

  if (!skill) return null

  const hasEmployees = skill.employeeCount > 0

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Skill</AlertDialogTitle>
          <AlertDialogDescription>
            Update the skill name and/or discipline category.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasEmployees && (
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
            <AlertCircleIcon className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                This skill is currently in use
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                {skill.employeeCount}{' '}
                {skill.employeeCount === 1 ? 'employee' : 'employees'}{' '}
                {skill.employeeCount === 1 ? 'has' : 'have'} this skill. Editing
                it will affect their profiles.
              </p>
            </div>
          </div>
        )}

        <form id="edit-skill-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <editSkillForm.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Skill Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="e.g., React, TypeScript, Docker"
                      disabled={loading}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <editSkillForm.Field
              name="discipline"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Discipline</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value as Discipline)
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a discipline" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {Object.values(Discipline).map((discipline) => (
                          <SelectItem key={discipline} value={discipline}>
                            {DisciplineMap[discipline]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>

          {customError && (
            <div className="mt-2 text-sm text-destructive">{customError}</div>
          )}
        </form>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            type="submit"
            form="edit-skill-form"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault()
              editSkillForm.handleSubmit()
            }}
          >
            {loading ? (
              <>
                <Spinner className="mr-2" />
                Updating...
              </>
            ) : (
              'Update Skill'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
