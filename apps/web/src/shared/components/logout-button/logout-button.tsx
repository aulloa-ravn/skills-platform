import { LogOut } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useLogout } from '@/modules/auth/hooks/use-logout'

export function LogoutButton() {
  const { logout } = useLogout()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Logout"
      onClick={logout}
    >
      <LogOut />
    </Button>
  )
}
