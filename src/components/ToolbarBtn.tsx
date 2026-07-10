import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { TOUCH_TARGET, ICON_SIZE } from '../constants';

interface ToolbarBtnProps {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

export function ToolbarBtn({ icon, label, color, onPress }: ToolbarBtnProps) {
  const { theme } = useTheme();
  const c = theme.color;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{ color: color + '14', borderless: true }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.actionBtn,
        { backgroundColor: pressed ? color + '0D' : c.surfaceContainer },
      ]}
    >
      <Ionicons name={icon as any} size={ICON_SIZE.md} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
