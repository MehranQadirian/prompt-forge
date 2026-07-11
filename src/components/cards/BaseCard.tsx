import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

interface BaseCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
}

export function BaseCard({
  children,
  onPress,
  onLongPress,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  style,
}: BaseCardProps) {
  const { theme } = useTheme();
  const c = theme.color;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      disabled={disabled}
      android_ripple={{ color: c.onBackground + '14' }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? c.onBackground + '08' : c.surfaceContainer,
          borderColor: c.outlineVariant,
          opacity: pressed ? 0.98 : 1,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = {
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  } as ViewStyle,
  disabled: {
    opacity: 0.5,
  } as ViewStyle,
};
