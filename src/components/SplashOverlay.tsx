import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { RADIUS, SPACING, TYPOGRAPHY } from '../constants';

// Entrance timing
const CONTAINER_FADE_IN = 600;
const ICON_DELAY = 200;
const ICON_DURATION = 800;
const NAME_DELAY = 500;
const NAME_DURATION = 600;
const TAGLINE_DELAY = 800;
const TAGLINE_DURATION = 500;
// Exit timing
const EXIT_DURATION = 500;
// How long to keep splash visible after everything loads
const MIN_DISPLAY_MS = 1800;

interface SplashOverlayProps {
  loadingPromise: Promise<void>;
  onReady: () => void;
  onMounted?: () => void;
}

export default function SplashOverlay({ loadingPromise, onReady, onMounted }: SplashOverlayProps) {
  const { theme } = useTheme();
  const c = theme.color;

  const [reduceMotion, setReduceMotion] = useState(false);

  const containerOpacity = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslateY = useRef(new Animated.Value(10)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  // Notify parent that we've mounted, so it can hide the native splash
  useEffect(() => {
    onMounted?.();
  }, []);

  // Detect reduced motion
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  // Entrance animation
  useEffect(() => {
    if (reduceMotion) {
      containerOpacity.setValue(1);
      iconOpacity.setValue(1);
      iconScale.setValue(1);
      nameOpacity.setValue(1);
      nameTranslateY.setValue(0);
      taglineOpacity.setValue(1);
      return;
    }

    // Container fades in
    Animated.timing(containerOpacity, {
      toValue: 1,
      duration: CONTAINER_FADE_IN,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Icon — delayed, scales up with spring + fades in
    const iconTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: ICON_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          damping: 12,
          stiffness: 100,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    }, ICON_DELAY);

    // Name — slides up and fades in
    const nameTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: NAME_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(nameTranslateY, {
          toValue: 0,
          duration: NAME_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, NAME_DELAY);

    // Tagline — fades in softly
    const taglineTimer = setTimeout(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: TAGLINE_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, TAGLINE_DELAY);

    return () => {
      clearTimeout(iconTimer);
      clearTimeout(nameTimer);
      clearTimeout(taglineTimer);
    };
  }, [reduceMotion]);

  // Wait for data + min delay, then dismiss
  useEffect(() => {
    let cancelled = false;

    const minDelay = new Promise<void>((r) => setTimeout(r, MIN_DISPLAY_MS));

    Promise.all([loadingPromise, minDelay]).then(() => {
      if (cancelled) return;

      if (reduceMotion) {
        containerOpacity.setValue(0);
        onReady();
      } else {
        // Fade out icon and text first, then container
        Animated.parallel([
          Animated.timing(iconOpacity, {
            toValue: 0,
            duration: EXIT_DURATION * 0.6,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(nameOpacity, {
            toValue: 0,
            duration: EXIT_DURATION * 0.5,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(taglineOpacity, {
            toValue: 0,
            duration: EXIT_DURATION * 0.4,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(containerOpacity, {
            toValue: 0,
            duration: EXIT_DURATION,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            onReady();
          }
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadingPromise, onReady, reduceMotion]);

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: c.background, opacity: containerOpacity }]}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { backgroundColor: c.surfaceContainer, opacity: iconOpacity, transform: [{ scale: iconScale }] }]}>
          <Animated.Image
            source={require('../../assets/splash-icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.Text
          style={[
            styles.appName,
            { color: c.onBackground },
            { opacity: nameOpacity, transform: [{ translateY: nameTranslateY }] },
          ]}
        >
          Prompt Forge
        </Animated.Text>

        <Animated.Text
          style={[styles.tagline, { color: c.onSurfaceVariant }, { opacity: taglineOpacity }]}
        >
          Craft perfect AI prompts
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  icon: {
    width: 100,
    height: 100,
  },
  appName: {
    ...TYPOGRAPHY.heading,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: SPACING.sm,
  },
  tagline: {
    ...TYPOGRAPHY.body,
  },
});
