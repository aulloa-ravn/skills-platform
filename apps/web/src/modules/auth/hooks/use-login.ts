import { useMutation } from '@apollo/client/react'
import { useStore } from '@/shared/store'
import {
  LoginDocument,
  type LoginMutationVariables,
} from '../graphql/login.mutation.generated'

/**
 * useLogin Hook
 * Apollo Client mutation hook for user login
 */
export function useLogin() {
  const { setToken, setRefreshToken, setCurrentUser } = useStore()

  const [loginMutation, { loading, error, data }] = useMutation(LoginDocument, {
    onCompleted: ({ login: { accessToken, refreshToken, profile } }) => {
      // Store tokens and user data in Zustand store
      setToken(accessToken)
      setRefreshToken(refreshToken)
      setCurrentUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        type: profile.type,
      })
    },
  })

  const login = async (variables: LoginMutationVariables) => {
    return loginMutation({ variables })
  }

  return {
    login,
    loading,
    error,
    data,
  }
}
