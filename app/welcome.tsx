import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, AccessibilityInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme/useTheme';
import { useSettingsStore } from '../src/stores/settingsStore';
import { hapticLight, hapticHeavy } from '../src/constants/haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { SPACING, RADIUS, TOUCH_TARGET, TYPOGRAPHY, ICON_SIZE } from '../src/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STEPS = [
  {
    icon: 'create-outline' as const,
    title: 'Write Better Prompts',
    description: 'A focused notepad designed for crafting perfect AI prompts.',
  },
  {
    icon: 'flash-outline' as const,
    title: 'Quick Fill Placeholders',
    description: 'Use [brackets] and {braces} for dynamic prompt templates.',
  },
  {
    icon: 'copy-outline' as const,
    title: 'Copy & Go',
    description: 'One-tap copy with instant feedback.',
  },
  {
    icon: 'color-palette-outline' as const,
    title: 'Stay Organized',
    description: 'Color-code, tag, and categorize your prompts.',
  },
];

const DOT_ACTIVE_WIDTH = 24;
const DOT_INACTIVE_WIDTH = 8;
const DOT_HEIGHT = 8;
const DOT_GAP = SPACING.sm;

// ---------------------------------------------------------------------------
// Animated dot indicator
// ---------------------------------------------------------------------------
function AnimatedDot({
  index,
  scrollX,
  primaryColor,
  inactiveColor,
}: {
  index: number;
  scrollX: SharedValue<number>;
  primaryColor: string;
  inactiveColor: string;
}) {
  const progress = useDerivedValue(() => {
    return interpolate(
      scrollX.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
  });

  const dotStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [DOT_INACTIVE_WIDTH, DOT_ACTIVE_WIDTH]),
    backgroundColor: progress.value > 0.5 ? primaryColor : inactiveColor,
  }));

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

// ---------------------------------------------------------------------------
// Animated page content
// ---------------------------------------------------------------------------
function AnimatedPage({
  step,
  index,
  scrollX,
}: {
  step: (typeof STEPS)[number];
  index: number;
  scrollX: SharedValue<number>;
}) {
  const { theme } = useTheme();
  const c = theme.color;

  const progress = useDerivedValue(() => {
    return interpolate(
      scrollX.value,
      [(index - 0.5) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 0.5) * SCREEN_WIDTH],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
  });

  const iconAnim = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [20, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.8, 1]) },
    ],
  }));

  const titleAnim = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [15, 0]) }],
  }));

  const descAnim = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [10, 0]) }],
  }));

  return (
    <View style={[styles.page, { width: SCREEN_WIDTH }]}>
      <Animated.View style={[styles.iconWrap, iconAnim]}>
        <View style={[styles.iconCircle, { backgroundColor: c.primaryLight }]}>
          <Ionicons name={step.icon} size={ICON_SIZE.xl} color={c.primary} />
        </View>
      </Animated.View>

      <Animated.Text style={[styles.title, { color: c.onBackground }, titleAnim]}>
        {step.title}
      </Animated.Text>

      <Animated.Text style={[styles.description, { color: c.onSurfaceVariant }, descAnim]}>
        {step.description}
      </Animated.Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main welcome screen
// ---------------------------------------------------------------------------
export default function WelcomeScreen() {
  const router = useRouter();
  const { setOnboarded } = useSettingsStore();
  const { theme } = useTheme();
  const c = theme.color;

  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useSharedValue(0);
  const reduceMotion = useSharedValue(false);
  const scrollViewRef = useRef<any>(null);

  // Detect reduced motion
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reduceMotion.value = enabled;
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      reduceMotion.value = enabled;
    });
    return () => sub.remove();
  }, []);

  const handleFinish = useCallback(async () => {
    hapticHeavy();
    setOnboarded();
    router.replace('/(tabs)');
  }, [setOnboarded, router]);

  const goToPage = useCallback(
    (page: number) => {
      scrollViewRef.current?.scrollTo({
        x: page * SCREEN_WIDTH,
        animated: !reduceMotion.value,
      });
      if (currentPage !== page) {
        setCurrentPage(page);
        hapticLight();
      }
    },
    [currentPage, reduceMotion]
  );

  const handleNext = useCallback(() => {
    if (currentPage < STEPS.length - 1) {
      goToPage(currentPage + 1);
    } else {
      handleFinish();
    }
  }, [currentPage, goToPage, handleFinish]);

  const handleSkip = useCallback(() => {
    handleFinish();
  }, [handleFinish]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleMomentumScrollEnd = useCallback(
    (e: any) => {
      const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      if (page !== currentPage && page >= 0 && page < STEPS.length) {
        setCurrentPage(page);
        hapticLight();
      }
    },
    [currentPage]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      {/* Decorative background circles */}
      <View style={[styles.bgCircle1, { backgroundColor: c.primary + '08' }]} />
      <View style={[styles.bgCircle2, { backgroundColor: c.primary + '06' }]} />

      {/* Scrollable pages */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {STEPS.map((step, i) => (
          <AnimatedPage key={i} step={step} index={i} scrollX={scrollX} />
        ))}
      </Animated.ScrollView>

      {/* Dot indicators */}
      <View
        style={styles.dotsContainer}
        accessibilityRole="progressbar"
        accessibilityValue={{ now: currentPage + 1, min: 1, max: STEPS.length }}
      >
        {STEPS.map((_, i) => (
          <AnimatedDot
            key={i}
            index={i}
            scrollX={scrollX}
            primaryColor={c.primary}
            inactiveColor={c.surfaceContainerHigh}
          />
        ))}
      </View>

      {/* Button row */}
      <View style={styles.buttonRow}>
        {currentPage < STEPS.length - 1 && (
          <Pressable
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            android_ripple={{ color: c.onBackground + '14' }}
            hitSlop={8}
            style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.skipText, { color: c.onSurfaceVariant }]}>Skip</Text>
          </Pressable>
        )}
        <Pressable
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={
            currentPage === STEPS.length - 1
              ? "Let's go"
              : `Next, page ${currentPage + 1} of ${STEPS.length}`
          }
          accessibilityHint={
            currentPage === STEPS.length - 1
              ? 'Finish onboarding and go to app'
              : 'Go to next onboarding page'
          }
          android_ripple={{ color: c.onBackground + '30' }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.nextBtn,
            currentPage === STEPS.length - 1 && styles.nextBtnFull,
            { backgroundColor: c.primary, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.nextText, { color: c.onPrimary }]}>
            {currentPage === STEPS.length - 1 ? "Let's Go" : 'Next'}
          </Text>
          <Ionicons
            name={currentPage === STEPS.length - 1 ? 'rocket' : 'arrow-forward'}
            size={ICON_SIZE.md}
            color={c.onPrimary}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgCircle1: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: SCREEN_WIDTH * 0.4,
    top: -100,
    right: -SCREEN_WIDTH * 0.2,
  },
  bgCircle2: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: SCREEN_WIDTH * 0.3,
    bottom: -50,
    left: -SCREEN_WIDTH * 0.15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxxl,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.heading,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: DOT_GAP,
    marginBottom: SPACING.xxxl,
    height: DOT_HEIGHT,
  },
  dot: {
    height: DOT_HEIGHT,
    borderRadius: DOT_HEIGHT / 2,
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xxxl,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  skipBtn: {
    flex: 1,
    height: TOUCH_TARGET + 8,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    ...TYPOGRAPHY.body,
  },
  nextBtn: {
    flex: 2,
    height: TOUCH_TARGET + 8,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  nextBtnFull: {
    flex: 1,
  },
  nextText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
});
