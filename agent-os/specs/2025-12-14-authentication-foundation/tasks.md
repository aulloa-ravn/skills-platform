# Task Breakdown: Authentication Foundation

## Overview
Total Tasks: 48 sub-tasks organized into 6 major task groups

## Task List

### Database Layer

#### Task Group 1: Profile Model Schema Updates and Migrations
**Dependencies:** None

- [ ] 1.0 Complete database layer updates for authentication
  - [ ] 1.1 Write 2-8 focused tests for Profile model authentication fields
    - Test password field storage and retrieval
    - Test role enum values (EMPLOYEE, TECH_LEAD, ADMIN)
    - Test nullable password for existing profiles during migration
    - Test default role assignment (EMPLOYEE)
  - [ ] 1.2 Update Profile model schema in Prisma
    - Add password field (String type, optional/nullable for migration compatibility)
    - Add role field as enum with values: EMPLOYEE, TECH_LEAD, ADMIN
    - Set default role to EMPLOYEE
    - Document that password stores bcrypt-hashed values with salt round 10
  - [ ] 1.3 Create Prisma migration for Profile schema changes
    - Generate migration with `npx prisma migrate dev --name add-auth-to-profile`
    - Review migration SQL to ensure password is nullable
    - Review migration SQL to ensure role has default value EMPLOYEE
    - Apply migration to database
  - [ ] 1.4 Update seed scripts to include passwords for sample profiles
    - Hash sample passwords using bcrypt with salt round 10
    - Add password values for all seeded profiles
    - Assign appropriate roles to seeded profiles (at least one ADMIN for testing)
    - Run seed script to populate database with test data
  - [ ] 1.5 Ensure database layer tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify migrations run successfully
    - Verify seed script executes without errors
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- Profile model includes password (String, nullable) and role (Enum, default EMPLOYEE) fields
- Migration applies successfully to database
- Seed script creates profiles with hashed passwords and assigned roles

---

### Backend Core Authentication Services

#### Task Group 2: Password Hashing Utilities and Auth Service
**Dependencies:** Task Group 1

- [ ] 2.0 Complete password hashing and authentication service
  - [ ] 2.1 Write 2-8 focused tests for password utilities and auth service
    - Test password hashing with bcrypt (salt round 10)
    - Test password comparison using bcrypt.compare
    - Test JWT token generation with correct expiration times
    - Test JWT token validation and decoding
    - Test login logic with valid credentials
    - Test login logic with invalid credentials (wrong password)
    - Test login logic with non-existent email
  - [ ] 2.2 Install required dependencies
    - Install bcrypt: `npm install bcrypt`
    - Install bcrypt types: `npm install --save-dev @types/bcrypt`
    - Install @nestjs/jwt: `npm install @nestjs/jwt`
    - Install @nestjs/passport: `npm install @nestjs/passport passport-jwt`
  - [ ] 2.3 Create password hashing utilities
    - Create `src/auth/utils/password.util.ts`
    - Implement hashPassword function using bcrypt with salt round 10
    - Implement comparePassword function using bcrypt.compare
    - Export utilities for use in auth service
  - [ ] 2.4 Create AuthService with login logic
    - Create `src/auth/auth.service.ts`
    - Implement validateUser method (find profile by email, compare password)
    - Implement login method (validate credentials, generate tokens, return profile info)
    - Return both access token (15-min) and refresh token (7-day) on successful login
    - Throw GraphQL error with INVALID_CREDENTIALS code for failed authentication
  - [ ] 2.5 Configure JWT module in AuthModule
    - Create `src/auth/auth.module.ts`
    - Register JwtModule with secret from environment variable JWT_SECRET
    - Configure default token expiration (15 minutes for access tokens)
    - Import PrismaModule for database access
  - [ ] 2.6 Ensure auth service tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify password hashing and comparison work correctly
    - Verify token generation includes correct expiration times
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- Password hashing uses bcrypt with salt round 10
- AuthService validates credentials and generates JWT tokens
- Access tokens expire in 15 minutes, refresh tokens expire in 7 days
- Invalid credentials throw GraphQL error with INVALID_CREDENTIALS code

---

### Backend GraphQL Mutations

#### Task Group 3: Login and Refresh Token Mutations
**Dependencies:** Task Group 2

