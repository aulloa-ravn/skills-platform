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
import { cn } from '@/shared/utils'
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

type SkillValidation = {
  id: string
  skill: string
  status: 'pending' | 'approved' | 'rejected'
  type: 'suggestion' | 'revalidation'
  suggestedBy?: string
  lastValidated?: string
}

type Project = {
  id: string
  name: string
  tech: string
  employees: Employee[]
}

type Employee = {
  id: string
  name: string
  role: string
  avatar?: string
  currentProject: string
  suggestions: SkillValidation[]
  revalidations: SkillValidation[]
}

// Mock data
const mockProjects: Project[] = [
  {
    id: 'project-alpha',
    name: 'Project Alpha',
    tech: 'Backend',
    employees: [
      {
        id: 'emp-1',
        name: 'John Smith',
        role: 'Backend Engineer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        currentProject: 'Project Alpha (Backend)',
        suggestions: [
          {
            id: 's1',
            skill: 'Node.js',
            status: 'pending',
            type: 'suggestion',
            suggestedBy: 'Self',
          },
          {
            id: 's2',
            skill: 'GraphQL',
            status: 'pending',
            type: 'suggestion',
            suggestedBy: 'Sarah',
          },
        ],
        revalidations: [
          {
            id: 'r1',
            skill: 'TypeScript',
            status: 'pending',
            type: 'revalidation',
            lastValidated: '2024-01-15',
          },
        ],
      },
      {
        id: 'emp-2',
        name: 'Sarah Johnson',
        role: 'Backend Engineer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        currentProject: 'Project Alpha (Backend)',
        suggestions: [
          {
            id: 's3',
            skill: 'Docker',
            status: 'pending',
            type: 'suggestion',
            suggestedBy: 'Self',
          },
        ],
        revalidations: [],
      },
    ],
  },
  {
    id: 'project-beta',
    name: 'Project Beta',
    tech: 'Frontend',
    employees: [
      {
        id: 'emp-3',
        name: 'Mike Chen',
        role: 'Frontend Engineer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        currentProject: 'Project Beta (Frontend)',
        suggestions: [
          {
            id: 's4',
            skill: 'React 19',
            status: 'pending',
            type: 'suggestion',
            suggestedBy: 'Self',
          },
          {
            id: 's5',
            skill: 'TailwindCSS',
            status: 'pending',
            type: 'suggestion',
            suggestedBy: 'John',
          },
        ],
        revalidations: [
          {
            id: 'r2',
            skill: 'React',
            status: 'pending',
            type: 'revalidation',
            lastValidated: '2023-11-20',
          },
          {
            id: 'r3',
            skill: 'JavaScript',
            status: 'pending',
            type: 'revalidation',
            lastValidated: '2023-09-10',
          },
        ],
      },
    ],
  },
]

export function ValidationInbox() {
  const [selectedEmployee, setSelectedEmployee] = useState(
    mockProjects[0].employees[0],
  )
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0)
  const [processedSkills, setProcessedSkills] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const allSkills = [
    ...(selectedEmployee?.suggestions || []),
    ...(selectedEmployee?.revalidations || []),
  ].filter((skill) => !processedSkills.includes(skill.id))

  const currentSkill = allSkills[currentSkillIndex]

  const handleApprove = () => {
    console.log(`Approved: ${currentSkill.skill}`)
    setProcessedSkills([...processedSkills, currentSkill.id])
    if (currentSkillIndex < allSkills.length - 1) {
      setCurrentSkillIndex(currentSkillIndex + 1)
    }
  }

  const handleReject = () => {
    console.log(`Rejected: ${currentSkill.skill}`)
    setProcessedSkills([...processedSkills, currentSkill.id])
    if (currentSkillIndex < allSkills.length - 1) {
      setCurrentSkillIndex(currentSkillIndex + 1)
    }
  }

  const handleNext = () => {
    if (currentSkillIndex < allSkills.length - 1) {
      setCurrentSkillIndex(currentSkillIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSkillIndex > 0) {
      setCurrentSkillIndex(currentSkillIndex - 1)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Validation Inbox</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Review and validate pending skill claims
        </p>
      </div>
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
            {mockProjects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                    {project.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {project.tech}
                  </Badge>
                </div>

                <div className="space-y-1">
                  {project.employees.map((employee) => {
                    const pendingCount =
                      employee.suggestions.filter(
                        (s) => !processedSkills.includes(s.id),
                      ).length +
                      employee.revalidations.filter(
                        (r) => !processedSkills.includes(r.id),
                      ).length

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
                            src={employee.avatar || '/placeholder.svg'}
                          />
                          <AvatarFallback>
                            {employee.name.charAt(0)}
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
                        {pendingCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="text-xs flex-shrink-0"
                          >
                            {pendingCount}
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
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                        <AvatarImage
                          src={selectedEmployee.avatar || '/placeholder.svg'}
                        />
                        <AvatarFallback>
                          {selectedEmployee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg">
                          {selectedEmployee.name}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {selectedEmployee.role}
                        </CardDescription>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Currently on{' '}
                          <span className="font-semibold">
                            {selectedEmployee.currentProject}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs sm:text-sm w-fit"
                    >
                      {allSkills.length -
                        processedSkills.filter((id) =>
                          allSkills.some((skill) => skill.id === id),
                        ).length}{' '}
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {currentSkill ? (
                <Card className="mb-4 sm:mb-6">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-sm sm:text-base">
                          {currentSkill.type === 'suggestion'
                            ? 'New Skill Claim'
                            : 'Re-validation Required'}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-1 sm:mt-2">
                          {currentSkill.type === 'suggestion'
                            ? `${selectedEmployee.name} claims expertise in ${currentSkill.skill}`
                            : `${currentSkill.skill} last validated on ${currentSkill.lastValidated}`}
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
                    <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircleIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {currentSkill.type === 'suggestion'
                            ? `Suggested by: ${currentSkill.suggestedBy}`
                            : 'This skill needs re-validation to maintain accuracy.'}
                        </p>
                      </div>
                    </div>

                    <Tabs defaultValue="review" className="mb-4 sm:mb-6">
                      <TabsList className="grid w-full grid-cols-2 text-xs sm:text-sm">
                        <TabsTrigger value="review">Review</TabsTrigger>
                        <TabsTrigger value="context">Context</TabsTrigger>
                      </TabsList>
                      <TabsContent value="review" className="space-y-4 mt-4">
                        <div>
                          <p className="text-xs sm:text-sm font-semibold mb-2">
                            Skill: {currentSkill.skill}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Type:{' '}
                            {currentSkill.type === 'suggestion'
                              ? 'New Claim'
                              : 'Re-validation'}
                          </p>
                        </div>
                      </TabsContent>
                      <TabsContent value="context" className="space-y-4 mt-4">
                        <div>
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
                        onClick={handleApprove}
                        className="sm:flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                        size="sm"
                      >
                        <CheckCircle2Icon className="h-4 w-4 mr-2" />
                        Approve Skill
                      </Button>
                      <Button
                        onClick={handleReject}
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
                        {currentSkillIndex + 1} of {allSkills.length}
                      </span>
                      <Button
                        onClick={handleNext}
                        variant="ghost"
                        size="sm"
                        disabled={currentSkillIndex === allSkills.length - 1}
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
    </div>
  )
}
