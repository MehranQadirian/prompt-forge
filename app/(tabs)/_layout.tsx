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
  Easing,
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
    scale.value = withTiming(0.9, { duration: 8 });
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
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Prompts' }}
          listeners={{
            focus: () => {
              setActiveTab('index');
              activeIndex.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) });
            },
          }}
        />
        <Tabs.Screen
          name="templates"
          options={{ title: 'Templates' }}
          listeners={{
            focus: () => {
              setActiveTab('templates');
              activeIndex.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
            },
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{ title: 'Settings' }}
          listeners={{
            focus: () => {
              setActiveTab('settings');
              activeIndex.value = withTiming(2, { duration: 200, easing: Easing.out(Easing.cubic) });
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
    right: SPACING.xl - 4,
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    borderWidth: 1,
  },
});
