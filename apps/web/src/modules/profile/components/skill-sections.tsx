import { Card } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

export function SkillsSection() {
  const coreStack = [
    { name: 'Figma', icon: '🎨', projects: ['WebApp Redesign', 'Mobile App'] },
    { name: 'React', icon: '⚛️', projects: ['Dashboard', 'Admin Panel'] },
    { name: 'TypeScript', icon: '📘', projects: ['Dashboard', 'Admin Panel'] },
    { name: 'Next.js', icon: '▲', projects: ['WebApp Redesign'] },
  ]

  const validatedInventory = [
    { skill: 'Adobe XD', endorsements: 12, lastUsed: '6 months ago' },
    { skill: 'Sketch', endorsements: 8, lastUsed: '1 year ago' },
    { skill: 'CSS/SCSS', endorsements: 15, lastUsed: '2 months ago' },
    { skill: 'HTML5', endorsements: 14, lastUsed: '2 months ago' },
    { skill: 'JavaScript', endorsements: 16, lastUsed: '1 month ago' },
    {
      skill: 'Accessibility (WCAG)',
      endorsements: 9,
      lastUsed: '3 months ago',
    },
  ]

  const pending = [
    { skill: 'Vue.js', status: 'Pending Review', suggestedBy: 'Manager' },
    { skill: 'Svelte', status: 'Clarification Needed', suggestedBy: 'Peer' },
    { skill: 'Web3 UX', status: 'Pending Review', suggestedBy: 'Self' },
  ]

  return (
    <div className="space-y-8 px-4 sm:px-6 py-6 sm:py-8">
      {/* Core Stack */}
      <div>
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
            Core Stack
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Skills actively used in current assignments
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {coreStack.map((skill) => (
            <Card
              key={skill.name}
              className="p-3 sm:p-6 border border-primary/20 bg-primary/5 hover:shadow-md transition-shadow"
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">
                {skill.icon}
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 sm:mb-2">
                {skill.name}
              </h3>
              <div className="space-y-0.5 sm:space-y-1">
                {skill.projects.map((project) => (
                  <p key={project} className="text-xs text-muted-foreground">
                    • {project}
                  </p>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Validated Inventory */}
      <div>
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
            Validated Inventory
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Previously verified skills and endorsements
          </p>
        </div>

        <Card className="border border-border overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-foreground font-semibold text-xs sm:text-sm">
                  Skill
                </TableHead>
                <TableHead className="text-foreground font-semibold text-xs sm:text-sm">
                  Endorsements
                </TableHead>
                <TableHead className="text-foreground font-semibold text-xs sm:text-sm text-right">
                  Last Used
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validatedInventory.map((item) => (
                <TableRow
                  key={item.skill}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="py-2 sm:py-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm text-foreground">
                        {item.skill}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 sm:py-4">
                    <Badge variant="secondary" className="text-xs">
                      {item.endorsements}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm text-muted-foreground py-2 sm:py-4">
                    {item.lastUsed}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Pending Skills */}
      <div>
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
            Pending Validation
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Skills awaiting manager approval
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {pending.map((item) => (
            <Card
              key={item.skill}
              className="p-3 sm:p-4 border border-yellow-200/50 bg-yellow-50/20 dark:bg-yellow-950/20"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm sm:text-base text-foreground">
                    {item.skill}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.suggestedBy}
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
      </div>
    </div>
  )
}
