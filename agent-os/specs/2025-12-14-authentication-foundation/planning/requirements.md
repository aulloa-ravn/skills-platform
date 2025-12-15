# Spec Requirements: Authentication Foundation

## Initial Description
Implement JWT-based authentication with login endpoint and auth guards for protected routes. This feature provides the authentication foundation for the Ravn Skills Platform, enabling secure access control for employees, tech leads, and administrators.

## Requirements Discussion

### First Round Questions

**Q1:** I assume we'll use the existing Profile model as the user entity for authentication (since profiles already exist with ravn.com emails), and we'll add a password field to the Profile model. Is that correct, or should we create a separate User model that references Profile?
**Answer:** Use existing Profile model with password field added - OK

**Q2:** For JWT configuration, I'm thinking we'll use a 15-minute access token expiration with no refresh token implementation initially (keeping it simple for this foundation). Should we implement refresh tokens now, or defer that to a future enhancement?
**Answer:** Implement refresh tokens (not just 15-minute access tokens)

**Q3:** I assume the login endpoint will accept email and password as credentials, validate against the Profile model, and return a JWT token along with basic profile info (id, name, email, role). Is that the expected response format, or would you like additional data returned?
**Answer:** Accept email/password, return JWT + basic profile info - OK

**Q4:** For password hashing, I'm thinking we'll use bcrypt with a salt round of 10 (industry standard). Should we also implement password validation rules (minimum length, complexity requirements), or keep it simple for now?
**Answer:** Use bcrypt with salt round of 10, keep validation simple for now (no complexity requirements)

**Q5:** I assume we need to differentiate between regular employees and Tech Leads for authorization purposes. Should we add a role field to the Profile model (EMPLOYEE, TECH_LEAD, ADMIN), or is there another way to determine user roles based on existing data?
**Answer:** Add role field to Profile model (EMPLOYEE, TECH_LEAD, ADMIN) - OK

**Q6:** For auth guards implementation, I'm thinking we'll create a standard JWT Guard for all protected routes, and optionally a Role Guard for admin-only endpoints. Which routes should be public (login) versus protected (everything else)?
**Answer:** Create JWT Guard for protected routes, Role Guard for admin endpoints - OK

**Q7:** I assume tokens will be stored in the frontend using localStorage or sessionStorage, and sent via Authorization: Bearer header. Is that correct, or would you prefer a different client-side token storage approach (httpOnly cookies)?
**Answer:** localStorage/sessionStorage with Authorization: Bearer header - OK

**Q8:** For error handling, I'm thinking we'll return standard HTTP status codes (401 for invalid credentials, 403 for unauthorized access) with descriptive error messages. Should we implement rate limiting on the login endpoint to prevent brute force attacks, or is that out of scope for this foundation?
**Answer:** Standard HTTP status codes (401/403) with descriptive messages - OK

**Q9:** Are there any specific features or behaviors you want to explicitly exclude from this authentication foundation? For example: password reset flows, email verification, OAuth integration, two-factor authentication, or session management across devices?
**Answer:** Exclude password reset flows, email verification, OAuth integration, two-factor authentication, session management across devices - OK

### Existing Code to Reference

No similar existing features identified for reference. This authentication foundation will establish patterns for future features to follow.

### Follow-up Questions

**Follow-up 1:** For the refresh token implementation, I'm thinking we'll use a 15-minute expiration for access tokens and a 7-day expiration for refresh tokens. Should the refresh token be returned alongside the access token during login, and should we create a separate `/refresh` endpoint or GraphQL mutation for obtaining new access tokens?
**Answer:** YES - return refresh token alongside access token during login AND create a separate /refresh endpoint or GraphQL mutation for obtaining new access tokens. Use 15-minute expiration for access tokens and 7-day expiration for refresh tokens.

**Follow-up 2:** You mentioned adding a role field to the Profile model with EMPLOYEE, TECH_LEAD, ADMIN values. Should Tech Leads be automatically identified based on their project assignments (someone who is a Tech Lead on at least one project), or should the role be manually set by admins? Also, can someone have multiple roles, or is it a single-value field?
**Answer:** AUTOMATICALLY - Tech Leads should be automatically identified based on their project assignments (someone who is a Tech Lead on at least one project). The role should be derived/computed, not manually set.

**Follow-up 3:** For token storage, should we store both access and refresh tokens in localStorage/sessionStorage? Also, should the refresh token be automatically used when the access token expires (transparent token renewal), or should users be logged out and required to log in again?
**Answer:** localStorage (both access and refresh tokens). Automatically use the refresh token to get a new access token and retry the failed request (user stays logged in, seamless experience).

**Follow-up 4:** When a protected GraphQL resolver is accessed without a valid token or with insufficient permissions, should we throw GraphQL errors (with extensions for error codes), or would you prefer a different error format? What about the login mutation - should invalid credentials return a GraphQL error or a specific error object in the response?
**Answer:** Return a GraphQL error for both protected resolvers without valid tokens and for login mutation with invalid credentials.

**Follow-up 5:** Are there any specific admin-only routes you've identified that need the Role Guard now, or should we just implement the infrastructure (Role Guard decorator) and apply it to admin endpoints later as they're built (like Skills Taxonomy Management)?
**Answer:** Just implement the infrastructure (Role Guard decorator) and apply it to admin endpoints later as they're built - OK.

