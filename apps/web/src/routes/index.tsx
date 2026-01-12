import { createFileRoute, redirect } from '@tanstack/react-router'
import { ProfileType } from '@/shared/lib/types'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
      })
    }

    throw redirect({
      to:
        context.auth.user?.type === ProfileType.ADMIN
          ? '/admin/profiles'
          : '/profile',
    })
  },
})

function RouteComponent() {
  return null
}
