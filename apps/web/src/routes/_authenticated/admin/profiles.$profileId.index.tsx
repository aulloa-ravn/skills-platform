import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/shared/components/ui/breadcrumb'
import { Profile } from '@/modules/profile/profile'
import { useProfile } from '@/modules/profile/hooks/use-profile'

export const Route = createFileRoute(
  '/_authenticated/admin/profiles/$profileId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { profileId } = Route.useParams()
  const { profile } = useProfile(profileId)

  return (
    <div className="flex flex-1 flex-col">
      {/* Breadcrumbs */}
      <div className="px-4 pt-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin/profiles">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin/profiles">Profiles</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{profile?.name || 'Loading...'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Profile Content */}
      <Profile profileId={profileId} />
    </div>
  )
}
