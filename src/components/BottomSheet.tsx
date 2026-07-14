import React, { useCallback, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView, BackHandler, useWindowDimensions, AccessibilityInfo, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../theme/useTheme';
import { SPACING, RADIUS } from '../constants';
import { hapticLight, hapticMedium } from '../constants/haptics';

const HANDLE_AREA_HEIGHT = 64;
const HANDLE_BAR_WIDTH = 40;
const HANDLE_BAR_HEIGHT = 5;
const DISMISS_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 500;
const OPEN_SPRING = { damping: 25, stiffness: 350, mass: 0.8 };
const CLOSE_SPRING = { damping: 30, stiffness: 400, mass: 0.9 };
const BACKDROP_DURATION = 200;
const CONTENT_FADE_DURATION = 150;

export interface BottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface BottomSheetProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
}

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  ({ children, footer, onClose }, ref) => {
    const { theme } = useTheme();
    const c = theme.color;
    const { height: screenHeight } = useWindowDimensions();

    const translateY = useSharedValue(screenHeight);
    const backdropOpacity = useSharedValue(0);
    const contentOpacity = useSharedValue(0);
    const scrollOffsetY = useSharedValue(0);
    const reduceMotion = useSharedValue(false);

    const [isOpen, setIsOpen] = useState(false);

    // Detect reduced motion preference
    useEffect(() => {
      AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
        reduceMotion.value = enabled;
      });
      const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
        reduceMotion.value = enabled;
      });
      return () => sub.remove();
    }, []);

    // Animate open when isOpen becomes true
    useEffect(() => {
      if (isOpen) {
        hapticLight();
        if (reduceMotion.value) {
          translateY.value = 0;
          backdropOpacity.value = 0.60;
          contentOpacity.value = 1;
        } else {
          translateY.value = withSpring(0, OPEN_SPRING);
          backdropOpacity.value = withTiming(0.60, { duration: BACKDROP_DURATION });
          contentOpacity.value = withTiming(1, { duration: CONTENT_FADE_DURATION });
        }
      }
    }, [isOpen]);

    const dismissSheet = useCallback(() => {
      hapticMedium();
      if (reduceMotion.value) {
        translateY.value = screenHeight;
        backdropOpacity.value = 0;
        contentOpacity.value = 0;
        setIsOpen(false);
        onClose?.();
      } else {
        translateY.value = withSpring(screenHeight, CLOSE_SPRING);
        contentOpacity.value = withTiming(0, { duration: 150 });
        backdropOpacity.value = withTiming(0, { duration: BACKDROP_DURATION }, (finished) => {
          if (finished) {
            runOnJS(setIsOpen)(false);
            if (onClose) {
              runOnJS(onClose)();
            }
          }
        });
      }
    }, [screenHeight, onClose]);

    // Android Back button
    useEffect(() => {
      if (!isOpen) return;
      const handler = BackHandler.addEventListener('hardwareBackPress', () => {
        dismissSheet();
        return true;
      });
      return () => handler.remove();
    }, [isOpen, dismissSheet]);

    // Expose present/dismiss via ref
    useImperativeHandle(ref, () => ({
      present: () => {
        setIsOpen(true);
      },
      dismiss: dismissSheet,
    }));

    // Native scroll gesture — used simultaneously with the pan gesture
    const scrollGesture = Gesture.Native();

    // Pan gesture — simultaneous with scroll, only acts when scroll is at top
    const panGesture = Gesture.Pan()
      .activeOffsetY(5)
      .simultaneousWithExternalGesture(scrollGesture)
      .onUpdate((event) => {
        if (scrollOffsetY.value > 0) return;
        const newY = Math.max(0, event.translationY);
        translateY.value = newY;
        const progress = Math.min(newY / DISMISS_THRESHOLD, 1);
        backdropOpacity.value = 0.60 * (1 - progress);
      })
      .onEnd((event) => {
        if (scrollOffsetY.value > 0) return;
        if (event.translationY > DISMISS_THRESHOLD || event.velocityY > VELOCITY_THRESHOLD) {
          runOnJS(dismissSheet)();
        } else {
          runOnJS(hapticLight)();
          translateY.value = withSpring(0, OPEN_SPRING);
          backdropOpacity.value = withTiming(0.60, { duration: BACKDROP_DURATION });
        }
      });

    // Track ScrollView offset for gesture coordination
    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollOffsetY.value = event.contentOffset.y;
      },
    });

    const backdropStyle = useAnimatedStyle(() => ({
      opacity: backdropOpacity.value,
    }));

    const sheetStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const contentStyle = useAnimatedStyle(() => ({
      opacity: contentOpacity.value,
    }));

    return (
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={dismissSheet}
        statusBarTranslucent
      >
        <View style={styles.container} pointerEvents="box-none">
          {/* Backdrop */}
          <Animated.View
            style={[styles.backdrop, { backgroundColor: c.overlay }, backdropStyle]}
          />
          <Pressable style={styles.backdropTouch} onPress={dismissSheet} />

          {/* Sheet — pan gesture wraps entire sheet */}
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                styles.sheet,
                {
                  backgroundColor: c.surfaceContainerHigh,
                  borderColor: c.outlineVariant,
                },
                sheetStyle,
              ]}
            >
              <View style={styles.handleArea} accessibilityLabel="Drag to dismiss">
                <View style={[styles.handle, { backgroundColor: c.outline }]} />
              </View>

              {/* Content — native scroll gesture wraps ScrollView */}
              <Animated.View style={[contentStyle, styles.contentWrapper]}>
                <GestureDetector gesture={scrollGesture}>
                  <ScrollView
                    style={styles.scrollContent}
                    contentContainerStyle={styles.scrollContentContainer}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                    bounces={false}
                    scrollEventThrottle={16}
                    onScroll={scrollHandler}
                  >
                    {children}
                  </ScrollView>
                </GestureDetector>

                {/* Footer — pinned outside ScrollView */}
                {footer && (
                  <View style={[styles.footer, { borderTopColor: c.outlineVariant }]}>
                    {footer}
                  </View>
                )}
              </Animated.View>
            </Animated.View>
          </GestureDetector>
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  backdropTouch: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '90%',
  },
  handleArea: {
    height: HANDLE_AREA_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: HANDLE_BAR_WIDTH,
    height: HANDLE_BAR_HEIGHT,
    borderRadius: 2.5,
  },
  contentWrapper: {
    flexShrink: 1,
  },
  scrollContent: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
