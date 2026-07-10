import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/useTheme';
import { Prompt } from '../../types';
import { detectRTL } from '../../utils/rtl';
import { SPACING, RADIUS, ICON_SIZE, FAVORITE_COLOR, TYPOGRAPHY } from '../../constants';
import { BaseCard } from './BaseCard';

interface PromptCardProps {
  prompt: Prompt;
  onPress: () => void;
  onLongPress?: () => void;
  onColorPress?: () => void;
  selected?: boolean;
  showCheckbox?: boolean;
  onToggleSelect?: () => void;
}

export function PromptCard({ prompt, onPress, onLongPress, onColorPress, selected, showCheckbox, onToggleSelect }: PromptCardProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const isRTL = detectRTL(prompt.title + ' ' + prompt.content);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.();
  }, [onLongPress]);

  const preview = prompt.content.substring(0, 120).replace(/\n/g, ' ');
  const updatedAgo = getRelativeTime(prompt.updatedAt);

  return (
    <BaseCard
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessibilityLabel={`${prompt.title}${prompt.isPinned ? ', pinned' : ''}${prompt.isFavorite ? ', favorited' : ''}`}
      accessibilityHint="Tap to preview, long press for options"
    >
      {/* Header: Checkbox + Icon + Title + Chevron */}
      <View style={styles.header}>
        {showCheckbox && (
          <Pressable
            onPress={onToggleSelect}
            accessibilityRole="checkbox"
            accessibilityLabel={selected ? 'Deselect prompt' : 'Select prompt'}
            accessibilityState={{ checked: selected }}
            android_ripple={{ color: c.onBackground + '14', borderless: true }}
            hitSlop={4}
            style={({ pressed }) => [styles.checkbox, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={[styles.checkboxInner, {
              backgroundColor: selected ? c.primary : 'transparent',
              borderColor: selected ? c.primary : c.outlineVariant,
            }]}>
              {selected && <Ionicons name="checkmark" size={12} color={c.onPrimary} />}
            </View>
          </Pressable>
        )}
        <View style={[styles.icon, { backgroundColor: (prompt.color || c.primary) + '18' }]}>
          <Ionicons name="document-text" size={ICON_SIZE.md} color={prompt.color || c.primary} />
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            {prompt.isPinned && (
              <View style={[styles.pinBadge, { backgroundColor: c.primary + '18' }]}>
                <Ionicons name="pin" size={10} color={c.primary} />
              </View>
            )}
            <Text style={[styles.title, { color: c.onBackground }]} numberOfLines={1}>
              {prompt.title}
            </Text>
            {prompt.isFavorite && <Ionicons name="star" size={12} color={FAVORITE_COLOR} />}
          </View>
          <Text style={[styles.category, { color: prompt.color || c.primary }]}>{prompt.category}</Text>
        </View>
        <Ionicons name="chevron-forward" size={ICON_SIZE.sm} color={c.disabled} />
      </View>

      {/* Body: Preview */}
      <Text
        style={[styles.preview, { color: c.onSurfaceVariant, textAlign: isRTL ? 'right' : 'left' }]}
        numberOfLines={2}
      >
        {preview || 'Empty prompt...'}
      </Text>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <View style={[styles.tags, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {prompt.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: c.primary + '18' }]}>
              <Text style={[styles.tagText, { color: c.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer: Timestamp + Color capsule + Version count */}
      <View style={styles.footer}>
        <Text style={[styles.timestamp, { color: c.disabled }]}>{updatedAgo}</Text>
        <View style={styles.footerRight}>
          {onColorPress && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onColorPress();
              }}
              accessibilityRole="button"
              accessibilityLabel="Change prompt color"
              android_ripple={{ color: c.onBackground + '14', borderless: true }}
              hitSlop={4}
              style={({ pressed }) => [
                styles.colorCapsule,
                {
                  backgroundColor: prompt.color || c.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            />
          )}
          {prompt.versions.length > 0 && (
            <View style={styles.versionBadge}>
              <Ionicons name="time-outline" size={10} color={c.disabled} />
              <Text style={[styles.versionCount, { color: c.disabled }]}>
                {prompt.versions.length}
              </Text>
            </View>
          )}
        </View>
      </View>
    </BaseCard>
  );
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pinBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.bodySemibold.fontSize,
    fontWeight: '600',
    flex: 1,
  },
  category: {
    fontSize: TYPOGRAPHY.labelSmallMedium.fontSize,
    fontWeight: '500',
    marginTop: 2,
  },
  preview: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  tags: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  tagText: {
    fontSize: TYPOGRAPHY.small.fontSize,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  colorCapsule: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.small.fontSize,
    fontWeight: '500',
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  versionCount: {
    fontSize: TYPOGRAPHY.small.fontSize,
    fontWeight: '500',
  },
});
