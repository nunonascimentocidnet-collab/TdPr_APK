import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  localLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

enum OperationType {
  GET = 'get',
  WRITE = 'write',
  CREATE = 'create',
}

function handleAuthFirestoreError(error: unknown, operationType: string, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error in Auth:', JSON.stringify(errInfo));
  // We don't necessarily want to crash the whole app here, so we just log it
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('is_guest') === 'true');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      if (authenticatedUser) {
        setIsGuest(false);
        localStorage.removeItem('is_guest');
        setUser(authenticatedUser);
      } else {
        // Fallback user if not yet authenticated
        const fallbackUser = {
          uid: 'atleta_local_01',
          displayName: 'Atleta de Precisão',
          isAnonymous: true
        };
        setUser(fallbackUser as any);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isGuest]);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/internal-error') {
        alert('O login foi bloqueado pelo navegador. Tenta entrar como Convidado.');
      }
    }
  };

  const signInAsGuest = async () => {
    try {
      setLoading(true);
      const { signInAnonymously } = await import('firebase/auth');
      await signInAnonymously(auth);
      // No need to set isGuest manually, onAuthStateChanged will handle it
    } catch (error) {
      console.error('Guest login error:', error);
      // Last resort fallback
      setUser({
        uid: 'anonymous_fallback',
        displayName: 'Atleta Visitante'
      } as any);
      setLoading(false);
    }
  };

  const logOut = async () => {
    try {
      setIsGuest(false);
      localStorage.removeItem('is_guest');
      setUser(null);
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  const localLogin = async () => {
    try {
      setLoading(true);
      const { signInAnonymously } = await import('firebase/auth');
      await signInAnonymously(auth);
      // setUser will be called by onAuthStateChanged
    } catch (error) {
      console.error('Local login error:', error);
      // Fallback
      setUser({
        uid: 'atleta_local_01',
        displayName: 'Atleta de Precisão',
        email: 'atleta@exemplo.pt'
      } as any);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut, signInAsGuest, localLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
