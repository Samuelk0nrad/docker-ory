'use client';

import { kratos } from '@/ory/kratos/kratos';
import { Identity, Session } from '@ory/client';
import { useEffect, useState } from 'react';
import { SessionContext } from './session_context';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [user, setUser] = useState<Identity | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // OAuth state
  const [accessTokenClaims, setAccessTokenClaims] = useState<
    Record<string, any> | undefined
  >(undefined);
  const [isOAuthSession, setIsOAuthSession] = useState<boolean>(false);

  const refrashSession = async () => {
    kratos
      .toSession()
      .then(({ data }) => {
        setSession(data);
        setUser(data.identity);
        setLoading(false);
      })
      .catch((err) => {
        setSession(undefined);
        setUser(undefined);
        setLoading(false);
        setError(err.message);
      });
  };

  // Check for OAuth session in parallel
  const checkOAuthSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated && data.isOAuthSession) {
          setIsOAuthSession(true);
          setAccessTokenClaims(data.accessTokenClaims);
        } else {
          setIsOAuthSession(false);
          setAccessTokenClaims(undefined);
        }
      } else {
        setIsOAuthSession(false);
        setAccessTokenClaims(undefined);
      }
    } catch (err) {
      console.error('Failed to check OAuth session:', err);
      setIsOAuthSession(false);
      setAccessTokenClaims(undefined);
    }
  };

  // Start OAuth2 authorization flow
  const startOAuthFlow = (returnTo?: string) => {
    const hydraPublicUrl =
      process.env.NEXT_PUBLIC_HYDRA_PUBLIC_URL ?? '/api/.ory/hydra';
    const appUrl =
      process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'http://localhost:3000';
    const redirectUri = `${appUrl}/auth/callback`;
    const clientId = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID ?? 'frontend-app';

    const authUrl = new URL(`${hydraPublicUrl}/oauth2/auth`);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid profile email offline');
    authUrl.searchParams.set('redirect_uri', redirectUri);

    // Always generate a strong random state (>= 8 chars)
    const state = crypto.randomUUID(); // 36 chars
    authUrl.searchParams.set('state', state);

    // Store state + returnTo in short-lived cookies for callback validation
    document.cookie = `oauth_state=${state}; Path=/; Max-Age=600; SameSite=Lax`;
    if (returnTo) {
      document.cookie = `oauth_return_to=${encodeURIComponent(
        returnTo
      )}; Path=/; Max-Age=600; SameSite=Lax`;
    }

    window.location.href = authUrl.toString();
  };

  // Logout from both OAuth and Kratos sessions
  const logout = async () => {
    try {
      // If OAuth session exists, initiate Hydra logout
      if (isOAuthSession) {
        const hydraPublicUrl =
          process.env.NEXT_PUBLIC_HYDRA_PUBLIC_URL ?? '/api/.ory/hydra';
        const appUrl =
          typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        
        // Redirect to Hydra's logout endpoint
        // This will call our /auth/hydra/logout page which handles both sessions
        window.location.href = `${hydraPublicUrl}/oauth2/sessions/logout`;
        return;
      }
      
      // Otherwise, just logout from Kratos
      const { data: logoutFlow } = await kratos.createBrowserLogoutFlow();
      if (logoutFlow.logout_url) {
        window.location.href = logoutFlow.logout_url;
      }
    } catch (err) {
      console.error('Logout failed:', err);
      // Fallback: try to logout from Kratos directly
      try {
        const { data: logoutFlow } = await kratos.createBrowserLogoutFlow();
        if (logoutFlow.logout_url) {
          window.location.href = logoutFlow.logout_url;
        }
      } catch (fallbackErr) {
        console.error('Fallback logout also failed:', fallbackErr);
        setError('Logout failed');
      }
    }
  };

  const isLoggedIn = !!session || isOAuthSession;

  useEffect(() => {
    // Check both Kratos and OAuth sessions in parallel
    Promise.all([refrashSession(), checkOAuthSession()]);
  }, []);

  return (
    <SessionContext.Provider
      value={{
        session,
        refrashSession,
        user,
        loading,
        isLoggedIn,
        error,
        accessTokenClaims,
        login: startOAuthFlow,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
