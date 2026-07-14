import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { PromptVersion } from '../types';
import { SPACING, RADIUS, TOUCH_TARGET, ICON_SIZE, TYPOGRAPHY } from '../constants';
import { hapticMedium, hapticHeavy } from '../constants/haptics';
import { BottomSheet, BottomSheetRef } from './BottomSheet';

interface VersionHistoryModalProps {
  visible: boolean;
  versions: PromptVersion[];
  onClose: () => void;
  onRestore: (version: PromptVersion) => void;
  onDeleteVersion: (versionId: string) => void;
}

export function VersionHistoryModal({ visible, versions, onClose, onRestore, onDeleteVersion }: VersionHistoryModalProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sheetRef = useRef<BottomSheetRef>(null);

  useEffect(() => {
    if (visible) {
      setSelectedId(null);
      sheetRef.current?.present();
    }
  }, [visible]);

  const handleRestore = (v: PromptVersion) => {
    hapticMedium();
    onRestore(v);
    sheetRef.current?.dismiss();
  };

  const handleDelete = (v: PromptVersion) => {
    hapticHeavy();
    setDeleteConfirmVersion(v);
    deleteConfirmRef.current?.present();
  };

  const [deleteConfirmVersion, setDeleteConfirmVersion] = useState<PromptVersion | null>(null);
  const deleteConfirmRef = useRef<BottomSheetRef>(null);

  return (
    <>
    <BottomSheet ref={sheetRef} onClose={onClose}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: c.primary + '18' }]}>
          <Ionicons name="time" size={ICON_SIZE.md} color={c.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: c.onBackground }]}>Version History</Text>
          <Text style={[styles.subtitle, { color: c.onSurfaceVariant }]}>
            {versions.length} version{versions.length !== 1 ? 's' : ''} saved
          </Text>
        </View>
      </View>

      {/* Version list */}
      {versions.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={ICON_SIZE.xl} color={c.disabled} />
          <Text style={[styles.emptyText, { color: c.onSurfaceVariant }]}>No versions saved yet</Text>
          <Text style={[styles.emptyHint, { color: c.disabled }]}>
            Tap the + button in the toolbar to save a version
          </Text>
        </View>
      ) : (
        [...versions].reverse().map((v, index) => {
          const isSelected = selectedId === v.id;
          const date = new Date(v.timestamp);
          return (
            <View key={v.id}>
              <Pressable
                onPress={() => setSelectedId(isSelected ? null : v.id)}
                accessibilityRole="button"
                accessibilityLabel={`Version from ${date.toLocaleString()}`}
                style={({ pressed }) => [
                  styles.versionItem,
                  {
                    backgroundColor: isSelected ? c.primary + '0D' : 'transparent',
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={styles.versionLeft}>
                  <View style={[styles.versionBadge, { backgroundColor: c.primary + '18' }]}>
                    <Text style={[styles.versionNumber, { color: c.primary }]}>
                      {versions.length - index}
                    </Text>
                  </View>
                  <View style={styles.versionInfo}>
                    <Text style={[styles.versionDate, { color: c.onBackground }]}>
                      {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={[styles.versionPreview, { color: c.onSurfaceVariant }]} numberOfLines={2}>
                      {v.content.substring(0, 120).replace(/\n/g, ' ') || 'Empty'}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={isSelected ? 'chevron-up' : 'chevron-down'}
                  size={ICON_SIZE.sm}
                  color={c.disabled}
                />
              </Pressable>

              {/* Expanded actions */}
              {isSelected && (
                <View style={styles.versionActions}>
                  <Pressable
                    onPress={() => handleRestore(v)}
                    accessibilityRole="button"
                    accessibilityLabel="Restore this version"
                    style={({ pressed }) => [styles.restoreBtn, { borderColor: c.primary, opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Ionicons name="arrow-undo" size={ICON_SIZE.sm} color={c.primary} />
                    <Text style={[styles.restoreText, { color: c.primary }]}>Restore</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(v)}
                    accessibilityRole="button"
                    accessibilityLabel="Delete this version"
                    style={({ pressed }) => [styles.deleteBtn, { borderColor: c.error, opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Ionicons name="trash-outline" size={ICON_SIZE.sm} color={c.error} />
                    <Text style={[styles.deleteText, { color: c.error }]}>Delete</Text>
                  </Pressable>
                </View>
              )}

              {index < versions.length - 1 && (
                <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />
              )}
            </View>
          );
        })
      )}
    </BottomSheet>

    {/* Delete version confirmation */}
    {deleteConfirmVersion && (
      <BottomSheet ref={deleteConfirmRef} onClose={() => setDeleteConfirmVersion(null)}>
        <View style={styles.confirmHeader}>
          <View style={[styles.confirmIcon, { backgroundColor: c.error + '18' }]}>
            <Ionicons name="warning" size={ICON_SIZE.xl} color={c.error} />
          </View>
          <Text style={[styles.confirmTitle, { color: c.onBackground }]}>Delete Version</Text>
          <Text style={[styles.confirmMessage, { color: c.onSurfaceVariant }]}>
            Delete version from {new Date(deleteConfirmVersion.timestamp).toLocaleString()}?
          </Text>
        </View>
        <View style={styles.confirmActions}>
          <Pressable
            onPress={() => { deleteConfirmRef.current?.dismiss(); }}
            style={({ pressed }) => [styles.confirmCancelBtn, { borderColor: c.outlineVariant, opacity: pressed ? 0.7 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={[styles.confirmCancelText, { color: c.onBackground }]}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (deleteConfirmVersion) onDeleteVersion(deleteConfirmVersion.id);
              deleteConfirmRef.current?.dismiss();
              setDeleteConfirmVersion(null);
            }}
            style={({ pressed }) => [styles.confirmDeleteBtn, { backgroundColor: c.error, opacity: pressed ? 0.7 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Delete"
          >
            <Text style={[styles.confirmDeleteText, { color: c.onError }]}>Delete</Text>
          </Pressable>
        </View>
      </BottomSheet>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
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
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
  },
  versionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  versionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  versionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  versionInfo: {
    flex: 1,
  },
  versionDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  versionPreview: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  versionActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingLeft: SPACING.xxxl + SPACING.sm,
    paddingBottom: SPACING.md,
  },
  restoreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  restoreText: {
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  confirmHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  confirmIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  confirmTitle: {
    fontSize: TYPOGRAPHY.subheading.fontSize,
    fontWeight: TYPOGRAPHY.subheading.fontWeight,
    marginBottom: SPACING.sm,
  },
  confirmMessage: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    lineHeight: 20,
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  confirmCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  confirmCancelText: {
    fontSize: TYPOGRAPHY.captionSemibold.fontSize,
    fontWeight: TYPOGRAPHY.captionSemibold.fontWeight,
  },
  confirmDeleteBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
  },
  confirmDeleteText: {
    fontSize: TYPOGRAPHY.captionSemibold.fontSize,
    fontWeight: TYPOGRAPHY.captionSemibold.fontWeight,
  },
});
