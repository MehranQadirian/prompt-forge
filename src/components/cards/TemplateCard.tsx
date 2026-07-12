import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/useTheme';
import { PromptTemplate } from '../../types';
import { SPACING, RADIUS, ICON_SIZE, TYPOGRAPHY } from '../../constants';
import { BaseCard } from './BaseCard';
import { MarkdownRenderer } from '../MarkdownRenderer';

interface TemplateCardProps {
  template: PromptTemplate;
  onPress: () => void;
  onLongPress?: () => void;
}

export const TemplateCard = React.memo(function TemplateCard({ template, onPress, onLongPress }: TemplateCardProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.();
  }, [onLongPress]);

  const preview = useMemo(() => template.content.substring(0, 200), [template.content]);

  return (
    <View style={{ marginBottom: 12 }}>
    <BaseCard
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessibilityLabel={`${template.title} template`}
      accessibilityHint="Tap to preview, long press for options"
    >
      {/* System badge */}
      {template.isSystem && (
        <View style={[styles.systemBadge, { backgroundColor: c.primary + '20' }]}>
          <Ionicons name="shield-checkmark" size={10} color={c.primary} />
          <Text style={[styles.systemBadgeText, { color: c.primary }]}>System</Text>
        </View>
      )}

      {/* Header: Icon + Title + Chevron */}
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: c.primary + '18' }]}>
          <Ionicons name="document-text" size={ICON_SIZE.md} color={c.primary} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: c.onBackground }]} numberOfLines={1}>
            {template.title}
          </Text>
          <Text style={[styles.category, { color: c.primary }]}>{template.category}</Text>
        </View>
        <Ionicons name="chevron-forward" size={ICON_SIZE.sm} color={c.disabled} />
      </View>

      {/* Body: Description (discovery-focused, highest priority) */}
      <Text style={[styles.description, { color: c.onSurfaceVariant }]} numberOfLines={2}>
        {template.description}
      </Text>

      {/* Tags */}
      {template.tags.length > 0 && (
        <View style={styles.tags}>
          {template.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: c.primary + '18' }]}>
              <Text style={[styles.tagText, { color: c.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Content preview block */}
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
        <View style={!isExpanded ? styles.previewTruncated : undefined}>
          {preview ? (
            <MarkdownRenderer
              content={preview}
              style={styles.previewMarkdown}
            />
          ) : (
            <Text style={[styles.preview, { color: c.onSurfaceVariant }]}>
              Empty prompt...
            </Text>
          )}
        </View>
        {!isExpanded && preview.length > 80 && (
          <View style={[styles.fadeOverlay, { backgroundColor: c.surface }]} />
        )}
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
    </BaseCard>
    </View>
  );
}, (prev, next) => {
  return prev.template.id === next.template.id
    && prev.template.title === next.template.title
    && prev.template.content === next.template.content
    && prev.template.description === next.template.description
    && prev.template.isSystem === next.template.isSystem;
});

const styles = StyleSheet.create({
  systemBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  systemBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
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
  description: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  tags: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
  },
  tagText: {
    fontSize: TYPOGRAPHY.small.fontSize,
    fontWeight: '500',
  },
  previewContainer: {
    marginBottom: 0,
  },
  previewTruncated: {
    maxHeight: 52,
    overflow: 'hidden',
  },
  previewMarkdown: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    lineHeight: 20,
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    height: 20,
  },
  preview: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    lineHeight: 20,
  },
  expandRow: {
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
});
