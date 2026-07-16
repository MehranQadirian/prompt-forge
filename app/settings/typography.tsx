import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useTheme } from '../../src/theme/useTheme';
import * as Haptics from 'expo-haptics';
import { SPACING, RADIUS, TYPOGRAPHY, ICON_SIZE } from '../../src/constants';

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
  const c = theme.color;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: c.outlineVariant }]}>
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
          <Ionicons name="chevron-back" size={ICON_SIZE.lg} color={c.onBackground} />
        </Pressable>
        <Text style={[styles.title, { color: c.onBackground }]}>Typography</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: c.onSurfaceVariant }]}>Font Size</Text>
        <View style={[styles.card, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}>
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
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: settings.fontSize === option.value ? c.primary + '18' : 'transparent',
                  borderBottomColor: c.outlineVariant,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.optionText, { color: c.onBackground }]}>{option.label}</Text>
              {settings.fontSize === option.value && <Ionicons name="checkmark" size={ICON_SIZE.list} color={c.primary} />}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: c.onSurfaceVariant }]}>Font Family</Text>
        <View style={[styles.card, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}>
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
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: settings.fontFamily === option.value ? c.primary + '18' : 'transparent',
                  borderBottomColor: c.outlineVariant,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: c.onBackground,
                    fontFamily: option.value === 'mono' ? 'monospace' : option.value === 'serif' ? 'serif' : undefined,
                  },
                ]}
              >
                {option.label}
              </Text>
              {settings.fontFamily === option.value && <Ionicons name="checkmark" size={ICON_SIZE.list} color={c.primary} />}
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: SPACING.sm, width: 40 },
  title: {
    ...TYPOGRAPHY.subheading,
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
    minHeight: 48,
  },
  optionText: {
    ...TYPOGRAPHY.body,
  },
});
