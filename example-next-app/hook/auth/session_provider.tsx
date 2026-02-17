'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { SessionContext, User } from './session_context';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [, setExpiresAt] = useState<number | null>(null);
  const [hasRefreshToken, setHasRefreshToken] = useState<boolean>(false);

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTokenRef = useRef<(() => Promise<void>) | null>(null);

  // Schedule token refresh 1 minute before expiry
  const scheduleTokenRefresh = useCallback((expiresAtTimestamp: number): void => {
    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const now = Date.now();
    const expiresIn = expiresAtTimestamp - now;
    const refreshIn = Math.max(0, expiresIn - 60000); // 1 minute before expiry

    refreshTimeoutRef.current = setTimeout(() => {
      refreshTokenRef.current?.();
    }, refreshIn);
  }, []);

  // Fetch session from API
  const fetchSession = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/session');

      if (response.ok) {
        const data = await response.json();

        if (data.user) {
          setUser(data.user);
          setExpiresAt(data.expiresAt);
          setHasRefreshToken(data.hasRefreshToken || false);
          setError(null);

          // Set Sentry user context
          Sentry.setUser({
            id: data.user.id,
            email: data.user.email,
            username: data.user.name,
          });

          // Schedule auto-refresh 1 minute before expiry
          if (data.expiresAt && data.hasRefreshToken) {
            scheduleTokenRefresh(data.expiresAt);
          }
        } else {
          setUser(undefined);
          setExpiresAt(null);
          setHasRefreshToken(false);
        }
      } else if (response.status === 401) {
        setUser(undefined);
        setExpiresAt(null);
        setHasRefreshToken(false);
        setError(null);
      } else {
        throw new Error('Failed to fetch session');
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch session');
      setUser(undefined);
      setExpiresAt(null);
      setHasRefreshToken(false);
    } finally {
      setLoading(false);
    }
  }, [scheduleTokenRefresh]);

  // Refresh the OAuth token
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/refresh', { method: 'POST' });

      if (response.ok) {
        const data = await response.json();
        setExpiresAt(data.expiresAt);
        setError(null);

        // Schedule next refresh
        if (data.expiresAt && hasRefreshToken) {
          scheduleTokenRefresh(data.expiresAt);
        }

        // Refetch session to get updated user data
        await fetchSession();
      } else if (response.status === 401) {
        // Refresh token expired or invalid
        if (hasRefreshToken) {
          // Had a refresh token but it failed - redirect to login
          setUser(undefined);
          setExpiresAt(null);
          setHasRefreshToken(false);
          login();
        } else {
          // No refresh token - just clear session
          setUser(undefined);
          setExpiresAt(null);
          setHasRefreshToken(false);
        }
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (err) {
      console.error('Failed to refresh token:', err);
      if (hasRefreshToken) {
        // Had a refresh token but refresh failed - redirect to login
        login();
      }
    }
  }, [fetchSession, hasRefreshToken, scheduleTokenRefresh]);
  
  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

  // Start OAuth login flow
  const login = (returnTo?: string) => {
    // Build query params
    const params = new URLSearchParams();
    if (returnTo) {
      params.set('returnTo', returnTo);
    }

    // Fetch authorization URL from server
    fetch(`/api/auth/login?${params.toString()}`)
      .then(response => response.json())
      .then(data => {
        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl;
        } else {
          setError('Failed to start login flow');
        }
      })
      .catch(err => {
        console.error('Failed to start login:', err);
        setError('Failed to start login flow');
      });
  };

  // Logout
  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });

      if (response.ok) {
        const data = await response.json().catch(() => ({} as { logoutUrl?: string }));
        setUser(undefined);
        setExpiresAt(null);
        setHasRefreshToken(false);
        setError(null);

        // Clear Sentry user context
        Sentry.setUser(null);

        // Clear refresh timeout
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
          refreshTimeoutRef.current = null;
        }

        // Redirect to Hydra logout URL if provided, otherwise home
        if (data.logoutUrl) {
          window.location.href = data.logoutUrl;
        } else {
          window.location.href = '/';
        }
      } else {
        throw new Error('Logout failed');
      }
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  const isLoggedIn = !!user;

  useEffect(() => {
    fetchSession();

    // Cleanup refresh timeout on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchSession]);

  return (
    <SessionContext.Provider
      value={{
        user,
        loading,
        isLoggedIn,
        error,
        login,
        logout,
        refreshSession: fetchSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
