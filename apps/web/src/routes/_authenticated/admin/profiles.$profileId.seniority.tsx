import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminSeniority } from '@/modules/admin-seniority/admin-seniority'
import { ProfileType } from '@/shared/lib/types'

export const Route = createFileRoute(
  '/_authenticated/admin/profiles/$profileId/seniority',
)({
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
  return <AdminSeniority />
}
