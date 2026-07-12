import React, { useCallback, useMemo, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Keyboard, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';
import { SPACING, RADIUS, ICON_SIZE, TYPOGRAPHY, TOUCH_TARGET } from '../constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 20, stiffness: 250, mass: 0.8 };

export interface Tab {
  key: string;
  label: string;
  icon: string;
  iconFocused: string;
  badge?: number;
}

interface PillTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (key: string) => void;
  activeIndex: SharedValue<number>;
  onSwipeNavigate?: (key: string) => void;
}

function PillTabItem({
  tab,
  isActive,
  onPress,
  index,
  activeIndex,
  tabWidth,
}: {
  tab: Tab;
  isActive: boolean;
  onPress: () => void;
  index: number;
  activeIndex: SharedValue<number>;
  tabWidth: number;
}) {
  const { theme } = useTheme();
  const c = theme.color;

  const iconStyle = useAnimatedStyle(() => {
    const dist = Math.abs(activeIndex.value - index);
    const scale = interpolate(dist, [0, 1], [1.1, 1], Extrapolation.CLAMP);
    return { transform: [{ scale }] };
  });

  const pressedOpacity = useSharedValue(1);
  const pressedBg = useSharedValue(0);

  const handlePressIn = useCallback(() => {
    pressedOpacity.value = withTiming(0.85, { duration: 120 });
    pressedBg.value = withTiming(1, { duration: 120 });
  }, []);

  const handlePressOut = useCallback(() => {
    pressedOpacity.value = withTiming(1, { duration: 120 });
    pressedBg.value = withTiming(0, { duration: 120 });
  }, []);

  const pressStyle = useAnimatedStyle(() => ({
    opacity: pressedOpacity.value,
    backgroundColor: pressedBg.value === 1 ? c.onBackground + '08' : 'transparent',
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={tab.badge ? `${tab.label}, ${tab.badge} unread` : tab.label}
      accessibilityHint={`Switch to ${tab.label} tab`}
      accessibilityState={{ selected: isActive }}
      style={[styles.tabItem, { width: tabWidth, borderRadius: RADIUS.md }]}
    >
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <Ionicons
          name={(isActive ? tab.iconFocused : tab.icon) as any}
          size={ICON_SIZE.lg}
          color={isActive ? c.primary : c.onSurfaceVariant}
        />
        {tab.badge !== undefined && tab.badge > 0 && (
          <View style={[styles.badge, { backgroundColor: c.error }]}>
            <Text style={[styles.badgeText, { color: c.onPrimary }]}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
          </View>
        )}
      </Animated.View>

      <Text
        style={[styles.tabLabel, { color: isActive ? c.primary : c.onSurfaceVariant }]}
        numberOfLines={1}
      >
        {tab.label}
      </Text>
    </AnimatedPressable>
  );
}

export function PillTabBar({ tabs, activeTab, onTabPress, activeIndex }: PillTabBarProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const activeTabIndex = Math.max(0, tabs.findIndex((t) => t.key === activeTab));

  const barPadding = SPACING.sm;
  const barWidth = screenWidth - SPACING.lg * 2;
  const tabWidth = (barWidth - barPadding * 2) / tabs.length;

  const translateY = useSharedValue(0);
  const barOpacity = useSharedValue(1);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      translateY.value = withTiming(100, { duration: 200 });
      barOpacity.value = withTiming(0, { duration: 150 });
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      translateY.value = withSpring(0, SPRING);
      barOpacity.value = withTiming(1, { duration: 200 });
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  const pillX = useDerivedValue(() => {
    return barPadding + activeIndex.value * tabWidth;
  });

  const barContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: barOpacity.value,
  }));

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: tabWidth,
  }));

  return (
    <Animated.View style={[styles.container, { paddingBottom: insets.bottom + SPACING.md }, barContainerStyle]}>
      <View style={[styles.bar, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}>
        <Animated.View
          style={[styles.pill, { backgroundColor: c.surfaceContainerHigh }, pillStyle]}
        />

        {tabs.map((tab, index) => (
          <PillTabItem
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onPress={() => onTabPress(tab.key)}
            index={index}
            activeIndex={activeIndex}
            tabWidth={tabWidth}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9998,
    paddingHorizontal: SPACING.lg,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    padding: SPACING.sm,
    position: 'relative',
    borderWidth: 1,
  },
  pill: {
    position: 'absolute',
    top: SPACING.sm,
    bottom: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    zIndex: 1,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
    marginBottom: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  tabLabel: {
    ...TYPOGRAPHY.smallSemibold,
  },
});
