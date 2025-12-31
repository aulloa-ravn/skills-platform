import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'
import {
  cn,
  getStringInitials,
  SeniorityLevelMap,
  formatTimeAgo,
  ProficiencyLevelMap,
  SuggestionSourceMap,
  DisciplineMap,
} from '@/shared/utils'
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useValidationInbox } from './hooks/use-validation-inbox'
import { SuggestionSource, type InboxResponse } from '@/shared/lib/types'

type EmployeeSuggestion = {
  id: string
  skill: string
  discipline: string
  type: 'suggestion' | 'revalidation'
  suggestedBy?: string
  suggestedProficiency: string
  currentProficiency?: string | null
  createdAt: string
}

type Employee = {
  id: string
  name: string
  email: string
  avatar?: string | null
  seniorityLevel: string
  role: string
  currentProject: string
  pendingSuggestionsCount: number
  suggestions: EmployeeSuggestion[]
}

type Project = {
  id: string
  name: string
  employees: Employee[]
  pendingSuggestionsCount: number
}

// Helper to transform API data to UI format
function transformInboxData(inbox: InboxResponse | undefined): Project[] {
  if (!inbox?.projects) return []

  return inbox.projects.map((project) => ({
    id: project.projectId,
    name: project.projectName,
    pendingSuggestionsCount: project.pendingSuggestionsCount,
    employees: project.employees.map((employee) => {
      const suggestions = employee.suggestions.map((suggestion) => ({
        id: suggestion.id,
        skill: suggestion.skillName,
        discipline: DisciplineMap[suggestion.discipline],
        type:
          suggestion.source === SuggestionSource.SELF_REPORT
            ? ('suggestion' as const)
            : ('revalidation' as const),
        suggestedBy: SuggestionSourceMap[suggestion.source],
        suggestedProficiency:
          ProficiencyLevelMap[suggestion.suggestedProficiency],
        currentProficiency: suggestion.currentProficiency
          ? ProficiencyLevelMap[suggestion.currentProficiency]
          : null,
        createdAt: suggestion.createdAt,
      }))

      return {
        id: employee.employeeId,
        name: employee.employeeName,
        email: employee.employeeEmail,
        avatar: employee.employeeAvatarUrl,
        seniorityLevel:
          SeniorityLevelMap[employee.employeeCurrentSeniorityLevel],
        role: employee.employeeRole,
        pendingSuggestionsCount: employee.pendingSuggestionsCount,
        currentProject: project.projectName, // Hardcoded - API doesn't provide project specialty detail
        suggestions: suggestions,
      }
    }),
  }))
}