- [ ] 3.0 Complete GraphQL authentication mutations
  - [ ] 3.1 Write 2-8 focused tests for GraphQL mutations
    - Test login mutation with valid credentials returns tokens and profile info
    - Test login mutation with invalid credentials returns GraphQL error
    - Test login mutation with non-existent email returns GraphQL error
    - Test refresh mutation with valid refresh token returns new access token
    - Test refresh mutation with invalid refresh token returns GraphQL error
    - Test refresh mutation with expired refresh token returns GraphQL error
  - [ ] 3.2 Create LoginInput and LoginResponse DTOs
    - Create `src/auth/dto/login.input.ts` with email and password fields
    - Create `src/auth/dto/login.response.ts` with accessToken, refreshToken, and profile fields
    - Profile fields: id, name, email, role
  - [ ] 3.3 Create RefreshTokenInput and RefreshTokenResponse DTOs
    - Create `src/auth/dto/refresh-token.input.ts` with refreshToken field
    - Create `src/auth/dto/refresh-token.response.ts` with accessToken field
  - [ ] 3.4 Implement login mutation in AuthResolver
    - Create `src/auth/auth.resolver.ts`
    - Implement login mutation accepting LoginInput
    - Call AuthService.login method
    - Return LoginResponse with tokens and profile info
    - Handle errors and throw GraphQL errors with appropriate error codes
  - [ ] 3.5 Implement refresh token mutation in AuthResolver
    - Implement refreshToken mutation accepting RefreshTokenInput
    - Validate refresh token using JwtService
    - Generate new access token (15-minute expiration)
    - Return RefreshTokenResponse with new access token
    - Throw GraphQL error with UNAUTHORIZED code for invalid/expired tokens
  - [ ] 3.6 Ensure GraphQL mutation tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify login mutation returns correct response format
    - Verify refresh mutation generates new access tokens
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Login mutation accepts email/password and returns tokens + profile info
- Refresh mutation accepts refresh token and returns new access token
- All authentication errors return GraphQL errors with appropriate error codes
- Error format includes message and extensions with code field

---

### Backend Guards and Authorization

#### Task Group 4: JWT Guard and Role Guard Implementation
**Dependencies:** Task Group 3

- [ ] 4.0 Complete authentication guards and authorization infrastructure
  - [ ] 4.1 Write 2-8 focused tests for guards
    - Test JWT Guard allows access with valid access token
    - Test JWT Guard blocks access without token (UNAUTHORIZED error)
    - Test JWT Guard blocks access with invalid token (UNAUTHORIZED error)
    - Test JWT Guard blocks access with expired token (UNAUTHORIZED error)
    - Test JWT Guard attaches user info to request context
    - Test Role Guard allows access when user has required role
    - Test Role Guard blocks access when user lacks required role (FORBIDDEN error)
  - [ ] 4.2 Create JWT strategy for Passport
    - Create `src/auth/strategies/jwt.strategy.ts`
    - Configure strategy to extract JWT from Authorization: Bearer header
    - Validate token signature and expiration using JWT_SECRET
    - Return decoded user payload (id, email, role) for request context
  - [ ] 4.3 Implement JWT Guard
    - Create `src/auth/guards/jwt-auth.guard.ts`
    - Extend NestJS AuthGuard('jwt')
    - Extract and validate JWT from request headers
    - Attach decoded user info to GraphQL context
    - Throw GraphQL error with UNAUTHORIZED code when token is missing/invalid
  - [ ] 4.4 Implement Role Guard decorator and infrastructure
    - Create `src/auth/decorators/roles.decorator.ts` for marking required roles
    - Create `src/auth/guards/roles.guard.ts` for role-based access control
    - Check user role from JWT payload against required roles
    - Allow access only if user role matches required role(s)
    - Throw GraphQL error with FORBIDDEN code when user lacks required role
    - Infrastructure ready but not yet applied to specific endpoints
  - [ ] 4.5 Create CurrentUser decorator for extracting user from context
    - Create `src/auth/decorators/current-user.decorator.ts`
    - Extract user info from GraphQL context (set by JWT Guard)
    - Make user info easily accessible in resolvers
  - [ ] 4.6 Apply JWT Guard to all GraphQL resolvers
    - Configure global JWT Guard in app.module.ts
    - Exclude login and refreshToken mutations from guard (public endpoints)
    - Verify all other resolvers require valid JWT
  - [ ] 4.7 Ensure guard tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify JWT Guard protects routes correctly
    - Verify Role Guard infrastructure works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- JWT Guard protects all GraphQL resolvers except login and refresh mutations
- Invalid/missing tokens result in UNAUTHORIZED GraphQL error
- Role Guard infrastructure is implemented and ready for future use
- User info is accessible in resolvers via CurrentUser decorator
- Insufficient permissions result in FORBIDDEN GraphQL error

---

### Backend Role Derivation Logic

