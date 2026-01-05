import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminSkills } from '@/modules/admin-skills/admin-skills'
import { ProfileType } from '@/shared/lib/types'

export const Route = createFileRoute('/_authenticated/admin/skills')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.auth.user?.type !== ProfileType.ADMIN) {
      throw redirect({
        to: '/profile',
      })
    }
  },
})

function RouteComponent() {
  return <AdminSkills />
}
