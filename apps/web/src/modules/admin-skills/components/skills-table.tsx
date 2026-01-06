import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { Switch } from '@/shared/components/ui/switch'
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'
import { DisciplineMap } from '@/shared/utils'
import { cn } from '@/shared/utils'
import { EditIcon } from 'lucide-react'
import type { Discipline } from '@/shared/lib/types'

export type SkillTableRow = {
  id: number
  name: string
  discipline: Discipline
  isActive: boolean
  employeeCount: number
  createdAt: string
}

type SkillsTableProps = {
  skills: SkillTableRow[]
  loading: boolean
  onToggleSkill: (
    skillId: number,
    currentIsActive: boolean,
    skillName: string,
    discipline: Discipline,
    employeeCount: number,
    createdAt: string,
  ) => void
  onEditSkill: (skill: SkillTableRow) => void
}

export function SkillsTable({
  skills,
  loading,
  onToggleSkill,
  onEditSkill,
}: SkillsTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner className="mr-2" />
        <span className="text-sm text-muted-foreground">Loading skills...</span>
      </div>
    )
  }

  if (skills.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No skills match the current filters.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%] min-w-[150px]">Skill Name</TableHead>
            <TableHead className="w-[20%] min-w-[120px]">Discipline</TableHead>
            <TableHead className="w-[15%] min-w-[100px] text-center hidden md:table-cell">
              Employees
            </TableHead>
            <TableHead className="w-[15%] min-w-[80px] text-center">
              Active
            </TableHead>
            <TableHead className="w-[10%] min-w-[80px] text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {skills.map((skill) => (
            <TableRow key={skill.id}>
              <TableCell
                className={cn(
                  'font-medium',
                  !skill.isActive && 'text-muted-foreground line-through',
                )}
              >
                {skill.name}
              </TableCell>
              <TableCell>
                <Badge variant={skill.isActive ? 'default' : 'secondary'}>
                  {DisciplineMap[skill.discipline]}
                </Badge>
              </TableCell>
              <TableCell className="text-center hidden md:table-cell">
                <span
                  className={cn(
                    'text-sm',
                    !skill.isActive && 'text-muted-foreground',
                  )}
                >
                  {skill.employeeCount}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Switch
                    checked={skill.isActive}
                    onCheckedChange={() =>
                      onToggleSkill(
                        skill.id,
                        skill.isActive,
                        skill.name,
                        skill.discipline,
                        skill.employeeCount,
                        skill.createdAt,
                      )
                    }
                    aria-label={`Toggle ${skill.name} active status`}
                  />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEditSkill(skill)}
                  aria-label={`Edit ${skill.name}`}
                >
                  <EditIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
