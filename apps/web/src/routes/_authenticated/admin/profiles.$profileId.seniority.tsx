import { createFileRoute } from '@tanstack/react-router'
import { AdminSeniority } from '@/modules/admin-seniority/admin-seniority'

export const Route = createFileRoute(
  '/_authenticated/admin/profiles/$profileId/seniority',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminSeniority />
}
