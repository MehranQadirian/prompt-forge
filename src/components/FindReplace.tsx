import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/useTheme';
import { SPACING, RADIUS, TOUCH_TARGET, ICON_SIZE } from '../constants';

interface FindReplaceProps {
  isActive: boolean;
  onClose: () => void;
  onFind: (query: string) => void;
  onReplace: (query: string, replaceWith: string) => void;
  onReplaceAll: (query: string, replaceWith: string) => void;
  matchCount: number;
  currentMatch: number;
  onNavigateMatch: (direction: 'next' | 'prev') => void;
}

export function FindReplace({
  isActive,
  onClose,
  onFind,
  onReplace,
  onReplaceAll,
  matchCount,
  currentMatch,
  onNavigateMatch,
}: FindReplaceProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const [query, setQuery] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isActive) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isActive]);

  const handleFindChange = useCallback((text: string) => {
    setQuery(text);
    onFind(text);
  }, [onFind]);

  const handleReplace = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReplace(query, replaceWith);
  }, [query, replaceWith, onReplace]);

  const handleReplaceAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReplaceAll(query, replaceWith);
  }, [query, replaceWith, onReplaceAll]);

  if (!isActive) return null;

  return (
    <View style={[styles.container, { backgroundColor: c.surfaceContainerHigh, borderColor: c.outlineVariant }]}>
      <View style={styles.row}>
        <Ionicons name="search" size={ICON_SIZE.md} color={c.disabled} />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: c.onBackground }]}
          value={query}
          onChangeText={handleFindChange}
          placeholder="Find..."
          placeholderTextColor={c.disabled}
          returnKeyType="next"
          accessibilityLabel="Search"
        />
        {matchCount > 0 && (
          <Text style={[styles.counter, { color: c.onSurfaceVariant }]}>
            {currentMatch}/{matchCount}
          </Text>
        )}
        <IconBtn icon="chevron-up" label="Previous match" color={c.onSurfaceVariant} onPress={() => onNavigateMatch('prev')} />
        <IconBtn icon="chevron-down" label="Next match" color={c.onSurfaceVariant} onPress={() => onNavigateMatch('next')} />
        <IconBtn icon="swap-horizontal" label="Toggle replace" color={c.disabled} onPress={() => setShowReplace(!showReplace)} />
        <IconBtn icon="close" label="Close find and replace" color={c.disabled} onPress={onClose} />
      </View>

      {showReplace && (
        <View style={styles.row}>
          <Ionicons name="arrow-forward" size={ICON_SIZE.md} color={c.disabled} />
          <TextInput
            style={[styles.input, { color: c.onBackground }]}
            value={replaceWith}
            onChangeText={setReplaceWith}
            placeholder="Replace with..."
            placeholderTextColor={c.disabled}
            accessibilityLabel="Replace"
          />
          <Pressable
            onPress={handleReplace}
            accessibilityRole="button"
            accessibilityLabel="Replace one"
            style={({ pressed }) => [styles.replaceBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.replaceBtnText, { color: c.primary }]}>Replace</Text>
          </Pressable>
          <Pressable
            onPress={handleReplaceAll}
            accessibilityRole="button"
            accessibilityLabel="Replace all"
            style={({ pressed }) => [styles.replaceBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.replaceBtnText, { color: c.primary }]}>All</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function IconBtn({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Ionicons name={icon as any} size={ICON_SIZE.md} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    height: TOUCH_TARGET,
    fontSize: 16,
    fontFamily: 'monospace',
  },
  counter: {
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  iconBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replaceBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  replaceBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
