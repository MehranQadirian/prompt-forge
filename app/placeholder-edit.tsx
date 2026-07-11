import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/useTheme';
import { usePlaceholderEditStore } from '../src/stores/placeholderEditStore';
import { SPACING, RADIUS, TOUCH_TARGET, ICON_SIZE, TYPOGRAPHY } from '../src/constants';
import { detectRTL } from '../src/utils/rtl';

export default function PlaceholderEditScreen() {
  const router = useRouter();
  const { placeholderKey, placeholderType, currentValue } = useLocalSearchParams<{
    placeholderKey: string;
    placeholderType: 'bracket' | 'brace';
    currentValue: string;
  }>();
  const { theme } = useTheme();
  const c = theme.color;
  const { saveResult, cancelEdit } = usePlaceholderEditStore();

  const [value, setValue] = useState(currentValue || '');
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<TextInput>(null);

  const key = placeholderKey || '';
  const type: 'bracket' | 'brace' = placeholderType || 'bracket';
  const displayLabel = type === 'bracket' ? `[${key}]` : `{${key}}`;
  const isRTL = detectRTL(key);

  useEffect(() => {
    // Auto-focus the input
    setTimeout(() => contentRef.current?.focus(), 300);
  }, []);

  const handleSave = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Keyboard.dismiss();
    saveResult(key, type, value);
    router.back();
  }, [key, type, value, saveResult, router]);

  const handleBack = useCallback(() => {
    Keyboard.dismiss();
    router.back();
  }, [router]);

  const handleCopy = useCallback(async () => {
    if (value) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Clipboard.setStringAsync(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [value]);

  const handleClear = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValue('');
    setTimeout(() => contentRef.current?.focus(), 50);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: c.outlineVariant }]}>
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          android_ripple={{ color: c.onBackground + '14', borderless: true }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.headerBtn,
            { backgroundColor: pressed ? c.onBackground + '0D' : c.surfaceContainer },
          ]}
        >
          <Ionicons name="arrow-back" size={ICON_SIZE.md} color={c.onBackground} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerLabel, { color: c.onSurfaceVariant }]}>Fill Placeholder</Text>
          <Text style={[styles.headerTitle, { color: c.onBackground }]} numberOfLines={1}>
            {displayLabel}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={handleCopy}
            disabled={!value}
            accessibilityRole="button"
            accessibilityLabel={copied ? 'Copied' : 'Copy value'}
            android_ripple={{ color: c.onBackground + '14', borderless: true }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.headerBtn,
              { backgroundColor: pressed ? c.onBackground + '0D' : c.surfaceContainer, opacity: value ? 1 : 0.4 },
            ]}
          >
            <Ionicons name={copied ? 'checkmark' : 'copy'} size={ICON_SIZE.md} color={copied ? c.success : c.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.content}>
          <View style={[styles.placeholderBadge, { backgroundColor: c.primary + '18', borderColor: c.primary + '30' }]}>
            <Ionicons name="flash" size={ICON_SIZE.sm} color={c.primary} />
            <Text style={[styles.placeholderText, { color: c.primary }]} numberOfLines={1}>
              {displayLabel}
            </Text>
          </View>

          <TextInput
            ref={contentRef}
            style={[
              styles.input,
              {
                color: c.onBackground,
                backgroundColor: c.surfaceContainer,
                borderColor: c.outlineVariant,
                textAlign: isRTL ? 'right' : 'left',
                textAlignVertical: 'top',
              },
            ]}
            value={value}
            onChangeText={setValue}
            placeholder={`Enter value for ${displayLabel}...`}
            placeholderTextColor={c.disabled}
            multiline
            accessibilityLabel={`Value for ${displayLabel}`}
          />
        </View>

        <View style={[styles.toolbar, { backgroundColor: c.surface, borderTopColor: c.outlineVariant }]}>
          {value.length > 0 && (
            <Pressable
              onPress={handleClear}
              accessibilityRole="button"
              accessibilityLabel="Clear value"
              android_ripple={{ color: c.onBackground + '14', borderless: true }}
              hitSlop={8}
              style={({ pressed }) => [
                styles.clearBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="close-circle" size={ICON_SIZE.sm} color={c.onSurfaceVariant} />
              <Text style={[styles.clearText, { color: c.onSurfaceVariant }]}>Clear</Text>
            </Pressable>
          )}

          <View style={styles.toolbarSpacer} />

          <Pressable
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Save placeholder value"
            android_ripple={{ color: c.onPrimary + '30' }}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: c.primary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="checkmark" size={ICON_SIZE.md} color={c.onPrimary} />
            <Text style={[styles.saveText, { color: c.onPrimary }]}>Save</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: SPACING.sm },
  headerLabel: {
    fontSize: TYPOGRAPHY.labelSmall.fontSize,
    fontWeight: TYPOGRAPHY.labelSmall.fontWeight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.subheading.fontSize,
    fontWeight: TYPOGRAPHY.subheading.fontWeight,
    marginTop: 2,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  placeholderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    flexShrink: 1,
    marginBottom: SPACING.lg,
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.captionMedium.fontSize,
    fontWeight: TYPOGRAPHY.captionMedium.fontWeight,
    fontFamily: 'monospace',
  },
  input: {
    flex: 1,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.lg,
    fontSize: 16,
    lineHeight: 24,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    gap: SPACING.sm,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    height: TOUCH_TARGET,
    paddingHorizontal: SPACING.md,
  },
  clearText: {
    fontSize: TYPOGRAPHY.captionMedium.fontSize,
    fontWeight: TYPOGRAPHY.captionMedium.fontWeight,
  },
  toolbarSpacer: { flex: 1 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    height: TOUCH_TARGET,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.md,
  },
  saveText: {
    fontSize: TYPOGRAPHY.captionSemibold.fontSize,
    fontWeight: TYPOGRAPHY.captionSemibold.fontWeight,
  },
});
