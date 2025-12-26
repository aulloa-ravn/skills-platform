import { createFileRoute } from '@tanstack/react-router'
import { ValidationInbox } from '@/modules/validation-inbox/validation-inbox'

export const Route = createFileRoute('/_authenticated/validation-inbox')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ValidationInbox />
}
