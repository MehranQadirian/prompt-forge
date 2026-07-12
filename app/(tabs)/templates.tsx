import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Keyboard, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePromptStore } from '../../src/stores/promptStore';
import { useTemplateStore } from '../../src/stores/templateStore';
import { useTheme } from '../../src/theme/useTheme';
import { DEFAULT_TEMPLATES } from '../../src/data/templates';
import { PromptTemplate } from '../../src/types';
import { SPACING, RADIUS, TYPOGRAPHY, ICON_SIZE, TOUCH_TARGET, DEFAULT_CATEGORIES } from '../../src/constants';
import { TemplatePreviewContent } from '../../src/components/TemplatePreviewSheet';
import { useBottomSheet } from '../../src/components/BottomSheetContext';
import { TemplateContextMenu } from '../../src/components/TemplateContextMenu';
import { SearchBar } from '../../src/components/SearchBar';
import { CategoryTag } from '../../src/components/CategoryTag';
import { TemplateCard } from '../../src/components/cards/TemplateCard';
import { BottomSheet, BottomSheetRef } from '../../src/components/BottomSheet';

export default function TemplatesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = theme.color;
  const { addPrompt, hasCategory, addCustomCategory, customCategories, prompts } = usePromptStore();
  const { userTemplates, loadTemplates } = useTemplateStore();

  useEffect(() => {
    loadTemplates();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMyTemplates, setShowMyTemplates] = useState(false);
  const [contextTemplate, setContextTemplate] = useState<PromptTemplate | null>(null);
  const [showContext, setShowContext] = useState(false);
  const { showBottomSheet, hideBottomSheet } = useBottomSheet();

  const [categoryConfirmVisible, setCategoryConfirmVisible] = useState(false);
  const categorySheetRef = useRef<BottomSheetRef>(null);

  useEffect(() => {
    if (categoryConfirmVisible) {
      categorySheetRef.current?.present();
    }
  }, [categoryConfirmVisible]);
  const [pendingTemplate, setPendingTemplate] = useState<PromptTemplate | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const newCatInputRef = useRef(null);

  const categoryListRef = useRef<FlatList>(null);
  const scrollXRef = useRef(0);

  const allTemplates = useMemo(() => [...DEFAULT_TEMPLATES, ...userTemplates], [userTemplates]);

  const filteredTemplates = useMemo(() => {
    let templates = allTemplates;

    // Filter by user templates if toggle is on
    if (showMyTemplates) {
      templates = templates.filter((t) => !t.isSystem);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (selectedCategory) {
      templates = templates.filter((t) => t.category === selectedCategory);
    }
    return templates;
  }, [allTemplates, searchQuery, selectedCategory, showMyTemplates]);

  useEffect(() => {
    if (categoryListRef.current && scrollXRef.current > 0) {
      categoryListRef.current.scrollToOffset({ offset: scrollXRef.current, animated: false });
    }
  }, [selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchVisible(false);
        setSearchQuery('');
        setSelectedCategory(null);
      };
    }, [setSearchQuery])
  );

  const handleUseTemplate = useCallback((template: PromptTemplate) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    hideBottomSheet();
    // Wait for dismiss animation to complete before proceeding
    setTimeout(() => {
      if (hasCategory(template.category)) {
        const id = addPrompt(template.title, template.content, template.category);
        router.push(`/editor?id=${id}`);
      } else {
        setPendingTemplate(template);
        setCategoryConfirmVisible(true);
      }
    }, 350);
  }, [addPrompt, router, hasCategory, hideBottomSheet]);

  const handleConfirmCreateCategory = useCallback(() => {
    if (!pendingTemplate) return;
    const id = addPrompt(pendingTemplate.title, pendingTemplate.content, pendingTemplate.category);
    addCustomCategory(pendingTemplate.category);
    // Reset ALL modal state before navigation
    setCategoryConfirmVisible(false);
    setPendingTemplate(null);
    setShowCategoryPicker(false);
    setNewCatName('');
    Keyboard.dismiss();
    router.push(`/editor?id=${id}`);
  }, [pendingTemplate, addCustomCategory, addPrompt, router]);

  const handleChooseDifferentCategory = useCallback(() => {
    setShowCategoryPicker(true);
  }, []);

  const handleSelectCategory = useCallback((catName: string) => {
    if (!pendingTemplate) return;
    const id = addPrompt(pendingTemplate.title, pendingTemplate.content, catName);
    // Reset ALL modal state before navigation
    setCategoryConfirmVisible(false);
    setShowCategoryPicker(false);
    setPendingTemplate(null);
    setNewCatName('');
    Keyboard.dismiss();
    router.push(`/editor?id=${id}`);
  }, [pendingTemplate, addPrompt, router]);

  const handleCreateNewCategory = useCallback(() => {
    const name = newCatName.trim();
    if (!name || !pendingTemplate) return;
    addCustomCategory(name);
    const id = addPrompt(pendingTemplate.title, pendingTemplate.content, name);
    // Reset ALL modal state before navigation
    setCategoryConfirmVisible(false);
    setShowCategoryPicker(false);
    setPendingTemplate(null);
    setNewCatName('');
    Keyboard.dismiss();
    router.push(`/editor?id=${id}`);
  }, [newCatName, pendingTemplate, addCustomCategory, addPrompt, router]);

  const handleCardPress = useCallback((template: PromptTemplate) => {
    const content = (
      <TemplatePreviewContent
        template={template}
        onClose={hideBottomSheet}
        onUse={handleUseTemplate}
      />
    );
    const footer = (
      <TemplatePreviewContent.Footer template={template} onUse={handleUseTemplate} />
    );
    showBottomSheet(content, footer);
  }, [showBottomSheet, hideBottomSheet, handleUseTemplate]);

  const handleCardLongPress = useCallback((template: PromptTemplate) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setContextTemplate(template);
    setShowContext(true);
  }, []);

  const availableCategories = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const name of customCategories) {
      if (!seen.has(name)) { seen.add(name); result.push(name); }
    }
    for (const p of prompts) {
      if (p.category && !seen.has(p.category)) { seen.add(p.category); result.push(p.category); }
    }
    return result;
  }, [customCategories, prompts]);

  const renderTemplateCard = useCallback(({ item }: { item: PromptTemplate }) => (
    <TemplateCard
      template={item}
      onPress={() => handleCardPress(item)}
      onLongPress={() => handleCardLongPress(item)}
    />
  ), [handleCardPress, handleCardLongPress]);

  const renderHeader = useCallback(() => (
    <View>
      {/* Toggle for My Templates */}
      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, { color: c.onBackground }]}>
          {showMyTemplates ? 'My Templates' : 'All Templates'}
        </Text>
        <Switch
          value={showMyTemplates}
          onValueChange={(value) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowMyTemplates(value);
          }}
          trackColor={{ false: c.outlineVariant, true: c.primary + '60' }}
          thumbColor={showMyTemplates ? c.primary : c.onSurfaceVariant}
        />
      </View>

      <FlatList
        ref={categoryListRef}
        horizontal
        data={[{ id: 'all', name: 'All', color: c.primary }, ...DEFAULT_CATEGORIES.filter((cat) => {
          const templateCats = new Set(allTemplates.map((t) => t.category));
          return templateCats.has(cat.name);
        })]}
        renderItem={({ item }) => (
          <CategoryTag
            name={item.name}
            isSelected={item.id === 'all' ? !selectedCategory : selectedCategory === item.name}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(item.id === 'all' ? null : item.name);
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catList}
        onScroll={(e) => { scrollXRef.current = e.nativeEvent.contentOffset.x; }}
        onMomentumScrollEnd={(e) => { scrollXRef.current = e.nativeEvent.contentOffset.x; }}
      />

      <View style={styles.resultsRow}>
        <Text style={[styles.resultsText, { color: c.onSurfaceVariant }]}>
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  ), [c, selectedCategory, allTemplates, filteredTemplates.length, showMyTemplates]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <SearchBar
          title="Templates"
          query={searchQuery}
          onQueryChange={setSearchQuery}
          placeholder="Search templates..."
          isVisible={searchVisible}
          onToggle={() => setSearchVisible(!searchVisible)}
        />
      </View>

      <FlatList
        data={filteredTemplates}
        renderItem={renderTemplateCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: c.primary + '18' }]}>
              <Ionicons name="search-outline" size={ICON_SIZE.xl} color={c.disabled} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.onSurfaceVariant }]}>No templates found</Text>
            <Text style={[styles.emptySubtitle, { color: c.disabled }]}>
              Try a different search or category
            </Text>
          </View>
        }
      />

      <TemplateContextMenu
        visible={showContext}
        template={contextTemplate}
        onClose={() => setShowContext(false)}
        onUse={handleUseTemplate}
        onPreview={(t) => {
          showBottomSheet(
            <TemplatePreviewContent
              template={t}
              onClose={hideBottomSheet}
              onUse={handleUseTemplate}
            />
          );
        }}
      />

      <BottomSheet
        ref={categorySheetRef}
        onClose={() => { setCategoryConfirmVisible(false); setShowCategoryPicker(false); setPendingTemplate(null); setNewCatName(''); }}
      >
        {!showCategoryPicker ? (
          <>
            <Text style={[styles.menuTitle, { color: c.onBackground }]}>Create category "{pendingTemplate?.category}"?</Text>
            <Text style={[styles.menuSubtitle, { color: c.onSurfaceVariant }]}>
              This category doesn't exist yet. The prompt "{pendingTemplate?.title}" will be assigned to it.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                onPress={handleConfirmCreateCategory}
                style={({ pressed }) => [styles.modalBtn, { backgroundColor: c.primary, opacity: pressed ? 0.7 : 1 }]}
                android_ripple={{ color: c.onPrimary + '30' }}
                accessibilityRole="button"
                accessibilityLabel="Create category"
              >
                <Text style={[styles.modalBtnText, { color: c.onPrimary }]}>Create</Text>
              </Pressable>
              <Pressable
                onPress={handleChooseDifferentCategory}
                style={({ pressed }) => [styles.modalBtn, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant, borderWidth: 1, opacity: pressed ? 0.7 : 1 }]}
                android_ripple={{ color: c.onBackground + '14' }}
                accessibilityRole="button"
                accessibilityLabel="Choose different category"
              >
                <Text style={[styles.modalBtnText, { color: c.onBackground }]}>Choose Different</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.menuTitle, { color: c.onBackground }]}>Select category:</Text>
            <FlatList
              data={[...availableCategories, '__new__', '__other__']}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                if (item === '__new__') {
                  return (
                    <View style={[styles.catPickRow, { borderColor: c.outlineVariant }]}>
                      <View style={[styles.catPickInput, { backgroundColor: c.surfaceContainer, borderColor: c.primary }]}>
                        <TextInput
                          ref={newCatInputRef}
                          style={[styles.catPickInputText, { color: c.onBackground }]}
                          value={newCatName}
                          onChangeText={setNewCatName}
                          placeholder="New category name"
                          placeholderTextColor={c.disabled}
                          onSubmitEditing={handleCreateNewCategory}
                          returnKeyType="done"
                        />
                        <Pressable
                          onPress={handleCreateNewCategory}
                          android_ripple={{ color: c.onBackground + '14', borderless: true }}
                          hitSlop={4}
                          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                        >
                          <Ionicons name="checkmark" size={ICON_SIZE.md} color={c.primary} />
                        </Pressable>
                      </View>
                    </View>
                  );
                }
                if (item === '__other__') {
                  return (
                    <Pressable
                      onPress={() => handleSelectCategory('Other')}
                      style={({ pressed }) => [styles.catPickRow, { borderColor: c.outlineVariant, opacity: pressed ? 0.7 : 1 }]}
                      android_ripple={{ color: c.onBackground + '14' }}
                      accessibilityRole="button"
                      accessibilityLabel="Other category"
                    >
                      <Text style={[styles.catPickText, { color: c.onSurfaceVariant }]}>Other</Text>
                      <Ionicons name="chevron-forward" size={ICON_SIZE.sm} color={c.disabled} />
                    </Pressable>
                  );
                }
                return (
                  <Pressable
                    onPress={() => handleSelectCategory(item)}
                    style={({ pressed }) => [styles.catPickRow, { borderColor: c.outlineVariant, opacity: pressed ? 0.7 : 1 }]}
                    android_ripple={{ color: c.onBackground + '14' }}
                    accessibilityRole="button"
                    accessibilityLabel={item}
                  >
                    <Text style={[styles.catPickText, { color: c.onBackground }]}>{item}</Text>
                    <Ionicons name="chevron-forward" size={ICON_SIZE.sm} color={c.disabled} />
                  </Pressable>
                );
              }}
              style={styles.catPickList}
            />
          </>
        )}
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxxl,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  catList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  resultsRow: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.sm,
  },
  resultsText: {
    ...TYPOGRAPHY.labelSmallMedium,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
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
  menuTitle: {
    ...TYPOGRAPHY.subheading,
    marginBottom: SPACING.sm,
  },
  menuSubtitle: {
    ...TYPOGRAPHY.caption,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.md,
  },
  modalBtnText: {
    ...TYPOGRAPHY.captionSemibold,
  },
  catPickList: {
    maxHeight: 250,
    marginTop: SPACING.sm,
  },
  catPickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: TOUCH_TARGET,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  catPickText: {
    ...TYPOGRAPHY.bodyMedium,
  },
  catPickInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
  },
  catPickInputText: {
    flex: 1,
    ...TYPOGRAPHY.captionMedium,
    padding: 0,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  toggleLabel: {
    ...TYPOGRAPHY.bodyMedium,
  },
});
