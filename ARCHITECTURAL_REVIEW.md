# Architectural Review — Bottom Sheet Bug Investigation

## 1. Root Application — `app/_layout.tsx`

```tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSettingsStore } from '../src/stores/settingsStore';
import { usePromptStore } from '../src/stores/promptStore';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { useTheme } from '../src/theme/useTheme';
import { getThemeTokens } from '../src/theme';

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { loadPrompts } = usePromptStore();
  const { settings, loadSettings } = useSettingsStore();
  const { theme, mode } = useTheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await loadSettings();
        await loadPrompts();
      } catch (e) {
        console.warn('Init error:', e);
      }
      setReady(true);
      try {
        await SplashScreen.hideAsync();
      } catch {}
    }
    init();
  }, []);

  // Sync system bars to theme
  useEffect(() => {
    if (!ready) return;
    SystemUI.setBackgroundColorAsync(theme.color.surface);
  }, [ready, theme.color.surface]);

  if (!ready) {
    const fallback = getThemeTokens(settings.theme);
    return (
      <View style={{ flex: 1, backgroundColor: fallback.color.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={fallback.color.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.color.background }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.color.background },
          animation: 'simple_push',
        }}
      />
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
```

---

## 2. Navigation — `app/(tabs)/_layout.tsx`

```tsx
import React, { useCallback, useMemo, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { PillTabBar, Tab } from '../../src/components/PillTabBar';
import { usePromptStore } from '../../src/stores/promptStore';
import { useTheme } from '../../src/theme/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, ICON_SIZE } from '../../src/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 20, stiffness: 250, mass: 0.8 };

const TABS: Tab[] = [
  { key: 'index', label: 'Prompts', icon: 'document-text-outline', iconFocused: 'document-text' },
  { key: 'templates', label: 'Templates', icon: 'library-outline', iconFocused: 'library' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline', iconFocused: 'settings-sharp' },
];

function CreatePromptFAB({ onPress, bottom }: { onPress: () => void; bottom: number }) {
  const { theme } = useTheme();
  const c = theme.color;
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.9, { duration: 80 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel="Create new prompt"
      style={[styles.fab, { backgroundColor: c.primary, bottom , borderColor: c.border }, animatedStyle]}
    >
      <Ionicons name="add" size={ICON_SIZE.xl} color={c.onPrimary} />
    </AnimatedPressable>
  );
}

export default function TabsLayout() {
  const router = useRouter();
  const { addPrompt, selectPrompt } = usePromptStore();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('index');
  const activeIndex = useSharedValue(0);

  const fabBottom = useMemo(
    () => insets.bottom + 72 + SPACING.md,
    [insets.bottom]
  );

  const handleCreate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const id = addPrompt();
    selectPrompt(id);
    router.push(`/editor?id=${id}`);
  }, [addPrompt, selectPrompt, router]);

  const handleSwipeNavigate = useCallback(
    (key: string) => {
      router.navigate(`/(tabs)/${key}`);
    },
    [router]
  );

  const renderTabBar = useCallback(
    (props: any) => {
      const activeKey = props.state.routes[props.state.index].name;
      return (
        <PillTabBar
          tabs={TABS}
          activeTab={activeKey}
          onTabPress={(key) => {
            const route = props.state.routes.find((r: any) => r.name === key);
            if (route) props.navigation.navigate(route.name);
          }}
          activeIndex={activeIndex}
          onSwipeNavigate={handleSwipeNavigate}
        />
      );
    },
    [handleSwipeNavigate]
  );

  return (
    <>
      <Tabs
        tabBar={renderTabBar}
        screenOptions={{
          headerShown: false,
          swipeEnabled: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Prompts' }}
          listeners={{
            focus: () => {
              setActiveTab('index');
              activeIndex.value = withSpring(0, SPRING);
            },
          }}
        />
        <Tabs.Screen
          name="templates"
          options={{ title: 'Templates' }}
          listeners={{
            focus: () => {
              setActiveTab('templates');
              activeIndex.value = withSpring(1, SPRING);
            },
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{ title: 'Settings' }}
          listeners={{
            focus: () => {
              setActiveTab('settings');
              activeIndex.value = withSpring(2, SPRING);
            },
          }}
        />
      </Tabs>

      {activeTab === 'index' && (
        <CreatePromptFAB onPress={handleCreate} bottom={fabBottom} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    borderWidth: 1,
  },
});
```

---

## 3. GestureHandlerRootView

**Created in**: `app/_layout.tsx` (line 54)

```tsx
<GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.color.background }}>
```

There is exactly **one** `GestureHandlerRootView` in the entire project, at the root.

---

## 4. SafeAreaProvider

**Not explicitly created.** The project uses `SafeAreaView` from `react-native-safe-area-context` in individual screens (e.g., `app/(tabs)/index.tsx`, `app/(tabs)/templates.tsx`, `app/(tabs)/settings.tsx`, `app/editor.tsx`, `app/categories.tsx`). There is no `SafeAreaProvider` component rendered at the root. Expo Router / React Navigation provides this implicitly.

---

## 5. Portal

**None found.** No `Portal`, `Portal.Host`, `PortalProvider`, `react-native-paper`, or `react-native-portalize` exists in the project.

---

## 6. Bottom Sheet / Modal / Dialog / Sheet / Overlay / Preview Files

