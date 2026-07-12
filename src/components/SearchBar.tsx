import React, { useRef, useCallback, useEffect } from 'react';
import { TextInput, StyleSheet, Pressable, Keyboard, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';
import { SPACING, RADIUS, TOUCH_TARGET, ICON_SIZE, TYPOGRAPHY } from '../constants';

interface SearchBarProps {
  title: string;
  query: string;
  onQueryChange: (q: string) => void;
  placeholder: string;
  isVisible: boolean;
  onToggle: () => void;
}

export const SearchBar = React.memo(function SearchBar({ title, query, onQueryChange, placeholder, isVisible, onToggle }: SearchBarProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const inputRef = useRef<TextInput>(null);
  const expandProgress = useSharedValue(0);

  useEffect(() => {
    expandProgress.value = withTiming(isVisible ? 1 : 0, {
      duration: 150,
    });
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => inputRef.current?.focus(), 180);
      return () => clearTimeout(timer);
    } else {
      Keyboard.dismiss();
    }
  }, [isVisible]);

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isVisible) {
      onQueryChange('');
    }
    onToggle();
  }, [isVisible, onQueryChange, onToggle]);

  const expandedStyle = useAnimatedStyle(() => ({
    height: interpolate(expandProgress.value, [0, 1], [0, TOUCH_TARGET + SPACING.sm], Extrapolation.CLAMP),
    opacity: interpolate(expandProgress.value, [0, 0.3], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: c.onBackground }]}>{title}</Text>
        <Pressable
          onPress={handleToggle}
          accessibilityRole="button"
          accessibilityLabel={isVisible ? 'Close search' : 'Open search'}
          android_ripple={{ color: c.onBackground + '14' }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.iconBtn,
            { backgroundColor: pressed ? c.onBackground + '0D' : c.surfaceContainer },
          ]}
        >
          <Ionicons name={isVisible ? 'close' : 'search'} size={ICON_SIZE.md} color={c.onSurfaceVariant} />
        </Pressable>
      </View>

      <Animated.View style={[styles.expandedWrap, expandedStyle]}>
        <View style={[styles.expandedBar, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}>
          <Ionicons name="search" size={ICON_SIZE.md} color={c.disabled} />
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: c.onBackground }]}
            value={query}
            onChangeText={onQueryChange}
            placeholder={placeholder}
            placeholderTextColor={c.disabled}
            returnKeyType="search"
            accessibilityLabel={placeholder}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => onQueryChange('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              android_ripple={{ color: c.onBackground + '14', borderless: true }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons name="close-circle" size={ICON_SIZE.md} color={c.disabled} />
            </Pressable>
          )}
        </View>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.title,
  },
  iconBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedWrap: {
    overflow: 'hidden',
  },
  expandedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TOUCH_TARGET,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
  },
});