export function ValidationInbox() {
  const { inbox, loading, error } = useValidationInbox()
  const projects = transformInboxData(inbox)

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  )
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Auto-select first employee when data loads
  if (projects.length > 0 && !selectedEmployee) {
    const firstEmployee = projects[0]?.employees[0]
    if (firstEmployee) {
      setSelectedEmployee(firstEmployee)
    }
  }

  const selectedEmployeeSuggestions = selectedEmployee?.suggestions || []
  const currentSkill = selectedEmployeeSuggestions[currentSkillIndex]

  const handleNext = () => {
    if (currentSkillIndex < selectedEmployeeSuggestions.length - 1) {
      setCurrentSkillIndex(currentSkillIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSkillIndex > 0) {
      setCurrentSkillIndex(currentSkillIndex - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="text-center py-12">Loading validation inbox...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="text-center py-12 text-red-500">
          Error loading inbox: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Validation Inbox</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Review and validate pending skill claims
        </p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle2Icon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-semibold">All Clear!</p>
              <p className="text-sm text-muted-foreground mt-2">
                No pending validations at this time.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex h-full overflow-hidden bg-background flex-col lg:flex-row">
          {/* Sidebar */}
          <div
            className={cn(
              'fixed inset-0 z-50 lg:static lg:w-80 overflow-y-auto transition-all bg-background',
              sidebarOpen ? 'block' : 'hidden',
              'lg:block',
            )}
          >
            <div className="p-4 sticky top-0 bg-background flex items-center justify-between lg:justify-start">
              <h2 className="text-lg font-semibold">Projects</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-muted rounded"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                      {project.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {project.pendingSuggestionsCount}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    {project.employees.map((employee) => {
                      return (
                        <button
                          key={employee.id}
                          onClick={() => {
                            setSelectedEmployee(employee)
                            setCurrentSkillIndex(0)
                            setSidebarOpen(false)
                          }}
                          className={`w-full text-left px-2 sm:px-3 py-2 rounded-md transition-colors flex items-center gap-2 text-xs sm:text-sm ${
                            selectedEmployee?.id === employee.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                            <AvatarImage
                              src={employee.avatar || undefined}
                              alt={employee.name}
                            />
                            <AvatarFallback>
                              {getStringInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {employee.name}
                            </p>
                            <p className="opacity-75 truncate text-xs">
                              {employee.role}
                            </p>
                          </div>
                          {employee.pendingSuggestionsCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="text-xs flex-shrink-0"
                            >
                              {employee.pendingSuggestionsCount}
                            </Badge>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto flex flex-col">
            <div className="lg:hidden p-3 border-b border-border flex items-center gap-2 bg-background">
              <h2 className="text-sm font-semibold flex-1">Projects</h2>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-muted rounded"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
            </div>
            {selectedEmployee ? (
              <div className="p-3 sm:p-6 max-w-4xl">
                <Card className="mb-4 sm:mb-6">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                          <AvatarImage
                            src={selectedEmployee.avatar || undefined}
                            alt={selectedEmployee.name}
                          />
                          <AvatarFallback>
                            {getStringInitials(selectedEmployee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <CardTitle className="text-base sm:text-lg">
                            {selectedEmployee.name}
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            {selectedEmployee.seniorityLevel}
                          </CardDescription>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Currently on{' '}
                            <span className="font-semibold">
                              {selectedEmployee.currentProject} (
                              {selectedEmployee.role})
                            </span>
                          </p>
                        </div>
                      </div>
                      {selectedEmployee.pendingSuggestionsCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-xs w-fit lg:hidden"
                        >
                          {selectedEmployee.pendingSuggestionsCount} pending
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>

                {currentSkill ? (
                  <Card>
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-sm sm:text-base">
                            {currentSkill.type === 'suggestion'
                              ? 'New Skill Claim'
                              : 'Re-validation Required'}
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm mt-1 sm:mt-2">
                            {currentSkill.type === 'suggestion' ? (
                              <>
                                {selectedEmployee.name} suggests{' '}
                                <span className="font-semibold">
                                  {currentSkill.suggestedProficiency}
                                </span>{' '}
                                proficiency in {currentSkill.skill}
                                {currentSkill.currentProficiency && (
                                  <>
                                    {' '}
                                    (current:{' '}
                                    <span className="font-semibold">
                                      {currentSkill.currentProficiency}
                                    </span>
                                    )
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                {currentSkill.skill} (
                                <span className="font-semibold">
                                  {currentSkill.currentProficiency}
                                </span>
                                ) needs re-validation - system suggests{' '}
                                <span className="font-semibold">
                                  {currentSkill.suggestedProficiency}
                                </span>{' '}
                                level
                              </>
                            )}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            currentSkill.type === 'suggestion'
                              ? 'default'
                              : 'secondary'
                          }
                          className="w-fit text-xs"
                        >
                          {currentSkill.type === 'suggestion'
                            ? 'Pending Review'
                            : 'Clarification Needed'}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 sm:space-y-6">
                      <Tabs defaultValue="review" className="mb-4 sm:mb-6">
                        <TabsList className="grid w-full grid-cols-2 text-xs sm:text-sm">
                          <TabsTrigger value="review">Review</TabsTrigger>
                          <TabsTrigger value="context">Context</TabsTrigger>
                        </TabsList>
                        <TabsContent value="review" className="space-y-4 mt-2">
                          <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground">
                                Skill
                              </p>
                              <p className="text-sm font-medium">
                                {currentSkill.skill}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground">
                                {currentSkill.type === 'suggestion'
                                  ? 'Suggested Proficiency'
                                  : 'Recommended Proficiency'}
                              </p>
                              <p className="text-sm font-medium">
                                {currentSkill.suggestedProficiency}
                              </p>
                            </div>
                            {currentSkill.currentProficiency && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground">
                                  Current Proficiency
                                </p>
                                <p className="text-sm font-medium">
                                  {currentSkill.currentProficiency}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground">
                                Discipline
                              </p>
                              <p className="text-sm font-medium">
                                {currentSkill.discipline}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground">
                                Suggested By
                              </p>
                              <p className="text-sm font-medium">
                                {currentSkill.suggestedBy}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground">
                                {currentSkill.type === 'suggestion'
                                  ? 'Submitted'
                                  : 'Flagged'}
                              </p>
                              <p className="text-sm font-medium">
                                {formatTimeAgo(currentSkill.createdAt)}
                              </p>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="context" className="space-y-4 mt-2">
                          <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Project Assignment:{' '}
                              {selectedEmployee.currentProject}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                              This skill is being reviewed as part of{' '}
                              {selectedEmployee.name}'s ongoing profile
                              maintenance.
                            </p>
                          </div>
                        </TabsContent>
                      </Tabs>

                      <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
                        <Button
                          className="sm:flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                          size="sm"
                        >
                          <CheckCircle2Icon className="h-4 w-4 mr-2" />
                          Approve Skill
                        </Button>
                        <Button
                          variant="outline"
                          className="sm:flex-1 bg-transparent text-xs sm:text-sm"
                          size="sm"
                        >
                          <XCircleIcon className="h-4 w-4 mr-2" />
                          Reject Skill
                        </Button>
                      </div>

                      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border gap-2">
                        <Button
                          onClick={handlePrevious}
                          variant="ghost"
                          size="sm"
                          disabled={currentSkillIndex === 0}
                          className="text-xs"
                        >
                          <ChevronLeftIcon className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {currentSkillIndex + 1} of{' '}
                          {selectedEmployeeSuggestions.length}
                        </span>
                        <Button
                          onClick={handleNext}
                          variant="ghost"
                          size="sm"
                          disabled={
                            currentSkillIndex ===
                            selectedEmployeeSuggestions.length - 1
                          }
                          className="text-xs"
                        >
                          Next
                          <ChevronRightIcon className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6 sm:pt-8">
                      <div className="text-center py-8 sm:py-12">
                        <CheckCircle2Icon className="h-10 sm:h-12 w-10 sm:w-12 text-green-600 mx-auto mb-3 sm:mb-4" />
                        <p className="text-base sm:text-lg font-semibold">
                          All Skills Reviewed
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                          Great! All pending skill claims for{' '}
                          {selectedEmployee.name} have been reviewed.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full px-4">
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Select an employee to begin reviewing skills
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
