// Import the generated route tree
import { routeTree } from './routeTree.gen'

import { createRouter, RouterProvider } from '@tanstack/react-router'
import { useTheme } from '@/shared/hooks/use-theme'
import { useStore } from '@/shared/store'

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth: {
      isAuthenticated: false,
      user: null,
    },
  },
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
  const currentUser = useStore((state) => state.currentUser)
  useTheme()

  return (
    <RouterProvider
      router={router}
      context={{
        auth: {
          isAuthenticated: currentUser !== null,
          user: currentUser,
        },
      }}
    />
  )
}
