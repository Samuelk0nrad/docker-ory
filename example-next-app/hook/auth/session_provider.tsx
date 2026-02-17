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
    return await Sentry.startSpan(
      { op: "http.client", name: "GET /api/auth/session" },
      async (span) => {
        try {
          Sentry.addBreadcrumb({
            category: "session",
            message: "Fetching user session",
            level: "info",
          });

          const response = await fetch('/api/auth/session');

          span.setAttribute("http.response.status_code", response.status);

          if (response.ok) {
            const data = await response.json();

            if (data.user) {
              setUser(data.user);
              setExpiresAt(data.expiresAt);
              setHasRefreshToken(data.hasRefreshToken || false);
              setError(null);

              span.setAttribute("session.authenticated", true);

              // Set Sentry user context
              Sentry.setUser({
                id: data.user.id,
                email: data.user.email,
                username: data.user.name,
              });

              Sentry.addBreadcrumb({
                category: "session",
                message: "User session loaded",
                level: "info",
                data: { has_refresh_token: data.hasRefreshToken },
              });

              // Schedule auto-refresh 1 minute before expiry
              if (data.expiresAt && data.hasRefreshToken) {
                scheduleTokenRefresh(data.expiresAt);
              }
            } else {
              setUser(undefined);
              setExpiresAt(null);
              setHasRefreshToken(false);

              span.setAttribute("session.authenticated", false);

              Sentry.addBreadcrumb({
                category: "session",
                message: "No active session",
                level: "info",
              });
            }
          } else if (response.status === 401) {
            setUser(undefined);
            setExpiresAt(null);
            setHasRefreshToken(false);
            setError(null);

            span.setAttribute("session.authenticated", false);

            Sentry.addBreadcrumb({
              category: "session",
              message: "Session expired or invalid",
              level: "info",
            });
          } else {
            throw new Error('Failed to fetch session');
          }
        } catch (err) {
          console.error('Failed to fetch session:', err);
          Sentry.captureException(err);
          Sentry.addBreadcrumb({
            category: "session",
            message: "Session fetch failed",
            level: "error",
          });
          setError(err instanceof Error ? err.message : 'Failed to fetch session');
          setUser(undefined);
          setExpiresAt(null);
          setHasRefreshToken(false);
        } finally {
          setLoading(false);
        }
      }
    );
  }, [scheduleTokenRefresh]);

  // Refresh the OAuth token
  const refreshToken = useCallback(async (): Promise<void> => {
    return await Sentry.startSpan(
      { op: "http.client", name: "POST /api/auth/refresh" },
      async (span) => {
        try {
          Sentry.addBreadcrumb({
            category: "session",
            message: "Refreshing OAuth token",
            level: "info",
          });

          const response = await fetch('/api/auth/refresh', { method: 'POST' });

          span.setAttribute("http.response.status_code", response.status);

          if (response.ok) {
            const data = await response.json();
            setExpiresAt(data.expiresAt);
            setError(null);

            Sentry.addBreadcrumb({
              category: "session",
              message: "Token refresh successful",
              level: "info",
            });

            // Schedule next refresh
            if (data.expiresAt && hasRefreshToken) {
              scheduleTokenRefresh(data.expiresAt);
            }

            // Refetch session to get updated user data
            await fetchSession();
          } else if (response.status === 401) {
            Sentry.addBreadcrumb({
              category: "session",
              message: "Refresh token expired or invalid",
              level: "warning",
            });

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
          Sentry.captureException(err);
          Sentry.addBreadcrumb({
            category: "session",
            message: "Token refresh failed",
            level: "error",
          });
          if (hasRefreshToken) {
            // Had a refresh token but refresh failed - redirect to login
            login();
          }
        }
      }
    );
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
    return await Sentry.startSpan(
      { op: "http.client", name: "POST /api/auth/logout" },
      async (span) => {
        try {
          Sentry.addBreadcrumb({
            category: "session",
            message: "Initiating logout",
            level: "info",
          });

          const response = await fetch('/api/auth/logout', { method: 'POST' });

          span.setAttribute("http.response.status_code", response.status);

          if (response.ok) {
            const data = await response.json().catch(() => ({} as { logoutUrl?: string }));
            setUser(undefined);
            setExpiresAt(null);
            setHasRefreshToken(false);
            setError(null);

            // Clear Sentry user context
            Sentry.setUser(null);

            Sentry.addBreadcrumb({
              category: "session",
              message: "Logout successful",
              level: "info",
            });

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
          Sentry.captureException(err);
          Sentry.addBreadcrumb({
            category: "session",
            message: "Logout failed",
            level: "error",
          });
          setError(err instanceof Error ? err.message : 'Logout failed');
        }
      }
    );
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
