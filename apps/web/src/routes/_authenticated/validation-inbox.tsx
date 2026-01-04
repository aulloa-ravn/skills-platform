import { createFileRoute } from '@tanstack/react-router'
import { ValidationInbox } from '@/modules/validation-inbox/validation-inbox'
import { ProfileType } from '@/shared/lib/types'
import { redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/validation-inbox')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.auth.user?.type === ProfileType.EMPLOYEE) {
      throw redirect({
        to: '/profile',
      })
    }
  },
})

function RouteComponent() {
  return <ValidationInbox />
}
