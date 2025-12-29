import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { apolloClient } from '../lib/apollo-client'

interface Profile {
  id: string
  name: string
  avatarUrl?: string | null
  type: string
}

interface CurrentUser {
  id: string
  email: string
  profile: Profile
}

interface UseGlobalStoreState {
  token: string | null
  refreshToken: string | null
  currentUser: CurrentUser | null
  invalidSession: boolean
  reset: () => void
  setToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  setCurrentUser: (user: CurrentUser | null) => void
  setInvalidSession: (value: boolean) => void
}

const initialState = {
  token: null,
  refreshToken: null,
  currentUser: null,
  invalidSession: false,
}

export const useStore = create<UseGlobalStoreState>()(
  persist(
    (set) => ({
      ...initialState,
      async reset() {
        useStore.persist.clearStorage()
        await apolloClient.clearStore()
        set(initialState)
      },
      setToken: (token: string | null) => {
        set({ token: token })
      },
      setRefreshToken: (refreshToken: string | null) => {
        set({ refreshToken: refreshToken })
      },
      setCurrentUser: (user: CurrentUser | null) => {
        set({ currentUser: user })
      },
      setInvalidSession: (value: boolean) => {
        set({ invalidSession: value })
      },
    }),
    {
      name: 'session',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
