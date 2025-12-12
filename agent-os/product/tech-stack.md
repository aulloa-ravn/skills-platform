# Tech Stack

## Project Structure

- **Monorepo Tool:** Turborepo
- **Package Manager:** pnpm 9.0.0
- **Language:** TypeScript (full-stack)
- **Node Version:** >= 18

## Backend (apps/api)

### Framework & Runtime

- **Framework:** NestJS 11
- **Runtime:** Node.js
- **API Style:** GraphQL
- **GraphQL Library:** @nestjs/graphql with Apollo Server

### Database & ORM

- **Database:** PostgreSQL
- **ORM:** Prisma
- **Migrations:** Prisma Migrate

### Authentication

- **Strategy:** JWT (JSON Web Tokens)
- **Future Integration:** Auth0 or Mission Board token verification

### Testing

- **Test Framework:** Jest
- **E2E Testing:** Supertest

## Frontend (apps/client)

### Framework & Build

- **Framework:** React 19
- **Build Tool:** Vite 7
- **Module System:** ES Modules

### Styling

- **CSS Framework:** Tailwind CSS
- **Approach:** Utility-first CSS

### State Management

- **Client State:** Zustand
- **Server State:** Apollo Client (GraphQL)

### Data Fetching

- **GraphQL Client:** Apollo Client
- **API Communication:** GraphQL queries and mutations

## Shared Packages

### packages/typescript-config

- Shared TypeScript configuration across apps

### packages/eslint-config

- Shared ESLint configuration across apps

## Code Quality

### Linting & Formatting

- **Linter:** ESLint 9
- **Formatter:** Prettier
- **TypeScript:** typescript-eslint

### Type Checking

- **TypeScript Version:** ~5.9
- **Strict Mode:** Enabled

## Development Environment

### Local Development

- **API Server:** `nest start --watch` (hot reload)
- **Client Server:** Vite dev server (HMR)
- **Database:** Local PostgreSQL instance

### Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm lint` - Lint all apps
- `pnpm format` - Format code with Prettier

## Deployment

- **Current:** Local development only
- **Future:** TBD (no cloud deployment planned yet)

## Third-Party Services

- **Authentication:** JWT (self-managed) or Auth0 (future)
- **External Integration:** Mission Board (webhook-based sync, future phase)
- **Monitoring:** None planned
- **Email:** None planned
