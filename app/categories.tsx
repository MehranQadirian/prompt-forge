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
  ScrollView,
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

type DeleteModalView = 'confirm' | 'prompts' | 'reassign' | 'createCategory';

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

  // Single modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [modalView, setModalView] = useState<DeleteModalView>('confirm');
  const [newCategoryForMove, setNewCategoryForMove] = useState('');

  const inputRef = useRef<TextInput>(null);
  const editInputRef = useRef<TextInput>(null);
  const modalRef = useRef<BottomSheetRef>(null);
  const newCatInputRef = useRef<TextInput>(null);

  // Affected prompts for the target category
  const affectedPrompts = useMemo(() => {
    if (!deleteTarget) return [];
    return prompts.filter((p: Prompt) => p.category === deleteTarget);
  }, [prompts, deleteTarget]);

  useEffect(() => {
    if (modalVisible) {
      modalRef.current?.present();
    }
  }, [modalVisible]);

  useFocusEffect(
    useCallback(() => {
      const handler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (isCreating || editingId || modalVisible) {
          setIsCreating(false);
          setEditingId(null);
          setModalVisible(false);
          return true;
        }
        return false;
      });
      return () => handler.remove();
    }, [isCreating, editingId, modalVisible])
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

  useEffect(() => {
    if (modalView === 'createCategory') {
      setTimeout(() => newCatInputRef.current?.focus(), 300);
    }
  }, [modalView]);

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

  // Available categories for reassign (excluding target and 'Other')
  const reassignCategories = useMemo(() => {
    return categories.filter(
      (cat) => cat.name !== deleteTarget && cat.name !== 'All'
    );
  }, [categories, deleteTarget]);

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

  // Delete flow handlers
  const handleDeletePress = useCallback((name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDeleteTarget(name);
    setModalView('confirm');
    setModalVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    if (affectedPrompts.length === 0) {
      // No prompts — delete directly
      hapticLight();
      deleteCustomCategory(deleteTarget);
      setModalVisible(false);
      setDeleteTarget(null);
    } else {
      // Has prompts — show prompts list
      hapticLight();
      setModalView('prompts');
    }
  }, [deleteTarget, affectedPrompts, deleteCustomCategory]);

  const handleDeleteAll = useCallback(() => {
    if (!deleteTarget) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Delete all prompts in this category
    for (const p of affectedPrompts) {
      const { deletePrompt } = usePromptStore.getState();
      deletePrompt(p.id);
    }
    deleteCustomCategory(deleteTarget);
    setModalVisible(false);
    setDeleteTarget(null);
  }, [deleteTarget, affectedPrompts, deleteCustomCategory]);

  const handleMoveToCategory = useCallback(() => {
    hapticLight();
    setModalView('reassign');
  }, []);

  const handleReassign = useCallback((to: string) => {
    if (!deleteTarget) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    reassignCategory(deleteTarget, to);
    deleteCustomCategory(deleteTarget);
    setModalVisible(false);
    setDeleteTarget(null);
  }, [deleteTarget, reassignCategory, deleteCustomCategory]);

  const handleCreateCategoryForMove = useCallback(() => {
    const name = newCategoryForMove.trim();
    if (!name || !deleteTarget) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addCustomCategory(name);
    reassignCategory(deleteTarget, name);
    deleteCustomCategory(deleteTarget);
    setModalVisible(false);
    setDeleteTarget(null);
    setNewCategoryForMove('');
    Keyboard.dismiss();
  }, [newCategoryForMove, deleteTarget, addCustomCategory, reassignCategory, deleteCustomCategory]);

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
                  onPress={() => handleDeletePress(item.name)}
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
  ), [editingId, editValue, c, handleEdit, handleDeletePress]);

  // Render modal content based on current view
  const renderModalContent = () => {
    switch (modalView) {
      case 'confirm':
        return (
          <>
            <Text style={[styles.dialogTitle, { color: c.onBackground }]}>
              Delete "{deleteTarget}"?
            </Text>
            {affectedPrompts.length > 0 ? (
              <Text style={[styles.dialogText, { color: c.onSurfaceVariant }]}>
                This category has {affectedPrompts.length} prompt{affectedPrompts.length !== 1 ? 's' : ''}.
              </Text>
            ) : (
              <Text style={[styles.dialogText, { color: c.onSurfaceVariant }]}>
                This category has no prompts.
              </Text>
            )}
            <View style={styles.dialogActions}>
              <Pressable
                onPress={() => { modalRef.current?.dismiss(); }}
                style={({ pressed }) => [styles.dialogBtn, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant, borderWidth: 1, opacity: pressed ? 0.7 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                android_ripple={{ color: c.onBackground + '14' }}
              >
                <Text style={[styles.dialogBtnText, { color: c.onBackground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmDelete}
                style={({ pressed }) => [styles.dialogBtn, { backgroundColor: c.primary, opacity: pressed ? 0.7 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Continue"
                android_ripple={{ color: c.onPrimary + '30' }}
              >
                <Text style={[styles.dialogBtnText, { color: c.onPrimary }]}>Continue</Text>
              </Pressable>
            </View>
          </>
        );

      case 'prompts':
        return (
          <>
            <Text style={[styles.dialogTitle, { color: c.onBackground }]}>
              Prompts in "{deleteTarget}"
            </Text>
            <ScrollView style={styles.promptsList} showsVerticalScrollIndicator={false}>
              {affectedPrompts.map((p) => (
                <View key={p.id} style={[styles.promptItem, { borderBottomColor: c.outlineVariant }]}>
                  <View style={[styles.promptDot, { backgroundColor: p.color || c.primary }]} />
                  <Text style={[styles.promptItemTitle, { color: c.onBackground }]} numberOfLines={1}>
                    {p.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.dialogActions}>
              <Pressable
                onPress={handleDeleteAll}
                style={({ pressed }) => [styles.dialogBtn, { backgroundColor: c.error, opacity: pressed ? 0.7 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Delete all prompts"
                android_ripple={{ color: c.onError + '30' }}
              >
                <Text style={[styles.dialogBtnText, { color: c.onError }]}>Delete All</Text>
              </Pressable>
              <Pressable
                onPress={handleMoveToCategory}
                style={({ pressed }) => [styles.dialogBtn, { backgroundColor: c.primary, opacity: pressed ? 0.7 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Move to another category"
                android_ripple={{ color: c.onPrimary + '30' }}
              >
                <Text style={[styles.dialogBtnText, { color: c.onPrimary }]}>Move to Category</Text>
              </Pressable>
            </View>
          </>
        );

      case 'reassign':
        return (
          <>
            <Text style={[styles.dialogTitle, { color: c.onBackground }]}>
              Move prompts to:
            </Text>
            <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
              {reassignCategories.map((cat) => (
                <Pressable
                  key={cat.name}
                  onPress={() => handleReassign(cat.name)}
                  style={({ pressed }) => [styles.reassignOption, { borderColor: c.outlineVariant, opacity: pressed ? 0.7 : 1 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Move to ${cat.name}`}
                  android_ripple={{ color: c.onBackground + '14' }}
                >
                  <Text style={[styles.reassignText, { color: c.onBackground }]}>{cat.name}</Text>
                  <Ionicons name="chevron-forward" size={ICON_SIZE.sm} color={c.disabled} />
                </Pressable>
              ))}
              <Pressable
                onPress={() => setModalView('createCategory')}
                style={({ pressed }) => [styles.reassignOption, { borderColor: c.primary, opacity: pressed ? 0.7 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Create new category"
                android_ripple={{ color: c.primary + '14' }}
              >
                <Ionicons name="add-circle-outline" size={ICON_SIZE.md} color={c.primary} />
                <Text style={[styles.reassignText, { color: c.primary }]}>Create New Category</Text>
              </Pressable>
            </ScrollView>
          </>
        );

      case 'createCategory':
        return (
          <>
            <Text style={[styles.dialogTitle, { color: c.onBackground }]}>
              Create new category
            </Text>
            <View style={[styles.createCatRow, { borderColor: c.outlineVariant, backgroundColor: c.surfaceContainer }]}>
              <TextInput
                ref={newCatInputRef}
                style={[styles.createCatInput, { color: c.onBackground }]}
                value={newCategoryForMove}
                onChangeText={setNewCategoryForMove}
                placeholder="Category name"
                placeholderTextColor={c.disabled}
                returnKeyType="done"
                onSubmitEditing={handleCreateCategoryForMove}
              />
              <Pressable
                onPress={handleCreateCategoryForMove}
                style={({ pressed }) => [styles.createCatBtn, { backgroundColor: c.primary, opacity: pressed ? 0.7 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Create and move"
                android_ripple={{ color: c.onPrimary + '30' }}
              >
                <Ionicons name="checkmark" size={ICON_SIZE.md} color={c.onPrimary} />
              </Pressable>
            </View>
            <Pressable
              onPress={() => setModalView('reassign')}
              style={({ pressed }) => [styles.backLink, { opacity: pressed ? 0.7 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Back to category list"
            >
              <Ionicons name="arrow-back" size={ICON_SIZE.sm} color={c.primary} />
              <Text style={[styles.backLinkText, { color: c.primary }]}>Back to categories</Text>
            </Pressable>
          </>
        );
    }
  };

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
          accessibilityLabel="Add new category"
          android_ripple={{ color: c.onBackground + '14', borderless: true }}
        >
          <Ionicons name="add-circle-outline" size={24} color={c.primary} />
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
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
          <Pressable
            onPress={handleCreate}
            style={({ pressed }) => [styles.iconBtn, { backgroundColor: c.primary + '18', opacity: pressed ? 0.7 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Confirm create"
            android_ripple={{ color: c.onBackground + '14' }}
          >
            <Ionicons name="checkmark" size={20} color={c.primary} />
          </Pressable>
          <Pressable
            onPress={() => { setIsCreating(false); setNewCategoryName(''); }}
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

      {/* Single modal with state-driven content */}
      <BottomSheet ref={modalRef} onClose={() => { setModalVisible(false); setDeleteTarget(null); setNewCategoryForMove(''); }}>
        {renderModalContent()}
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
    fontSize: TYPOGRAPHY.small.fontSize,
    fontWeight: TYPOGRAPHY.small.fontWeight,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  editInput: {
    flex: 1,
    height: TOUCH_TARGET,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.bodyMedium.fontSize,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: SPACING.md,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  dialogBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
  },
  dialogBtnText: {
    fontSize: TYPOGRAPHY.captionSemibold.fontSize,
    fontWeight: TYPOGRAPHY.captionSemibold.fontWeight,
  },
  promptsList: {
    maxHeight: 200,
    marginBottom: SPACING.sm,
  },
  promptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  promptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  promptItemTitle: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    flex: 1,
  },
  categoryList: {
    maxHeight: 300,
  },
  reassignOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  reassignText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    flex: 1,
  },
  createCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    height: TOUCH_TARGET,
    marginBottom: SPACING.sm,
  },
  createCatInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.body.fontSize,
    padding: 0,
  },
  createCatBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  backLinkText: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: '500',
  },
});
