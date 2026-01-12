import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/shared/components/ui/breadcrumb'
import { Spinner } from '@/shared/components/ui/spinner'
import { AlertCircleIcon } from 'lucide-react'
import type { Discipline } from '@/shared/lib/types'
import { useSkills } from './hooks/use-skills'
import { useToggleSkill } from './hooks/use-toggle-skill'
import { SkillsFilters } from './components/skills-filters'
import { SkillsSorting, type SortOption } from './components/skills-sorting'
import { SkillsTable, type SkillTableRow } from './components/skills-table'
import { AddSkillModal } from './components/add-skill-modal'
import { EditSkillModal } from './components/edit-skill-modal'

export function AdminSkills() {
  // Filter and sort state
  const [showInactive, setShowInactive] = useState(true)
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>(
    [],
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('name')

  // Edit modal state
  const [selectedSkill, setSelectedSkill] = useState<SkillTableRow | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  // Toggle skill confirmation state
  const [toggleConfirmation, setToggleConfirmation] = useState<{
    skill: SkillTableRow
    newIsActive: boolean
  } | null>(null)

  // Fetch skills with filters
  const { skills, loading, error } = useSkills({
    isActive: showInactive ? undefined : true,
    disciplines:
      selectedDisciplines.length > 0 ? selectedDisciplines : undefined,
    searchTerm: searchTerm.trim() || undefined,
  })

  const { toggleSkill, loading: toggling } = useToggleSkill()

  // Transform and sort skills
  const sortedSkills = useMemo(() => {
    if (!skills) return []

    const skillsArray = [...skills]

    // Apply sorting
    skillsArray.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'discipline':
          return a.discipline.localeCompare(b.discipline)
        case 'createdAt':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        default:
          return 0
      }
    })

    return skillsArray
  }, [skills, sortBy])

  const handleClearFilters = () => {
    setShowInactive(true)
    setSelectedDisciplines([])
    setSearchTerm('')
  }

  const handleEditSkill = (skill: SkillTableRow) => {
    setSelectedSkill(skill)
    setEditModalOpen(true)
  }

  const handleToggleSkill = (
    skillId: number,
    currentIsActive: boolean,
    skillName: string,
    discipline: Discipline,
    employeeCount: number,
    createdAt: string,
  ) => {
    const skill: SkillTableRow = {
      id: skillId,
      name: skillName,
      discipline: discipline as Discipline,
      isActive: currentIsActive,
      employeeCount,
      createdAt,
    }

    // Show confirmation if disabling a skill with employees
    if (currentIsActive && employeeCount > 0) {
      setToggleConfirmation({
        skill,
        newIsActive: false,
      })
    } else {
      // Toggle immediately if no confirmation needed
      toggleSkill(
        skillId,
        currentIsActive,
        skillName,
        discipline,
        employeeCount,
        createdAt,
      )
    }
  }

  const handleConfirmToggle = async () => {
    if (!toggleConfirmation) return

    const { skill } = toggleConfirmation

    try {
      await toggleSkill(
        skill.id,
        skill.isActive,
        skill.name,
        skill.discipline,
        skill.employeeCount,
        skill.createdAt,
      )
    } finally {
      setToggleConfirmation(null)
    }
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="text-center py-12 text-red-500">
          Error loading skills: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/profiles">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Skills</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Skills Management</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage the canonical skills taxonomy
        </p>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex-1 w-full">
            <SkillsFilters
              showInactive={showInactive}
              onShowInactiveChange={setShowInactive}
              selectedDisciplines={selectedDisciplines}
              onDisciplinesChange={setSelectedDisciplines}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>

        {/* Sorting and Add Button Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <SkillsSorting sortBy={sortBy} onSortChange={setSortBy} />
          <AddSkillModal existingSkills={sortedSkills} />
        </div>
      </div>

      {/* Skills Table */}
      <SkillsTable
        skills={sortedSkills}
        loading={loading}
        onToggleSkill={handleToggleSkill}
        onEditSkill={handleEditSkill}
      />

      {/* Edit Skill Modal */}
      <EditSkillModal
        skill={selectedSkill}
        existingSkills={sortedSkills}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />

      {/* Toggle Skill Confirmation Dialog */}
      {toggleConfirmation && (
        <AlertDialog
          open={!!toggleConfirmation}
          onOpenChange={(open) => !open && setToggleConfirmation(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disable Skill?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to disable{' '}
                <span className="font-semibold">
                  {toggleConfirmation.skill.name}
                </span>
                .
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
              <AlertCircleIcon className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  This skill is currently in use
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  {toggleConfirmation.skill.employeeCount}{' '}
                  {toggleConfirmation.skill.employeeCount === 1
                    ? 'employee has'
                    : 'employees have'}{' '}
                  this skill. Disabling it will affect their profiles.
                </p>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={toggling}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmToggle}
                disabled={toggling}
                variant="destructive"
              >
                {toggling ? (
                  <>
                    <Spinner className="mr-2" />
                    Disabling...
                  </>
                ) : (
                  'Disable Skill'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
