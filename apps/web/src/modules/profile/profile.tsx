import { ProfileHeader } from '@/modules/profile/components/profile-header'
import { SeniorityTimeline } from '@/modules/profile/components/seniority-timeline'
import { SkillsSection } from '@/modules/profile/components/skill-sections'
import { CurrentAssignments } from '@/modules/profile/components/current-assignments'
// import { MyLeadersSection } from '@/modules/profile/components/my-leaders-section'
import { useProfile } from '@/modules/profile/hooks/use-profile'

type ProfileProps = {
  profileId: string
}

export function Profile({ profileId }: ProfileProps) {
  const { profile, loading, error } = useProfile(profileId)

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="text-center py-12">Loading profile...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="text-center py-12 text-red-500">
          Error loading profile: {error.message}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="text-center py-12">No profile data available</div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <ProfileHeader profile={profile} />
      <SeniorityTimeline seniorityHistory={profile.seniorityHistory} />
      <CurrentAssignments assignments={profile.currentAssignments} />
      {/* <MyLeadersSection assignments={profile.currentAssignments} /> */}
      <SkillsSection skills={profile.skills} profileId={profileId} />
    </div>
  )
}
