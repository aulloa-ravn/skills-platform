import { ApolloClient, InMemoryCache, ApolloLink, HttpLink, Observable } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/tokenStorage';

/**
 * GraphQL API endpoint
 * TODO: Move to environment variable
 */
const GRAPHQL_ENDPOINT = 'http://localhost:3000/graphql';

/**
 * HTTP link for GraphQL requests
 */
const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
});

/**
 * Auth link to add Authorization header to every request
 */
const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

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
`;

/**
 * Attempt to refresh access token using refresh token
 * @returns New access token or null if refresh failed
 */
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return null;
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
    });

    const result = await response.json();

    if (result.errors) {
      console.error('Token refresh failed:', result.errors);
      return null;
    }

    const newAccessToken = result.data?.refreshToken?.accessToken;
    if (newAccessToken) {
      // Update access token in localStorage (keep same refresh token)
      setTokens(newAccessToken, refreshToken);
      return newAccessToken;
    }

    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};

/**
 * Error link to handle GraphQL errors
 * Implements transparent token renewal on UNAUTHORIZED errors
 */
const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const error of graphQLErrors) {
      // Check for UNAUTHORIZED error code
      if (error.extensions?.code === 'UNAUTHORIZED') {
        // Return an observable that attempts token refresh
        return new Observable((observer) => {
          (async () => {
            try {
              // Attempt to refresh the access token
              const newAccessToken = await refreshAccessToken();

              if (!newAccessToken) {
                // Refresh failed - clear tokens and redirect to login
                clearTokens();
                window.location.href = '/login';
                observer.complete();
                return;
              }

              // Update the operation context with new token
              const oldHeaders = operation.getContext().headers;
              operation.setContext({
                headers: {
                  ...oldHeaders,
                  authorization: `Bearer ${newAccessToken}`,
                },
              });

              // Retry the failed request with new token
              const subscriber = {
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              };

              forward(operation).subscribe(subscriber);
            } catch (err) {
              observer.error(err);
            }
          })();
        });
      }

      // Handle other error codes
      if (error.extensions?.code === 'FORBIDDEN') {
        console.error('Permission denied:', error.message);
      }

      if (error.extensions?.code === 'INVALID_CREDENTIALS') {
        console.error('Invalid credentials:', error.message);
      }
    }
  }
});

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
});
