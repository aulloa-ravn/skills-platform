// Import the generated route tree
import { routeTree } from './routeTree.gen'

import { createRouter, RouterProvider } from '@tanstack/react-router'
import { useTheme } from '@/shared/hooks/use-theme'
import { useStore, type CurrentUser } from '@/shared/store'

interface RouterContext {
  auth?: {
    isAuthenticated: boolean
    user: CurrentUser | null
  }
}

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth: {
      isAuthenticated: false,
      user: null,
    },
  } as RouterContext,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export const App = () => {
  const { getCurrentUser } = useStore()
  const user = getCurrentUser()
  useTheme()

  return (
    <RouterProvider
      router={router}
      context={{
        auth: {
          isAuthenticated: user !== null,
          user,
        },
      }}
    />
  )
}
