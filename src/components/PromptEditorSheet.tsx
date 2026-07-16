import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePromptStore } from '../stores/promptStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTheme } from '../theme/useTheme';
import { CategoryTag } from './CategoryTag';
import { useHistoryState } from '../hooks/useHistory';
import { detectRTL } from '../utils/rtl';
import { SPACING, RADIUS, ICON_SIZE, TYPOGRAPHY } from '../constants';
import { BottomSheet, BottomSheetRef } from './BottomSheet';

interface PromptEditorSheetProps {
  promptId: string;
  ref?: React.Ref<BottomSheetRef>;
  onClose?: () => void;
}

export const PromptEditorSheet = React.forwardRef<BottomSheetRef, PromptEditorSheetProps>(
  function PromptEditorSheet({ promptId, onClose }, ref) {
    const { theme } = useTheme();
    const c = theme.color;
    const { settings } = useSettingsStore();
    const { getPromptById, updatePrompt, addVersion, prompts, customCategories } = usePromptStore();

    const prompt = getPromptById(promptId);

    const [title, setTitle] = useState(prompt?.title || '');
    const [category, setCategory] = useState(prompt?.category || 'Other');
    const history = useHistoryState(prompt?.content || '');
    const [copied, setCopied] = useState(false);

    const contentRef = useRef<TextInput>(null);
    const titleRef = useRef<TextInput>(null);
    const currentTextRef = useRef(history.present);
    const versionCounterRef = useRef(0);

    const existingCategories: string[] = useMemo(() => {
      const seen = new Set<string>();
      const result: string[] = [];
      for (const name of customCategories) {
        if (!seen.has(name)) {
          seen.add(name);
          result.push(name);
        }
      }
      for (const p of prompts) {
        if (p.category && !seen.has(p.category)) {
          seen.add(p.category);
          result.push(p.category);
        }
      }
      return result;
    }, [prompts, customCategories]);

    const categoryData: { id: string; name: string }[] = useMemo(() => {
      const items = existingCategories.map((name, i) => ({ id: `cat-${i}`, name }));
      if (category && !items.some((item) => item.name === category)) {
        items.unshift({ id: 'current', name: category });
      }
      return items;
    }, [existingCategories, category]);

    const isRTL = detectRTL(history.present);

    // Auto-save version on editor exit if content has changed
    const autoSaveVersion = useCallback(() => {
      const currentContent = currentTextRef.current;
      if (!currentContent.trim()) return;
      const p = usePromptStore.getState().getPromptById(promptId);
      if (!p) return;
      const lastVersion = p.versions[p.versions.length - 1];
      if (lastVersion && lastVersion.content === currentContent) return;
      addVersion(promptId);
    }, [promptId, addVersion]);

    useEffect(() => {
      return () => {
        autoSaveVersion();
      };
    }, []);

    const handleContentChange = useCallback(
      (text: string) => {
        currentTextRef.current = text;
        versionCounterRef.current += 1;
        history.setValue(text);
        updatePrompt(promptId, { content: text });
      },
      [promptId, updatePrompt, history.setValue]
    );

    const handleTitleChange = useCallback(
      (text: string) => {
        setTitle(text);
        updatePrompt(promptId, { title: text });
      },
      [promptId, updatePrompt]
    );

    const handleCategoryChange = useCallback(
      (text: string) => {
        setCategory(text);
        updatePrompt(promptId, { category: text });
      },
      [promptId, updatePrompt]
    );

    const handleClose = useCallback(() => {
      history.commitNow(history.present);
      autoSaveVersion();
      Keyboard.dismiss();
      onClose?.();
    }, [history.present, autoSaveVersion, onClose]);

    if (!prompt) return null;

    return (
      <BottomSheet ref={ref} onClose={handleClose}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: c.onBackground }]}>New Prompt</Text>
          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close editor"
            hitSlop={8}
            style={({ pressed }) => [
              styles.closeBtn,
              { backgroundColor: pressed ? c.surfaceContainerHigh : c.surfaceContainer, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="close" size={ICON_SIZE.sm} color={c.onBackground} />
          </Pressable>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Title row */}
            <View style={styles.titleRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.colorDot,
                  { backgroundColor: prompt.color || c.primary, opacity: pressed ? 0.7 : 1 },
                ]}
              />
              <TextInput
                ref={titleRef}
                style={[styles.titleInput, { color: c.onBackground, textAlign: isRTL ? 'right' : 'left' }]}
                value={title}
                onChangeText={handleTitleChange}
                placeholder="Prompt title..."
                placeholderTextColor={c.disabled}
                returnKeyType="next"
                onSubmitEditing={() => contentRef.current?.focus()}
                accessibilityLabel="Prompt title"
              />
            </View>

            {/* Category section */}
            <View style={styles.categorySection}>
              <TextInput
                style={[styles.categoryInput, { color: c.onBackground, backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}
                value={category}
                onChangeText={handleCategoryChange}
                placeholder="Category"
                placeholderTextColor={c.disabled}
                accessibilityLabel="Category name"
              />
              <FlatList
                horizontal
                data={categoryData}
                renderItem={({ item }) => (
                  <CategoryTag
                    name={item.name}
                    isSelected={category === item.name}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCategory(item.name);
                      updatePrompt(promptId, { category: item.name });
                    }}
                  />
                )}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
              />
            </View>

            <TextInput
              ref={contentRef}
              style={[
                styles.contentInput,
                {
                  color: c.onBackground,
                  fontSize: settings.fontSize,
                  fontFamily: settings.fontFamily === 'mono' ? 'monospace' : settings.fontFamily === 'serif' ? 'serif' : undefined,
                  textAlign: isRTL ? 'right' : 'left',
                  textAlignVertical: 'top',
                },
              ]}
              value={history.present}
              onChangeText={handleContentChange}
              placeholder="Start writing your prompt here..."
              placeholderTextColor={c.disabled}
              multiline
              accessibilityLabel="Prompt content"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.subheading,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { flex: 1 },
  scrollContainer: {
    paddingBottom: SPACING.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  titleInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.bodySemibold.fontSize,
    fontWeight: TYPOGRAPHY.bodySemibold.fontWeight,
    padding: 0,
  },
  categorySection: {
    marginBottom: SPACING.sm,
  },
  categoryInput: {
    height: 36,
    borderRadius: RADIUS.xs,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SPACING.sm,
    fontSize: TYPOGRAPHY.captionMedium.fontSize,
    fontWeight: TYPOGRAPHY.captionMedium.fontWeight,
    marginBottom: SPACING.xs,
  },
  categoryList: { paddingBottom: SPACING.xs },
  contentInput: { lineHeight: 24, minHeight: 200, padding: 0 },
});
