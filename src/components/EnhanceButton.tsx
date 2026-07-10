import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { TOUCH_TARGET, ICON_SIZE } from '../constants';

interface EnhanceButtonProps {
  isEnhancing: boolean;
  onPress: () => void;
}

export function EnhanceButton({ isEnhancing, onPress }: EnhanceButtonProps) {
  const { theme } = useTheme();
  const c = theme.color;

  return (
    <Pressable
      onPress={onPress}
      disabled={isEnhancing}
      accessibilityRole="button"
      accessibilityLabel={isEnhancing ? 'Enhancing prompt' : 'Enhance prompt'}
      android_ripple={{ color: c.primary + '14', borderless: true }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? c.primary + '0D' : c.surfaceContainer,
        },
      ]}
    >
      {isEnhancing ? (
        <ActivityIndicator size="small" color={c.primary} />
      ) : (
        <Ionicons name="sparkles" size={ICON_SIZE.md} color={c.primary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
