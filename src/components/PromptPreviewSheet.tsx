import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../theme/useTheme';
import { Prompt } from '../types';
import { SPACING, RADIUS, TOUCH_TARGET, ICON_SIZE, FAVORITE_COLOR } from '../constants';
import { hapticLight, hapticMedium, hapticHeavy } from '../constants/haptics';
import { MarkdownRenderer } from './MarkdownRenderer';

interface PromptPreviewContentProps {
  prompt: Prompt;
  onClose: () => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
}

export function PromptPreviewContent({ prompt, onClose, onEdit, onDelete }: PromptPreviewContentProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopy = useCallback(async () => {
    hapticLight();
    await Clipboard.setStringAsync(prompt.content);
  }, [prompt]);

  const handleEdit = useCallback(() => {
    hapticMedium();
    onEdit(prompt);
  }, [prompt, onEdit]);

  const handleDeletePress = useCallback(() => {
    hapticHeavy();
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(() => {
    hapticHeavy();
    setShowDeleteConfirm(false);
    onDelete(prompt);
  }, [prompt, onDelete]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const footer = (
    <View style={styles.footer}>
      <Pressable
        onPress={handleDeletePress}
        accessibilityRole="button"
        accessibilityLabel="Delete prompt"
        android_ripple={{ color: c.error + '14' }}
        style={({ pressed }) => [styles.dangerBtn, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Ionicons name="trash-outline" size={ICON_SIZE.sm} color={c.error} />
        <Text style={[styles.dangerText, { color: c.error }]}>Delete</Text>
      </Pressable>

      <Pressable
        onPress={handleEdit}
        accessibilityRole="button"
        accessibilityLabel="Edit prompt"
        android_ripple={{ color: c.onPrimary + '30' }}
        style={({ pressed }) => [styles.primaryBtn, { backgroundColor: c.primary, opacity: pressed ? 0.7 : 1 }]}
      >
        <Ionicons name="pencil" size={ICON_SIZE.sm} color={c.onPrimary} />
        <Text style={[styles.primaryText, { color: c.onPrimary }]}>Edit</Text>
      </Pressable>
    </View>
  );

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.colorBar, { backgroundColor: prompt.color || c.primary }]} />
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            {prompt.isPinned && (
              <Ionicons name="pin" size={ICON_SIZE.sm} color={c.primary} style={styles.pinIcon} />
            )}
            <Text style={[styles.title, { color: c.onBackground }]} numberOfLines={2}>
              {prompt.title}
            </Text>
            {prompt.isFavorite && <Ionicons name="star" size={ICON_SIZE.sm} color={FAVORITE_COLOR} />}
          </View>
          <Text style={[styles.meta, { color: c.onSurfaceVariant }]}>
            {prompt.category} · {prompt.content.length} chars
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={handleCopy}
            accessibilityRole="button"
            accessibilityLabel="Copy content"
            android_ripple={{ color: c.onBackground + '14', borderless: true }}
            hitSlop={8}
            style={({ pressed }) => [styles.copyBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="copy-outline" size={ICON_SIZE.sm} color={c.primary} />
          </Pressable>
        </View>
      </View>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <View style={styles.tagRow}>
          {prompt.tags.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: c.primary + '18' }]}>
              <Text style={[styles.tagText, { color: c.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Markdown Content */}
      <View
        style={[
          styles.contentBox,
          {
            backgroundColor: c.surface,
            borderColor: c.outlineVariant,
          },
        ]}
      >
        <MarkdownRenderer content={prompt.content} />
      </View>

      {/* Delete Confirmation Dialog */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
        accessibilityViewIsModal
      >
        <TouchableWithoutFeedback onPress={cancelDelete}>
          <View style={[styles.confirmOverlay, { backgroundColor: c.overlay }]}>
            <TouchableWithoutFeedback>
              <View style={[styles.confirmDialog, { backgroundColor: c.surfaceContainerHigh, borderColor: c.outlineVariant }]}>
                <View style={[styles.confirmIcon, { backgroundColor: c.error + '18' }]}>
                  <Ionicons name="warning" size={ICON_SIZE.xl} color={c.error} />
                </View>
                <Text style={[styles.confirmTitle, { color: c.onBackground }]}>Delete Prompt</Text>
                <Text style={[styles.confirmMessage, { color: c.onSurfaceVariant }]}>
                  Are you sure you want to delete &quot;{prompt.title}&quot;? This action cannot be undone.
                </Text>
                <View style={styles.confirmActions}>
                  <Pressable
                    onPress={cancelDelete}
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

// This component is used as children of BottomSheet via BottomSheetContext
// The footer is passed separately via the footer prop pattern
PromptPreviewContent.Footer = function PromptPreviewFooter({ prompt, onDelete, onEdit }: {
  prompt: Prompt;
  onDelete: (p: Prompt) => void;
  onEdit: (p: Prompt) => void;
}) {
  const { theme } = useTheme();
  const c = theme.color;

  return (
    <View style={styles.footer}>
      <Pressable
        onPress={() => { hapticHeavy(); onDelete(prompt); }}
        accessibilityRole="button"
        accessibilityLabel="Delete prompt"
        android_ripple={{ color: c.error + '14' }}
        style={({ pressed }) => [styles.dangerBtn, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Ionicons name="trash-outline" size={ICON_SIZE.sm} color={c.error} />
        <Text style={[styles.dangerText, { color: c.error }]}>Delete</Text>
      </Pressable>
      <Pressable
        onPress={() => { hapticMedium(); onEdit(prompt); }}
        accessibilityRole="button"
        accessibilityLabel="Edit prompt"
        android_ripple={{ color: c.onPrimary + '30' }}
        style={({ pressed }) => [styles.primaryBtn, { backgroundColor: c.primary, opacity: pressed ? 0.7 : 1 }]}
      >
        <Ionicons name="pencil" size={ICON_SIZE.sm} color={c.onPrimary} />
        <Text style={[styles.primaryText, { color: c.onPrimary }]}>Edit</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  colorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  pinIcon: {
    transform: [{ rotate: '45deg' }],
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  copyBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
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
  contentBox: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  dangerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmDialog: {
    marginHorizontal: SPACING.xxxl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
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
