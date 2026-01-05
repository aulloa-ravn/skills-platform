import { useState } from 'react'
import { Input } from '@/shared/components/ui/input'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { DisciplineMap } from '@/shared/utils'
import { Discipline } from '@/shared/lib/types'
import { FilterIcon, XIcon } from 'lucide-react'
import { Field, FieldLabel } from '@/shared/components/ui/field'

type SkillsFiltersProps = {
  showInactive: boolean
  onShowInactiveChange: (show: boolean) => void
  selectedDisciplines: Discipline[]
  onDisciplinesChange: (disciplines: Discipline[]) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  onClearFilters: () => void
}

export function SkillsFilters({
  showInactive,
  onShowInactiveChange,
  selectedDisciplines,
  onDisciplinesChange,
  searchTerm,
  onSearchChange,
  onClearFilters,
}: SkillsFiltersProps) {
  const [disciplineMenuOpen, setDisciplineMenuOpen] = useState(false)

  const allDisciplines = Object.values(Discipline)

  const handleDisciplineToggle = (discipline: Discipline) => {
    if (selectedDisciplines.includes(discipline)) {
      onDisciplinesChange(
        selectedDisciplines.filter((d) => d !== discipline),
      )
    } else {
      onDisciplinesChange([...selectedDisciplines, discipline])
    }
  }

  const hasActiveFilters =
    !showInactive || selectedDisciplines.length > 0 || searchTerm.length > 0

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
      {/* Search Input */}
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Search skills by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Discipline Filter Dropdown */}
      <DropdownMenu open={disciplineMenuOpen} onOpenChange={setDisciplineMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <FilterIcon className="h-4 w-4 mr-2" />
            Disciplines
            {selectedDisciplines.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {selectedDisciplines.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-h-[400px] overflow-y-auto">
          <DropdownMenuLabel>Filter by Discipline</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allDisciplines.map((discipline) => (
            <DropdownMenuCheckboxItem
              key={discipline}
              checked={selectedDisciplines.includes(discipline)}
              onCheckedChange={() => handleDisciplineToggle(discipline)}
            >
              {DisciplineMap[discipline]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Show Inactive Toggle */}
      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-background">
        <Checkbox
          id="show-inactive"
          checked={showInactive}
          onCheckedChange={(checked) =>
            onShowInactiveChange(checked === true)
          }
        />
        <FieldLabel
          htmlFor="show-inactive"
          className="text-sm cursor-pointer select-none"
        >
          Show inactive
        </FieldLabel>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="w-full sm:w-auto"
        >
          <XIcon className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  )
}
