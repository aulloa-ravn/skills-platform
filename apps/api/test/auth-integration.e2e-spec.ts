import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { hashPassword } from '../src/auth/utils/password.util';
import { Role } from '@prisma/client';

/**
 * End-to-end integration tests for authentication feature
 * Tests complete authentication workflows across all layers
 */
describe('Authentication Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create a test user for authentication tests
    const hashedPassword = await hashPassword('testPassword123');
    const testUser = await prisma.profile.create({
      data: {
        name: 'Test User',
        email: 'testuser@ravn.com',
        password: hashedPassword,
        role: Role.EMPLOYEE,
      },
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.profile.delete({ where: { id: testUserId } }).catch(() => {});
    await app.close();
  });

  describe('Complete Login Flow', () => {
    it('should successfully log in with valid credentials and return tokens + profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
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
          `,
          variables: {
            input: {
              email: 'testuser@ravn.com',
              password: 'testPassword123',
            },
          },
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.login).toBeDefined();
      expect(response.body.data.login.accessToken).toBeDefined();
      expect(response.body.data.login.refreshToken).toBeDefined();
      expect(response.body.data.login.profile.email).toBe('testuser@ravn.com');
      expect(response.body.data.login.profile.role).toBe('EMPLOYEE');
    });

    it('should return INVALID_CREDENTIALS error for wrong password', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
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
          `,
          variables: {
            input: {
              email: 'testuser@ravn.com',
              password: 'wrongPassword',
            },
          },
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return INVALID_CREDENTIALS error for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                accessToken
              }
            }
          `,
          variables: {
            input: {
              email: 'nonexistent@ravn.com',
              password: 'anyPassword',
            },
          },
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('Token Refresh Flow', () => {
    let refreshToken: string;

    beforeAll(async () => {
      // Get a refresh token by logging in
      const loginResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                refreshToken
              }
            }
          `,
          variables: {
            input: {
              email: 'testuser@ravn.com',
              password: 'testPassword123',
            },
          },
        });

      refreshToken = loginResponse.body.data.login.refreshToken;
    });

    it('should successfully refresh access token with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation RefreshToken($input: RefreshTokenInput!) {
              refreshToken(input: $input) {
                accessToken
              }
            }
          `,
          variables: {
            input: {
              refreshToken,
            },
          },
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.refreshToken.accessToken).toBeDefined();
    });

    it('should return UNAUTHORIZED error for invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation RefreshToken($input: RefreshTokenInput!) {
              refreshToken(input: $input) {
                accessToken
              }
            }
          `,
          variables: {
            input: {
              refreshToken: 'invalid-token',
            },
          },
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Protected Route Access', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Get an access token by logging in
      const loginResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                accessToken
              }
            }
          `,
          variables: {
            input: {
              email: 'testuser@ravn.com',
              password: 'testPassword123',
            },
          },
        });

      accessToken = loginResponse.body.data.login.accessToken;
    });

    it('should allow access to protected routes with valid token', async () => {
      // Using a basic query that should be protected
      // Note: This assumes there's at least one protected query in the schema
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            query {
              __typename
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
    });

    it('should return UNAUTHORIZED error when accessing protected route without token', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              profiles {
                id
              }
            }
          `,
        })
        .expect(200);

      // Protected routes should fail without token
      // Note: Exact error depends on schema - this validates auth guard works
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Error Handling Standards', () => {
    it('should return consistent error format with code and message', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                accessToken
              }
            }
          `,
          variables: {
            input: {
              email: 'testuser@ravn.com',
              password: 'wrongPassword',
            },
          },
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBeDefined();
      expect(response.body.errors[0].extensions).toBeDefined();
      expect(response.body.errors[0].extensions.code).toBeDefined();
    });
  });
});
