import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/useTheme';
import { ThemeVariant } from '../../src/types';
import * as Haptics from 'expo-haptics';
import { SPACING, RADIUS, TYPOGRAPHY, TOUCH_TARGET, ICON_SIZE } from '../../src/constants';
import { darkThemeVariants, lightThemeVariants, getThemeTokens } from '../../src/theme';

const THEME_DESCRIPTIONS: Record<ThemeVariant, string> = {
  forest: 'Green natural theme',
  midnight: 'Deep blue theme',
  carbon: 'Pure dark gray',
  plum: 'Rich purple theme',
  ember: 'Warm orange theme',
  dracula: 'Classic dark theme',
  mono: 'Minimal monochrome',
  paper: 'Clean light theme',
  sky: 'Soft blue light',
  sage: 'Green light theme',
  rose: 'Pink light theme',
  latte: 'Warm beige light',
  lavender: 'Purple light theme',
  snow: 'Pure white theme',
};

export default function AppearanceScreen() {
  const router = useRouter();
  const { theme, themeVariant, followSystem, setTheme, setFollowSystem } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.color.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          android_ripple={{ color: theme.color.onBackground + '14', borderless: true }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: pressed ? theme.color.onBackground + '0D' : theme.color.surfaceContainer },
          ]}
        >
          <Ionicons name="arrow-back" size={ICON_SIZE.md} color={theme.color.onBackground} />
        </Pressable>
        <Text style={[styles.title, { color: theme.color.onBackground }]}>Appearance</Text>
        <View style={{ width: TOUCH_TARGET }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.color.onSurfaceVariant }]}>Theme</Text>
        <View style={[styles.card, { backgroundColor: theme.color.surfaceContainer, borderColor: theme.color.outlineVariant }]}>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.color.onBackground }]}>Follow System</Text>
            <Switch
              value={followSystem}
              onValueChange={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFollowSystem(val);
              }}
              accessibilityLabel="Follow system theme"
              trackColor={{ false: theme.color.disabledContainer, true: theme.color.primary + '80' }}
              thumbColor={followSystem ? theme.color.primary : theme.color.disabled}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.color.onSurfaceVariant }]}>Dark Themes</Text>
        <View style={[styles.card, { backgroundColor: theme.color.surfaceContainer, borderColor: theme.color.outlineVariant }]}>
          {darkThemeVariants.map((variant) => {
            const t = getThemeTokens(variant);
            const isSelected = themeVariant === variant;
            return (
              <Pressable
                key={variant}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTheme(variant);
                  if (followSystem) setFollowSystem(false);
                }}
                accessibilityRole="radio"
                accessibilityLabel={`${variant} theme`}
                accessibilityState={{ selected: isSelected }}
                android_ripple={{ color: theme.color.onBackground + '14' }}
                style={({ pressed }) => [
                  styles.themeOption,
                  {
                    backgroundColor: isSelected ? theme.color.primary + '18' : 'transparent',
                    borderColor: isSelected ? theme.color.primary : 'transparent',
                    borderBottomColor: theme.color.outlineVariant,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={styles.themeLeft}>
                  <View style={styles.themePreview}>
                    <View style={[styles.previewDot, { backgroundColor: t.color.background }]} />
                    <View style={[styles.previewDot, { backgroundColor: t.color.surfaceContainer }]} />
                    <View style={[styles.previewDot, { backgroundColor: t.color.primary }]} />
                  </View>
                  <View>
                    <Text style={[styles.themeName, { color: theme.color.onBackground }]}>{variant.charAt(0).toUpperCase() + variant.slice(1)}</Text>
                    <Text style={[styles.themeDesc, { color: theme.color.disabled }]}>{THEME_DESCRIPTIONS[variant]}</Text>
                  </View>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={ICON_SIZE.list} color={theme.color.primary} />}
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.color.onSurfaceVariant }]}>Light Themes</Text>
        <View style={[styles.card, { backgroundColor: theme.color.surfaceContainer, borderColor: theme.color.outlineVariant }]}>
          {lightThemeVariants.map((variant) => {
            const t = getThemeTokens(variant);
            const isSelected = themeVariant === variant;
            return (
              <Pressable
                key={variant}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTheme(variant);
                  if (followSystem) setFollowSystem(false);
                }}
                accessibilityRole="radio"
                accessibilityLabel={`${variant} theme`}
                accessibilityState={{ selected: isSelected }}
                android_ripple={{ color: theme.color.onBackground + '14' }}
                style={({ pressed }) => [
                  styles.themeOption,
                  {
                    backgroundColor: isSelected ? theme.color.primary + '18' : 'transparent',
                    borderColor: isSelected ? theme.color.primary : 'transparent',
                    borderBottomColor: theme.color.outlineVariant,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={styles.themeLeft}>
                  <View style={styles.themePreview}>
                    <View style={[styles.previewDot, { backgroundColor: t.color.background }]} />
                    <View style={[styles.previewDot, { backgroundColor: t.color.surfaceContainer }]} />
                    <View style={[styles.previewDot, { backgroundColor: t.color.primary }]} />
                  </View>
                  <View>
                    <Text style={[styles.themeName, { color: theme.color.onBackground }]}>{variant.charAt(0).toUpperCase() + variant.slice(1)}</Text>
                    <Text style={[styles.themeDesc, { color: theme.color.disabled }]}>{THEME_DESCRIPTIONS[variant]}</Text>
                  </View>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={ICON_SIZE.list} color={theme.color.primary} />}
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  backBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.title,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.captionSemibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xs,
  },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: TOUCH_TARGET,
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  themePreview: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  previewDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  themeName: {
    ...TYPOGRAPHY.bodyMedium,
  },
  themeDesc: {
    ...TYPOGRAPHY.labelSmallMedium,
    marginTop: SPACING.xs,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    minHeight: TOUCH_TARGET,
  },
  switchLabel: {
    ...TYPOGRAPHY.body,
  },
});
