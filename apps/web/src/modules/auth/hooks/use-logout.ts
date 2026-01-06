import { useNavigate } from '@tanstack/react-router'
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
    navigate({ to: '/login' })
  }

  return {
    logout,
  }
}
