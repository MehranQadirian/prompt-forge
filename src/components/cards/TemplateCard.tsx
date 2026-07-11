import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/useTheme';
import { PromptTemplate } from '../../types';
import { SPACING, RADIUS, ICON_SIZE, TYPOGRAPHY } from '../../constants';
import { BaseCard } from './BaseCard';

interface TemplateCardProps {
  template: PromptTemplate;
  onPress: () => void;
  onLongPress?: () => void;
}

export function TemplateCard({ template, onPress, onLongPress }: TemplateCardProps) {
  const { theme } = useTheme();
  const c = theme.color;

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.();
  }, [onLongPress]);

  return (
    <View style={{ marginBottom: 12 }}>
    <BaseCard
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessibilityLabel={`${template.title} template`}
      accessibilityHint="Tap to preview, long press for options"
    >
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
      <View style={[styles.previewBlock, { backgroundColor: c.surface, borderColor: c.outlineVariant }]}>
        <Text style={[styles.previewText, { color: c.disabled }]} numberOfLines={2}>
          {template.content}
        </Text>
      </View>
    </BaseCard>
    </View>
  );
}

const styles = StyleSheet.create({
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
  previewBlock: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    padding: SPACING.sm,
  },
  previewText: {
    fontSize: TYPOGRAPHY.labelSmall.fontSize,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
});
