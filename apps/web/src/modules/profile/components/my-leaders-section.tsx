import { Card } from '@/shared/components/ui/card'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/shared/components/ui/avatar'
import { getStringInitials } from '@/shared/utils'
import type {
  CurrentAssignmentResponse,
  TechLeadInfo,
} from '@/shared/lib/types'

interface MyLeadersSectionProps {
  assignments: CurrentAssignmentResponse[]
}

export function MyLeadersSection({ assignments }: MyLeadersSectionProps) {
  // Conditional rendering: hide section when no assignments
  if (assignments.length === 0) {
    return null
  }

  // Extract and deduplicate Tech Leads
  const uniqueLeaders = Array.from(
    new Map(
      assignments
        .map((a) => a.techLead)
        .filter(
          (tl): tl is TechLeadInfo =>
            tl !== null && tl !== undefined && tl.id !== null,
        )
        .map((tl) => [tl.id, tl]),
    ).values(),
  )

  // Hide section if no valid Tech Leads after filtering
  if (uniqueLeaders.length === 0) {
    return null
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8">
      {/* Section Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
          My Leaders
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Tech Leads who can validate your skills
        </p>
      </div>

      {/* Tech Lead Cards - Vertical Stack Layout */}
      <div className="flex flex-col gap-4">
        {uniqueLeaders.map((techLead) => (
          <Card key={techLead.id} className="p-4 sm:p-6 border border-border">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage
                  src={techLead.avatarUrl || undefined}
                  alt={techLead.name || 'Tech Lead'}
                />
                <AvatarFallback>
                  {techLead.name ? getStringInitials(techLead.name) : 'TL'}
                </AvatarFallback>
              </Avatar>

              {/* Name and Email */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {techLead.name || 'Unknown'}
                </p>
                {techLead.email && (
                  <span className="text-xs text-muted-foreground truncate block">
                    {techLead.email}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
