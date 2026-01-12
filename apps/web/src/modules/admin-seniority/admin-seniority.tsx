import { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/shared/components/ui/breadcrumb'
import { useProfile } from '@/modules/profile/hooks/use-profile'
import { SeniorityLevelMap } from '@/shared/utils'
import { useSeniorityHistory } from './hooks/use-seniority-history'
import { SeniorityHistoryTable } from './components/seniority-history-table'
import { EditSeniorityModal } from './components/edit-seniority-modal'
import { AddSeniorityModal } from './components/add-seniority-modal'
import type { SeniorityHistoryTableRow } from './components/seniority-history-table'

export function AdminSeniority() {
  const { profileId } = useParams({ strict: false }) as { profileId: string }
  const [selectedRecord, setSelectedRecord] =
    useState<SeniorityHistoryTableRow | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  // Fetch profile data for breadcrumbs
  const { profile } = useProfile(profileId)

  // Fetch seniority history
  const { seniorityHistory, loading, error } = useSeniorityHistory(profileId)

  const handleEditRecord = (record: SeniorityHistoryTableRow) => {
    setSelectedRecord(record)
    setEditModalOpen(true)
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="text-center py-12 text-red-500">
          Error loading seniority history: {error.message}
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
            <BreadcrumbLink asChild>
              <Link to="/admin/profiles">Profiles</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/profiles/$profileId" params={{ profileId }}>
                {profile?.name || 'Loading...'}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Seniority</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {`${profile?.name}'s seniority history` || 'Loading...'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Current Level:{' '}
          <span className="font-medium text-foreground">
            {profile?.currentSeniorityLevel
              ? SeniorityLevelMap[profile.currentSeniorityLevel]
              : 'Loading...'}
          </span>
        </p>
      </div>

      {/* Add Record Button */}
      <div className="flex justify-end">
        <AddSeniorityModal profileId={profileId} />
      </div>

      {/* Seniority History Table */}
      <SeniorityHistoryTable
        records={seniorityHistory || []}
        loading={loading}
        onEditRecord={handleEditRecord}
      />

      {/* Edit Seniority Modal */}
      <EditSeniorityModal
        record={selectedRecord}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  )
}