#### Task Group 5: Automatic Tech Lead Role Assignment
**Dependencies:** Task Group 4

- [ ] 5.0 Complete automatic role derivation for Tech Leads
  - [ ] 5.1 Write 2-8 focused tests for role derivation
    - Test user with techLead on at least one project gets TECH_LEAD role
    - Test user with no techLead assignments remains EMPLOYEE role
    - Test role is computed dynamically based on current project assignments
    - Test admin users retain ADMIN role regardless of project assignments
  - [ ] 5.2 Create role derivation logic in AuthService
    - Implement getRoleForUser method in AuthService
    - Query projects where user is techLead (using Project.techLeadId relationship)
    - Return TECH_LEAD role if user is techLead on at least one project
    - Return EMPLOYEE role if user has no techLead assignments
    - Preserve ADMIN role if explicitly set (ADMIN overrides computed role)
  - [ ] 5.3 Update login mutation to include computed role
    - Call getRoleForUser during login to compute current role
    - Include computed role in JWT payload
    - Return computed role in login response profile info
  - [ ] 5.4 Update JWT strategy to validate role on each request
    - Optionally recompute role on each request for real-time updates
    - Or keep role in JWT and require token refresh for role changes
    - Document chosen approach and tradeoffs
  - [ ] 5.5 Ensure role derivation tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify Tech Lead role is assigned based on project assignments
    - Verify role changes are reflected in tokens
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 5.1 pass
- Tech Lead role is automatically derived when user is techLead on at least one project
- Role is included in JWT payload and returned in login response
- ADMIN role takes precedence over computed Tech Lead role
- Default role is EMPLOYEE for users with no special assignments

---

### Frontend Token Management and UI

#### Task Group 6: Frontend Authentication Implementation
**Dependencies:** Task Groups 3, 4

- [ ] 6.0 Complete frontend authentication and token management
  - [ ] 6.1 Write 2-8 focused tests for frontend authentication
    - Test login form submission calls login mutation
    - Test successful login stores tokens in localStorage
    - Test access token is sent in Authorization header
    - Test token refresh on UNAUTHORIZED error
    - Test failed refresh clears tokens and redirects to login
    - Test user stays logged in during transparent token renewal
  - [ ] 6.2 Create AuthContext for managing authentication state
    - Create `src/contexts/AuthContext.tsx`
    - Provide login, logout, and current user state
    - Store and retrieve tokens from localStorage
    - Include isAuthenticated boolean for UI conditional rendering
  - [ ] 6.3 Implement token storage utilities
    - Create `src/utils/tokenStorage.ts`
    - Implement setTokens function (store both tokens in localStorage)
    - Implement getAccessToken function (retrieve from localStorage)
    - Implement getRefreshToken function (retrieve from localStorage)
    - Implement clearTokens function (remove tokens from localStorage)
  - [ ] 6.4 Configure Apollo Client with authentication headers
    - Update Apollo Client setup in `src/App.tsx` or `src/apollo/client.ts`
    - Create setContext link to add Authorization: Bearer header
    - Attach access token to every GraphQL request
  - [ ] 6.5 Implement Apollo Client error link for token renewal
    - Create error link to intercept GraphQL errors
    - On UNAUTHORIZED error: call refreshToken mutation
    - Update localStorage with new access token
    - Retry failed request with new access token
    - If refresh fails: clear tokens and redirect to login page
    - Ensure transparent renewal (user stays logged in seamlessly)
  - [ ] 6.6 Create login page/form component
    - Create `src/pages/Login.tsx` or `src/components/LoginForm.tsx`
    - Form fields: email and password
    - Call login mutation on form submission
    - Store tokens in localStorage on successful login
    - Display error message on failed login
    - Redirect to main app on successful login
  - [ ] 6.7 Create logout functionality
    - Implement logout function in AuthContext
    - Clear tokens from localStorage
    - Redirect to login page
    - Reset Apollo Client cache
  - [ ] 6.8 Ensure frontend authentication tests pass
    - Run ONLY the 2-8 tests written in 6.1
    - Verify login flow works end-to-end
    - Verify transparent token renewal works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 6.1 pass
- Login form accepts email/password and authenticates user
- Both access and refresh tokens are stored in localStorage
- Authorization header includes access token on every request
- Token renewal is transparent when access token expires
- Failed refresh clears tokens and redirects to login page
- User can logout and tokens are cleared

---

### Testing and Quality Assurance

#### Task Group 7: Integration Testing and Error Handling Standards
**Dependencies:** Task Groups 1-6

