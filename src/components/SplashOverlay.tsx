import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { SPACING, RADIUS, ICON_SIZE, TYPOGRAPHY } from '../constants';

const ICON_DURATION = 500;
const NAME_DELAY = 150;
const NAME_DURATION = 400;
const TAGLINE_DELAY = 300;
const TAGLINE_DURATION = 400;
const EXIT_DURATION = 300;
const MIN_DISPLAY_MS = 1000;

interface SplashOverlayProps {
  loadingPromise: Promise<void>;
  onReady: () => void;
}

export default function SplashOverlay({ loadingPromise, onReady }: SplashOverlayProps) {
  const { theme } = useTheme();
  const c = theme.color;

  const [reduceMotion, setReduceMotion] = useState(false);

  const containerOpacity = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslateY = useRef(new Animated.Value(10)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

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

    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: ICON_DURATION,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        damping: 15,
        stiffness: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Name — delayed
    const nameTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: NAME_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(nameTranslateY, {
          toValue: 0,
          duration: NAME_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }, NAME_DELAY);

    // Tagline — delayed
    const taglineTimer = setTimeout(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: TAGLINE_DURATION,
        useNativeDriver: true,
      }).start();
    }, TAGLINE_DELAY);

    return () => {
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
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: EXIT_DURATION,
          useNativeDriver: true,
        }).start(({ finished }) => {
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
        <Animated.View
          style={[
            styles.iconCircle,
            { backgroundColor: c.primary },
            { opacity: iconOpacity, transform: [{ scale: iconScale }] },
          ]}
        >
          <Ionicons name="flash" size={ICON_SIZE.xl} color={c.onPrimary} />
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
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
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
