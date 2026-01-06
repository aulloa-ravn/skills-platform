import { Card } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/shared/components/ui/avatar'
import { Briefcase, User } from 'lucide-react'
import { getStringInitials } from '@/shared/utils'
import type { CurrentAssignmentResponse } from '@/shared/lib/types'

interface CurrentAssignmentsProps {
  assignments: CurrentAssignmentResponse[]
}

export function CurrentAssignments({ assignments }: CurrentAssignmentsProps) {
  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
          Current Assignments
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Active assignments
        </p>
      </div>

      {assignments.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <Briefcase className="w-12 h-12 mx-auto opacity-50" />
          <p>No active assignments</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assignments.map((assignment, index) => (
            <Card
              key={index}
              className="p-4 sm:p-6 border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1">
                    {assignment.projectName}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {assignment.role}
                  </p>

                  {/* Tags */}
                  {assignment.tags && assignment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {assignment.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  {/* Tech Lead */}
                  {assignment.techLead && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Tech Lead
                      </p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border-2 border-background">
                          <AvatarImage
                            src={assignment.techLead.avatarUrl || undefined}
                            alt={assignment.techLead.name || 'Tech Lead'}
                          />
                          <AvatarFallback>
                            {assignment.techLead.name
                              ? getStringInitials(assignment.techLead.name)
                              : 'TL'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {assignment.techLead.name || 'Unknown'}
                          </p>
                          {assignment.techLead.email && (
                            <a
                              href={`mailto:${assignment.techLead.email}`}
                              className="text-xs text-muted-foreground hover:underline truncate block"
                            >
                              {assignment.techLead.email}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
