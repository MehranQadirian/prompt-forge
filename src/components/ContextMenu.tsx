import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { Prompt } from '../types';
import { SPACING, RADIUS, TOUCH_TARGET, ICON_SIZE } from '../constants';
import { hapticLight, hapticHeavy } from '../constants/haptics';
import { BottomSheet, BottomSheetRef } from './BottomSheet';

interface ContextMenuProps {
  visible: boolean;
  prompt: Prompt | null;
  onClose: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onToggleFavorite: () => void;
  onColorSelect: (color: string) => void;
  onSaveAsTemplate: () => void;
  onSelect?: () => void;
}

export function ContextMenu({
  visible,
  prompt,
  onClose,
  onRename,
  onDuplicate,
  onDelete,
  onTogglePin,
  onToggleFavorite,
  onColorSelect,
  onSaveAsTemplate,
  onSelect,
}: ContextMenuProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const sheetRef = useRef<BottomSheetRef>(null);
  const confirmSheetRef = useRef<BottomSheetRef>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (visible && prompt) {
      setShowDeleteConfirm(false);
      sheetRef.current?.present();
    }
  }, [visible, prompt]);

  useEffect(() => {
    if (showDeleteConfirm) {
      confirmSheetRef.current?.present();
    }
  }, [showDeleteConfirm]);

  if (!prompt) return null;

  const handleAction = (action: () => void) => {
    hapticLight();
    action();
    sheetRef.current?.dismiss();
  };

  const handleDeletePress = () => {
    hapticHeavy();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    hapticHeavy();
    setShowDeleteConfirm(false);
    onDelete();
    sheetRef.current?.dismiss();
  };

  return (
    <>
      <BottomSheet ref={sheetRef} onClose={onClose}>
        {/* Prompt header */}
        <View style={styles.promptHeader}>
          <View style={[styles.colorBar, { backgroundColor: prompt.color || c.primary }]} />
          <View style={styles.promptInfo}>
            <Text style={[styles.promptTitle, { color: c.onBackground }]} numberOfLines={1}>
              {prompt.title}
            </Text>
            <Text style={[styles.promptMeta, { color: c.onSurfaceVariant }]}>
              {prompt.category} · {prompt.content.length} chars
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />

        {/* Select */}
        {onSelect && (
          <MenuItem
            icon="checkbox-outline"
            label="Select"
            color={c.primary}
            onPress={() => {
              hapticLight();
              onSelect();
              onClose();
            }}
          />
        )}

        {/* Quick actions */}
        <MenuItem
          icon="pencil"
          label="Rename"
          color={c.primary}
          onPress={() => handleAction(onRename)}
        />
        <MenuItem
          icon="copy"
          label="Duplicate"
          color={c.primary}
          onPress={() => handleAction(onDuplicate)}
        />
        <MenuItem
          icon={prompt.isPinned ? 'pin' : 'pin-outline'}
          label={prompt.isPinned ? 'Unpin' : 'Pin'}
          color={c.primary}
          onPress={() => handleAction(onTogglePin)}
        />
        <MenuItem
          icon={prompt.isFavorite ? 'star' : 'star-outline'}
          label={prompt.isFavorite ? 'Unfavorite' : 'Favorite'}
          color={c.primary}
          onPress={() => handleAction(onToggleFavorite)}
        />
        <MenuItem
          icon="bookmark-outline"
          label="Save as Template"
          color={c.primary}
          onPress={() => handleAction(onSaveAsTemplate)}
        />

        <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />

        {/* Delete */}
        <MenuItem
          icon="trash"
          label="Delete"
          color={c.error}
          onPress={handleDeletePress}
        />
      </BottomSheet>

      {/* Delete confirmation sheet */}
      <BottomSheet ref={confirmSheetRef} onClose={() => setShowDeleteConfirm(false)}>
        <View style={styles.confirmContent}>
          <View style={[styles.confirmIcon, { backgroundColor: c.error + '18' }]}>
            <Ionicons name="warning" size={ICON_SIZE.xl} color={c.error} />
          </View>
          <Text style={[styles.confirmTitle, { color: c.onBackground }]}>Delete Prompt</Text>
          <Text style={[styles.confirmMessage, { color: c.onSurfaceVariant }]}>
            Are you sure you want to delete &quot;{prompt.title}&quot;? This action cannot be undone.
          </Text>
          <View style={styles.confirmActions}>
            <Pressable
              onPress={() => confirmSheetRef.current?.dismiss()}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              android_ripple={{ color: c.onBackground + '14' }}
              style={({ pressed }) => [styles.cancelBtn, { borderColor: c.outline, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.cancelText, { color: c.onSurfaceVariant }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={confirmDelete}
              accessibilityRole="button"
              accessibilityLabel="Confirm delete"
              android_ripple={{ color: c.error + '30' }}
              style={({ pressed }) => [styles.deleteBtn, { backgroundColor: c.error, opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons name="trash" size={ICON_SIZE.sm} color={c.onError} />
              <Text style={[styles.deleteText, { color: c.onError }]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    </>
  );
}

function MenuItem({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{ color: color + '14' }}
      hitSlop={8}
      style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Ionicons name={icon as any} size={ICON_SIZE.md} color={color} />
      <Text style={[styles.menuItemText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  colorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  promptInfo: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  promptMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TOUCH_TARGET,
    gap: SPACING.md,
  },
  menuItemText: {
    fontSize: 16,
  },
  confirmContent: {
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  confirmMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
