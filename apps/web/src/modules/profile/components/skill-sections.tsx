import { Card } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { AlertCircle, ToolCase } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { formatTimeAgo, ProficiencyLevelMap, skillIcons } from '@/shared/utils'
import type {
  PendingSkillResponse,
  SkillsTiersResponse,
  ValidatedSkillResponse,
} from '@/shared/lib/types'

interface SkillsSectionProps {
  skills: SkillsTiersResponse
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <div className="space-y-8 px-4 sm:px-6 py-6 sm:py-8">
      <CoreStackSection coreStack={skills.coreStack} />
      <ValidatedInventorySection
        validatedInventory={skills.validatedInventory}
      />
      <PendingSkillsSection pending={skills.pending} />
    </div>
  )
}

function CoreStackSection({
  coreStack,
}: {
  coreStack: SkillsTiersResponse['coreStack']
}) {
  const skills = coreStack.map((skill) => ({
    name: skill.skillName,
    icon: getSkillIcon(skill),
    proficiency: ProficiencyLevelMap[skill.proficiencyLevel],
    validatedBy: skill.validator?.name,
  }))

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
          Core Stack
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Skills actively used in current assignments
        </p>
      </div>

      {skills.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto opacity-50" />
          <p>No skills found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {skills.map((skill) => (
            <Card
              key={skill.name}
              className="p-3 sm:p-6 border border-primary/20 bg-primary/5 hover:shadow-md transition-shadow"
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">
                {skill.icon ? (
                  <skill.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                ) : (
                  <ToolCase className="w-6 h-6 sm:w-8 sm:h-8" />
                )}
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                {skill.name}
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {skill.proficiency}
                </p>
              </h3>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function ValidatedInventorySection({
  validatedInventory,
}: {
  validatedInventory: SkillsTiersResponse['validatedInventory']
}) {
  const skills = validatedInventory.map((skill) => ({
    skill: skill.skillName,
    icon: getSkillIcon(skill),
    proficiency: ProficiencyLevelMap[skill.proficiencyLevel],
    lastValidated: formatTimeAgo(skill.validatedAt),
    validatedBy: skill.validator?.name,
  }))

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
          Validated Inventory
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Previously verified skills
        </p>
      </div>

      {skills.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto opacity-50" />
          <p>No skills found</p>
        </Card>
      ) : (
        <Card className="border border-border overflow-hidden overflow-x-auto p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-foreground font-semibold text-xs sm:text-sm">
                  Skill
                </TableHead>
                <TableHead className="text-foreground font-semibold text-xs sm:text-sm text-center">
                  Proficiency
                </TableHead>
                <TableHead className="text-foreground font-semibold text-xs sm:text-sm text-right">
                  Last Validated
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.map((item) => (
                <TableRow
                  key={item.skill}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="py-2 sm:py-4">
                    <div className="flex items-center gap-2">
                      {item.icon ? (
                        <item.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      ) : (
                        <ToolCase className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      )}
                      <span className="font-medium text-xs sm:text-sm text-foreground">
                        {item.skill}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-xs sm:text-sm text-muted-foreground py-2 sm:py-4">
                    {item.proficiency}
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm text-muted-foreground py-2 sm:py-4">
                    {item.lastValidated}{' '}
                    {item.validatedBy && `by ${item.validatedBy}`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}

function PendingSkillsSection({
  pending,
}: {
  pending: SkillsTiersResponse['pending']
}) {
  const skills = pending.map((skill) => ({
    skill: skill.skillName,
    icon: getSkillIcon(skill),
    status: 'Pending Review', // Hardcoded - API doesn't provide status
    proficiency: ProficiencyLevelMap[skill.suggestedProficiency],
    createdAt: formatTimeAgo(skill.createdAt),
  }))

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
          Pending Validation
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Skills awaiting Tech Lead approval
        </p>
      </div>

      {skills.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto opacity-50" />
          <p>No skills found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {skills.map((item) => (
            <Card
              key={item.skill}
              className="p-3 sm:p-4 border border-yellow-200/50 bg-yellow-50/20 dark:bg-yellow-950/20"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                {item.icon ? (
                  <item.icon className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <ToolCase className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm sm:text-base text-foreground">
                    {item.skill}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Proficiency: {item.proficiency}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted: {item.createdAt}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-2 text-xs bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 border-yellow-200/50"
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

const getSkillIcon = (skill: ValidatedSkillResponse | PendingSkillResponse) =>
  skillIcons[skill.skillName as keyof typeof skillIcons]
