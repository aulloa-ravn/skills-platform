import { ProfileHeader } from '@/modules/profile/components/profile-header'
import { SeniorityTimeline } from '@/modules/profile/components/seniority-timeline'
import { SkillsSection } from '@/modules/profile/components/skill-sections'

export function Profile() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <ProfileHeader />
      <SeniorityTimeline />
      <SkillsSection />
    </div>
  )
}
