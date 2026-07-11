import React, { useEffect, useMemo, useRef } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';
import { SPACING, RADIUS, TOUCH_TARGET, TYPOGRAPHY } from '../constants';

interface CategoryTagProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  onDragStart?: () => void;
  isReorderMode?: boolean;
}

export function CategoryTag({ name, isSelected, onPress, onLongPress, onDragStart, isReorderMode = false }: CategoryTagProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const rotation = useSharedValue(0);
  const delay = useMemo(() => Math.random() * 150, []);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isReorderMode) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Start animation with random delay for natural feel
      timeoutRef.current = setTimeout(() => {
        rotation.value = withRepeat(
          withSequence(
            withTiming(-3, { duration: 100 }),
            withTiming(3, { duration: 100 }),
          ),
          -1, // infinite
          true
        );
      }, delay);
    } else {
      // Clear timeout and stop animation
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      cancelAnimation(rotation);
      rotation.value = withTiming(0, { duration: 200 });
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isReorderMode, delay, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Use onDragStart if provided, otherwise use onLongPress
  const longPressHandler = onDragStart || onLongPress;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onLongPress={longPressHandler}
        delayLongPress={300}
        accessibilityRole="button"
        accessibilityLabel={`${name} category${isSelected ? ', selected' : ''}`}
        accessibilityState={{ selected: isSelected }}
        android_ripple={{ color: c.onBackground + '14' }}
        hitSlop={8}
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: isSelected ? c.primary : c.surfaceContainer,
            borderColor: isSelected ? c.primary : c.outlineVariant,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text
          style={[styles.name, { color: isSelected ? c.onPrimary : c.onSurfaceVariant }]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  name: {
    ...TYPOGRAPHY.captionMedium,
  },
});
