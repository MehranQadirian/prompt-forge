import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, View, StyleSheet } from 'react-native';
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

// Release velocity is fed into the spring so the animation continues the
// finger's motion instead of starting from rest. Clamped so a very fast
// flick can't blow past a sane settle time.
const MAX_SPRING_VELOCITY = 1200;

// How far past ACTION_WIDTH the card is allowed to stretch while the finger
// is still down, and how "stiff" that stretch feels. This is the same
// diminishing-returns rubber-band curve iOS uses for scroll bounce — it
// tells the user "you've hit the edge" without a jarring hard stop.
const MAX_OVERDRAG = ACTION_WIDTH * 0.45;
const RUBBER_BAND_COEFFICIENT = 0.55;

/**
 * Motion design notes (why two spring configs instead of one):
 * - Opening reveals new, actionable UI — it should feel immediate and
 *   energetic so the user's eye is drawn to it (higher stiffness, lower mass).
 * - Closing/canceling recedes back to the resting state — it should feel
 *   calm and settled, not jumpy (higher damping, no snappiness needed).
 * This asymmetry is the same reasoning behind Material's "emphasized" vs
 * "standard" motion curves and iOS UIKit's differing enter/exit dynamics.
 */
const OPEN_SPRING_CONFIG = {
  damping: 24,
  stiffness: 380,
  mass: 0.7,
  overshootClamping: true,
};

const CLOSE_SPRING_CONFIG = {
  damping: 30,
  stiffness: 260,
  mass: 0.9,
  overshootClamping: true,
};

// Used for every transition when the OS-level "Reduce Motion" accessibility
// setting is on: no velocity injection, no elastic drag, single gentle curve.
const REDUCED_MOTION_SPRING_CONFIG = {
  damping: 32,
  stiffness: 220,
  mass: 1,
  overshootClamping: true,
};

/** Optional haptic adapter — inject whichever haptics library the app uses
 * (expo-haptics, react-native-haptic-feedback, etc.) without hard-coupling
 * this component to one. Defaults to silent no-ops.
 *
 * Example wiring with expo-haptics:
 *   import * as Haptics from 'expo-haptics';
 *   <SwipeCard
 *     haptics={{
 *       light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
 *       medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
 *     }}
 *   />
 */
export interface HapticAdapter {
  /** Fired once when the drag crosses the open/close threshold. */
  light?: () => void;
  /** Fired once when an open/close state is actually committed on release. */
  medium?: () => void;
}

interface SwipeCardProps {
  children: React.ReactNode;
  cardId: string;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  onLeftAction?: () => void;
  onRightAction?: () => void;
  haptics?: HapticAdapter;
}

