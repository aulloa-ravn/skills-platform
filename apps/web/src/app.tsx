// Import the generated route tree
import { routeTree } from './routeTree.gen'

import { createRouter, RouterProvider } from '@tanstack/react-router'
import { useTheme } from '@/shared/hooks/use-theme'

interface RouterContext {
  auth?: {
    isLoading: boolean
    isAuthenticated: boolean
    user: any | null
  }
}

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth: undefined,
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
  const auth = {
    isLoading: false,
    isAuthenticated: false,
    user: null,
  }
  useTheme()

  return (
    <RouterProvider
      router={router}
      context={{
        auth: {
          isLoading: auth.isLoading,
          isAuthenticated: auth.isAuthenticated,
          user: auth.user,
        },
      }}
    />
  )
}
