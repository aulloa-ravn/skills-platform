import { Card } from '@/shared/components/ui/card'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/shared/components/ui/avatar'
import { Mail, Linkedin, Github } from 'lucide-react'
import type { ProfileResponse } from '@/shared/lib/types'
import {
  formatShortDate,
  getStringInitials,
  SeniorityLevelMap,
} from '@/shared/utils'

interface ProfileHeaderProps {
  profile: ProfileResponse
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  // Calculate join date
  const joinDate = profile.seniorityHistory[0].startDate

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="px-4 sm:px-6 py-2">
        <div className="flex flex-row items-center gap-4 mb-4">
          <Avatar className="h-16 sm:h-24 w-16 sm:w-24 border-4 border-background flex-shrink-0">
            <AvatarImage
              src={profile.avatarUrl || undefined}
              alt={profile.name}
            />
            <AvatarFallback>{getStringInitials(profile.name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {profile.name}
            </h1>
            <p className="text-base sm:text-lg text-primary font-semibold">
              {SeniorityLevelMap[profile.currentSeniorityLevel]}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Since {formatShortDate(joinDate)}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <a
                href={`mailto:${profile.email}`}
                className="text-sm font-medium hover:underline truncate block"
              >
                {profile.email}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Linkedin className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">LinkedIn</p>
              <a className="text-sm font-medium hover:underline">
                View Profile
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Github className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">GitHub</p>
              <a className="text-sm font-medium hover:underline truncate block">
                @username
              </a>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
