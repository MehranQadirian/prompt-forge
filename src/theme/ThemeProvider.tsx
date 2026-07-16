import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeVariant, ThemeTokens, ThemeMode } from '../types';
import { getThemeTokens, darkThemeVariants, lightThemeVariants } from './tokens';
import { STORAGE_KEYS } from '../constants';

interface ThemeContextValue {
  theme: ThemeTokens;
  themeVariant: ThemeVariant;
  mode: ThemeMode;
  setTheme: (variant: ThemeVariant) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getModeForVariant(variant: ThemeVariant): ThemeMode {
  return darkThemeVariants.includes(variant) ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('forest');
  const [loaded, setLoaded] = useState(false);

  // Load saved settings
  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.theme) setThemeVariant(parsed.theme);
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const persistTheme = useCallback(async (variant: ThemeVariant) => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      const parsed = data ? JSON.parse(data) : {};
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...parsed,
        theme: variant,
      }));
    } catch {}
  }, []);

  const setTheme = useCallback((variant: ThemeVariant) => {
    setThemeVariant(variant);
    persistTheme(variant);
  }, [persistTheme]);

  const theme = useMemo(() => getThemeTokens(themeVariant), [themeVariant]);
  const mode = getModeForVariant(themeVariant);

  const value = useMemo(() => ({
    theme,
    themeVariant,
    mode,
    setTheme,
  }), [theme, themeVariant, mode, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback for components used outside provider (shouldn't happen in production)
    const fallback = getThemeTokens('forest');
    return {
      theme: fallback,
      themeVariant: 'forest',
      mode: 'dark',
      setTheme: () => {},
    };
  }
  return ctx;
}
