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

  const isLoggedIn = !!session;

  useEffect(() => {
    refrashSession();
  }, []);

  return (
    <SessionContext.Provider
      value={{ session, refrashSession, user, loading, isLoggedIn, error }}
    >
      {children}
    </SessionContext.Provider>
  );
}