| File | Lines | Description |
|------|-------|-------------|
| `src/components/BottomSheet.tsx` | 206 | Core gesture-driven bottom sheet |
| `src/components/PromptPreviewSheet.tsx` | 368 | Prompt preview composing BottomSheet + MarkdownRenderer |
| `src/components/TemplatePreviewSheet.tsx` | 167 | Template preview composing BottomSheet + MarkdownRenderer |
| `src/components/ContextMenu.tsx` | 360 | Long-press context menu (uses native Modal slide) |
| `src/components/TemplateContextMenu.tsx` | 183 | Template long-press menu (uses native Modal slide) |
| `src/components/VersionHistoryModal.tsx` | 313 | Version history (uses native Modal slide) |
| `src/components/ColorPickerModal.tsx` | 198 | Color picker (uses native Modal slide) |
| `src/components/MarkdownRenderer.tsx` | 454 | Custom markdown parser/renderer |

---

## 7. BackHandler / hardwareBackPress / onRequestClose / router.back

| File | Line(s) | Usage |
|------|---------|-------|
| `src/components/BottomSheet.tsx` | 78-84 | `BackHandler.addEventListener('hardwareBackPress', ...)` |
| `src/components/BottomSheet.tsx` | 126 | `onRequestClose={() => onCloseRef.current()}` on Modal |
| `src/components/PromptPreviewSheet.tsx` | 159 | `onRequestClose={cancelDelete}` on delete confirm Modal |
| `src/components/ContextMenu.tsx` | 63 | `onRequestClose={onClose}` on context menu Modal |
| `src/components/ContextMenu.tsx` | 166 | `onRequestClose={() => setShowDeleteConfirm(false)}` on confirm Modal |
| `src/components/TemplateContextMenu.tsx` | 44 | `onRequestClose={onClose}` on context menu Modal |
| `src/components/VersionHistoryModal.tsx` | 48 | `onRequestClose={onClose}` on version history Modal |
| `src/components/ColorPickerModal.tsx` | 30 | `onRequestClose={onClose}` on color picker Modal |
| `app/(tabs)/index.tsx` | 174-188 | `BackHandler.addEventListener('hardwareBackPress', ...)` for reorder/newCategory state |
| `app/(tabs)/templates.tsx` | 282 | `onRequestClose` on category confirm Modal |
| `app/editor.tsx` | 256 | `router.back()` |
| `app/categories.tsx` | 239 | `router.back()` |

No `beforeRemove` usage found.

---

## 8. React Native Modal

Every file that imports `Modal`:

| File | Import |
|------|--------|
| `src/components/BottomSheet.tsx` | `import { Modal } from 'react-native'` |
| `src/components/PromptPreviewSheet.tsx` | `import { Modal } from 'react-native'` |
| `src/components/ContextMenu.tsx` | `import { Modal } from 'react-native'` |
| `src/components/TemplateContextMenu.tsx` | `import { Modal } from 'react-native'` |
| `src/components/VersionHistoryModal.tsx` | `import { Modal } from 'react-native'` |
| `src/components/ColorPickerModal.tsx` | `import { Modal } from 'react-native'` |
| `app/(tabs)/templates.tsx` | `import { Modal } from 'react-native'` |

---

## 9. Reanimated

Files using `useSharedValue`, `withSpring`, `withTiming`, `runOnJS`, `GestureDetector`, Pan Gesture:

| File | Features Used |
|------|---------------|
| `src/components/BottomSheet.tsx` | `useSharedValue`, `useAnimatedStyle`, `withSpring`, `withTiming`, `runOnJS`, `Gesture.Pan`, `GestureDetector` |
| `app/(tabs)/_layout.tsx` | `useSharedValue`, `useAnimatedStyle`, `withSpring`, `withTiming`, `Animated.createAnimatedComponent` |

---

## 10. Providers

| Provider | Location | Scope |
|----------|----------|-------|
| `ThemeProvider` | `app/_layout.tsx` line 69 | Wraps entire app |
| `GestureHandlerRootView` | `app/_layout.tsx` line 54 | Wraps everything inside ThemeProvider |

There is **no** `SafeAreaProvider` (Expo Router provides it implicitly), **no** Portal provider, **no** Redux/Zustand provider (Zustand stores are used directly via hooks), **no** `NavigationContainer` (Expo Router handles this internally).

---

## 11. Package Information — `package.json`

```json
{
  "name": "prompt-forge",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "dependencies": {
    "@expo/vector-icons": "^14.0.0",
    "@react-native-async-storage/async-storage": "1.23.1",
    "expo": "~52.0.0",
    "expo-asset": "~11.0.5",
    "expo-clipboard": "~6.0.0",
    "expo-constants": "~17.0.0",
    "expo-font": "~13.0.0",
    "expo-haptics": "~14.0.0",
    "expo-linking": "~7.0.0",
    "expo-router": "~4.0.0",
    "expo-splash-screen": "~0.29.0",
    "expo-status-bar": "~2.0.0",
    "expo-system-ui": "~4.0.0",
    "react": "18.3.1",
    "react-native": "0.76.7",
    "react-native-draggable-flatlist": "^4.0.3",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-reanimated": "~3.16.1",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "~18.3.0",
    "babel-preset-expo": "~12.0.0",
    "typescript": "~5.3.0"
  }
}
```

**Key versions:**
- `react-native`: `0.76.7`
- `expo`: `~52.0.0`
- `expo-router`: `~4.0.0`
- `react-native-reanimated`: `~3.16.1`
- `react-native-gesture-handler`: `~2.20.2`
- `react-native-safe-area-context`: `4.12.0`
- `react-native-screens`: `~4.4.0`
- `react-native-paper`: **not installed**
- `@gorhom/bottom-sheet`: **not installed**
- `react-native-portalize`: **not installed**
