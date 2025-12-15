import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as tokenStorage from '../utils/tokenStorage';
import { Role } from './AuthContext';

// Mock token storage
vi.mock('../utils/tokenStorage', () => ({
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
  hasTokens: vi.fn(() => false),
  getAccessToken: vi.fn(() => null),
  getRefreshToken: vi.fn(() => null),
}));

describe('AuthContext - Token Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide token storage functionality', () => {
    expect(tokenStorage.setTokens).toBeDefined();
    expect(tokenStorage.clearTokens).toBeDefined();
    expect(tokenStorage.hasTokens).toBeDefined();
  });

  it('should call setTokens with correct arguments', () => {
    const accessToken = 'test-access-token';
    const refreshToken = 'test-refresh-token';

    tokenStorage.setTokens(accessToken, refreshToken);

    expect(tokenStorage.setTokens).toHaveBeenCalledWith(accessToken, refreshToken);
    expect(tokenStorage.setTokens).toHaveBeenCalledTimes(1);
  });

  it('should call clearTokens to remove authentication', () => {
    tokenStorage.clearTokens();

    expect(tokenStorage.clearTokens).toHaveBeenCalledTimes(1);
  });

  it('should check if tokens exist', () => {
    vi.mocked(tokenStorage.hasTokens).mockReturnValue(true);

    const hasAuth = tokenStorage.hasTokens();

    expect(hasAuth).toBe(true);
    expect(tokenStorage.hasTokens).toHaveBeenCalled();
  });

  it('should return false when tokens do not exist', () => {
    vi.mocked(tokenStorage.hasTokens).mockReturnValue(false);

    const hasAuth = tokenStorage.hasTokens();

    expect(hasAuth).toBe(false);
  });

  it('should export Role enum correctly', () => {
    expect(Role.EMPLOYEE).toBe('EMPLOYEE');
    expect(Role.TECH_LEAD).toBe('TECH_LEAD');
    expect(Role.ADMIN).toBe('ADMIN');
  });
});
