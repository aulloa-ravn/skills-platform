import { gql } from '@apollo/client';

/**
 * Login mutation for authenticating users with email and password
 */
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      profile {
        id
        name
        email
        role
      }
    }
  }
`;

/**
 * Refresh token mutation for obtaining new access token
 */
export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
    }
  }
`;

/**
 * Resolve Suggestions mutation for batch processing validation decisions
 * Allows tech leads and admins to approve, adjust, or reject skill suggestions
 */
export const RESOLVE_SUGGESTIONS_MUTATION = gql`
  mutation ResolveSuggestions($input: ResolveSuggestionsInput!) {
    resolveSuggestions(input: $input) {
      success
      processed {
        suggestionId
        action
        employeeName
        skillName
        proficiencyLevel
      }
      errors {
        suggestionId
        message
        code
      }
    }
  }
`;