**Follow-up 6:** Since you mentioned no similar existing features, should we establish patterns for this authentication foundation that will be followed throughout the rest of the application? For example, should all mutations follow the same error handling approach, or will each feature determine its own patterns?
**Answer:** YES - document a standard approach for GraphQL error handling (error codes, error extensions, message formats) that future features should follow.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual assets provided.

## Requirements Summary

### Functional Requirements

**Authentication Core:**
- Add password field to existing Profile model (hashed with bcrypt, salt round 10)
- Implement JWT-based authentication with dual-token system (access + refresh)
- Create login mutation accepting email and password credentials
- Return both access token (15-minute expiration) and refresh token (7-day expiration) on successful login
- Return basic profile info on login (id, name, email, role)
- Create refresh token mutation/endpoint for obtaining new access tokens

**Authorization & Access Control:**
- Add role field to Profile model with three values: EMPLOYEE, TECH_LEAD, ADMIN
- Automatically derive TECH_LEAD role based on project assignments (if user is Tech Lead on at least one active project)
- Implement JWT Guard for protecting GraphQL resolvers/endpoints
- Implement Role Guard infrastructure (decorator) for future admin-only endpoints
- All routes protected except login mutation

**Token Management:**
- Store both access and refresh tokens in localStorage on frontend
- Send access token via Authorization: Bearer header with each request
- Implement transparent token renewal: when access token expires, automatically use refresh token to obtain new access token and retry failed request
- Keep user logged in seamlessly during token renewal

**Error Handling:**
- Return GraphQL errors for invalid credentials during login
- Return GraphQL errors for protected resolvers accessed without valid token (401 equivalent)
- Return GraphQL errors for insufficient permissions (403 equivalent)
- Include descriptive error messages and error codes in GraphQL error extensions
- Establish standard error handling patterns for consistency across application

**Password Management:**
- Use bcrypt for password hashing with salt round of 10
- Keep password validation simple (no complexity requirements for now)
- No minimum length or special character requirements in this foundation

### Reusability Opportunities

No existing similar features identified. This authentication foundation will establish the following patterns for reuse:
- GraphQL error handling approach with standardized error codes and extensions
- Guard decorators pattern (JWT Guard, Role Guard)
- Token management and storage patterns
- Authorization patterns for role-based access control

### Scope Boundaries

**In Scope:**
- JWT-based authentication with access and refresh tokens
- Login mutation with email/password authentication
- Refresh token mutation for transparent token renewal
- Password field addition to Profile model with bcrypt hashing
- Role field addition to Profile model (EMPLOYEE, TECH_LEAD, ADMIN)
- Automatic Tech Lead role derivation based on project assignments
- JWT Guard for protecting routes
- Role Guard infrastructure (decorator) for future use
- GraphQL error handling with standardized patterns
- Frontend token storage in localStorage
- Transparent token renewal when access token expires

**Out of Scope:**
- Password reset flows
- Email verification
- OAuth integration
- Two-factor authentication (2FA)
- Session management across devices
- Rate limiting on login endpoint (brute force protection)
- Password complexity requirements
- httpOnly cookie-based token storage
- Manual role assignment by admins

### Technical Considerations

**Backend (NestJS/GraphQL):**
- Extend Prisma Profile model with password and role fields
- Use @nestjs/jwt for JWT token generation and validation
- Use bcrypt library for password hashing
- Create AuthService for login and token refresh logic
- Create JWT Guard using NestJS guards pattern
- Create Role Guard decorator for future admin endpoints
- Implement GraphQL error handling with error extensions (codes, messages)
- Access token expiration: 15 minutes
- Refresh token expiration: 7 days

**Frontend (React/Apollo Client):**
- Store access and refresh tokens in localStorage
- Send access token via Authorization: Bearer header
- Implement Apollo Client error link for transparent token renewal
- On 401/invalid token error: call refresh mutation, retry original request
- If refresh fails: clear tokens and redirect to login
- Create login form UI (not specified in detail, basic implementation)

**Database (Prisma/PostgreSQL):**
- Add password field to Profile model (String type, hashed)
- Add role field to Profile model (Enum: EMPLOYEE, TECH_LEAD, ADMIN)
- Tech Lead role computed based on Assignment model (where isTechLead = true)
- Consider adding refreshToken field to Profile model for token validation/revocation (optional)

**Integration Points:**
- Profile model already exists from database schema migrations (roadmap item #1)
- Assignment model exists with isTechLead field for role derivation
- All future GraphQL mutations and queries will use JWT Guard
- Admin features (Skills Taxonomy Management, Seniority Management) will use Role Guard

**Security Considerations:**
- Passwords hashed with bcrypt (salt round 10) before storage
- JWT tokens signed with secret key (configure via environment variable)
- Access tokens short-lived (15 minutes) to limit exposure
- Refresh tokens longer-lived (7 days) for user convenience
- No rate limiting in this foundation (defer to future enhancement)
- Tokens stored in localStorage (vulnerable to XSS, but acceptable for this internal tool)

**Error Handling Standards:**
- Establish consistent GraphQL error format with extensions
- Include error codes (e.g., INVALID_CREDENTIALS, UNAUTHORIZED, FORBIDDEN)
- Include descriptive error messages for debugging
- Future features should follow this pattern for consistency
