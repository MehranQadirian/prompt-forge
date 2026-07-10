import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { TOUCH_TARGET, SPACING, RADIUS, ICON_SIZE } from '../constants';

interface UndoRedoBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function UndoRedoBar({ canUndo, canRedo, onUndo, onRedo }: UndoRedoBarProps) {
  const { theme } = useTheme();
  const c = theme.color;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onUndo}
        disabled={!canUndo}
        accessibilityRole="button"
        accessibilityLabel="Undo"
        accessibilityState={{ disabled: !canUndo }}
        android_ripple={{ color: c.onBackground + '14' }}
        hitSlop={8}
        style={({ pressed }) => [
          styles.btn,
          {
            opacity: pressed ? 0.7 : (canUndo ? 1 : 0.38),
            backgroundColor: pressed ? c.onBackground + '0D' : c.surfaceContainer,
          },
        ]}
      >
        <Ionicons name="arrow-undo" size={ICON_SIZE.md} color={c.onSurfaceVariant} />
      </Pressable>
      <Pressable
        onPress={onRedo}
        disabled={!canRedo}
        accessibilityRole="button"
        accessibilityLabel="Redo"
        accessibilityState={{ disabled: !canRedo }}
        android_ripple={{ color: c.onBackground + '14' }}
        hitSlop={8}
        style={({ pressed }) => [
          styles.btn,
          {
            opacity: pressed ? 0.7 : (canRedo ? 1 : 0.38),
            backgroundColor: pressed ? c.onBackground + '0D' : c.surfaceContainer,
          },
        ]}
      >
        <Ionicons name="arrow-redo" size={ICON_SIZE.md} color={c.onSurfaceVariant} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  btn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
