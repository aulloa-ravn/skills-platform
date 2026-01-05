import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useStore } from '@/shared/store'

/**
 * useLogout Hook
 * Hook for user logout functionality
 */
export function useLogout() {
  const navigate = useNavigate()
  const { reset } = useStore()

  const logout = () => {
    reset()

    toast.success('Logged out successfully', {
      description: 'You have been logged out',
      position: 'bottom-right',
    })

    navigate({ to: '/login' })
  }

  return {
    logout,
  }
}
