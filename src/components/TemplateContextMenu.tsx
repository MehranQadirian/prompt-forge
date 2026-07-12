import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../theme/useTheme';
import { PromptTemplate } from '../types';
import { SPACING, RADIUS, TOUCH_TARGET, ICON_SIZE } from '../constants';
import { hapticLight, hapticHeavy } from '../constants/haptics';
import { BottomSheet, BottomSheetRef } from './BottomSheet';
import { useTemplateStore } from '../stores/templateStore';

interface TemplateContextMenuProps {
  visible: boolean;
  template: PromptTemplate | null;
  onClose: () => void;
  onUse: (template: PromptTemplate) => void;
  onPreview: (template: PromptTemplate) => void;
}

export function TemplateContextMenu({
  visible,
  template,
  onClose,
  onUse,
  onPreview,
}: TemplateContextMenuProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const sheetRef = useRef<BottomSheetRef>(null);
  const confirmSheetRef = useRef<BottomSheetRef>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteTemplate = useTemplateStore((s) => s.deleteTemplate);

  useEffect(() => {
    if (visible && template) {
      setShowDeleteConfirm(false);
      sheetRef.current?.present();
    }
  }, [visible, template]);

  useEffect(() => {
    if (showDeleteConfirm) {
      confirmSheetRef.current?.present();
    }
  }, [showDeleteConfirm]);

  if (!template) return null;

  const handleAction = (action: () => void) => {
    hapticLight();
    action();
    sheetRef.current?.dismiss();
  };

  const handleCopyContent = async () => {
    await Clipboard.setStringAsync(template.content);
  };

  const handleDeletePress = () => {
    hapticHeavy();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    hapticHeavy();
    setShowDeleteConfirm(false);
    deleteTemplate(template.id);
    sheetRef.current?.dismiss();
  };

  return (
    <>
      <BottomSheet ref={sheetRef} onClose={onClose}>
        {/* Template title */}
        <View style={styles.titleRow}>
          <View style={[styles.iconWrap, { backgroundColor: c.primary + '18' }]}>
            <Ionicons name="document-text" size={ICON_SIZE.md} color={c.primary} />
          </View>
          <View style={styles.titleText}>
            <Text style={[styles.menuTitle, { color: c.onBackground }]} numberOfLines={1}>
              {template.title}
            </Text>
            <Text style={[styles.menuSubtitle, { color: c.onSurfaceVariant }]}>
              {template.category}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />

        <MenuItem
          icon="eye-outline"
          label="Preview"
          color={c.onBackground}
          onPress={() => handleAction(() => onPreview(template))}
        />
        <MenuItem
          icon="copy-outline"
          label="Copy Content"
          color={c.onBackground}
          onPress={() => handleAction(handleCopyContent)}
        />
        <MenuItem
          icon="create-outline"
          label="Use Template"
          color={c.primary}
          onPress={() => handleAction(() => onUse(template))}
        />

        {/* Delete option - only for user templates */}
        {!template.isSystem && (
          <>
            <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />
            <MenuItem
              icon="trash"
              label="Delete"
              color={c.error}
              onPress={handleDeletePress}
            />
          </>
        )}

        <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />

        <View style={styles.tagRow}>
          {template.tags.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: c.primary + '18' }]}>
              <Text style={[styles.tagText, { color: c.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>
      </BottomSheet>

      {/* Delete confirmation sheet */}
      <BottomSheet ref={confirmSheetRef} onClose={() => setShowDeleteConfirm(false)}>
        <View style={styles.confirmContent}>
          <View style={[styles.confirmIcon, { backgroundColor: c.error + '18' }]}>
            <Ionicons name="warning" size={ICON_SIZE.xl} color={c.error} />
          </View>
          <Text style={[styles.confirmTitle, { color: c.onBackground }]}>Delete Template</Text>
          <Text style={[styles.confirmMessage, { color: c.onSurfaceVariant }]}>
            Are you sure you want to delete &quot;{template.title}&quot;? This action cannot be undone.
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  confirmContent: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  confirmIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
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
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteBtn: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
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
  tagRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.xs,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
