import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SwipeAction } from '../../types';
import { useSwipeStore } from '../../stores/swipeStore';
import { SwipeActionRow, ACTION_WIDTH } from './SwipeActionRow';
import { RADIUS } from '../../constants';

const SWIPE_THRESHOLD = 10;
const VERTICAL_LOCK = 20;
const SNAP_THRESHOLD = 36;
const VELOCITY_THRESHOLD = 800;
const TAP_DISTANCE_THRESHOLD = 5;
const TAP_VELOCITY_THRESHOLD = 100;

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 300,
  mass: 0.8,
  overshootClamping: true,
};

interface SwipeCardProps {
  children: React.ReactNode;
  cardId: string;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  onLeftAction?: () => void;
  onRightAction?: () => void;
}

export const SwipeCard = React.memo(function SwipeCard({
  children,
  cardId,
  leftAction = 'none',
  rightAction = 'none',
  onLeftAction,
  onRightAction,
}: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const openCardId = useSwipeStore((s) => s.openCardId);
  const setOpenCard = useSwipeStore((s) => s.setOpenCard);
  const clearOpenCard = useSwipeStore((s) => s.clearOpenCard);
  const [cardPointerEvents, setCardPointerEvents] = useState<'auto' | 'box-none'>('auto');

  const hasLeftAction = leftAction !== 'none' && !!onLeftAction;
  const hasRightAction = rightAction !== 'none' && !!onRightAction;

  // Close this card when another card opens
  useEffect(() => {
    if (openCardId !== null && openCardId !== cardId && translateX.value !== 0) {
      translateX.value = withSpring(0, SPRING_CONFIG);
      setCardPointerEvents('auto');
    }
  }, [openCardId, cardId]);

  const handleActionPress = useCallback(
    (side: 'left' | 'right') => {
      const action = side === 'left' ? leftAction : rightAction;
      const handler = side === 'left' ? onLeftAction : onRightAction;
      if (action === 'none' || !handler) return;
      handler();
    },
    [leftAction, rightAction, onLeftAction, onRightAction]
  );

  const clampValue = (value: number, min: number, max: number) => {
    'worklet';
    return Math.min(Math.max(value, min), max);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-SWIPE_THRESHOLD, SWIPE_THRESHOLD])
    .failOffsetY([-VERTICAL_LOCK, VERTICAL_LOCK])
    .onStart(() => {
      'worklet';
      isDragging.value = true;
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      'worklet';
      const newX = startX.value + e.translationX;

      let clampedX = newX;
      if (!hasLeftAction && clampedX > 0) clampedX = 0;
      if (!hasRightAction && clampedX < 0) clampedX = 0;
      clampedX = clampValue(clampedX, -ACTION_WIDTH, ACTION_WIDTH);

      translateX.value = clampedX;
    })
    .onEnd((e) => {
      'worklet';
      isDragging.value = false;
      const velocity = e.velocityX;
      const translation = translateX.value;
      const distance = Math.abs(translation - startX.value);

      // Tap detection: minimal movement and velocity
      const isTap = distance < TAP_DISTANCE_THRESHOLD && Math.abs(velocity) < TAP_VELOCITY_THRESHOLD;

      if (isTap && translation !== 0) {
        // Tap on open card — close it
        translateX.value = withSpring(0, SPRING_CONFIG);
        runOnJS(setCardPointerEvents)('auto');
        runOnJS(clearOpenCard)(cardId);
        return;
      }

      let target = 0;
      let shouldOpen = false;

      if (hasRightAction && (translation < -SNAP_THRESHOLD || velocity < -VELOCITY_THRESHOLD)) {
        target = -ACTION_WIDTH;
        shouldOpen = true;
      } else if (hasLeftAction && (translation > SNAP_THRESHOLD || velocity > VELOCITY_THRESHOLD)) {
        target = ACTION_WIDTH;
        shouldOpen = true;
      }

      translateX.value = withSpring(target, SPRING_CONFIG);

      if (shouldOpen) {
        runOnJS(setCardPointerEvents)('box-none');
        runOnJS(setOpenCard)(cardId);
      } else {
        runOnJS(setCardPointerEvents)('auto');
        runOnJS(clearOpenCard)(cardId);
      }
    });

  // Card animation — translateX
  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      // Keep card corners always rounded
      borderTopLeftRadius: RADIUS.lg,
      borderBottomLeftRadius: RADIUS.lg,
      borderTopRightRadius: RADIUS.lg,
      borderBottomRightRadius: RADIUS.lg,
    };
  });

  // Left action progress: 0 when closed, 1 when fully open (positive translateX)
  const leftProgress = useDerivedValue(() => {
    if (!hasLeftAction) return 0;
    return clampValue(translateX.value / ACTION_WIDTH, 0, 1);
  });

  // Right action progress: 0 when closed, 1 when fully open (negative translateX)
  const rightProgress = useDerivedValue(() => {
    if (!hasRightAction) return 0;
    return clampValue(-translateX.value / ACTION_WIDTH, 0, 1);
  });

  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(leftProgress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateX: interpolate(leftProgress.value, [0, 1], [-ACTION_WIDTH * 0.3, 0], Extrapolation.CLAMP) }],
  }));

  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(rightProgress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateX: interpolate(rightProgress.value, [0, 1], [ACTION_WIDTH * 0.3, 0], Extrapolation.CLAMP) }],
  }));

  return (
    <View style={styles.container}>
      {/* Background action layer — FIXED, never moves */}
      <View style={styles.actionLayer}>
        {hasLeftAction && (
          <SwipeActionRow
            action={leftAction}
            side="left"
            animatedStyle={leftActionStyle}
            progress={leftProgress}
            onPress={() => handleActionPress('left')}
          />
        )}
        {hasRightAction && (
          <SwipeActionRow
            action={rightAction}
            side="right"
            animatedStyle={rightActionStyle}
            progress={rightProgress}
            onPress={() => handleActionPress('right')}
          />
        )}
      </View>

      {/* Foreground card — translates horizontally */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardStyle]} pointerEvents={cardPointerEvents}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  actionLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  card: {
    borderRadius: RADIUS.lg,
  },
});
