import { useState } from 'react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { SeniorityLevelMap } from '@/shared/utils'
import type { SeniorityLevel, YearsInCompanyRange } from '@/shared/lib/types'
import { FilterIcon, XIcon, SearchIcon } from 'lucide-react'
import { useSkills } from '@/modules/admin-skills/hooks/use-skills'

type ProfilesFiltersProps = {
  searchTerm: string
  onSearchChange: (term: string) => void
  seniorityFilters: SeniorityLevel[]
  onSeniorityChange: (levels: SeniorityLevel[]) => void
  skillFilters: string[]
  onSkillChange: (skillIds: string[]) => void
  yearsInCompanyFilters: YearsInCompanyRange[]
  onYearsInCompanyChange: (ranges: YearsInCompanyRange[]) => void
  onClearFilters: () => void
}

// Map YearsInCompanyRange enum to display text
const YearsInCompanyRangeMap: Record<YearsInCompanyRange, string> = {
  LESS_THAN_1: 'Less than 1 year',
  ONE_TO_TWO: '1-2 years',
  TWO_TO_THREE: '2-3 years',
  THREE_TO_FIVE: '3-5 years',
  FIVE_PLUS: '5+ years',
}

export function ProfilesFilters({
  searchTerm,
  onSearchChange,
  seniorityFilters,
  onSeniorityChange,
  skillFilters,
  onSkillChange,
  yearsInCompanyFilters,
  onYearsInCompanyChange,
  onClearFilters,
}: ProfilesFiltersProps) {
  const [seniorityMenuOpen, setSeniorityMenuOpen] = useState(false)
  const [skillsMenuOpen, setSkillsMenuOpen] = useState(false)
  const [yearsMenuOpen, setYearsMenuOpen] = useState(false)
  const [skillSearchTerm, setSkillSearchTerm] = useState('')

  // Fetch skills for the skills filter dropdown
  const { skills } = useSkills({ isActive: true })

  // All seniority levels
  const allSeniorityLevels = Object.keys(SeniorityLevelMap) as SeniorityLevel[]

  // All years in company ranges
  const allYearsRanges = Object.keys(
    YearsInCompanyRangeMap,
  ) as YearsInCompanyRange[]

  // Handle seniority toggle
  const handleSeniorityToggle = (level: SeniorityLevel) => {
    if (seniorityFilters.includes(level)) {
      onSeniorityChange(seniorityFilters.filter((l) => l !== level))
    } else {
      onSeniorityChange([...seniorityFilters, level])
    }
  }

  // Handle skill toggle
  const handleSkillToggle = (skillId: string) => {
    if (skillFilters.includes(skillId)) {
      onSkillChange(skillFilters.filter((id) => id !== skillId))
    } else {
      onSkillChange([...skillFilters, skillId])
    }
  }

  // Handle years in company toggle
  const handleYearsToggle = (range: YearsInCompanyRange) => {
    if (yearsInCompanyFilters.includes(range)) {
      onYearsInCompanyChange(yearsInCompanyFilters.filter((r) => r !== range))
    } else {
      onYearsInCompanyChange([...yearsInCompanyFilters, range])
    }
  }

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm.length > 0 ||
    seniorityFilters.length > 0 ||
    skillFilters.length > 0 ||
    yearsInCompanyFilters.length > 0

  // Filter skills by search term
  const filteredSkills =
    skills?.filter((skill) =>
      skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()),
    ) || []

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
      {/* Search Input */}
      <div className="flex-1">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10"
          />
        </div>
      </div>

      {/* Seniority Level Filter Dropdown */}
      <DropdownMenu
        open={seniorityMenuOpen}
        onOpenChange={setSeniorityMenuOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <FilterIcon className="h-4 w-4 mr-2" />
            Seniority
            {seniorityFilters.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {seniorityFilters.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-h-[400px] overflow-y-auto">
          <DropdownMenuLabel>Filter by Seniority</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allSeniorityLevels.map((level) => (
            <DropdownMenuCheckboxItem
              key={level}
              checked={seniorityFilters.includes(level)}
              onCheckedChange={() => handleSeniorityToggle(level)}
            >
              {SeniorityLevelMap[level]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Skills Filter Dropdown */}
      <DropdownMenu open={skillsMenuOpen} onOpenChange={setSkillsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <FilterIcon className="h-4 w-4 mr-2" />
            Skills
            {skillFilters.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {skillFilters.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-h-[400px] overflow-y-auto">
          <DropdownMenuLabel>Filter by Skills</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* Search input within dropdown */}
          <div className="px-2 py-1.5">
            <Input
              type="text"
              placeholder="Search skills..."
              value={skillSearchTerm}
              onChange={(e) => setSkillSearchTerm(e.target.value)}
              className="h-8"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <DropdownMenuSeparator />
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => (
              <DropdownMenuCheckboxItem
                key={skill.id}
                checked={skillFilters.includes(String(skill.id))}
                onCheckedChange={() => handleSkillToggle(String(skill.id))}
              >
                {skill.name}
              </DropdownMenuCheckboxItem>
            ))
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No skills found
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Years in Company Filter Dropdown */}
      <DropdownMenu open={yearsMenuOpen} onOpenChange={setYearsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <FilterIcon className="h-4 w-4 mr-2" />
            Years in Company
            {yearsInCompanyFilters.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {yearsInCompanyFilters.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Filter by Years in Company</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allYearsRanges.map((range) => (
            <DropdownMenuCheckboxItem
              key={range}
              checked={yearsInCompanyFilters.includes(range)}
              onCheckedChange={() => handleYearsToggle(range)}
            >
              {YearsInCompanyRangeMap[range]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="w-full sm:w-auto"
        >
          <XIcon className="h-4 w-4 mr-2" />
          Clear all filters
        </Button>
      )}
    </div>
  )
}
