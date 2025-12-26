import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: () => {
    throw redirect({
      to: '/profile',
    })
  },
})

function RouteComponent() {
  return null
}
