import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/useTheme';
import { SPACING, RADIUS, TOUCH_TARGET, TYPOGRAPHY } from '../constants';

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export function FilterChip({ label, isSelected, onPress }: FilterChipProps) {
  const { theme } = useTheme();
  const c = theme.color;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${label} category${isSelected ? ', selected' : ''}`}
      accessibilityState={{ selected: isSelected }}
      android_ripple={{ color: c.onBackground + '14' }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: isSelected ? c.primary : c.surfaceContainer,
          borderColor: isSelected ? c.primary : c.outlineVariant,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: isSelected ? c.background : c.onSurfaceVariant },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: TOUCH_TARGET,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...TYPOGRAPHY.captionMedium,
  },
});
