import { createFileRoute } from '@tanstack/react-router'
import { Profile } from '@/modules/profile/profile'
import { useStore } from '@/shared/store'

export const Route = createFileRoute('/_authenticated/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  const currentUser = useStore((state) => state.currentUser)

  return <Profile profileId={currentUser?.id || ''} />
}
