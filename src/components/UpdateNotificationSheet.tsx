import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { SPACING, RADIUS, TYPOGRAPHY, ICON_SIZE, TOUCH_TARGET } from '../constants';
import { hapticLight } from '../constants/haptics';
import { BottomSheet, BottomSheetRef } from './BottomSheet';
import { AppIcon } from './AppIcon';

interface UpdateNotificationSheetProps {
  visible: boolean;
  version: string;
  releaseNotes: string;
  onDismiss: () => void;
}

export function UpdateNotificationSheet({
  visible,
  version,
  releaseNotes,
  onDismiss,
}: UpdateNotificationSheetProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const sheetRef = useRef<BottomSheetRef>(null);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    }
  }, [visible]);

  const handleDismiss = () => {
    hapticLight();
    sheetRef.current?.dismiss();
    onDismiss();
  };

  return (
    <BottomSheet ref={sheetRef} onClose={onDismiss}>
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: c.primary + '18' }]}>
          <AppIcon size={48} />
        </View>

        <View style={styles.info}>
          <Text style={[styles.title, { color: c.onBackground }]}>Update Available</Text>
          <Text style={[styles.version, { color: c.primary }]}>v{version}</Text>
        </View>

        {releaseNotes ? (
          <View style={[styles.notesBox, { backgroundColor: c.surface, borderColor: c.outlineVariant }]}>
            <Text style={[styles.notesLabel, { color: c.onSurfaceVariant }]}>What's new:</Text>
            <Text style={[styles.notes, { color: c.onBackground }]} numberOfLines={4}>
              {releaseNotes}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss update notification"
          style={({ pressed }) => [
            styles.dismissBtn,
            { backgroundColor: c.primary, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="checkmark" size={ICON_SIZE.md} color={c.onPrimary} />
          <Text style={[styles.dismissText, { color: c.onPrimary }]}>I got it</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: SPACING.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.subheading,
    fontWeight: '700',
  },
  version: {
    ...TYPOGRAPHY.captionMedium,
    fontWeight: '600',
  },
  notesBox: {
    width: '100%',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    padding: SPACING.md,
  },
  notesLabel: {
    ...TYPOGRAPHY.captionMedium,
    marginBottom: SPACING.xs,
  },
  notes: {
    ...TYPOGRAPHY.caption,
    lineHeight: 18,
  },
  dismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    width: '100%',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
  },
  dismissText: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
  },
});
