import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useTheme } from '../../src/theme/useTheme';
import { SwipeAction } from '../../src/types';
import * as Haptics from 'expo-haptics';
import { SPACING, RADIUS, TYPOGRAPHY, ICON_SIZE } from '../../src/constants';

const SWIPE_OPTIONS: { value: SwipeAction; label: string; icon: string }[] = [
  { value: 'edit', label: 'Edit', icon: 'pencil' },
  { value: 'duplicate', label: 'Duplicate', icon: 'copy' },
  { value: 'pin', label: 'Pin', icon: 'pin' },
  { value: 'favorite', label: 'Favorite', icon: 'star' },
  { value: 'delete', label: 'Delete', icon: 'trash' },
  { value: 'none', label: 'None', icon: 'close-circle' },
];

export default function OptionsScreen() {
  const router = useRouter();
  const { settings, setShowTokenCount, setSwipeLeftAction, setSwipeRightAction } = useSettingsStore();
  const { theme } = useTheme();
  const c = theme.color;

  const renderSwipePicker = (
    label: string,
    currentValue: SwipeAction,
    onSelect: (action: SwipeAction) => void
  ) => (
    <View style={styles.pickerSection}>
      <Text style={[styles.pickerLabel, { color: c.onSurfaceVariant }]}>{label}</Text>
      <View style={styles.pickerGrid}>
        {SWIPE_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(opt.value);
            }}
            accessibilityRole="radio"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: currentValue === opt.value }}
            style={({ pressed }) => [
              styles.pickerOption,
              {
                backgroundColor: currentValue === opt.value ? c.primary + '18' : c.surfaceContainerHigh,
                borderColor: currentValue === opt.value ? c.primary : c.outlineVariant,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons
              name={opt.icon as any}
              size={ICON_SIZE.sm}
              color={currentValue === opt.value ? c.primary : c.onSurfaceVariant}
            />
            <Text
              style={[
                styles.pickerOptionText,
                { color: currentValue === opt.value ? c.primary : c.onSurfaceVariant },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

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
        <Text style={[styles.title, { color: c.onBackground }]}>Options</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: c.onSurfaceVariant }]}>Display</Text>
        <View style={[styles.card, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: c.onBackground }]}>Show Token Count</Text>
            <Switch
              value={settings.showTokenCount}
              onValueChange={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowTokenCount(val);
              }}
              accessibilityLabel="Show token count"
              trackColor={{ false: c.disabledContainer, true: c.primary + '80' }}
              thumbColor={settings.showTokenCount ? c.primary : c.disabled}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: c.onSurfaceVariant }]}>Swipe Actions</Text>
        <View style={[styles.card, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}>
          {renderSwipePicker('Swipe Left Action', settings.swipeLeftAction, setSwipeLeftAction)}
          <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />
          {renderSwipePicker('Swipe Right Action', settings.swipeRightAction, setSwipeRightAction)}
        </View>

        <Text style={[styles.hint, { color: c.onSurfaceVariant }]}>
          Choose which action to assign to each swipe direction on prompt cards.
        </Text>
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    minHeight: 48,
  },
  switchLabel: {
    ...TYPOGRAPHY.body,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: SPACING.lg,
  },
  pickerSection: {
    padding: SPACING.lg,
  },
  pickerLabel: {
    ...TYPOGRAPHY.captionMedium,
    marginBottom: SPACING.sm,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
  },
  pickerOptionText: {
    fontSize: TYPOGRAPHY.small.fontSize,
    fontWeight: '500',
  },
  hint: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xs,
    lineHeight: 18,
  },
});
