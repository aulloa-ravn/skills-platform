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
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Label } from '@/shared/components/ui/label'
import { Spinner } from '@/shared/components/ui/spinner'
import { SeniorityLevelMap } from '@/shared/utils'
import { SeniorityLevel } from '@/shared/lib/types'
import { useUpdateSeniorityHistory } from '../hooks/use-update-seniority-history'
import type { SeniorityHistoryTableRow } from './seniority-history-table'

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

type EditSeniorityModalProps = {
  record: SeniorityHistoryTableRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditSeniorityModal({
  record,
  open,
  onOpenChange,
}: EditSeniorityModalProps) {
  const [customError, setCustomError] = useState<string | null>(null)
  const { updateSeniorityHistory, loading } = useUpdateSeniorityHistory()

  const editForm = useForm({
    defaultValues: {
      seniorityLevel: record?.seniorityLevel || SeniorityLevel.JUNIOR_ENGINEER,
      startDate: record?.startDate
        ? new Date(record.startDate).toISOString().split('T')[0]
        : '',
      endDate: record?.endDate
        ? new Date(record.endDate).toISOString().split('T')[0]
        : '',
      isCurrentLevel: !record?.endDate,
    } as SeniorityFormValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!record) return

      setCustomError(null)

      try {
        await updateSeniorityHistory({
          id: record.id,
          seniorityLevel: value.seniorityLevel,
          startDate: new Date(value.startDate),
          endDate: value.isCurrentLevel
            ? null
            : value.endDate
              ? new Date(value.endDate)
              : null,
        })

        // Close modal on success
        onOpenChange(false)
      } catch (error) {
        // Error is handled by the hook with toast
        console.error('Failed to update seniority record:', error)
      }
    },
  })

  // Reset form when record changes
  useEffect(() => {
    if (record) {
      editForm.reset()
      editForm.setFieldValue('seniorityLevel', record.seniorityLevel)
      editForm.setFieldValue(
        'startDate',
        new Date(record.startDate).toISOString().split('T')[0],
      )
      editForm.setFieldValue(
        'endDate',
        record.endDate
          ? new Date(record.endDate).toISOString().split('T')[0]
          : '',
      )
      editForm.setFieldValue('isCurrentLevel', !record.endDate)
      setCustomError(null)
    }
  }, [record])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      setCustomError(null)
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    editForm.handleSubmit()
  }

  if (!record) return null

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Seniority Record</AlertDialogTitle>
          <AlertDialogDescription>
            Update the seniority level, start date, or end date for this record.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form id="edit-seniority-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <editForm.Field
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

            <editForm.Field
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

            <editForm.Field
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

            <editForm.Subscribe
              selector={(state) => [state.values.isCurrentLevel]}
              children={([isCurrentLevel]) => (
                <>
                  {!isCurrentLevel && (
                    <editForm.Field
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
            form="edit-seniority-form"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault()
              editForm.handleSubmit()
            }}
          >
            {loading ? (
              <>
                <Spinner className="mr-2" />
                Updating...
              </>
            ) : (
              'Update Record'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
