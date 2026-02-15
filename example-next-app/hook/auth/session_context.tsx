'use client';
import { createContext } from 'react';

export type User = {
  id: string;
  email: string;
  name?: string;
};

type SessionContextType = {
  user?: User;
  loading: boolean;
  isLoggedIn: boolean;
  error?: string | null;
  login: (returnTo?: string) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextType | undefined>(
  undefined
);
