import { createFileRoute } from '@tanstack/react-router'
import { AdminProfiles } from '@/modules/admin-profiles/admin-profiles'
import * as z from 'zod'

const searchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(10),
})

// Define search params schema for URL query params
type ProfilesSearchParams = {
  page?: number
  pageSize?: number
}

export const Route = createFileRoute('/_authenticated/admin/profiles/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): ProfilesSearchParams =>
    searchSchema.parse(search),
})

function RouteComponent() {
  return <AdminProfiles />
}
