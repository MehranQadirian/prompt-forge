import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { Prompt, SwipeAction } from '../../types';
import { detectRTL } from '../../utils/rtl';
import { SPACING, RADIUS, ICON_SIZE, FAVORITE_COLOR, TYPOGRAPHY } from '../../constants';
import { hapticLight, hapticMedium } from '../../constants/haptics';
import { BaseCard } from './BaseCard';
import { SwipeCard } from './SwipeCard';

interface PromptCardProps {
  prompt: Prompt;
  onPress: () => void;
  onLongPress?: () => void;
  onColorPress?: () => void;
  selected?: boolean;
  showCheckbox?: boolean;
  onToggleSelect?: () => void;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  onLeftAction?: () => void;
  onRightAction?: () => void;
}

export function PromptCard({
  prompt,
  onPress,
  onLongPress,
  onColorPress,
  selected,
  showCheckbox,
  onToggleSelect,
  leftAction = 'edit',
  rightAction = 'delete',
  onLeftAction,
  onRightAction,
}: PromptCardProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const isRTL = detectRTL(prompt.title + ' ' + prompt.content);
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePress = useCallback(() => {
    hapticLight();
    onPress();
  }, [onPress]);

  const handleLongPress = useCallback(() => {
    hapticMedium();
    onLongPress?.();
  }, [onLongPress]);

  const preview = prompt.content.substring(0, 200);
  const updatedAgo = getRelativeTime(prompt.updatedAt);

  return (
    <View style={{ marginBottom: 12 }}>
    <SwipeCard
      cardId={prompt.id}
      leftAction={leftAction}
      rightAction={rightAction}
      onLeftAction={onLeftAction}
      onRightAction={onRightAction}
    >
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
            <Text style={[styles.title, { color: c.onBackground }]} numberOfLines={1}>
              {prompt.title}
            </Text>
            <Text style={[styles.category, { color: prompt.color || c.primary }]}>{prompt.category}</Text>
          </View>
          <Ionicons name="chevron-forward" size={ICON_SIZE.sm} color={c.disabled} />
        </View>

        {/* Body: Expandable Preview */}
        <Pressable
          onPress={() => setIsExpanded(!isExpanded)}
          style={[styles.previewContainer, {
            backgroundColor: c.surface,
            borderColor: c.outlineVariant,
            borderWidth: StyleSheet.hairlineWidth,
            borderRadius: RADIUS.sm,
            padding: SPACING.sm,
          }]}
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? 'Collapse preview' : 'Expand preview'}
          accessibilityState={{ expanded: isExpanded }}
        >
          <Text
            style={[styles.preview, { color: c.onSurfaceVariant, textAlign: isRTL ? 'right' : 'left' }]}
            numberOfLines={isExpanded ? 6 : 2}
          >
            {preview || 'Empty prompt...'}
          </Text>
          {preview.length > 80 && (
            <View style={styles.expandRow}>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={c.onSurfaceVariant}
              />
            </View>
          )}
        </Pressable>

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

        {/* Footer Container */}
        <View style={[styles.footerContainer, { borderTopColor: c.outlineVariant }]}>
          <View style={styles.footer}>
            <Text style={[styles.timestamp, { color: c.disabled }]}>{updatedAgo}</Text>
            <View style={styles.footerRight}>
              {prompt.isPinned && (
                <View style={[styles.statusBadge, { backgroundColor: c.primary + '18' }]}>
                  <Ionicons name="pin" size={10} color={c.primary} />
                </View>
              )}
              {prompt.isFavorite && (
                <View style={[styles.statusBadge, { backgroundColor: FAVORITE_COLOR + '28' }]}>
                  <Ionicons name="star" size={10} color={FAVORITE_COLOR} />
                </View>
              )}
              {onColorPress && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation?.();
                    hapticLight();
                    onColorPress();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Change prompt color"
                  android_ripple={{ color: c.onBackground + '14', borderless: true }}
                  hitSlop={4}
                  style={({ pressed }) => [
                    styles.colorPill,
                    {
                      backgroundColor: (prompt.color || c.primary) + '28',
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <View style={[styles.colorDot, { backgroundColor: prompt.color || c.primary }]} />
                </Pressable>
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
        </View>
      </BaseCard>
    </SwipeCard>
    </View>
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
  title: {
    fontSize: TYPOGRAPHY.bodySemibold.fontSize,
    fontWeight: '600',
  },
  category: {
    fontSize: TYPOGRAPHY.labelSmallMedium.fontSize,
    fontWeight: '500',
    marginTop: 2,
  },
  previewContainer: {
    marginBottom: SPACING.sm,
  },
  preview: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    lineHeight: 20,
  },
  expandRow: {
    alignItems: 'center',
    marginTop: SPACING.xs,
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
  footerContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    height: 18,
    borderRadius: 9,
    gap: 4,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
