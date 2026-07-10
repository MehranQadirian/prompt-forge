import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSettingsStore } from '../src/stores/settingsStore';
import { usePromptStore } from '../src/stores/promptStore';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { useTheme } from '../src/theme/useTheme';
import { BottomSheetProvider } from '../src/components/BottomSheetContext';
import SplashOverlay from '../src/components/SplashOverlay';

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const router = useRouter();
  const { loadPrompts } = usePromptStore();
  const { settings, loadSettings } = useSettingsStore();
  const { theme, mode } = useTheme();
  const [ready, setReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const hasRedirected = useRef(false);

  const loadingPromise = useMemo(
    () =>
      Promise.all([loadSettings(), loadPrompts()]).then(() => {}),
    []
  );

  const handleSplashReady = useCallback(() => {
    setReady(true);
    try {
      SplashScreen.hideAsync();
    } catch {}
    SystemUI.setBackgroundColorAsync(theme.color.surface);
    setShowSplash(false);
  }, [theme.color.surface]);

  // Navigation guard: redirect based on hasOnboarded
  useEffect(() => {
    if (!ready || hasRedirected.current) return;
    hasRedirected.current = true;

    // Small delay to ensure Stack is mounted
    const timer = setTimeout(() => {
      if (!settings.hasOnboarded) {
        router.replace('/welcome');
      } else {
        router.replace('/(tabs)');
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [ready, settings.hasOnboarded]);

  // Sync system bars to theme
  useEffect(() => {
    if (!ready) return;
    SystemUI.setBackgroundColorAsync(theme.color.surface);
  }, [ready, theme.color.surface]);

  if (showSplash) {
    return (
      <SplashOverlay loadingPromise={loadingPromise} onReady={handleSplashReady} />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.color.background }}>
      <BottomSheetProvider>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.color.background },
            animation: 'simple_push',
          }}
        />
      </BottomSheetProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
