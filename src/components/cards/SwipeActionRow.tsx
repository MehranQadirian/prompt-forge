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
import { ICON_SIZE, TYPOGRAPHY, SPACING, RADIUS, ACTION_COLORS } from '../../constants';
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

function getActionColor(action: SwipeAction, themeColors: Record<string, string>): string {
  const colorValue = ACTION_COLORS[action];
  if (!colorValue) return themeColors.primary;
  // Check if it's a theme color key (like 'primary', 'error')
  if (colorValue === 'primary') return themeColors.primary;
  if (colorValue === 'error') return themeColors.error;
  // Otherwise it's a direct hex color
  return colorValue;
}

export const ACTION_WIDTH = 72;

interface SwipeActionRowProps {
  action: SwipeAction;
  side: 'left' | 'right';
  animatedStyle: any;
  progress: SharedValue<number>;
  onPress: () => void;
}

export const SwipeActionRow = React.memo(function SwipeActionRow({ action, side, animatedStyle, progress, onPress }: SwipeActionRowProps) {
  const { theme } = useTheme();
  const c = theme.color;

  if (action === 'none') return null;

  const icon = ACTION_ICONS[action];
  const label = ACTION_LABELS[action];
  const color = getActionColor(action, c);

  const handlePress = () => {
    hapticLight();
    onPress();
  };

  const radiusStyle = useAnimatedStyle(() => {
    // Keep inner corners always rounded at RADIUS.lg
    if (side === 'left') {
      return {
        borderTopRightRadius: RADIUS.lg,
        borderBottomRightRadius: RADIUS.lg,
      };
    } else {
      return {
        borderTopLeftRadius: RADIUS.lg,
        borderBottomLeftRadius: RADIUS.lg,
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
});

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
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.small.fontSize,
    fontWeight: '600',
  },
});
