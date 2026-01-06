# GraphQL Error Handling Standards

This document establishes the standard error handling patterns for the Ravn Skills Platform GraphQL API.

## Error Format

All GraphQL errors should follow this standard format:

```typescript
{
  message: string;           // Human-readable error description
  extensions: {
    code: string;            // Machine-readable error code
  };
}
```

## Error Codes

### Authentication & Authorization Errors

#### `INVALID_CREDENTIALS`
**Use When:** Login credentials (email/password) are incorrect or user doesn't exist

**HTTP Equivalent:** 401 Unauthorized

**Example:**
```typescript
throw new UnauthorizedException({
  message: 'Invalid email or password',
  extensions: {
    code: 'INVALID_CREDENTIALS',
  },
});
```

**Typical Scenarios:**
- Wrong password during login
- Non-existent email during login
- Profile without password attempting to log in

---

#### `UNAUTHORIZED`
**Use When:** Request lacks valid authentication token or token is expired/invalid

**HTTP Equivalent:** 401 Unauthorized

**Example:**
```typescript
throw new UnauthorizedException({
  message: 'Invalid or expired refresh token',
  extensions: {
    code: 'UNAUTHORIZED',
  },
});
```

**Typical Scenarios:**
- Missing JWT token in Authorization header
- Expired access token
- Invalid JWT signature
- Malformed JWT token
- Expired refresh token

---

#### `FORBIDDEN`
**Use When:** User is authenticated but lacks required permissions/role for the requested resource

**HTTP Equivalent:** 403 Forbidden

**Example:**
```typescript
throw new ForbiddenException({
  message: 'User does not have required role(s): ADMIN',
  extensions: {
    code: 'FORBIDDEN',
  },
});
```

**Typical Scenarios:**
- Employee trying to access admin-only endpoint
- User without TECH_LEAD role trying to validate skills
- Authenticated user accessing resource they don't own

---

## Implementation Guidelines

### In Services

```typescript
// AuthService example
if (!profile) {
  throw new UnauthorizedException({
    message: 'Invalid email or password',
    extensions: {
      code: 'INVALID_CREDENTIALS',
    },
  });
}
```

### In Guards

```typescript
// RolesGuard example
if (!hasRole) {
  throw new ForbiddenException({
    message: `User does not have required role(s): ${requiredRoles.join(', ')}`,
    extensions: {
      code: 'FORBIDDEN',
    },
  });
}
```

### In Resolvers

```typescript
// Resolvers typically let services throw errors
// Errors bubble up to GraphQL error handler automatically
@Mutation(() => LoginResponse)
async login(@Args('input') input: LoginInput): Promise<LoginResponse> {
  return this.authService.login(input.email, input.password);
  // AuthService throws UnauthorizedException if credentials invalid
}
```

## Frontend Error Handling

### Apollo Client Error Link

```typescript
// Handle UNAUTHORIZED errors with token refresh
onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const error of graphQLErrors) {
      if (error.extensions?.code === 'UNAUTHORIZED') {
        // Attempt token refresh
        return refreshTokenAndRetry(operation, forward);
      }

      if (error.extensions?.code === 'FORBIDDEN') {
        // Show permission denied message
        showError('You do not have permission to perform this action');
      }

      if (error.extensions?.code === 'INVALID_CREDENTIALS') {
        // Show login error message
        showError('Invalid email or password');
      }
    }
  }
});
```

## Testing Error Handling

### Unit Tests

```typescript
it('should throw UnauthorizedException with INVALID_CREDENTIALS for invalid password', async () => {
  await expect(service.login('test@ravn.com', 'wrongPassword'))
    .rejects.toThrow(UnauthorizedException);

  try {
    await service.login('test@ravn.com', 'wrongPassword');
  } catch (error) {
    expect(error.response).toEqual({
      message: 'Invalid email or password',
      extensions: {
        code: 'INVALID_CREDENTIALS',
      },
    });
  }
});
```

### E2E Tests

```typescript
it('should return GraphQL error with UNAUTHORIZED code for expired token', async () => {
  const response = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      query: '{ protectedQuery { data } }',
    })
    .set('Authorization', 'Bearer expired-token')
    .expect(200); // GraphQL returns 200 even for errors

  expect(response.body.errors[0].extensions.code).toBe('UNAUTHORIZED');
});
```

## Future Error Codes

As the application grows, additional error codes may be added following this pattern:

- `VALIDATION_ERROR`: Input validation failures
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (e.g., duplicate email)
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Unexpected server errors

## Best Practices

1. **Always include error code**: Every error should have a machine-readable code
2. **User-friendly messages**: Error messages should be clear and actionable
3. **Consistent naming**: Use SCREAMING_SNAKE_CASE for error codes
4. **Document new codes**: Add new error codes to this document
5. **Test error paths**: Write tests for both success and error scenarios
6. **Frontend handling**: Ensure frontend can handle all error codes gracefully
7. **Logging**: Log errors server-side for debugging (not shown to users)

## Related Documentation

- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [GraphQL Error Handling](https://www.apollographql.com/docs/apollo-server/data/errors/)
- [Passport JWT Strategy](https://www.passportjs.org/packages/passport-jwt/)
