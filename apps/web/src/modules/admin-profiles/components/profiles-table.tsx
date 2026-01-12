import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Spinner } from '@/shared/components/ui/spinner'
import {
  formatShortDate,
  getStringInitials,
  SeniorityLevelMap,
} from '@/shared/utils'
import { ArrowUpIcon, ArrowDownIcon, MoreHorizontal } from 'lucide-react'
import {
  ProfileSortField,
  SeniorityLevel,
  type ProfileListItemResponse,
  SortDirection,
} from '@/shared/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Button } from '@/shared/components/ui/button'

type ProfilesTableProps = {
  profiles: Pick<
    ProfileListItemResponse,
    | 'id'
    | 'name'
    | 'email'
    | 'avatarUrl'
    | 'currentSeniorityLevel'
    | 'joinDate'
    | 'currentAssignmentsCount'
    | 'coreStackSkills'
    | 'remainingSkillsCount'
  >[]
  loading: boolean
  onNameClick: (profileId: string) => void
  onSeniorityHistoryClick: (profileId: string) => void
  sortBy?: ProfileSortField
  sortDirection?: SortDirection
  onSortChange: (field: ProfileSortField, direction: SortDirection) => void
}

// Helper to format skills display
const formatSkills = (
  coreStackSkills: string[],
  remainingSkillsCount: number,
): string => {
  if (coreStackSkills.length === 0 && remainingSkillsCount === 0) {
    return 'No skills'
  }

  // Show first 3-4 skills
  const displaySkills = coreStackSkills.slice(0, 3)
  const parts = displaySkills.join(', ')

  // Calculate remaining count (skills not shown)
  const notShownCount =
    coreStackSkills.length - displaySkills.length + remainingSkillsCount

  if (notShownCount > 0) {
    return `${parts}, +${notShownCount}`
  }

  return parts
}

// Helper to get badge variant for seniority
const getSeniorityBadgeVariant = (
  seniorityLevel: SeniorityLevel,
): 'default' | 'secondary' | 'outline' => {
  switch (seniorityLevel) {
    case SeniorityLevel.SENIOR_ENGINEER:
    case SeniorityLevel.STAFF_ENGINEER:
      return 'default'
    case SeniorityLevel.MID_ENGINEER:
      return 'secondary'
    case SeniorityLevel.JUNIOR_ENGINEER:
      return 'outline'
    default:
      return 'outline'
  }
}

// Sortable column header component
const SortableHeader = ({
  field,
  label,
  currentSortBy,
  currentSortDirection,
  onSort,
}: {
  field: ProfileSortField
  label: string
  currentSortBy?: ProfileSortField
  currentSortDirection?: SortDirection
  onSort: (field: ProfileSortField, direction: SortDirection) => void
}) => {
  const isActive = currentSortBy === field
  const direction = isActive ? currentSortDirection : undefined

  const handleClick = () => {
    if (!isActive) {
      onSort(field, SortDirection.ASC)
    } else if (direction === SortDirection.ASC) {
      onSort(field, SortDirection.DESC)
    } else {
      onSort(field, SortDirection.ASC)
    }
  }

  return (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50"
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {isActive && direction === SortDirection.ASC && (
          <ArrowUpIcon className="h-4 w-4" />
        )}
        {isActive && direction === SortDirection.DESC && (
          <ArrowDownIcon className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  )
}

export function ProfilesTable({
  profiles,
  loading,
  onNameClick,
  onSeniorityHistoryClick,
  sortBy,
  sortDirection,
  onSortChange,
}: ProfilesTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner className="mr-2" />
        <span className="text-sm text-muted-foreground">
          Loading profiles...
        </span>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No employees found matching your filters
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader
              field={ProfileSortField.NAME}
              label="Name"
              currentSortBy={sortBy}
              currentSortDirection={sortDirection}
              onSort={onSortChange}
            />
            <SortableHeader
              field={ProfileSortField.EMAIL}
              label="Email"
              currentSortBy={sortBy}
              currentSortDirection={sortDirection}
              onSort={onSortChange}
            />
            <SortableHeader
              field={ProfileSortField.SENIORITY}
              label="Seniority"
              currentSortBy={sortBy}
              currentSortDirection={sortDirection}
              onSort={onSortChange}
            />
            <SortableHeader
              field={ProfileSortField.JOIN_DATE}
              label="Join Date"
              currentSortBy={sortBy}
              currentSortDirection={sortDirection}
              onSort={onSortChange}
            />
            <TableHead className="text-center md:table-cell">
              Assignments
            </TableHead>
            <TableHead>Skills</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow
              key={profile.id}
              className="cursor-pointer hover:bg-muted/50"
            >
              {/* Avatar + Name Column */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {profile.avatarUrl && (
                      <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                    )}
                    <AvatarFallback>
                      {getStringInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="font-medium cursor-pointer"
                    onClick={() => onNameClick(profile.id)}
                  >
                    {profile.name}
                  </span>
                </div>
              </TableCell>

              {/* Email Column */}
              <TableCell className="text-muted-foreground">
                {profile.email}
              </TableCell>

              {/* Seniority Column */}
              <TableCell>
                <Badge
                  className="cursor-pointer"
                  variant={getSeniorityBadgeVariant(
                    profile.currentSeniorityLevel,
                  )}
                  onClick={() => onSeniorityHistoryClick(profile.id)}
                >
                  {SeniorityLevelMap[profile.currentSeniorityLevel]}
                </Badge>
              </TableCell>

              {/* Join Date Column - hidden on mobile */}
              <TableCell className="md:table-cell">
                {formatShortDate(profile.joinDate)}
              </TableCell>

              {/* Assignments Column - hidden on mobile */}
              <TableCell className="text-center md:table-cell">
                {profile.currentAssignmentsCount}
              </TableCell>

              {/* Skills Column */}
              <TableCell className="text-sm text-muted-foreground">
                {formatSkills(
                  profile.coreStackSkills,
                  profile.remainingSkillsCount,
                )}
              </TableCell>

              {/* Actions Column - placeholder for future three-dot menu */}
              <TableCell className="w-[50px] text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onNameClick(profile.id)}>
                      View profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onSeniorityHistoryClick(profile.id)}
                    >
                      View seniority history
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => navigator.clipboard.writeText(profile.id)}
                    >
                      Copy profile ID
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
