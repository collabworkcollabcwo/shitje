import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/format';
import { googleSignInWeb, googleDemoProfile, isGoogleReal, GoogleProfile } from '../utils/googleAuth';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google';
  joinedAt: string;
}

interface StoredAccount extends AuthUser {
  passHash?: string;
}

type AuthResult = { ok: true; demo?: boolean } | { ok: false; error: string };

interface AuthContextType {
  /** The signed-in user, or null when browsing as a guest. */
  user: AuthUser | null;
  /** False until the persisted session has been restored. */
  ready: boolean;
  /** True when the Google button performs a real OAuth flow (vs demo). */
  googleIsReal: boolean;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'shitje.auth.users';
const SESSION_KEY = 'shitje.auth.session';

// Demo-grade password hash (djb2 + email salt). Fine for a local demo account
// store; a real backend must use bcrypt/argon2 server-side instead.
function hashPassword(password: string, salt: string): string {
  const input = `${salt}::${password}`;
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(36) + '.' + input.length.toString(36);
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

const toPublicUser = ({ passHash: _passHash, ...user }: StoredAccount): AuthUser => user;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [usersRaw, session] = await Promise.all([
          AsyncStorage.getItem(USERS_KEY),
          AsyncStorage.getItem(SESSION_KEY),
        ]);
        if (session && usersRaw) {
          const accounts: StoredAccount[] = JSON.parse(usersRaw);
          const found = accounts.find(a => a.id === session);
          if (found) setUser(toPublicUser(found));
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  const readAccounts = async (): Promise<StoredAccount[]> => {
    try {
      const raw = await AsyncStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const persistSession = (accounts: StoredAccount[], account: StoredAccount) => {
    AsyncStorage.setItem(USERS_KEY, JSON.stringify(accounts)).catch(() => {});
    AsyncStorage.setItem(SESSION_KEY, account.id).catch(() => {});
    setUser(toPublicUser(account));
  };

  const register = useCallback(async (name: string, email: string, password: string): Promise<AuthResult> => {
    const cleanName = name.trim();
    const cleanEmail = normalizeEmail(email);
    if (cleanName.length < 2) return { ok: false, error: 'Shkruaj emrin tënd (të paktën 2 shkronja).' };
    if (!isValidEmail(cleanEmail)) return { ok: false, error: 'Email-i nuk duket i saktë.' };
    if (password.length < 6) return { ok: false, error: 'Fjalëkalimi duhet të ketë të paktën 6 karaktere.' };

    const accounts = await readAccounts();
    if (accounts.some(a => a.email === cleanEmail)) {
      return { ok: false, error: 'Ky email është i regjistruar tashmë. Provo të hysh.' };
    }
    const account: StoredAccount = {
      id: 'u_' + generateId(),
      name: cleanName,
      email: cleanEmail,
      provider: 'email',
      joinedAt: new Date().toISOString(),
      passHash: hashPassword(password, cleanEmail),
    };
    persistSession([...accounts, account], account);
    return { ok: true };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const cleanEmail = normalizeEmail(email);
    if (!isValidEmail(cleanEmail)) return { ok: false, error: 'Email-i nuk duket i saktë.' };
    if (!password) return { ok: false, error: 'Shkruaj fjalëkalimin.' };

    const accounts = await readAccounts();
    const account = accounts.find(a => a.email === cleanEmail);
    if (!account) return { ok: false, error: 'Nuk ka llogari me këtë email. Regjistrohu më parë.' };
    if (account.provider === 'google' && !account.passHash) {
      return { ok: false, error: 'Kjo llogari u krijua me Google. Përdor "Vazhdo me Google".' };
    }
    if (account.passHash !== hashPassword(password, cleanEmail)) {
      return { ok: false, error: 'Email ose fjalëkalim i gabuar.' };
    }
    persistSession(accounts, account);
    return { ok: true };
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    let profile: GoogleProfile;
    const real = isGoogleReal();
    try {
      profile = real ? await googleSignInWeb() : googleDemoProfile();
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Hyrja me Google dështoi.' };
    }

    const accounts = await readAccounts();
    let account = accounts.find(
      a => a.email === profile.email || (a.provider === 'google' && a.id === 'g_' + profile.sub)
    );
    let nextAccounts = accounts;
    if (account) {
      // Refresh name/avatar from Google on every sign-in.
      account = { ...account, name: profile.name, avatar: profile.avatar, provider: 'google' };
      nextAccounts = accounts.map(a => (a.id === account!.id ? account! : a));
    } else {
      account = {
        id: 'g_' + profile.sub,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        provider: 'google',
        joinedAt: new Date().toISOString(),
      };
      nextAccounts = [...accounts, account];
    }
    persistSession(nextAccounts, account);
    return { ok: true, demo: !real };
  }, []);

  const logout = useCallback(() => {
    AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, googleIsReal: isGoogleReal(), register, login, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
