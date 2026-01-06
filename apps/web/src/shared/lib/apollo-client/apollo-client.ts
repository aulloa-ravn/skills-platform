import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
  Observable,
} from '@apollo/client'
import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
} from '@apollo/client/errors'
import { SetContextLink } from '@apollo/client/link/context'
import { ErrorLink } from '@apollo/client/link/error'
import { useStore } from '../../store'

/**
 * GraphQL API endpoint
 */
const GRAPHQL_ENDPOINT = '/graphql'

/**
 * Refresh token mutation as a raw GraphQL request
 * This is used in the error link to avoid circular dependencies
 */
const refreshTokenMutation = `
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
    }
  }
`

/**
 * Attempt to refresh access token using refresh token
 */
const handleRefreshToken = async (
  onSuccess: (token: string, refreshToken: string) => void,
  onFail: () => void,
) => {
  const { refreshToken } = useStore.getState()
  if (!refreshToken) {
    onFail()
    return
  }

  // Make a direct fetch request to avoid circular Apollo Client dependency
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: refreshTokenMutation,
      variables: {
        input: { refreshToken },
      },
    }),
  })

  const result = await response.json()

  if (result.errors) {
    console.error('Token refresh failed:', result.errors)
    onFail()
    return
  }

  const newAccessToken = result.data?.refreshToken?.accessToken
  if (newAccessToken) {
    onSuccess(newAccessToken, refreshToken)
  } else {
    onFail()
  }
}

const authorizationHeader = (token: string) => {
  return { Authorization: `Bearer ${token}` }
}

/**
 * Error link to handle GraphQL errors
 * Implements transparent token renewal on UNAUTHORIZED errors
 */
const errorLink = new ErrorLink(({ error, operation, forward }) => {
  const { setToken, setRefreshToken, reset } = useStore.getState()

  if (CombinedGraphQLErrors.is(error)) {
    for (const { message } of error.errors) {
      if (message === 'Unauthorized') {
        return new Observable((observer) => {
          handleRefreshToken(
            (token, refreshToken) => {
              const oldHeaders = operation.getContext().headers

              setToken(token)
              setRefreshToken(refreshToken)

              operation.setContext({
                headers: {
                  ...oldHeaders,
                  ...authorizationHeader(token),
                },
              })

              const subscriber = {
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              }

              forward(operation).subscribe(subscriber)
            },
            () => {
              reset()

              const subscriber = {
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              }

              forward(operation).subscribe(subscriber)
            },
          )
        })
      }
    }
  } else if (CombinedProtocolErrors.is(error)) {
    return new Observable((observer) => {
      handleRefreshToken(
        (token, refreshToken) => {
          const oldHeaders = operation.getContext().headers

          setToken(token)
          setRefreshToken(refreshToken)

          operation.setContext({
            headers: {
              ...oldHeaders,
              ...authorizationHeader(token),
            },
          })

          const subscriber = {
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          }

          forward(operation).subscribe(subscriber)
        },
        () => {
          reset()

          const subscriber = {
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          }

          forward(operation).subscribe(subscriber)
        },
      )
    })
  }
})

/**
 * Auth link to add Authorization header to every request
 */
const authLink = new SetContextLink((prevContext) => {
  const token = useStore.getState().token

  return {
    headers: {
      ...prevContext.headers,
      ...(token && authorizationHeader(token)),
    },
  }
})

/**
 * HTTP link for GraphQL requests
 */
const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
})

/**
 * Apollo Client instance with authentication and error handling
 */
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})
