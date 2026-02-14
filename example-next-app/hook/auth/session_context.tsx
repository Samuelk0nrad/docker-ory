'use client';
import { Identity, Session } from '@ory/client';
import { createContext } from 'react';

type SessionContextType = {
  session?: Session;
  refrashSession: () => Promise<void>;
  user?: Identity; // Replace with your user type
  loading: boolean;
  isLoggedIn: boolean;
  error?: string | null;
  // OAuth-related fields
  accessTokenClaims?: Record<string, any>;
  login: (returnTo?: string) => void;
  logout: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextType | undefined>(
  undefined
);
