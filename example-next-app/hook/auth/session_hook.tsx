import { useContext } from 'react';
import { SessionContext } from './session_context';

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
