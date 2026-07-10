import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useTheme } from '../../src/theme/useTheme';
import * as Haptics from 'expo-haptics';
import { SPACING, RADIUS, TYPOGRAPHY, TOUCH_TARGET, ICON_SIZE } from '../../src/constants';

const FONT_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'mono', label: 'Monospace' },
  { value: 'serif', label: 'Serif' },
];

const FONT_SIZE_OPTIONS = [
  { value: 14, label: 'Small' },
  { value: 16, label: 'Medium' },
  { value: 18, label: 'Large' },
  { value: 20, label: 'X-Large' },
];

export default function TypographyScreen() {
  const router = useRouter();
  const { settings, setFontSize, setFontFamily } = useSettingsStore();
  const { theme } = useTheme();

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
        <Text style={[styles.title, { color: theme.color.onBackground }]}>Typography</Text>
        <View style={{ width: TOUCH_TARGET }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.color.onSurfaceVariant }]}>Font Size</Text>
        <View style={[styles.card, { backgroundColor: theme.color.surfaceContainer, borderColor: theme.color.outlineVariant }]}>
          {FONT_SIZE_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFontSize(option.value);
              }}
              accessibilityRole="radio"
              accessibilityLabel={`${option.label} font size`}
              accessibilityState={{ selected: settings.fontSize === option.value }}
              android_ripple={{ color: theme.color.onBackground + '14' }}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: settings.fontSize === option.value ? theme.color.primary + '18' : 'transparent',
                  borderBottomColor: theme.color.outlineVariant,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.optionText, { color: theme.color.onBackground }]}>{option.label}</Text>
              {settings.fontSize === option.value && <Ionicons name="checkmark" size={ICON_SIZE.list} color={theme.color.primary} />}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.color.onSurfaceVariant }]}>Font Family</Text>
        <View style={[styles.card, { backgroundColor: theme.color.surfaceContainer, borderColor: theme.color.outlineVariant }]}>
          {FONT_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFontFamily(option.value);
              }}
              accessibilityRole="radio"
              accessibilityLabel={`${option.label} font family`}
              accessibilityState={{ selected: settings.fontFamily === option.value }}
              android_ripple={{ color: theme.color.onBackground + '14' }}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: settings.fontFamily === option.value ? theme.color.primary + '18' : 'transparent',
                  borderBottomColor: theme.color.outlineVariant,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: theme.color.onBackground,
                    fontFamily: option.value === 'mono' ? 'monospace' : option.value === 'serif' ? 'serif' : undefined,
                  },
                ]}
              >
                {option.label}
              </Text>
              {settings.fontFamily === option.value && <Ionicons name="checkmark" size={ICON_SIZE.list} color={theme.color.primary} />}
            </Pressable>
          ))}
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: TOUCH_TARGET,
  },
  optionText: {
    ...TYPOGRAPHY.body,
  },
});
