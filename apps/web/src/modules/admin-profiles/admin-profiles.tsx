import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import type {
  SeniorityLevel,
  YearsInCompanyRange,
  ProfileSortField,
  SortDirection,
} from '@/shared/lib/types'
import { useProfiles } from './hooks/use-profiles'
import { ProfilesTable } from './components/profiles-table'
import { ProfilesFilters } from './components/profiles-filters'
import { ProfilesPagination } from './components/profiles-pagination'

export function AdminProfiles() {
  const navigate = useNavigate()
  const searchParams = useSearch({ from: '/_authenticated/admin/profiles/' })

  // Initialize state from URL params if available
  const [searchTerm, setSearchTerm] = useState('')
  const [seniorityFilters, setSeniorityFilters] = useState<SeniorityLevel[]>([])
  const [skillFilters, setSkillFilters] = useState<string[]>([])
  const [yearsInCompanyFilters, setYearsInCompanyFilters] = useState<
    YearsInCompanyRange[]
  >([])
  const [sortBy, setSortBy] = useState<ProfileSortField | undefined>(undefined)
  const [sortDirection, setSortDirection] = useState<SortDirection | undefined>(
    undefined,
  )
  const [page, setPage] = useState(searchParams.page || 1)
  const [pageSize, setPageSize] = useState(searchParams.pageSize || 25)

  // Fetch profiles with current filters/sort/pagination
  const { data, loading, error } = useProfiles({
    page,
    pageSize,
    searchTerm,
    seniorityLevels: seniorityFilters.length > 0 ? seniorityFilters : undefined,
    skillIds: skillFilters.length > 0 ? skillFilters : undefined,
    yearsInCompanyRanges:
      yearsInCompanyFilters.length > 0 ? yearsInCompanyFilters : undefined,
    sortBy,
    sortDirection,
  })

  // Handle filter changes - reset to page 1
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleSeniorityChange = (values: SeniorityLevel[]) => {
    setSeniorityFilters(values)
    setPage(1)
  }

  const handleSkillChange = (values: string[]) => {
    setSkillFilters(values)
    setPage(1)
  }

  const handleYearsInCompanyChange = (values: YearsInCompanyRange[]) => {
    setYearsInCompanyFilters(values)
    setPage(1)
  }

  // Handle sort changes - reset to page 1
  const handleSortChange = (
    field: ProfileSortField,
    direction: SortDirection,
  ) => {
    setSortBy(field)
    setSortDirection(direction)
    setPage(1)
  }

  // Handle pagination changes - update URL params
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    navigate({
      from: '/admin/profiles',
      search: (prev) => ({ ...prev, page: newPage, pageSize }),
    })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1)
    navigate({
      from: '/admin/profiles',
      search: (prev) => ({ ...prev, page: 1, pageSize: newPageSize }),
    })
  }

  // Handle row click navigation
  const handleRowClick = (profileId: string) => {
    navigate({ to: `/admin/profiles/${profileId}` })
  }

  // Handle clear all filters
  const handleClearFilters = () => {
    setSearchTerm('')
    setSeniorityFilters([])
    setSkillFilters([])
    setYearsInCompanyFilters([])
    setPage(1)
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="text-center py-12 text-red-500">
          Error loading profiles: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Employee Profiles</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          View and manage employee profiles
        </p>
      </div>

      {/* Filters */}
      <ProfilesFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        seniorityFilters={seniorityFilters}
        onSeniorityChange={handleSeniorityChange}
        skillFilters={skillFilters}
        onSkillChange={handleSkillChange}
        yearsInCompanyFilters={yearsInCompanyFilters}
        onYearsInCompanyChange={handleYearsInCompanyChange}
        onClearFilters={handleClearFilters}
      />

      {/* Profiles Table */}
      <ProfilesTable
        profiles={data?.profiles || []}
        loading={loading}
        onRowClick={handleRowClick}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />

      {/* Pagination */}
      {data && data.totalCount > 0 && (
        <ProfilesPagination
          currentPage={data.currentPage}
          pageSize={data.pageSize}
          totalPages={data.totalPages}
          totalCount={data.totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  )
}