export const SwipeCard = React.memo(function SwipeCard({
  children,
  cardId,
  leftAction = 'none',
  rightAction = 'none',
  onLeftAction,
  onRightAction,
  haptics,
}: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const hasFiredThresholdHaptic = useSharedValue(false);
  const reduceMotion = useSharedValue(false);
  // Guards against a double action-fire if the user taps the action button
  // again while the previous "close" spring is still settling.
  const isSettlingAfterAction = useSharedValue(false);

  const openCardId = useSwipeStore((s) => s.openCardId);
  const setOpenCard = useSwipeStore((s) => s.setOpenCard);
  const clearOpenCard = useSwipeStore((s) => s.clearOpenCard);
  const [childrenPointerEvents, setChildrenPointerEvents] = useState<'auto' | 'none'>('auto');

  const hasLeftAction = leftAction !== 'none' && !!onLeftAction;
  const hasRightAction = rightAction !== 'none' && !!onRightAction;

  // Haptics are stored in a ref so the memoized gesture below never has to
  // be rebuilt just because the parent passed a new adapter object.
  const hapticsRef = useRef(haptics);
  useEffect(() => {
    hapticsRef.current = haptics;
  }, [haptics]);

  const triggerLightHaptic = useCallback(() => {
    hapticsRef.current?.light?.();
  }, []);
  const triggerMediumHaptic = useCallback(() => {
    hapticsRef.current?.medium?.();
  }, []);

  // Respect the OS-level Reduce Motion setting: disable bounce/overshoot and
  // elastic drag for users who've asked the system for calmer motion.
  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) reduceMotion.value = enabled;
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      reduceMotion.value = enabled;
    });
    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  // Close this card when another card opens.
  // Guarded by isDragging so we never fight an in-progress gesture on this card.
  useEffect(() => {
    if (
      openCardId !== null &&
      openCardId !== cardId &&
      translateX.value !== 0 &&
      !isDragging.value
    ) {
      translateX.value = withSpring(
        0,
        reduceMotion.value ? REDUCED_MOTION_SPRING_CONFIG : CLOSE_SPRING_CONFIG
      );
      setChildrenPointerEvents('auto');
    }
  }, [openCardId, cardId]);

  const handleActionPress = useCallback(
    (side: 'left' | 'right') => {
      if (isSettlingAfterAction.value) return;

      const action = side === 'left' ? leftAction : rightAction;
      const handler = side === 'left' ? onLeftAction : onRightAction;
      if (action === 'none' || !handler) return;

      handler();
      isSettlingAfterAction.value = true;
      translateX.value = withSpring(
        0,
        reduceMotion.value ? REDUCED_MOTION_SPRING_CONFIG : CLOSE_SPRING_CONFIG,
        (finished) => {
          'worklet';
          if (finished) isSettlingAfterAction.value = false;
        }
      );
      setChildrenPointerEvents('auto');
      clearOpenCard(cardId);
    },
    [leftAction, rightAction, onLeftAction, onRightAction, cardId]
  );

  const clampValue = (value: number, min: number, max: number) => {
    'worklet';
    return Math.min(Math.max(value, min), max);
  };

  // Diminishing-returns rubber band: the further past the limit you drag,
  // the less additional visual travel you get, asymptotically approaching
  // `limit + dim`. Communicates a physical boundary without a hard stop.
  const rubberBand = (overflow: number, dim: number, coefficient: number) => {
    'worklet';
    return (1 - 1 / ((overflow * coefficient) / dim + 1)) * dim;
  };

  // Memoized so the gesture recognizer isn't rebuilt on every unrelated re-render
  // (important in long lists where SwipeCard instances re-render often).
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-SWIPE_THRESHOLD, SWIPE_THRESHOLD])
        .failOffsetY([-VERTICAL_LOCK, VERTICAL_LOCK])
        .onStart(() => {
          'worklet';
          isDragging.value = true;
          startX.value = translateX.value;
          hasFiredThresholdHaptic.value = false;
        })
        .onUpdate((e) => {
          'worklet';
          const newX = startX.value + e.translationX;

          let clampedX = newX;
          if (!hasLeftAction && clampedX > 0) clampedX = 0;
          if (!hasRightAction && clampedX < 0) clampedX = 0;

          if (reduceMotion.value) {
            clampedX = clampValue(clampedX, -ACTION_WIDTH, ACTION_WIDTH);
          } else if (clampedX > ACTION_WIDTH) {
            const overflow = clampedX - ACTION_WIDTH;
            clampedX = ACTION_WIDTH + rubberBand(overflow, MAX_OVERDRAG, RUBBER_BAND_COEFFICIENT);
          } else if (clampedX < -ACTION_WIDTH) {
            const overflow = -clampedX - ACTION_WIDTH;
            clampedX = -(ACTION_WIDTH + rubberBand(overflow, MAX_OVERDRAG, RUBBER_BAND_COEFFICIENT));
          }

          // One tick exactly when crossing the commit threshold — and it can
          // re-fire if the user drags back and forth over the line, the same
          // discoverable feedback pattern used by Mail/Gmail's swipe actions.
          const pastThreshold =
            (hasRightAction && clampedX < -SNAP_THRESHOLD) ||
            (hasLeftAction && clampedX > SNAP_THRESHOLD);

          if (pastThreshold && !hasFiredThresholdHaptic.value) {
            hasFiredThresholdHaptic.value = true;
            runOnJS(triggerLightHaptic)();
          } else if (!pastThreshold && hasFiredThresholdHaptic.value) {
            hasFiredThresholdHaptic.value = false;
          }

          translateX.value = clampedX;
        })
        .onEnd((e) => {
          'worklet';
          isDragging.value = false;

          // IMPORTANT: use the raw gesture translation for tap detection, not
          // the clamped translateX value. When the card is already open,
          // translateX is pinned near ACTION_WIDTH, so comparing against it
          // would always read a "distance" of 0 and misclassify real drags
          // as taps.
          const rawDistance = Math.abs(e.translationX);
          const rawVelocity = e.velocityX;
          const isTap = rawDistance < TAP_DISTANCE_THRESHOLD && Math.abs(rawVelocity) < TAP_VELOCITY_THRESHOLD;
          const velocity = clampValue(rawVelocity, -MAX_SPRING_VELOCITY, MAX_SPRING_VELOCITY);

          if (isTap) {
            if (translateX.value !== 0) {
              translateX.value = withSpring(
                0,
                reduceMotion.value ? REDUCED_MOTION_SPRING_CONFIG : CLOSE_SPRING_CONFIG
              );
              runOnJS(setChildrenPointerEvents)('auto');
              runOnJS(clearOpenCard)(cardId);
            }
            return;
          }

          // Decide target purely from current position + velocity. This lets a
          // single continuous drag move directly from "open left" to "open right"
          // (or vice versa) instead of forcing a close-then-reopen.
          const current = translateX.value;
          let target = 0;
          let shouldOpen = false;

          if (hasRightAction && (current < -SNAP_THRESHOLD || rawVelocity < -VELOCITY_THRESHOLD)) {
            target = -ACTION_WIDTH;
            shouldOpen = true;
          } else if (hasLeftAction && (current > SNAP_THRESHOLD || rawVelocity > VELOCITY_THRESHOLD)) {
            target = ACTION_WIDTH;
            shouldOpen = true;
          }

          const baseConfig = reduceMotion.value
            ? REDUCED_MOTION_SPRING_CONFIG
            : shouldOpen
            ? OPEN_SPRING_CONFIG
            : CLOSE_SPRING_CONFIG;

          translateX.value = withSpring(target, {
            ...baseConfig,
            velocity: reduceMotion.value ? 0 : velocity,
          });

          if (shouldOpen) {
            runOnJS(setChildrenPointerEvents)('none');
            runOnJS(setOpenCard)(cardId);
            runOnJS(triggerMediumHaptic)();
          } else {
            runOnJS(setChildrenPointerEvents)('auto');
            runOnJS(clearOpenCard)(cardId);
          }
        }),
    [hasLeftAction, hasRightAction, cardId, setOpenCard, clearOpenCard, triggerLightHaptic, triggerMediumHaptic]
  );

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

  // Layered reveal: opacity resolves early (by ~50% of the drag) so the
  // action reads as "available" well before the gesture completes — the
  // user shouldn't have to fully commit to see what's underneath. Position
  // uses an ease-out curve (fast start, slow settle) which reads as the
  // element "arriving," and a small overshoot scale bump lands right at
  // full reveal as a tactile confirmation that the action is now armed.
  // All of this is progress-driven (tied 1:1 to the drag), so it stays
  // perfectly responsive during the gesture itself; only the release uses
  // an actual spring.
  const leftActionStyle = useAnimatedStyle(() => {
    const p = leftProgress.value;
    if (reduceMotion.value) {
      return {
        opacity: interpolate(p, [0, 0.5], [0, 1], Extrapolation.CLAMP),
        transform: [{ translateX: interpolate(p, [0, 1], [-ACTION_WIDTH * 0.15, 0], Extrapolation.CLAMP) }],
      };
    }
    return {
      opacity: interpolate(p, [0, 0.5], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateX: interpolate(p, [0, 0.6, 1], [-ACTION_WIDTH * 0.28, -ACTION_WIDTH * 0.04, 0], Extrapolation.CLAMP) },
        { scale: interpolate(p, [0, 0.7, 0.92, 1], [0.82, 0.96, 1.04, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  const rightActionStyle = useAnimatedStyle(() => {
    const p = rightProgress.value;
    if (reduceMotion.value) {
      return {
        opacity: interpolate(p, [0, 0.5], [0, 1], Extrapolation.CLAMP),
        transform: [{ translateX: interpolate(p, [0, 1], [ACTION_WIDTH * 0.15, 0], Extrapolation.CLAMP) }],
      };
    }
    return {
      opacity: interpolate(p, [0, 0.5], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateX: interpolate(p, [0, 0.6, 1], [ACTION_WIDTH * 0.28, ACTION_WIDTH * 0.04, 0], Extrapolation.CLAMP) },
        { scale: interpolate(p, [0, 0.7, 0.92, 1], [0.82, 0.96, 1.04, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <View style={styles.container}>
      {/* Background action layer — behind the card */}
      <View style={styles.actionLayer}>
        {hasLeftAction && (
          <SwipeActionRow
            action={leftAction}
            side="left"
            animatedStyle={leftActionStyle}
            progress={leftProgress}
            onPress={() => handleActionPress('left')}
            reduceMotion={reduceMotion}
          />
        )}
        {hasRightAction && (
          <SwipeActionRow
            action={rightAction}
            side="right"
            animatedStyle={rightActionStyle}
            progress={rightProgress}
            onPress={() => handleActionPress('right')}
            reduceMotion={reduceMotion}
          />
        )}
      </View>

      {/* Foreground card — translates horizontally */}
      <GestureDetector gesture={panGesture}>
        {/*
          IMPORTANT: no pointerEvents="box-none" here. This outer view is what
          GestureDetector attaches the pan recognizer to, so it must always stay
          a valid hit-test target. If it were "box-none" while the inner View
          below is "none" (card open), the whole subtree would have zero valid
          touch targets and the pan gesture would stop receiving touches
          entirely — i.e. every swipe after the first one would silently die.
          Only the inner content's pointerEvents should toggle, never this one.
        */}
        <Animated.View style={[styles.card, cardStyle]}>
          <View pointerEvents={childrenPointerEvents}>
            {children}
          </View>
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