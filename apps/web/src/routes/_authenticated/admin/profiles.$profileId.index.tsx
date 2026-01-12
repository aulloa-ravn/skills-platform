import { createFileRoute } from '@tanstack/react-router'
import { Profile } from '@/modules/profile/profile'

export const Route = createFileRoute(
  '/_authenticated/admin/profiles/$profileId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { profileId } = Route.useParams()
  return <Profile profileId={profileId} />
}
