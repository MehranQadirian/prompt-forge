import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePromptStore } from '../src/stores/promptStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useTheme } from '../src/theme/useTheme';
import { PlaceholderBar } from '../src/components/PlaceholderBar';
import { FindReplace } from '../src/components/FindReplace';
import { UndoRedoBar } from '../src/components/UndoRedoBar';
import { VersionHistoryModal } from '../src/components/VersionHistoryModal';
import { ColorPickerModal } from '../src/components/ColorPickerModal';
import { CategoryTag } from '../src/components/CategoryTag';
import { StatItem } from '../src/components/StatItem';
import { ToolbarBtn } from '../src/components/ToolbarBtn';
import { getTextStats } from '../src/utils/tokenCounter';
import { detectRTL } from '../src/utils/rtl';
import { detectPlaceholders } from '../src/utils/placeholders';
import { useHistoryState } from '../src/hooks/useHistory';
import { useEnhance } from '../src/hooks/useEnhance';
import { EnhanceButton } from '../src/components/EnhanceButton';
import { EnhancedPromptSheet } from '../src/components/EnhancedPromptSheet';
import { SPACING, RADIUS, TOUCH_TARGET, ICON_SIZE, TYPOGRAPHY } from '../src/constants';

export default function EditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { settings } = useSettingsStore();
  const { theme } = useTheme();
  const c = theme.color;
  const { getPromptById, updatePrompt, addVersion, updatePromptColor, prompts, customCategories } = usePromptStore();

  const prompt = id ? getPromptById(id) : undefined;

  const [title, setTitle] = useState(prompt?.title || '');
  const [category, setCategory] = useState(prompt?.category || 'Other');
  const history = useHistoryState(prompt?.content || '');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);

  const contentRef = useRef<TextInput>(null);
  const titleRef = useRef<TextInput>(null);
  const currentTextRef = useRef(history.present);
  const versionCounterRef = useRef(0);

  const {
    isEnhancing,
    enhancedResult,
    showResultSheet,
    enhanceError,
    enhance,
    dismissSheet,
  } = useEnhance();

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
  const stats = useMemo(() => getTextStats(history.present), [history.present]);
  const placeholders = useMemo(() => detectPlaceholders(history.present), [history.present]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) history.redo();
          else history.undo();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
          e.preventDefault();
          history.redo();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [history.undo, history.redo]);

  useEffect(() => {
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      history.commitNow(currentTextRef.current);
    });
    return () => keyboardDidHide.remove();
  }, []);

  const handleCopy = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(history.present);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [history.present]);

  const handleSaveVersion = useCallback(() => {
    if (id) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      history.commitNow(history.present);
      addVersion(id);
    }
  }, [id, addVersion, history.present]);

  const handleRestoreVersion = useCallback(
    (version: { id: string; content: string; title: string }) => {
      if (id) {
        const { restoreVersion, getPromptById: getById } = usePromptStore.getState();
        restoreVersion(id, version.id);
        const restored = getById(id);
        if (restored) {
          setTitle(restored.title);
          setCategory(restored.category);
          history.setValue(restored.content);
        }
      }
    },
    [id, history.setValue]
  );

  const handleDeleteVersion = useCallback(
    (versionId: string) => {
      if (id) {
        const { prompts, savePrompts } = usePromptStore.getState();
        const p = prompts.find((pr: { id: string }) => pr.id === id);
        if (p) {
          const updated = p.versions.filter((v: { id: string }) => v.id !== versionId);
          usePromptStore.setState((state) => ({
            prompts: state.prompts.map((pr) =>
              pr.id === id ? { ...pr, versions: updated } : pr
            ),
          }));
          savePrompts();
        }
      }
    },
    [id]
  );

  const handleContentChange = useCallback(
    (text: string) => {
      currentTextRef.current = text;
      versionCounterRef.current += 1;
      history.setValue(text);
      if (id) updatePrompt(id, { content: text });
    },
    [id, updatePrompt, history.setValue]
  );

  const handleTitleChange = useCallback(
    (text: string) => {
      setTitle(text);
      if (id) updatePrompt(id, { title: text });
    },
    [id, updatePrompt]
  );

  const handleCategoryChange = useCallback(
    (text: string) => {
      setCategory(text);
      if (id) updatePrompt(id, { category: text });
    },
    [id, updatePrompt]
  );

  const handleFind = useCallback(
    (query: string) => {
      if (!query) {
        setMatchCount(0);
        setCurrentMatch(0);
        return;
      }
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = history.present.match(regex);
      setMatchCount(matches ? matches.length : 0);
      setCurrentMatch(matches && matches.length > 0 ? 1 : 0);
    },
    [history.present]
  );

  const handleReplace = useCallback(
    (query: string, replaceWith: string) => {
      if (!query) return;
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const newContent = history.present.replace(regex, replaceWith);
      history.setValue(newContent);
      if (id) updatePrompt(id, { content: newContent });
    },
    [history.present, id, updatePrompt, history.setValue]
  );

  const handleReplaceAll = useCallback(
    (query: string, replaceWith: string) => {
      if (!query) return;
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const newContent = history.present.replace(regex, replaceWith);
      history.setValue(newContent);
      if (id) updatePrompt(id, { content: newContent });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [history.present, id, updatePrompt, history.setValue]
  );

  const handleNavigateMatch = useCallback(
    (direction: 'next' | 'prev') => {
      if (matchCount === 0) return;
      if (direction === 'next') {
        setCurrentMatch((prev) => (prev >= matchCount ? 1 : prev + 1));
      } else {
        setCurrentMatch((prev) => (prev <= 1 ? matchCount : prev - 1));
      }
    },
    [matchCount]
  );

  const handleColorSelect = useCallback(
    (color: string) => {
      if (id) updatePromptColor(id, color);
    },
    [id, updatePromptColor]
  );

  const handleEnhance = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await enhance(history.present, versionCounterRef.current);
    if (result?.type === 'replace' && result.content) {
      history.setValue(result.content);
      if (id) updatePrompt(id, { content: result.content });
    }
  }, [enhance, history.present, history.setValue, id, updatePrompt]);

  const handleEnhancedReplace = useCallback(() => {
    if (enhancedResult) {
      history.setValue(enhancedResult);
      if (id) updatePrompt(id, { content: enhancedResult });
    }
  }, [enhancedResult, history.setValue, id, updatePrompt]);

  const handleEnhancedInsertBelow = useCallback(() => {
    if (enhancedResult) {
      const separator = history.present ? '\n\n' : '';
      const newContent = history.present + separator + enhancedResult;
      history.setValue(newContent);
      if (id) updatePrompt(id, { content: newContent });
    }
  }, [enhancedResult, history.present, history.setValue, id, updatePrompt]);

  const handleEnhancedCopy = useCallback(async () => {
    if (enhancedResult) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Clipboard.setStringAsync(enhancedResult);
    }
  }, [enhancedResult]);

  if (!prompt) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: c.disabled }}>Prompt not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: c.outlineVariant }]}>
        <Pressable
          onPress={() => {
            history.commitNow(history.present);
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          android_ripple={{ color: c.onBackground + '14', borderless: true }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.headerBtn,
            { backgroundColor: pressed ? c.onBackground + '0D' : c.surfaceContainer },
          ]}
        >
          <Ionicons name="arrow-back" size={ICON_SIZE.md} color={c.onBackground} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: c.onSurfaceVariant }]} numberOfLines={1}>
            {prompt.title || 'Untitled'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <UndoRedoBar
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            onUndo={history.undo}
            onRedo={history.redo}
          />
          <Pressable
            onPress={() => setShowFindReplace(!showFindReplace)}
            accessibilityRole="button"
            accessibilityLabel={showFindReplace ? 'Close find' : 'Find and replace'}
            android_ripple={{ color: c.onBackground + '14', borderless: true }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.headerBtn,
              { backgroundColor: pressed ? c.onBackground + '0D' : c.surfaceContainer },
            ]}
          >
            <Ionicons name="search" size={ICON_SIZE.md} color={showFindReplace ? c.primary : c.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <FindReplace
            isActive={showFindReplace}
            onClose={() => setShowFindReplace(false)}
            onFind={handleFind}
            onReplace={handleReplace}
            onReplaceAll={handleReplaceAll}
            matchCount={matchCount}
            currentMatch={currentMatch}
            onNavigateMatch={handleNavigateMatch}
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

          <Pressable
            onPress={() => setShowColorPicker(true)}
            accessibilityRole="button"
            accessibilityLabel="Change prompt color"
            android_ripple={{ color: c.onBackground + '14', borderless: true }}
            style={({ pressed }) => [
              styles.colorIndicator,
              { backgroundColor: prompt.color || c.primary, opacity: pressed ? 0.7 : 1 },
            ]}
          />

          <View style={styles.categoryRow}>
            <TextInput
              style={[styles.categoryInput, { color: c.onBackground, backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}
              value={category}
              onChangeText={handleCategoryChange}
              placeholder="Category..."
              placeholderTextColor={c.disabled}
              accessibilityLabel="Category name"
            />
          </View>

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
                  if (id) updatePrompt(id, { category: item.name });
                }}
              />
            )}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />

          {placeholders.length > 0 && <PlaceholderBar text={history.present} onTextChange={handleContentChange} promptId={id} />}

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

        <View style={[styles.toolbar, { backgroundColor: c.surface, borderTopColor: c.outlineVariant }]}>
          {showStats && (
            <View style={[styles.statsRow, { borderBottomColor: c.outlineVariant }]}>
              <StatItem label="Chars" value={stats.chars} color={c.onBackground} mutedColor={c.disabled} />
              <View style={[styles.statDivider, { backgroundColor: c.outlineVariant }]} />
              <StatItem label="Words" value={stats.words} color={c.onBackground} mutedColor={c.disabled} />
              <View style={[styles.statDivider, { backgroundColor: c.outlineVariant }]} />
              <StatItem label="~Tokens" value={stats.tokens} color={c.onBackground} mutedColor={c.disabled} />
              <View style={[styles.statDivider, { backgroundColor: c.outlineVariant }]} />
              <StatItem label="Lines" value={stats.lines} color={c.onBackground} mutedColor={c.disabled} />
            </View>
          )}

          <View style={styles.actions}>
            <ToolbarBtn
              icon="add-circle-outline"
              label="Save version"
              color={c.onSurfaceVariant}
              onPress={handleSaveVersion}
            />
            <ToolbarBtn
              icon="time-outline"
              label="View version history"
              color={c.primary}
              onPress={() => setShowHistory(true)}
            />
            <ToolbarBtn
              icon={showStats ? 'stats-chart' : 'stats-chart-outline'}
              label={showStats ? 'Hide stats' : 'Show stats'}
              color={c.primary}
              onPress={() => setShowStats(!showStats)}
            />

            <EnhanceButton isEnhancing={isEnhancing} onPress={handleEnhance} />

            <Pressable
              onPress={handleCopy}
              accessibilityRole="button"
              accessibilityLabel={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
              android_ripple={{ color: c.onPrimary + '30' }}
              style={({ pressed }) => [
                styles.copyBtn,
                {
                  backgroundColor: copied ? c.success : c.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons name={copied ? 'checkmark' : 'copy'} size={ICON_SIZE.md} color={c.onPrimary} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <VersionHistoryModal
        visible={showHistory}
        versions={prompt.versions}
        onClose={() => setShowHistory(false)}
        onRestore={handleRestoreVersion}
        onDeleteVersion={handleDeleteVersion}
      />

      <ColorPickerModal
        visible={showColorPicker}
        currentColor={prompt.color || c.primary}
        onClose={() => setShowColorPicker(false)}
        onSelect={handleColorSelect}
      />

      <EnhancedPromptSheet
        visible={showResultSheet}
        enhancedText={enhancedResult}
        error={enhanceError}
        onClose={dismissSheet}
        onReplace={handleEnhancedReplace}
        onInsertBelow={handleEnhancedInsertBelow}
        onCopy={handleEnhancedCopy}
        onOpenSettings={() => {
          dismissSheet();
          router.push('/(tabs)/settings');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: SPACING.sm },
  headerTitle: { fontSize: TYPOGRAPHY.caption.fontSize, fontWeight: TYPOGRAPHY.caption.fontWeight },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  scrollContent: { flex: 1 },
  scrollContainer: { padding: SPACING.lg },
  titleInput: { fontSize: TYPOGRAPHY.heading.fontSize, fontWeight: TYPOGRAPHY.heading.fontWeight, marginBottom: SPACING.xs, padding: 0 },
  colorIndicator: { width: 40, height: 4, borderRadius: SPACING.xs, marginBottom: SPACING.lg },
  categoryRow: { marginBottom: SPACING.sm },
  categoryInput: {
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.captionMedium.fontSize,
    fontWeight: TYPOGRAPHY.captionMedium.fontWeight,
  },
  categoryList: { paddingBottom: SPACING.md },
  contentInput: { lineHeight: 24, minHeight: 300, padding: 0 },
  toolbar: { borderTopWidth: 1 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statDivider: { width: 1, height: 24, marginHorizontal: SPACING.sm },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xxl,
    height: TOUCH_TARGET,
    borderRadius: RADIUS.md,
  },
  copyText: { fontSize: TYPOGRAPHY.captionSemibold.fontSize, fontWeight: TYPOGRAPHY.captionSemibold.fontWeight },
});
