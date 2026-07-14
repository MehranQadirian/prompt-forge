import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { ICON_SIZE, RADIUS } from '../constants';

const BTN_SIZE = 32;

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
      hitSlop={8}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? c.surfaceContainerHigh : isEnhancing ? c.primary + '18' : c.surfaceContainer,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {isEnhancing ? (
        <ActivityIndicator size="small" color={c.primary} />
      ) : (
        <Ionicons name="sparkles" size={ICON_SIZE.sm} color={c.primary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
  },
});