- [ ] 7.0 Review existing tests and establish error handling standards
  - [ ] 7.1 Review tests from Task Groups 1-6
    - Review the 2-8 tests written by database layer (Task 1.1)
    - Review the 2-8 tests written by auth service (Task 2.1)
    - Review the 2-8 tests written by GraphQL mutations (Task 3.1)
    - Review the 2-8 tests written by guards (Task 4.1)
    - Review the 2-8 tests written by role derivation (Task 5.1)
    - Review the 2-8 tests written by frontend (Task 6.1)
    - Total existing tests: approximately 12-48 tests
  - [ ] 7.2 Analyze test coverage gaps for authentication feature
    - Identify critical authentication workflows that lack test coverage
    - Focus ONLY on gaps related to authentication requirements
    - Prioritize end-to-end authentication flows over unit test gaps
    - Check token expiration edge cases
    - Check concurrent token refresh scenarios
  - [ ] 7.3 Write up to 10 additional strategic tests maximum
    - Add tests for complete login-to-authenticated-request flow
    - Add tests for token expiration and renewal workflow
    - Add tests for role-based access control scenarios
    - Add tests for error handling across layers (database, service, resolver, frontend)
    - Do NOT write comprehensive coverage for all scenarios
    - Focus on integration points and critical user workflows
  - [ ] 7.4 Document GraphQL error handling standards
    - Create `docs/error-handling-standards.md` or add to existing docs
    - Document standard error format: { message, extensions: { code } }
    - Document error codes: INVALID_CREDENTIALS, UNAUTHORIZED, FORBIDDEN
    - Document when to use each error code
    - Establish pattern for future features to follow
  - [ ] 7.5 Run authentication feature tests
    - Run ONLY tests related to authentication feature (tests from 1.1-6.1 and 7.3)
    - Expected total: approximately 22-58 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical authentication workflows pass
    - Fix any failing tests

**Acceptance Criteria:**
- All authentication feature tests pass (approximately 22-58 tests total)
- Critical authentication workflows are covered by tests
- No more than 10 additional tests added when filling in testing gaps
- GraphQL error handling standards are documented
- Error format is consistent across all authentication endpoints
- Testing focused exclusively on authentication feature requirements

---

## Execution Order

Recommended implementation sequence:
1. **Database Layer** (Task Group 1) - Update Profile model schema and create migrations
2. **Backend Core Authentication Services** (Task Group 2) - Password hashing and AuthService
3. **Backend GraphQL Mutations** (Task Group 3) - Login and refresh mutations
4. **Backend Guards and Authorization** (Task Group 4) - JWT Guard and Role Guard
5. **Backend Role Derivation Logic** (Task Group 5) - Automatic Tech Lead role assignment
6. **Frontend Token Management and UI** (Task Group 6) - Login UI and token renewal
7. **Testing and Quality Assurance** (Task Group 7) - Integration tests and error standards

## Implementation Notes

### Key Dependencies
- bcrypt library for password hashing (salt round 10)
- @nestjs/jwt for JWT token generation and validation
- @nestjs/passport and passport-jwt for authentication strategies
- localStorage for frontend token storage
- Apollo Client error link for transparent token renewal

### Security Considerations
- All passwords hashed with bcrypt before storage
- JWT tokens signed with secret from JWT_SECRET environment variable
- Access tokens short-lived (15 minutes) to limit exposure window
- Refresh tokens longer-lived (7 days) for user convenience
- Tokens stored in localStorage (acceptable for internal tool)

### Token Expiration Configuration
- Access Token: 15 minutes
- Refresh Token: 7 days

### Error Codes Established
- `INVALID_CREDENTIALS`: Login failed due to incorrect email or password
- `UNAUTHORIZED`: Request lacks valid authentication token or token is expired
- `FORBIDDEN`: User authenticated but lacks required role for resource

### Environment Variables Required
- `JWT_SECRET`: Secret key for signing and validating JWT tokens
- `DATABASE_URL`: Connection string for PostgreSQL database (already configured)

### Testing Strategy
- Each task group writes 2-8 focused tests for their specific responsibilities
- Test verification runs ONLY newly written tests, not entire suite
- Task Group 7 adds maximum 10 additional tests to fill critical gaps
- Total expected tests: approximately 22-58 tests for authentication feature
- Focus on integration testing and end-to-end authentication flows

### Future Enhancements (Out of Scope)
- Password reset flows
- Email verification
- OAuth integration (Google, GitHub)
- Two-factor authentication (2FA)
- Rate limiting for brute force protection
- Password complexity requirements
- httpOnly cookie token storage
- Session management across devices
