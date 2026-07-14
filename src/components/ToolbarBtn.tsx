import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { ICON_SIZE, RADIUS } from '../constants';

const BTN_SIZE = 32;

interface ToolbarBtnProps {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
  isActive?: boolean;
}

export function ToolbarBtn({ icon, label, color, onPress, isActive = false }: ToolbarBtnProps) {
  const { theme } = useTheme();
  const c = theme.color;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [
        styles.actionBtn,
        {
          backgroundColor: pressed ? c.surfaceContainerHigh : isActive ? c.primary + '18' : c.surfaceContainer,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Ionicons name={icon as any} size={ICON_SIZE.sm} color={isActive ? c.primary : color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
  },
});
