import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Keyboard,
  BackHandler,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, interpolate, Extrapolation } from 'react-native-reanimated';
import { usePromptStore } from '../../src/stores/promptStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useTemplateStore } from '../../src/stores/templateStore';
import { useTheme } from '../../src/theme/useTheme';
import { PromptCard } from '../../src/components/cards/PromptCard';
import { useSwipeStore } from '../../src/stores/swipeStore';
import { ContextMenu } from '../../src/components/ContextMenu';
import { PromptPreviewContent } from '../../src/components/PromptPreviewSheet';
import { useBottomSheet } from '../../src/components/BottomSheetContext';
import { SearchBar } from '../../src/components/SearchBar';
import { CategoryTag } from '../../src/components/CategoryTag';
import { ColorGridSheet } from '../../src/components/ColorGridSheet';
import { BottomSheet, BottomSheetRef } from '../../src/components/BottomSheet';
import { SPACING, RADIUS, TOUCH_TARGET, TYPOGRAPHY, ICON_SIZE } from '../../src/constants';
import { Prompt, SwipeAction } from '../../src/types';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

const CategoryInput = React.memo(function CategoryInput({
  initialName,
  onConfirm,
  onCancel,
  placeholder,
}: {
  initialName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
  placeholder: string;
}) {
  const [value, setValue] = useState(initialName);
  const { theme } = useTheme();
  const c = theme.color;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.newCategoryWrap, { backgroundColor: c.surfaceContainer, borderColor: c.primary }]}>
      <TextInput
        ref={inputRef}
        style={[styles.newCategoryInput, { color: c.onBackground }]}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={c.disabled}
        onSubmitEditing={() => onConfirm(value)}
        onBlur={() => { if (!value.trim()) onCancel(); }}
        returnKeyType="done"
        accessibilityLabel={placeholder}
      />
      <Pressable
        onPress={() => onConfirm(value)}
        accessibilityRole="button"
        accessibilityLabel="Confirm"
        hitSlop={4}
        style={styles.confirmBtn}
      >
        <Ionicons name="checkmark" size={18} color={c.primary} />
      </Pressable>
    </View>
  );
});

