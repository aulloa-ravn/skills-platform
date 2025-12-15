import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  hasTokens,
} from './tokenStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('Token Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store both access and refresh tokens', () => {
    const accessToken = 'test-access-token';
    const refreshToken = 'test-refresh-token';

    setTokens(accessToken, refreshToken);

    expect(getAccessToken()).toBe(accessToken);
    expect(getRefreshToken()).toBe(refreshToken);
  });

  it('should retrieve access token from localStorage', () => {
    const accessToken = 'test-access-token';
    localStorage.setItem('accessToken', accessToken);

    expect(getAccessToken()).toBe(accessToken);
  });

  it('should retrieve refresh token from localStorage', () => {
    const refreshToken = 'test-refresh-token';
    localStorage.setItem('refreshToken', refreshToken);

    expect(getRefreshToken()).toBe(refreshToken);
  });

  it('should return null when tokens do not exist', () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('should clear both tokens from localStorage', () => {
    setTokens('access-token', 'refresh-token');

    clearTokens();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('should check if user has tokens stored', () => {
    expect(hasTokens()).toBe(false);

    setTokens('access-token', 'refresh-token');
    expect(hasTokens()).toBe(true);

    clearTokens();
    expect(hasTokens()).toBe(false);
  });
});
