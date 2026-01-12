import { createFileRoute } from '@tanstack/react-router'
import { AdminSkills } from '@/modules/admin-skills/admin-skills'

export const Route = createFileRoute('/_authenticated/admin/skills')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminSkills />
}
