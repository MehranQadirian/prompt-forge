import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeVariant, ThemeTokens, ThemeMode } from '../types';
import { getThemeTokens, darkThemeVariants, lightThemeVariants } from './tokens';
import { STORAGE_KEYS } from '../constants';

interface ThemeContextValue {
  theme: ThemeTokens;
  themeVariant: ThemeVariant;
  mode: ThemeMode;
  followSystem: boolean;
  setTheme: (variant: ThemeVariant) => void;
  setFollowSystem: (follow: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getDefaultVariant(scheme: string | null | undefined): ThemeVariant {
  return scheme === 'light' ? 'paper' : 'forest';
}

function getModeForVariant(variant: ThemeVariant): ThemeMode {
  return darkThemeVariants.includes(variant) ? 'dark' : 'light';
}

function getOppositeModeVariant(variant: ThemeVariant, targetMode: ThemeMode): ThemeVariant {
  const currentMode = getModeForVariant(variant);
  if (currentMode === targetMode) return variant;
  // Find the same-named variant in the other mode
  const candidates = targetMode === 'dark' ? darkThemeVariants : lightThemeVariants;
  return candidates[0]; // fallback to first in target mode
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('forest');
  const [followSystem, setFollowSystemState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load saved settings
  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.theme) setThemeVariant(parsed.theme);
          if (typeof parsed.followSystem === 'boolean') setFollowSystemState(parsed.followSystem);
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  // Follow system mode
  useEffect(() => {
    if (!followSystem || !loaded) return;
    const targetMode: ThemeMode = systemScheme === 'light' ? 'light' : 'dark';
    const currentMode = getModeForVariant(themeVariant);
    if (currentMode !== targetMode) {
      const newVariant = getOppositeModeVariant(themeVariant, targetMode);
      setThemeVariant(newVariant);
      persistTheme(newVariant, followSystem);
    }
  }, [systemScheme, followSystem, loaded]);

  const persistTheme = useCallback(async (variant: ThemeVariant, follow: boolean) => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      const parsed = data ? JSON.parse(data) : {};
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...parsed,
        theme: variant,
        followSystem: follow,
      }));
    } catch {}
  }, []);

  const setTheme = useCallback((variant: ThemeVariant) => {
    setThemeVariant(variant);
    persistTheme(variant, followSystem);
  }, [followSystem, persistTheme]);

  const setFollowSystem = useCallback((follow: boolean) => {
    setFollowSystemState(follow);
    if (follow && systemScheme) {
      const targetMode: ThemeMode = systemScheme === 'light' ? 'light' : 'dark';
      const currentMode = getModeForVariant(themeVariant);
      if (currentMode !== targetMode) {
        const newVariant = getOppositeModeVariant(themeVariant, targetMode);
        setThemeVariant(newVariant);
        persistTheme(newVariant, follow);
        return;
      }
    }
    persistTheme(themeVariant, follow);
  }, [themeVariant, systemScheme, persistTheme]);

  const theme = useMemo(() => getThemeTokens(themeVariant), [themeVariant]);
  const mode = getModeForVariant(themeVariant);

  const value = useMemo(() => ({
    theme,
    themeVariant,
    mode,
    followSystem,
    setTheme,
    setFollowSystem,
  }), [theme, themeVariant, mode, followSystem, setTheme, setFollowSystem]);

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
      followSystem: false,
      setTheme: () => {},
      setFollowSystem: () => {},
    };
  }
  return ctx;
}
