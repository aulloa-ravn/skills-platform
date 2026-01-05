import { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { ChevronLeftIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { SeniorityLevelMap } from '@/shared/utils'
import { useSeniorityHistory } from './hooks/use-seniority-history'
import { SeniorityHistoryTable } from './components/seniority-history-table'
import { EditSeniorityModal } from './components/edit-seniority-modal'
import { AddSeniorityModal } from './components/add-seniority-modal'
import type { SeniorityHistoryTableRow } from './components/seniority-history-table'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'

const GET_PROFILE_INFO = gql`
  query GetProfileInfo($profileId: String!) {
    profile(id: $profileId) {
      id
      name
      currentSeniorityLevel
    }
  }
`

export function AdminSeniority() {
  const { profileId } = useParams({ strict: false }) as { profileId: string }
  const [selectedRecord, setSelectedRecord] =
    useState<SeniorityHistoryTableRow | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  // Fetch profile info
  const { data: profileData, loading: profileLoading } = useQuery(
    GET_PROFILE_INFO,
    {
      variables: { profileId },
      skip: !profileId,
    },
  )

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

  const profile = profileData?.profile

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Breadcrumb/Navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/admin/profiles" className="hover:text-foreground">
          <Button variant="ghost" size="sm">
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Back to Employees
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {profileLoading ? 'Loading...' : profile?.name || 'Employee'} -{' '}
          Seniority History
        </h1>
        {profile && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            Current Level:{' '}
            <span className="font-medium text-foreground">
              {SeniorityLevelMap[profile.currentSeniorityLevel]}
            </span>
          </p>
        )}
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