export default function PromptsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = theme.color;
  const {
    prompts,
    customCategories,
    categoryOrder,
    searchQuery,
    filterCategory,
    setSearchQuery,
    setFilterCategory,
    addCustomCategory,
    renameCustomCategory,
    deleteCustomCategory,
    deleteCategoryAndPrompts,
    reassignCategory,
    setCategoryOrder,
    selectPrompt,
    deletePrompt,
    duplicatePrompt,
    toggleFavorite,
    togglePin,
    updatePromptColor,
    getFilteredPrompts,
  } = usePromptStore();

  const { settings } = useSettingsStore();
  const { addTemplate } = useTemplateStore();

  const handleSwipeAction = useCallback((action: SwipeAction, prompt: Prompt) => {
    switch (action) {
      case 'edit':
        selectPrompt(prompt.id);
        router.push(`/editor?id=${prompt.id}`);
        break;
      case 'duplicate':
        duplicatePrompt(prompt.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'pin':
        togglePin(prompt.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'favorite':
        toggleFavorite(prompt.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'delete':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setDeleteConfirmPrompt(prompt);
        deleteConfirmRef.current?.present();
        break;
    }
  }, [selectPrompt, router, duplicatePrompt, togglePin, toggleFavorite, deletePrompt]);

  const [searchVisible, setSearchVisible] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPrompt, setContextMenuPrompt] = useState<Prompt | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { showBottomSheet, hideBottomSheet } = useBottomSheet();

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [reorderMode, setReorderMode] = useState(false);
  const [colorGridVisible, setColorGridVisible] = useState(false);
  const [colorGridPrompt, setColorGridPrompt] = useState<Prompt | null>(null);
  const [categoryContextMenuVisible, setCategoryContextMenuVisible] = useState(false);
  const [categoryContextMenuName, setCategoryContextMenuName] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirmPrompt, setDeleteConfirmPrompt] = useState<Prompt | null>(null);
  const deleteConfirmRef = useRef<BottomSheetRef>(null);
  const bulkDeleteConfirmRef = useRef<BottomSheetRef>(null);

  // Animation for new category input
  const newCategoryExpandProgress = useSharedValue(0);

  // Animation values for selection mode transitions
  const headerOpacity = useSharedValue(1);
  const headerTranslateY = useSharedValue(0);
  const bulkOpacity = useSharedValue(0);
  const bulkTranslateY = useSharedValue(20);

  useEffect(() => {
    if (selectionMode) {
      headerOpacity.value = withTiming(0, { duration: 250 });
      headerTranslateY.value = withTiming(-20, { duration: 250 });
      bulkOpacity.value = withTiming(1, { duration: 250 });
      bulkTranslateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    } else {
      headerOpacity.value = withTiming(1, { duration: 250 });
      headerTranslateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      bulkOpacity.value = withTiming(0, { duration: 200 });
      bulkTranslateY.value = withTiming(20, { duration: 200 });
    }
  }, [selectionMode]);

  // Animate new category input expand/collapse and auto-focus
  useEffect(() => {
    newCategoryExpandProgress.value = withTiming(showNewCategory ? 1 : 0, { duration: 150 });
    if (showNewCategory) {
      const timer = setTimeout(() => newCategoryInputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [showNewCategory]);

  const headerAnimStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const bulkAnimStyle = useAnimatedStyle(() => ({
    opacity: bulkOpacity.value,
    transform: [{ translateY: bulkTranslateY.value }],
  }));

  const newCategoryStyle = useAnimatedStyle(() => ({
    height: interpolate(newCategoryExpandProgress.value, [0, 1], [0, TOUCH_TARGET + SPACING.sm], Extrapolation.CLAMP),
    opacity: interpolate(newCategoryExpandProgress.value, [0, 0.3], [0, 1], Extrapolation.CLAMP),
  }));

  const categoryListRef = useRef<FlatList>(null);
  const scrollXRef = useRef(0);
  const categoryContextMenuSheetRef = useRef<BottomSheetRef>(null);
  const newCategoryInputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchVisible(false);
        setSearchQuery('');
        setFilterCategory(null);
        setShowNewCategory(false);
        setNewCategoryName('');
      };
    }, [setSearchQuery, setFilterCategory])
  );

  useEffect(() => {
    if (categoryContextMenuVisible) {
      categoryContextMenuSheetRef.current?.present();
    }
  }, [categoryContextMenuVisible]);

  const filteredPrompts = useMemo(() => getFilteredPrompts(), [prompts, searchQuery, filterCategory]);

  const filterCategories = useMemo(() => {
    const seen = new Set<string>();
    const result: { name: string }[] = [];
    for (const name of customCategories) {
      if (!seen.has(name)) {
        seen.add(name);
        result.push({ name });
      }
    }
    for (const p of prompts) {
      if (p.category && !seen.has(p.category)) {
        seen.add(p.category);
        result.push({ name: p.category });
      }
    }
    if (categoryOrder.length > 0) {
      result.sort((a, b) => {
        const ai = categoryOrder.indexOf(a.name);
        const bi = categoryOrder.indexOf(b.name);
        const aIdx = ai === -1 ? Infinity : ai;
        const bIdx = bi === -1 ? Infinity : bi;
        return aIdx - bIdx;
      });
    }
    return result;
  }, [prompts, customCategories, categoryOrder]);

  const headerColors = useMemo(() => ({
    surfaceContainer: c.surfaceContainer,
    primary: c.primary,
    onBackground: c.onBackground,
    onSurfaceVariant: c.onSurfaceVariant,
    outlineVariant: c.outlineVariant,
    disabled: c.disabled,
    error: c.error,
    onPrimary: c.onPrimary,
  }), [c.surfaceContainer, c.primary, c.onBackground, c.onSurfaceVariant, c.outlineVariant, c.disabled, c.error, c.onPrimary]);

  useEffect(() => {
    if (categoryListRef.current && scrollXRef.current > 0) {
      categoryListRef.current.scrollToOffset({ offset: scrollXRef.current, animated: false });
    }
  }, [filterCategory]);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectionMode) {
        setSelectionMode(false);
        setSelectedIds(new Set());
        return true;
      }
      if (reorderMode) {
        setReorderMode(false);
        return true;
      }
      if (showNewCategory) {
        setShowNewCategory(false);
        Keyboard.dismiss();
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [showNewCategory, reorderMode, selectionMode]);

  const handleCreateCategory = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setShowNewCategory(false);
      setNewCategoryName('');
      return;
    }
    addCustomCategory(trimmed);
    setFilterCategory(trimmed);
    setShowNewCategory(false);
    setNewCategoryName('');
    Keyboard.dismiss();
  }, [addCustomCategory, setFilterCategory]);

  const handlePromptPress = useCallback((prompt: Prompt) => {
    const content = (
      <PromptPreviewContent
        prompt={prompt}
        onClose={hideBottomSheet}
        onEdit={(p) => {
          hideBottomSheet();
          selectPrompt(p.id);
          router.push(`/editor?id=${p.id}`);
        }}
        onDelete={(p) => {
          deletePrompt(p.id);
          hideBottomSheet();
        }}
      />
    );
    const footer = (
      <PromptPreviewContent.Footer
        prompt={prompt}
        onDelete={(p) => { deletePrompt(p.id); hideBottomSheet(); }}
        onEdit={(p) => { hideBottomSheet(); selectPrompt(p.id); router.push(`/editor?id=${p.id}`); }}
      />
    );
    showBottomSheet(content, footer);
  }, [showBottomSheet, hideBottomSheet, selectPrompt, router, deletePrompt]);

  const handlePromptLongPress = useCallback((prompt: Prompt) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setContextMenuPrompt(prompt);
    setContextMenuVisible(true);
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (next.size === 0) {
        setSelectionMode(false);
      }
      return next;
    });
  }, []);

  const handleEnterSelectionMode = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectionMode(true);
    setSelectedIds(new Set([id]));
  }, []);

  const handleExitSelectionMode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleBulkDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    bulkDeleteConfirmRef.current?.present();
  }, []);

  const handleBulkDuplicate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    selectedIds.forEach((id) => duplicatePrompt(id));
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, [selectedIds, duplicatePrompt]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 500));
    setRefreshing(false);
  }, []);

  const renderPromptCard = useCallback(({ item }: { item: Prompt }) => (
    <PromptCard
      prompt={item}
      onPress={() => {
        if (selectionMode) {
          handleToggleSelect(item.id);
        } else {
          handlePromptPress(item);
        }
      }}
      onLongPress={() => {
        if (selectionMode) {
          handleToggleSelect(item.id);
        } else {
          handlePromptLongPress(item);
        }
      }}
      onColorPress={() => {
        setColorGridPrompt(item);
        setColorGridVisible(true);
      }}
      selected={selectedIds.has(item.id)}
      showCheckbox={selectionMode}
      onToggleSelect={() => handleToggleSelect(item.id)}
      leftAction={settings.swipeLeftAction}
      rightAction={settings.swipeRightAction}
      onLeftAction={() => handleSwipeAction(settings.swipeLeftAction, item)}
      onRightAction={() => handleSwipeAction(settings.swipeRightAction, item)}
    />
  ), [selectionMode, selectedIds, handlePromptPress, handlePromptLongPress, handleToggleSelect, settings.swipeLeftAction, settings.swipeRightAction]);

  const categoryData = useMemo(() => {
    const items = [
      { id: 'all', name: 'All' },
      { id: 'add', name: '+' },
      ...filterCategories.map((cat, i) => ({ id: `cat-${i}`, name: cat.name })),
    ];
    if (reorderMode) {
      items.push({ id: 'done-reorder', name: 'Done' });
    }
    return items;
  }, [filterCategories, reorderMode]);

  const renderHeader = useCallback(() => {
    // Separate items
    const allCategory = categoryData.find(item => item.id === 'all');
    const addCategory = categoryData.find(item => item.id === 'add');
    const draggableCategories = categoryData.filter(item => item.id !== 'all' && item.id !== 'add' && item.id !== 'done-reorder' && item.id !== 'new-input');

    return (
    <View>
      {reorderMode ? (
        /* Reorder mode: Fixed "All" + DraggableFlatList */
        <View style={styles.reorderContainer}>
          {/* Fixed "All" category */}
          {allCategory && (
            <View style={styles.reorderItem}>
              <CategoryTag
                name={allCategory.name}
                isSelected={!filterCategory}
                isReorderMode={false}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFilterCategory(null);
                }}
              />
            </View>
          )}

          {/* Draggable categories */}
          <DraggableFlatList
            horizontal
            data={draggableCategories}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => {
              const newOrder = data.map(item => item.name);
              setCategoryOrder(newOrder);
            }}
            renderItem={({ item, drag, isActive }) => (
              <ScaleDecorator>
                <CategoryTag
                  name={item.name}
                  isSelected={filterCategory === item.name}
                  isReorderMode={true}
                  onPress={() => {}}
                  onDragStart={drag}
                />
              </ScaleDecorator>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.draggableList}
          />
        </View>
      ) : (
        /* Normal mode: FlatList with all items */
        <FlatList
          ref={categoryListRef}
          horizontal
          data={categoryData}
          renderItem={({ item }) => {
            if (item.id === 'add') {
              return (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowNewCategory(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Add new category"
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.addBtn,
                    { borderColor: headerColors.outlineVariant, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Ionicons name="add" size={18} color={headerColors.onSurfaceVariant} />
                </Pressable>
              );
            }
            return (
              <View style={styles.reorderItem}>
                <CategoryTag
                  name={item.name}
                  isSelected={item.id === 'all' ? !filterCategory : filterCategory === item.name}
                  isReorderMode={false}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFilterCategory(item.id === 'all' ? null : item.name);
                  }}
                  onLongPress={item.id !== 'all' ? () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setCategoryContextMenuName(item.name);
                    setCategoryContextMenuVisible(true);
                  } : undefined}
                />
              </View>
            );
          }}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
          onScroll={(e) => { scrollXRef.current = e.nativeEvent.contentOffset.x; }}
          onMomentumScrollEnd={(e) => { scrollXRef.current = e.nativeEvent.contentOffset.x; }}
        />
      )}

      {/* New category input - animated below the category row */}
      {!reorderMode && (
        <Animated.View style={[styles.newCategoryContainer, newCategoryStyle]}>
          <View style={[styles.newCategoryWrap, { backgroundColor: headerColors.surfaceContainer, borderColor: headerColors.primary }]}>
            <TextInput
              ref={newCategoryInputRef}
              style={[styles.newCategoryInput, { color: headerColors.onBackground }]}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Category name"
              placeholderTextColor={headerColors.disabled}
              onSubmitEditing={() => handleCreateCategory(newCategoryName)}
              onBlur={() => { if (!newCategoryName.trim()) setShowNewCategory(false); }}
              returnKeyType="done"
              accessibilityLabel="New category name"
            />
            <Pressable
              onPress={() => handleCreateCategory(newCategoryName)}
              accessibilityRole="button"
              accessibilityLabel="Confirm"
              hitSlop={4}
              style={styles.confirmBtn}
            >
              <Ionicons name="checkmark" size={18} color={headerColors.primary} />
            </Pressable>
          </View>
        </Animated.View>
      )}

      <View style={styles.resultsRow}>
        <Text style={[styles.resultsText, { color: headerColors.onSurfaceVariant }]}>
          {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''}
        </Text>
        {reorderMode && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setReorderMode(false);
            }}
            accessibilityRole="button"
            accessibilityLabel="Done reordering"
            hitSlop={8}
            style={({ pressed }) => [
              styles.doneBtn,
              { backgroundColor: headerColors.primary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="checkmark" size={16} color={headerColors.onPrimary} />
            <Text style={[styles.doneBtnText, { color: headerColors.onPrimary }]}>Done</Text>
          </Pressable>
        )}
      </View>
    </View>
    );
  }, [categoryData, filterCategory, filteredPrompts.length, setFilterCategory, showNewCategory, newCategoryName, headerColors, handleCreateCategory, reorderMode, setCategoryOrder]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        {!selectionMode ? (
          <Animated.View style={headerAnimStyle}>
            <SearchBar
              title="Prompts"
              query={searchQuery}
              onQueryChange={setSearchQuery}
              placeholder="Search prompts..."
              isVisible={searchVisible}
              onToggle={() => setSearchVisible(!searchVisible)}
            />
          </Animated.View>
        ) : (
          <View style={[styles.bulkToolbar, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}>
            <Pressable
              onPress={handleExitSelectionMode}
              accessibilityRole="button"
              accessibilityLabel="Exit selection mode"
              hitSlop={8}
              style={({ pressed }) => [
                styles.bulkActionBtn,
                { backgroundColor: pressed ? c.onBackground + '14' : 'transparent' },
              ]}
            >
              <Ionicons name="close" size={ICON_SIZE.md} color={c.onSurfaceVariant} />
            </Pressable>

            <View style={styles.bulkSpacer} />

            <View style={styles.bulkCountWrap}>
              <Text style={[styles.bulkCount, { color: c.primary }]}>{selectedIds.size}</Text>
              <Text style={[styles.bulkCountLabel, { color: c.onSurfaceVariant }]}>selected</Text>
            </View>

            <View style={styles.bulkSpacer} />

            <Pressable
              onPress={handleBulkDuplicate}
              accessibilityRole="button"
              accessibilityLabel="Duplicate selected"
              hitSlop={8}
              style={({ pressed }) => [
                styles.bulkActionBtn,
                { backgroundColor: pressed ? c.onBackground + '14' : 'transparent' },
              ]}
            >
              <Ionicons name="copy-outline" size={ICON_SIZE.md} color={c.onSurfaceVariant} />
            </Pressable>

            <Pressable
              onPress={handleBulkDelete}
              accessibilityRole="button"
              accessibilityLabel="Delete selected"
              hitSlop={8}
              style={({ pressed }) => [
                styles.bulkActionBtn,
                { backgroundColor: pressed ? c.error + '14' : 'transparent' },
              ]}
            >
              <Ionicons name="trash-outline" size={ICON_SIZE.md} color={c.error} />
            </Pressable>
          </View>
        )}
      </View>

      <FlatList
        data={filteredPrompts}
        renderItem={renderPromptCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => useSwipeStore.getState().closeAll()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={c.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: c.primary + '18' }]}>
              <Ionicons name="document-text-outline" size={ICON_SIZE.xl} color={c.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.onBackground }]}>No prompts yet</Text>
            <Text style={[styles.emptySubtitle, { color: c.onSurfaceVariant }]}>
              Tap + to create your first prompt
            </Text>
          </View>
        }
      />

      {contextMenuVisible && (
        <ContextMenu
          visible={contextMenuVisible}
          prompt={contextMenuPrompt}
          onClose={() => setContextMenuVisible(false)}
          onRename={() => {
            if (contextMenuPrompt) {
              selectPrompt(contextMenuPrompt.id);
              router.push(`/editor?id=${contextMenuPrompt.id}`);
            }
            setContextMenuVisible(false);
          }}
          onDuplicate={() => {
            if (contextMenuPrompt) duplicatePrompt(contextMenuPrompt.id);
            setContextMenuVisible(false);
          }}
          onDelete={() => {
            if (contextMenuPrompt) deletePrompt(contextMenuPrompt.id);
            setContextMenuVisible(false);
          }}
          onTogglePin={() => {
            if (contextMenuPrompt) togglePin(contextMenuPrompt.id);
            setContextMenuVisible(false);
          }}
          onToggleFavorite={() => {
            if (contextMenuPrompt) toggleFavorite(contextMenuPrompt.id);
            setContextMenuVisible(false);
          }}
          onColorSelect={(color) => {
            if (contextMenuPrompt) updatePromptColor(contextMenuPrompt.id, color);
            setContextMenuVisible(false);
          }}
          onSaveAsTemplate={(prompt) => {
            addTemplate({
              title: prompt.title,
              content: prompt.content,
              category: prompt.category,
              tags: prompt.tags,
              description: '',
              isSystem: false,
            });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setContextMenuVisible(false);
          }}
          onShare={(prompt) => {
            Share.share({ message: `${prompt.title}\n\n${prompt.content}` });
            setContextMenuVisible(false);
          }}
          onSelect={() => {
            if (contextMenuPrompt) {
              handleEnterSelectionMode(contextMenuPrompt.id);
            }
            setContextMenuVisible(false);
          }}
        />
      )}

      <ColorGridSheet
        visible={colorGridVisible}
        currentColor={colorGridPrompt?.color || '#4ADE80'}
        onClose={() => {
          setColorGridVisible(false);
          setColorGridPrompt(null);
        }}
        onSelect={(color) => {
          if (colorGridPrompt) updatePromptColor(colorGridPrompt.id, color);
          setColorGridVisible(false);
          setColorGridPrompt(null);
        }}
      />

      {/* Category Context Menu */}
      <BottomSheet
        ref={categoryContextMenuSheetRef}
        onClose={() => {
          setCategoryContextMenuVisible(false);
          setCategoryContextMenuName(null);
        }}
      >
        <View style={styles.categoryContextHeader}>
          <Ionicons name="pricetags" size={ICON_SIZE.md} color={c.primary} />
          <Text style={[styles.categoryContextTitle, { color: c.onBackground }]}>
            {categoryContextMenuName}
          </Text>
        </View>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCategoryContextMenuVisible(false);
            setCategoryContextMenuName(null);
            setReorderMode(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Sort categories"
          style={({ pressed }) => [styles.categoryContextItem, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="reorder-three" size={ICON_SIZE.md} color={c.onBackground} />
          <Text style={[styles.categoryContextItemText, { color: c.onBackground }]}>Sort Categories</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCategoryContextMenuVisible(false);
            setCategoryContextMenuName(null);
            router.push('/categories');
          }}
          accessibilityRole="button"
          accessibilityLabel="Manage categories"
          style={({ pressed }) => [styles.categoryContextItem, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="settings-outline" size={ICON_SIZE.md} color={c.onBackground} />
          <Text style={[styles.categoryContextItemText, { color: c.onBackground }]}>Manage Categories</Text>
        </Pressable>
      </BottomSheet>

      {/* Single delete confirmation */}
      {deleteConfirmPrompt && (
        <BottomSheet
          ref={deleteConfirmRef}
          onClose={() => { setDeleteConfirmPrompt(null); }}
        >
          <View style={styles.confirmHeader}>
            <View style={[styles.confirmIcon, { backgroundColor: c.error + '18' }]}>
              <Ionicons name="warning" size={ICON_SIZE.xl} color={c.error} />
            </View>
            <Text style={[styles.confirmTitle, { color: c.onBackground }]}>Delete Prompt</Text>
            <Text style={[styles.confirmMessage, { color: c.onSurfaceVariant }]}>
              Are you sure you want to delete "{deleteConfirmPrompt.title}"? This action cannot be undone.
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
                if (deleteConfirmPrompt) deletePrompt(deleteConfirmPrompt.id);
                deleteConfirmRef.current?.dismiss();
                setDeleteConfirmPrompt(null);
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

      {/* Bulk delete confirmation */}
      <BottomSheet
        ref={bulkDeleteConfirmRef}
        onClose={() => {
          setSelectionMode(false);
          setSelectedIds(new Set());
        }}
      >
          <View style={styles.confirmHeader}>
            <View style={[styles.confirmIcon, { backgroundColor: c.error + '18' }]}>
              <Ionicons name="warning" size={ICON_SIZE.xl} color={c.error} />
            </View>
            <Text style={[styles.confirmTitle, { color: c.onBackground }]}>Delete Prompts</Text>
            <Text style={[styles.confirmMessage, { color: c.onSurfaceVariant }]}>
              Delete {selectedIds.size} prompt{selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.
            </Text>
          </View>
          <View style={styles.confirmActions}>
            <Pressable
              onPress={() => bulkDeleteConfirmRef.current?.dismiss()}
              style={({ pressed }) => [styles.confirmCancelBtn, { borderColor: c.outlineVariant, opacity: pressed ? 0.7 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={[styles.confirmCancelText, { color: c.onBackground }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                selectedIds.forEach((id) => deletePrompt(id));
                setSelectionMode(false);
                setSelectedIds(new Set());
                bulkDeleteConfirmRef.current?.dismiss();
              }}
              style={({ pressed }) => [styles.confirmDeleteBtn, { backgroundColor: c.error, opacity: pressed ? 0.7 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Delete all"
            >
              <Text style={[styles.confirmDeleteText, { color: c.onError }]}>Delete</Text>
            </Pressable>
          </View>
        </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  catList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  addBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    width: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  newCategoryWrap: {
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginRight: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newCategoryInput: {
    ...TYPOGRAPHY.captionMedium,
    minWidth: 100,
    flex: 1,
    padding: 0,
  },
  confirmBtn: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
  reorderItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reorderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  draggableList: {
    flexGrow: 0,
  },
  reorderBtns: {
    flexDirection: 'row',
    marginLeft: SPACING.xs,
  },
  reorderBtn: {
    padding: SPACING.xs,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.sm,
  },
  resultsText: {
    ...TYPOGRAPHY.labelSmallMedium,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    height: 28,
    borderRadius: RADIUS.sm,
  },
  doneBtnText: {
    fontSize: 12,
    fontWeight: '600',
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
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 135,
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
    ...TYPOGRAPHY.subheading,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.caption,
  },
  categoryContextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  categoryContextTitle: {
    ...TYPOGRAPHY.subheading,
  },
  categoryContextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  categoryContextItemText: {
    ...TYPOGRAPHY.body,
  },
  bulkToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  bulkActionBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
  },
  bulkSpacer: {
    flex: 1,
  },
  bulkCountWrap: {
    alignItems: 'center',
  },
  bulkCount: {
    fontSize: TYPOGRAPHY.bodyMedium.fontSize,
    fontWeight: TYPOGRAPHY.bodyMedium.fontWeight,
  },
  bulkCountLabel: {
    fontSize: TYPOGRAPHY.labelSmall.fontSize,
    fontWeight: TYPOGRAPHY.labelSmall.fontWeight,
  },
  newCategoryContainer: {
    overflow: 'hidden',
    paddingHorizontal: SPACING.lg,
  },
});