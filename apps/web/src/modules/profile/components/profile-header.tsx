import { Card } from '@/shared/components/ui/card'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/shared/components/ui/avatar'
import { Mail, Linkedin, Github } from 'lucide-react'

export function ProfileHeader() {
  const employee = {
    name: 'Sarah Chen',
    role: 'Senior UI/UX Designer',
    email: 'sarah.chen@company.com',
    phone: '+1 (555) 123-4567',
    joinDate: 'Jan 2020',
    avatar: '/professional-avatar.png',
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="px-4 sm:px-6 py-2">
        <div className="flex flex-row items-center gap-4 mb-4">
          <Avatar className="h-16 sm:h-24 w-16 sm:w-24 border-4 border-background flex-shrink-0">
            <AvatarImage
              src={employee.avatar || '/placeholder.svg'}
              alt={employee.name}
            />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {employee.name}
            </h1>
            <p className="text-base sm:text-lg text-primary font-semibold">
              {employee.role}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Since {employee.joinDate}
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
                href={`mailto:${employee.email}`}
                className="text-sm font-medium hover:underline truncate block"
              >
                {employee.email}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Linkedin className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">LinkedIn</p>
              <a href="#" className="text-sm font-medium hover:underline">
                View Profile
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Github className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">GitHub</p>
              <a
                href="#"
                className="text-sm font-medium hover:underline truncate block"
              >
                @sarahchen
              </a>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
