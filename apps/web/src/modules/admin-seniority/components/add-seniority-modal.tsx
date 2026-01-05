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
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Label } from '@/shared/components/ui/label'
import { Spinner } from '@/shared/components/ui/spinner'
import { SeniorityLevelMap } from '@/shared/utils'
import { SeniorityLevel } from '@/shared/lib/types'
import { PlusIcon } from 'lucide-react'
import { useCreateSeniorityHistory } from '../hooks/use-create-seniority-history'

const formSchema = z
  .object({
    seniorityLevel: z.enum(SeniorityLevel, {
      error: () => 'Please select a seniority level',
    }),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    isCurrentLevel: z.boolean(),
  })
  .superRefine((data, ctx) => {
    // Only validate dates if endDate is provided (not current level)
    if (!data.isCurrentLevel && data.endDate) {
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)

      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date cannot be before start date',
          path: ['endDate'],
        })
      }
    }
  })

type SeniorityFormValues = z.infer<typeof formSchema>

type AddSeniorityModalProps = {
  profileId: string
}

export function AddSeniorityModal({ profileId }: AddSeniorityModalProps) {
  const [open, setOpen] = useState(false)
  const [customError, setCustomError] = useState<string | null>(null)
  const { createSeniorityHistory, loading } = useCreateSeniorityHistory()

  const addForm = useForm({
    defaultValues: {
      seniorityLevel: SeniorityLevel.JUNIOR_ENGINEER,
      startDate: '',
      endDate: '',
      isCurrentLevel: false,
    } as SeniorityFormValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setCustomError(null)

      try {
        await createSeniorityHistory({
          profileId,
          seniorityLevel: value.seniorityLevel,
          startDate: new Date(value.startDate),
          endDate: value.isCurrentLevel
            ? null
            : value.endDate
              ? new Date(value.endDate)
              : null,
        })

        // Close modal and reset form on success
        setOpen(false)
        addForm.reset()
      } catch (error) {
        // Error is handled by the hook with toast
        console.error('Failed to create seniority record:', error)
      }
    },
  })

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      setCustomError(null)
      addForm.reset()
    }
    setOpen(newOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addForm.handleSubmit()
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button className="whitespace-nowrap">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Seniority Record</AlertDialogTitle>
          <AlertDialogDescription>
            Create a new seniority history record for this employee.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form id="add-seniority-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <addForm.Field
              name="seniorityLevel"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Seniority Level
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value as SeniorityLevel)
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select seniority level" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(SeniorityLevel).map((level) => (
                          <SelectItem key={level} value={level}>
                            {SeniorityLevelMap[level]}
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

            <addForm.Field
              name="startDate"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Start Date</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      disabled={loading}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <addForm.Field
              name="isCurrentLevel"
              children={(field) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isCurrentLevel"
                    checked={field.state.value}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked as boolean)
                    }
                    disabled={loading}
                  />
                  <Label
                    htmlFor="isCurrentLevel"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Current seniority level
                  </Label>
                </div>
              )}
            />

            <addForm.Subscribe
              selector={(state) => [state.values.isCurrentLevel]}
              children={([isCurrentLevel]) => (
                <>
                  {!isCurrentLevel && (
                    <addForm.Field
                      name="endDate"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              End Date
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              type="date"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              disabled={loading}
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                  )}
                </>
              )}
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
            form="add-seniority-form"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault()
              addForm.handleSubmit()
            }}
          >
            {loading ? (
              <>
                <Spinner className="mr-2" />
                Creating...
              </>
            ) : (
              'Create Record'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
