import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, Palette } from '../constants/colors';

type Scheme = 'light' | 'dark';

interface ThemeContextType {
  scheme: Scheme;
  colors: Palette;
  isDark: boolean;
  toggleTheme: () => void;
  setScheme: (scheme: Scheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = 'shitje.theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default theme is light/white.
  const [scheme, setSchemeState] = useState<Scheme>('light');

  // Restore the saved choice on launch.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(v => {
        if (v === 'dark' || v === 'light') setSchemeState(v);
      })
      .catch(() => {});
  }, []);

  const persist = (next: Scheme) => {
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const setScheme = useCallback((next: Scheme) => {
    setSchemeState(next);
    persist(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setSchemeState(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      persist(next);
      return next;
    });
  }, []);

  const colors = scheme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ scheme, colors, isDark: scheme === 'dark', toggleTheme, setScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/** Convenience hook returning just the active palette. */
export function useColors(): Palette {
  return useTheme().colors;
}
