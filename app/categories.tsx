import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  Keyboard,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Prompt } from '../src/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePromptStore } from '../src/stores/promptStore';
import { useTheme } from '../src/theme/useTheme';
import * as Haptics from 'expo-haptics';
import { BottomSheet, BottomSheetRef } from '../src/components/BottomSheet';
import { SPACING, RADIUS, TOUCH_TARGET, ICON_SIZE, TYPOGRAPHY } from '../src/constants';
import { hapticLight } from '../src/constants/haptics';

export default function CategoriesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = theme.color;
  const {
    prompts,
    customCategories,
    addCustomCategory,
    renameCustomCategory,
    deleteCustomCategory,
    reassignCategory,
  } = usePromptStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [reassignModalVisible, setReassignModalVisible] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);
  const editInputRef = useRef<TextInput>(null);
  const deleteSheetRef = useRef<BottomSheetRef>(null);
  const reassignSheetRef = useRef<BottomSheetRef>(null);

  useEffect(() => {
    if (deleteModalVisible) {
      deleteSheetRef.current?.present();
    }
  }, [deleteModalVisible]);

  useEffect(() => {
    if (reassignModalVisible) {
      reassignSheetRef.current?.present();
    }
  }, [reassignModalVisible]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const result: { name: string; promptCount: number; isSystem: boolean }[] = [];

    result.push({ name: 'Other', promptCount: 0, isSystem: true });

    for (const name of customCategories) {
      if (!seen.has(name) && name !== 'Other') {
        seen.add(name);
        result.push({ name, promptCount: 0, isSystem: false });
      }
    }

    for (const p of prompts) {
      if (p.category && !seen.has(p.category)) {
        seen.add(p.category);
        if (p.category !== 'Other') {
          result.push({ name: p.category, promptCount: 0, isSystem: false });
        }
      }
    }

    for (const cat of result) {
      cat.promptCount = prompts.filter((p: Prompt) => p.category === cat.name).length;
    }

    return result;
  }, [prompts, customCategories]);

  const affectedPrompts = useMemo(() => {
    if (!deleteTarget) return [];
    return prompts.filter((p: Prompt) => p.category === deleteTarget);
  }, [prompts, deleteTarget]);

  const reassignCategories = useMemo(() => {
    return categories.filter(
      (cat) => cat.name !== reassignTarget && cat.name !== 'All'
    );
  }, [categories, reassignTarget]);

  useFocusEffect(
    useCallback(() => {
      const handler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (isCreating || editingId || deleteModalVisible || reassignModalVisible) {
          setIsCreating(false);
          setEditingId(null);
          setDeleteModalVisible(false);
          setReassignModalVisible(false);
          return true;
        }
        return false;
      });
      return () => handler.remove();
    }, [isCreating, editingId, deleteModalVisible, reassignModalVisible])
  );

  useEffect(() => {
    if (isCreating) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isCreating]);

  useEffect(() => {
    if (editingId) {
      setTimeout(() => editInputRef.current?.focus(), 300);
    }
  }, [editingId]);

  const handleCreate = useCallback(() => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setIsCreating(false);
      return;
    }
    if (categories.some((cat) => cat.name.toLowerCase() === trimmed.toLowerCase())) {
      setIsCreating(false);
      return;
    }
    addCustomCategory(trimmed);
    setNewCategoryName('');
    setIsCreating(false);
    Keyboard.dismiss();
  }, [newCategoryName, categories, addCustomCategory]);

  const handleEdit = useCallback(() => {
    const trimmed = editValue.trim();
    if (!trimmed || !editingId) {
      setEditingId(null);
      return;
    }
    if (categories.some((cat) => cat.name.toLowerCase() === trimmed.toLowerCase() && cat.name !== editingId)) {
      setEditingId(null);
      return;
    }
    renameCustomCategory(editingId, trimmed);
    setEditingId(null);
    Keyboard.dismiss();
  }, [editValue, editingId, categories, renameCustomCategory]);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    if (affectedPrompts.length === 0) {
      deleteCustomCategory(deleteTarget);
      setDeleteModalVisible(false);
      setDeleteTarget(null);
    } else {
      setDeleteModalVisible(false);
      setReassignTarget(deleteTarget);
      setReassignModalVisible(true);
    }
  }, [deleteTarget, affectedPrompts, deleteCustomCategory]);

  const handleReassign = useCallback((to: string) => {
    if (!reassignTarget) return;
    reassignCategory(reassignTarget, to);
    deleteCustomCategory(reassignTarget);
    setReassignModalVisible(false);
    setReassignTarget(null);
  }, [reassignTarget, reassignCategory, deleteCustomCategory]);

  const renderCategory = useCallback(({ item }: { item: { name: string; promptCount: number; isSystem: boolean } }) => (
    <View style={[styles.categoryRow, { borderBottomColor: c.outlineVariant }]}>
      {editingId === item.name ? (
        <View style={styles.editContainer}>
          <TextInput
            ref={editInputRef}
            style={[styles.editInput, { color: c.onBackground, borderColor: c.primary }]}
            value={editValue}
            onChangeText={setEditValue}
            onSubmitEditing={handleEdit}
            returnKeyType="done"
          />
          <Pressable
            onPress={handleEdit}
            style={({ pressed }) => [styles.iconBtn, { backgroundColor: c.primary + '18', opacity: pressed ? 0.7 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Confirm edit"
            android_ripple={{ color: c.onBackground + '14' }}
          >
            <Ionicons name="checkmark" size={20} color={c.primary} />
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.categoryInfo}>
            <Text style={[styles.categoryName, { color: c.onBackground }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.promptCount, { color: c.onSurfaceVariant }]}>
              {item.promptCount} prompt{item.promptCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.actions}>
            {!item.isSystem && (
              <>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setEditingId(item.name);
                    setEditValue(item.name);
                  }}
                  style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${item.name}`}
                  android_ripple={{ color: c.onBackground + '14' }}
                >
                  <Ionicons name="pencil" size={ICON_SIZE.sm} color={c.onSurfaceVariant} />
                </Pressable>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setDeleteTarget(item.name);
                    setDeleteModalVisible(true);
                  }}
                  style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${item.name}`}
                  android_ripple={{ color: c.error + '14' }}
                >
                  <Ionicons name="trash" size={ICON_SIZE.sm} color={c.error} />
                </Pressable>
              </>
            )}
          </View>
        </>
      )}
    </View>
  ), [editingId, editValue, c, handleEdit]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.7 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          android_ripple={{ color: c.onBackground + '14', borderless: true }}
        >
          <Ionicons name="chevron-back" size={24} color={c.onBackground} />
        </Pressable>
        <Text style={[styles.title, { color: c.onBackground }]}>Categories</Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsCreating(true);
          }}
          style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.7 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Add category"
          android_ripple={{ color: c.onBackground + '14', borderless: true }}
        >
          <Ionicons name="add" size={24} color={c.primary} />
        </Pressable>
      </View>

      {isCreating && (
        <View style={[styles.createRow, { backgroundColor: c.surfaceContainer, borderColor: c.primary }]}>
          <TextInput
            ref={inputRef}
            style={[styles.createInput, { color: c.onBackground }]}
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            placeholder="Category name"
            placeholderTextColor={c.disabled}
            onSubmitEditing={handleCreate}
            returnKeyType="done"
          />
          <Pressable
            onPress={handleCreate}
            style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Confirm create"
            android_ripple={{ color: c.onBackground + '14' }}
          >
            <Ionicons name="checkmark" size={20} color={c.primary} />
          </Pressable>
          <Pressable
            onPress={() => {
              setIsCreating(false);
              setNewCategoryName('');
            }}
            style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Cancel create"
            android_ripple={{ color: c.onBackground + '14' }}
          >
            <Ionicons name="close" size={20} color={c.onSurfaceVariant} />
          </Pressable>
        </View>
      )}

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: c.primary + '18' }]}>
              <Ionicons name="pricetags-outline" size={ICON_SIZE.xl} color={c.disabled} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.onSurfaceVariant }]}>No categories yet</Text>
            <Text style={[styles.emptySubtitle, { color: c.disabled }]}>Create a category to organize your prompts</Text>
          </View>
        }
      />

      {/* Delete confirmation sheet */}
      <BottomSheet ref={deleteSheetRef} onClose={() => setDeleteModalVisible(false)}>
        <Text style={[styles.dialogTitle, { color: c.onBackground }]}>Delete "{deleteTarget}"?</Text>
        {affectedPrompts.length > 0 ? (
          <Text style={[styles.dialogText, { color: c.onSurfaceVariant }]}>
            This category has {affectedPrompts.length} prompt{affectedPrompts.length !== 1 ? 's' : ''}. They will be moved to "Other".
          </Text>
        ) : (
          <Text style={[styles.dialogText, { color: c.onSurfaceVariant }]}>
            This category has no prompts.
          </Text>
        )}
        <View style={styles.dialogActions}>
          <Pressable
            onPress={() => deleteSheetRef.current?.dismiss()}
            style={({ pressed }) => [styles.dialogBtn, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant, borderWidth: 1, opacity: pressed ? 0.7 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            android_ripple={{ color: c.onBackground + '14' }}
          >
            <Text style={[styles.dialogBtnText, { color: c.onBackground }]}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [styles.dialogBtn, { backgroundColor: c.error, opacity: pressed ? 0.7 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Delete"
            android_ripple={{ color: c.error + '30' }}
          >
            <Text style={[styles.dialogBtnText, { color: c.onError }]}>Delete</Text>
          </Pressable>
        </View>
      </BottomSheet>

      {/* Reassign category sheet */}
      <BottomSheet ref={reassignSheetRef} onClose={() => setReassignModalVisible(false)}>
        <Text style={[styles.dialogTitle, { color: c.onBackground }]}>Move prompts to:</Text>
        <FlatList
          data={reassignCategories}
          keyExtractor={(item) => item.name}
          style={styles.reassignList}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleReassign(item.name)}
              style={({ pressed }) => [styles.reassignOption, { borderColor: c.outlineVariant, opacity: pressed ? 0.7 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel={`Move to ${item.name}`}
              android_ripple={{ color: c.onBackground + '14' }}
            >
              <Text style={[styles.reassignText, { color: c.onBackground }]}>{item.name}</Text>
              <Ionicons name="chevron-forward" size={ICON_SIZE.sm} color={c.disabled} />
            </Pressable>
          )}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  backBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: TYPOGRAPHY.title.fontWeight,
    flex: 1,
    textAlign: 'center',
  },
  addBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    height: TOUCH_TARGET,
  },
  createInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.body.fontSize,
    padding: 0,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: TOUCH_TARGET + SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.bodyMedium.fontSize,
    fontWeight: TYPOGRAPHY.bodyMedium.fontWeight,
  },
  promptCount: {
    fontSize: TYPOGRAPHY.labelSmall.fontSize,
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  editInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.body.fontSize,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    height: TOUCH_TARGET,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: SPACING.md,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.bodySemibold.fontSize,
    fontWeight: TYPOGRAPHY.bodySemibold.fontWeight,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.caption.fontSize,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  dialog: {
    width: '100%',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.xl,
  },
  dialogTitle: {
    fontSize: TYPOGRAPHY.subheading.fontSize,
    fontWeight: TYPOGRAPHY.subheading.fontWeight,
    marginBottom: SPACING.sm,
  },
  dialogText: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  dialogBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.md,
  },
  dialogBtnText: {
    fontSize: TYPOGRAPHY.captionSemibold.fontSize,
    fontWeight: TYPOGRAPHY.captionSemibold.fontWeight,
  },
  reassignList: {
    maxHeight: 200,
    marginTop: SPACING.md,
  },
  reassignOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: TOUCH_TARGET,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  reassignText: {
    fontSize: TYPOGRAPHY.bodyMedium.fontSize,
    fontWeight: TYPOGRAPHY.bodyMedium.fontWeight,
  },
});
