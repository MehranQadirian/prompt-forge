import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { SPACING, RADIUS, TOUCH_TARGET, ICON_SIZE, TYPOGRAPHY } from '../constants';
import { hapticLight, hapticMedium } from '../constants/haptics';
import { AIError } from '../types';
import { BottomSheet, BottomSheetRef } from './BottomSheet';

interface EnhancedPromptSheetProps {
  visible: boolean;
  enhancedText: string | null;
  error: AIError | null;
  onClose: () => void;
  onReplace: () => void;
  onInsertBelow: () => void;
  onCopy: () => void;
  onOpenSettings?: () => void;
}

export function EnhancedPromptSheet({
  visible,
  enhancedText,
  error,
  onClose,
  onReplace,
  onInsertBelow,
  onCopy,
  onOpenSettings,
}: EnhancedPromptSheetProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const sheetRef = useRef<BottomSheetRef>(null);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    }
  }, [visible]);

  const handleReplace = () => {
    hapticMedium();
    onReplace();
    sheetRef.current?.dismiss();
  };

  const handleInsertBelow = () => {
    hapticMedium();
    onInsertBelow();
    sheetRef.current?.dismiss();
  };

  const handleCopy = () => {
    hapticLight();
    onCopy();
    sheetRef.current?.dismiss();
  };

  const handleClose = () => {
    hapticLight();
    sheetRef.current?.dismiss();
  };

  return (
    <BottomSheet ref={sheetRef} onClose={onClose}>
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: error ? c.error + '18' : c.primary + '18' },
          ]}
        >
          <Ionicons
            name={error ? 'alert-circle' : 'sparkles'}
            size={ICON_SIZE.md}
            color={error ? c.error : c.primary}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: c.onBackground }]}>
            {error ? 'Enhancement Failed' : 'Enhanced Prompt Ready'}
          </Text>
          <Text style={[styles.subtitle, { color: c.onSurfaceVariant }]}>
            {error
              ? 'Something went wrong while enhancing your prompt.'
              : 'Your prompt has been improved. Choose what to do next.'}
          </Text>
        </View>
      </View>

      {/* Error message or preview */}
      {error ? (
        <>
          <View style={[styles.errorContainer, { backgroundColor: c.error + '0D', borderColor: c.error + '30' }]}>
            <Ionicons name="warning" size={ICON_SIZE.sm} color={c.error} />
            <Text style={[styles.errorText, { color: c.error }]}>{error.message}</Text>
          </View>
          {error.code === 'INVALID_KEY' && onOpenSettings && (
            <Pressable
              onPress={() => {
                hapticMedium();
                onOpenSettings();
                sheetRef.current?.dismiss();
              }}
              accessibilityRole="button"
              accessibilityLabel="Open AI Settings"
              android_ripple={{ color: c.primary + '30' }}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: c.primary, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="key" size={ICON_SIZE.sm} color={c.onPrimary} />
              <Text style={[styles.primaryBtnText, { color: c.onPrimary }]}>
                Configure API Key
              </Text>
            </Pressable>
          )}
        </>
      ) : (
        <ScrollView
          style={[styles.previewContainer, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <Text
            style={[styles.previewText, { color: c.onSurfaceVariant }]}
            selectable
          >
            {enhancedText}
          </Text>
        </ScrollView>
      )}

      {/* Actions */}
      {!error && (
        <View style={styles.actions}>
          <Pressable
            onPress={handleReplace}
            accessibilityRole="button"
            accessibilityLabel="Replace current text"
            android_ripple={{ color: c.onPrimary + '30' }}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: c.primary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="swap-horizontal" size={ICON_SIZE.sm} color={c.onPrimary} />
            <Text style={[styles.primaryBtnText, { color: c.onPrimary }]}>
              Replace Current
            </Text>
          </Pressable>

          <Pressable
            onPress={handleInsertBelow}
            accessibilityRole="button"
            accessibilityLabel="Insert below current text"
            android_ripple={{ color: c.primary + '14' }}
            style={({ pressed }) => [
              styles.secondaryBtn,
              { borderColor: c.primary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="arrow-down" size={ICON_SIZE.sm} color={c.primary} />
            <Text style={[styles.secondaryBtnText, { color: c.primary }]}>
              Insert Below
            </Text>
          </Pressable>

          <Pressable
            onPress={handleCopy}
            accessibilityRole="button"
            accessibilityLabel="Copy to clipboard"
            android_ripple={{ color: c.primary + '14' }}
            style={({ pressed }) => [
              styles.secondaryBtn,
              { borderColor: c.primary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="copy" size={ICON_SIZE.sm} color={c.primary} />
            <Text style={[styles.secondaryBtnText, { color: c.primary }]}>Copy</Text>
          </Pressable>

          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            android_ripple={{ color: c.onBackground + '14' }}
            style={({ pressed }) => [
              styles.tertiaryBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.tertiaryBtnText, { color: c.onSurfaceVariant }]}>
              Dismiss
            </Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: SPACING.xl,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  previewContainer: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    padding: SPACING.md,
    maxHeight: 200,
    marginBottom: SPACING.xl,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: SPACING.sm,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    gap: SPACING.sm,
  },
  primaryBtnText: {
    fontSize: TYPOGRAPHY.captionSemibold.fontSize,
    fontWeight: TYPOGRAPHY.captionSemibold.fontWeight,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  secondaryBtnText: {
    fontSize: TYPOGRAPHY.captionMedium.fontSize,
    fontWeight: TYPOGRAPHY.captionMedium.fontWeight,
  },
  tertiaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
  },
  tertiaryBtnText: {
    fontSize: TYPOGRAPHY.captionMedium.fontSize,
    fontWeight: TYPOGRAPHY.captionMedium.fontWeight,
  },
});
