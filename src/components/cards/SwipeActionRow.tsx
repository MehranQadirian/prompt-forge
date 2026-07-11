import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SwipeAction } from '../../types';
import { useTheme } from '../../theme/useTheme';
import { ICON_SIZE, TYPOGRAPHY, SPACING, RADIUS } from '../../constants';
import { hapticLight } from '../../constants/haptics';

const ACTION_ICONS: Record<SwipeAction, string> = {
  edit: 'pencil',
  duplicate: 'copy',
  pin: 'pin',
  favorite: 'star',
  delete: 'trash',
  none: 'close',
};

const ACTION_LABELS: Record<SwipeAction, string> = {
  edit: 'Edit',
  duplicate: 'Duplicate',
  pin: 'Pin',
  favorite: 'Favorite',
  delete: 'Delete',
  none: '',
};

export const ACTION_WIDTH = 72;

interface SwipeActionRowProps {
  action: SwipeAction;
  side: 'left' | 'right';
  animatedStyle: any;
  progress: SharedValue<number>;
  onPress: () => void;
}

export function SwipeActionRow({ action, side, animatedStyle, progress, onPress }: SwipeActionRowProps) {
  const { theme } = useTheme();
  const c = theme.color;

  if (action === 'none') return null;

  const icon = ACTION_ICONS[action];
  const label = ACTION_LABELS[action];
  const color = action === 'delete' ? c.error : c.primary;

  const handlePress = () => {
    hapticLight();
    onPress();
  };

  const radiusStyle = useAnimatedStyle(() => {
    const p = progress.value;
    if (side === 'left') {
      // Left side: left corners stay rounded, right corners sharpen as action reveals
      return {
        borderTopRightRadius: interpolate(p, [0, 1], [RADIUS.lg, 0], Extrapolation.CLAMP),
        borderBottomRightRadius: interpolate(p, [0, 1], [RADIUS.lg, 0], Extrapolation.CLAMP),
      };
    } else {
      // Right side: right corners stay rounded, left corners sharpen as action reveals
      return {
        borderTopLeftRadius: interpolate(p, [0, 1], [RADIUS.lg, 0], Extrapolation.CLAMP),
        borderBottomLeftRadius: interpolate(p, [0, 1], [RADIUS.lg, 0], Extrapolation.CLAMP),
      };
    }
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: color,
          [side]: 0,
        },
        radiusStyle,
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={8}
      >
        <Ionicons name={icon as any} size={ICON_SIZE.md} color={c.onPrimary} />
        <Text style={[styles.label, { color: c.onPrimary }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.small.fontSize,
    fontWeight: '600',
  },
});
