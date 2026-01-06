# Specification: Authentication Foundation

## Goal
Implement JWT-based authentication with dual-token system (access + refresh) to secure the Ravn Skills Platform, enabling role-based access control for employees, tech leads, and administrators with transparent token renewal for seamless user experience.

## User Stories
- As an employee, I want to log in with my email and password so that I can securely access my skills profile
- As a tech lead, I want to stay logged in without interruption so that I can efficiently validate team members' skills
- As an admin, I want protected endpoints with role-based access so that only authorized users can manage taxonomy and seniority data

## Specific Requirements

**Profile Model Schema Updates**
- Add password field to Profile model (String type, stores bcrypt-hashed password with salt round 10)
- Add role field to Profile model as enum with three values: EMPLOYEE, TECH_LEAD, ADMIN
- Tech Lead role automatically derived when user is techLead on at least one Project (from Project.techLeadId relationship)
- Password field required for new profiles, nullable for existing profiles during migration
- Default role is EMPLOYEE unless user meets Tech Lead criteria or is explicitly set as ADMIN

**Login Mutation**
- Accept email and password as credentials via GraphQL mutation
- Validate email exists in Profile model and password matches hashed value using bcrypt.compare
- Return access token (JWT, 15-minute expiration) and refresh token (JWT, 7-day expiration) on successful authentication
- Return basic profile info on success: id, name, email, role
- Throw GraphQL error with INVALID_CREDENTIALS code and descriptive message for failed login attempts
- Sign JWT tokens with secret key from environment variable (JWT_SECRET)

**Refresh Token Mutation**
- Accept refresh token as input via GraphQL mutation or dedicated endpoint
- Validate refresh token signature and expiration
- Generate new access token (15-minute expiration) if refresh token is valid
- Return new access token and refresh token info
- Throw GraphQL error with UNAUTHORIZED code if refresh token is invalid or expired

**JWT Guard Implementation**
- Create NestJS guard using @nestjs/jwt for protecting GraphQL resolvers
- Extract JWT from Authorization: Bearer header
- Validate token signature and expiration
- Attach decoded user info (id, email, role) to request context for use in resolvers
- Apply guard to all GraphQL resolvers except login and refresh mutations
- Throw GraphQL error with UNAUTHORIZED code when token is missing or invalid

**Role Guard Infrastructure**
- Create Role Guard decorator for admin-only endpoints
- Check user role from JWT payload against required roles (ADMIN, TECH_LEAD, EMPLOYEE)
- Allow access only if user role matches required role(s)
- Throw GraphQL error with FORBIDDEN code when user lacks required role
- Infrastructure ready for future use but not applied to specific endpoints yet

**Password Hashing and Validation**
- Use bcrypt library for password hashing with salt round of 10
- Hash password before storing in database during profile creation or password update
- Simple password validation: no minimum length, no complexity requirements, no special character requirements
- Password comparison using bcrypt.compare for login validation

**GraphQL Error Handling Standards**
- All authentication errors return GraphQL errors (not error objects in response data)
- Include error code in error extensions: INVALID_CREDENTIALS, UNAUTHORIZED, FORBIDDEN
- Include descriptive error messages for debugging and user feedback
- Format: { message: "Descriptive message", extensions: { code: "ERROR_CODE" } }
- Future features should follow this error handling pattern for consistency

**Frontend Token Storage**
- Store both access token and refresh token in localStorage
- Send access token via Authorization: Bearer header with every GraphQL request
- Implement Apollo Client error link for transparent token renewal
- On GraphQL error with UNAUTHORIZED code: call refresh mutation, update localStorage with new access token, retry failed request
- If refresh mutation fails: clear tokens from localStorage, redirect user to login page
- User stays logged in seamlessly during token renewal (no visible interruption)

## Out of Scope
- Password reset flows and forgot password functionality
- Email verification for new accounts
- OAuth integration (Google, GitHub, etc.)
- Two-factor authentication (2FA)
- Session management across multiple devices
- Rate limiting on login endpoint for brute force protection
- Password complexity requirements (minimum length, special characters, uppercase/lowercase)
- httpOnly cookie-based token storage
- Manual role assignment by admins (roles are derived automatically)
- Remember me functionality with extended token expiration
