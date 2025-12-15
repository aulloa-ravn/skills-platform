import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAccessToken, getRefreshToken } from '../utils/tokenStorage';

// Mock the token storage module
vi.mock('../utils/tokenStorage', () => ({
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
}));

describe('Apollo Client Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have access to token storage utilities', () => {
    expect(getAccessToken).toBeDefined();
    expect(getRefreshToken).toBeDefined();
  });

  it('should retrieve access token from storage', () => {
    vi.mocked(getAccessToken).mockReturnValue('test-token');
    const token = getAccessToken();
    expect(token).toBe('test-token');
  });

  it('should handle null tokens gracefully', () => {
    vi.mocked(getAccessToken).mockReturnValue(null);
    const token = getAccessToken();
    expect(token).toBeNull();
  });

  it('should retrieve refresh token from storage', () => {
    vi.mocked(getRefreshToken).mockReturnValue('test-refresh-token');
    const refreshToken = getRefreshToken();
    expect(refreshToken).toBe('test-refresh-token');
  });
});
