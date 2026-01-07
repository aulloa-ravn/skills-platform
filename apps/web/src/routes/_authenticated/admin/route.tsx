import { ProfileType } from '@/shared/lib/types'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: ({ context }) => {
    if (context.auth.user?.type !== ProfileType.ADMIN) {
      throw redirect({
        to: '/profile',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
