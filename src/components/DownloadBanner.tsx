import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { downloadService, DownloadState } from '../services/downloadService';
import { useTheme } from '../theme/useTheme';
import { SPACING, TYPOGRAPHY, ICON_SIZE, RADIUS } from '../constants';
import { hapticLight } from '../constants/haptics';

export function DownloadBanner() {
  const { theme } = useTheme();
  const c = theme.color;
  const insets = useSafeAreaInsets();
  const [dlState, setDlState] = useState<DownloadState>(downloadService.getState());

  useEffect(() => {
    const unsubStatus = downloadService.onStatusChange((status) => {
      setDlState((prev) => ({ ...prev, status }));
    });
    const unsubProgress = downloadService.onProgress((progress) => {
      setDlState((prev) => ({ ...prev, progress }));
    });
    setDlState(downloadService.getState());
    return () => {
      unsubStatus();
      unsubProgress();
    };
  }, []);

  if (dlState.status !== 'downloading') return null;

  const progress = Math.round(dlState.progress * 100);

  const handleCancel = () => {
    hapticLight();
    downloadService.cancelDownload();
  };

  return (
    <View
      style={[
        styles.container,
        {
          top: insets.top,
          backgroundColor: c.surfaceContainerHigh,
          borderColor: c.outlineVariant,
        },
      ]}
    >
      <View style={styles.progressRow}>
        <Ionicons name="cloud-download" size={ICON_SIZE.sm} color={c.primary} />
        <Text style={[styles.progressText, { color: c.onBackground }]} numberOfLines={1}>
          {progress}% — Downloading v{dlState.version}...
        </Text>
        <Pressable
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel download"
          hitSlop={4}
          style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="close" size={16} color={c.error} />
        </Pressable>
      </View>
      <View style={[styles.progressBar, { backgroundColor: c.outlineVariant }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: c.primary,
              width: `${progress}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 10000,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TYPOGRAPHY.captionMedium,
    flex: 1,
  },
  cancelBtn: {
    padding: SPACING.xs,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
});
