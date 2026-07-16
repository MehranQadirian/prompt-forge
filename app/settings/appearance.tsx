import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../src/theme/useTheme";
import { ThemeVariant } from "../../src/types";
import {
  darkThemeVariants,
  lightThemeVariants,
  getThemeTokens,
} from "../../src/theme/tokens";
import { SPACING, RADIUS, TYPOGRAPHY, ICON_SIZE } from "../../src/constants";
import { hapticMedium } from "../../src/constants/haptics";

const SPRING_CONFIG = { damping: 18, stiffness: 300, mass: 0.5 };
const PRESS_IN_CONFIG = { damping: 20, stiffness: 400, mass: 0.4 };
const PRESS_OUT_CONFIG = { damping: 16, stiffness: 320, mass: 0.4 };

/* ---------- Animated Theme Card ---------- */

function ThemeCard({
  variant,
  isSelected,
  onSelect,
}: {
  variant: ThemeVariant;
  isSelected: boolean;
  onSelect: (v: ThemeVariant) => void;
}) {
  const tokens = getThemeTokens(variant);
  const pressScale = useSharedValue(1);
  const selectedScale = useSharedValue(isSelected ? 1 : 0.8);
  const selectedOpacity = useSharedValue(isSelected ? 1 : 0);

  React.useEffect(() => {
    if (isSelected) {
      selectedScale.value = withSpring(1, SPRING_CONFIG);
      selectedOpacity.value = withTiming(1, { duration: 120 });
    } else {
      selectedScale.value = withTiming(0.8, { duration: 100 });
      selectedOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [isSelected]);

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const checkAnimStyle = useAnimatedStyle(() => ({
    opacity: selectedOpacity.value,
    transform: [{ scale: selectedScale.value }],
  }));

  const handlePressIn = useCallback(() => {
    pressScale.value = withSpring(0.94, PRESS_IN_CONFIG);
  }, []);

  const handlePressOut = useCallback(() => {
    pressScale.value = withSpring(1, PRESS_OUT_CONFIG);
  }, []);

  const handlePress = useCallback(() => {
    if (!isSelected) hapticMedium();
    onSelect(variant);
  }, [isSelected, variant, onSelect]);

  return (
    <View style={styles.themeCardWrapper}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`${variant} theme`}
      >
        <Animated.View
          style={[
            styles.themeCard,
            cardAnimStyle,
            {
              backgroundColor: tokens.color.surfaceContainer,
              borderColor: isSelected
                ? tokens.color.primary
                : tokens.color.outlineVariant,
            },
          ]}
        >
          <View
            style={[
              styles.themePreview,
              { backgroundColor: tokens.color.background },
            ]}
          >
            <View
              style={[
                styles.themePreviewBar,
                { backgroundColor: tokens.color.primary },
              ]}
            />
            <View
              style={[
                styles.themePreviewLine,
                { backgroundColor: tokens.color.text },
              ]}
            />
            <View
              style={[
                styles.themePreviewLine2,
                { backgroundColor: tokens.color.onSurfaceVariant },
              ]}
            />

            <Animated.View
              style={[
                styles.checkBadge,
                checkAnimStyle,
                { backgroundColor: tokens.color.primary },
              ]}
            >
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </Animated.View>
          </View>
          <Text
            style={[styles.themeName, { color: tokens.color.onBackground }]}
          >
            {variant}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

/* ---------- Screen ---------- */

export default function AppearanceScreen() {
  const router = useRouter();
  const { theme, themeVariant, setTheme } = useTheme();

  const handleSelectTheme = useCallback(
    (variant: ThemeVariant) => {
      setTheme(variant);
    },
    [setTheme],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.color.background }]}
      edges={["top", "bottom"]}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.color.outlineVariant },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            { opacity: pressed ? 0.5 : 1 },
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="chevron-back"
            size={ICON_SIZE.lg}
            color={theme.color.onBackground}
          />
        </Pressable>
        <Text style={[styles.title, { color: theme.color.onBackground }]}>
          Appearance
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.color.onSurfaceVariant },
            ]}
          >
            Dark Themes
          </Text>
          <View style={styles.themeGrid}>
            {darkThemeVariants.map((variant) => (
              <ThemeCard
                key={variant}
                variant={variant}
                isSelected={themeVariant === variant}
                onSelect={handleSelectTheme}
              />
            ))}
          </View>
        </View>

        <View>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.color.onSurfaceVariant },
            ]}
          >
            Light Themes
          </Text>
          <View style={styles.themeGrid}>
            {lightThemeVariants.map((variant) => (
              <ThemeCard
                key={variant}
                variant={variant}
                isSelected={themeVariant === variant}
                onSelect={handleSelectTheme}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: SPACING.sm, width: 40 },
  title: { ...TYPOGRAPHY.subheading },
  content: { padding: SPACING.lg, gap: SPACING.lg },
  sectionTitle: {
    ...TYPOGRAPHY.captionMedium,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.md },
  themeCardWrapper: { width: "47%" },
  themeCard: { borderRadius: RADIUS.lg, overflow: "hidden", borderWidth: 2 },
  themePreview: { height: 80, padding: SPACING.sm, gap: 4 },
  themePreviewBar: { width: "60%", height: 8, borderRadius: 4 },
  themePreviewLine: { width: "80%", height: 4, borderRadius: 2 },
  themePreviewLine2: { width: "50%", height: 4, borderRadius: 2 },
  themeName: {
    ...TYPOGRAPHY.captionMedium,
    textTransform: "capitalize",
    padding: SPACING.sm,
  },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
