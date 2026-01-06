import { useState } from 'react'
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
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'
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
import { PlusIcon } from 'lucide-react'
import { useCreateSkill } from '../hooks/use-create-skill'
import type { SkillTableRow } from './skills-table'

const formSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  discipline: z.enum(Discipline, {
    error: () => 'Please select a discipline',
  }),
})

type AddSkillModalProps = {
  existingSkills: SkillTableRow[]
}

export function AddSkillModal({ existingSkills }: AddSkillModalProps) {
  const [open, setOpen] = useState(false)
  const [customError, setCustomError] = useState<string | null>(null)
  const { createSkill, loading } = useCreateSkill()

  const addSkillForm = useForm({
    defaultValues: {
      name: '',
      discipline: '' as Discipline,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setCustomError(null)

      // Check for duplicate skill name (case-insensitive)
      const duplicateSkill = existingSkills.find(
        (skill) => skill.name.toLowerCase() === value.name.trim().toLowerCase(),
      )

      if (duplicateSkill) {
        setCustomError(
          `A skill named "${duplicateSkill.name}" already exists. Please choose a different name.`,
        )
        return
      }

      try {
        await createSkill({
          name: value.name.trim(),
          discipline: value.discipline,
        })

        // Reset form and close modal on success
        addSkillForm.reset()
        setOpen(false)
      } catch (error) {
        // Error is handled by the hook with toast
        console.error('Failed to create skill:', error)
      }
    },
  })

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      // Reset form when closing
      addSkillForm.reset()
      setCustomError(null)
    }
    setOpen(newOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addSkillForm.handleSubmit()
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Skill</AlertDialogTitle>
          <AlertDialogDescription>
            Create a new skill in the canonical taxonomy. Specify the skill name
            and discipline category.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form id="add-skill-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <addSkillForm.Field
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

            <addSkillForm.Field
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
            form="add-skill-form"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault()
              addSkillForm.handleSubmit()
            }}
          >
            {loading ? (
              <>
                <Spinner className="mr-2" />
                Creating...
              </>
            ) : (
              'Create Skill'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
