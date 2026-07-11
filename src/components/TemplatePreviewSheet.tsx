import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { PromptTemplate } from '../types';
import { SPACING, RADIUS, TOUCH_TARGET, ICON_SIZE } from '../constants';
import { hapticMedium } from '../constants/haptics';
import { MarkdownRenderer } from './MarkdownRenderer';

interface TemplatePreviewContentProps {
  template: PromptTemplate;
  onClose: () => void;
  onUse: (template: PromptTemplate) => void;
}

export function TemplatePreviewContent({ template, onClose, onUse }: TemplatePreviewContentProps) {
  const { theme } = useTheme();
  const c = theme.color;

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: c.primary + '18' }]}>
          <Ionicons name="document-text" size={ICON_SIZE.lg} color={c.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: c.onBackground }]} numberOfLines={2}>
            {template.title}
          </Text>
          <Text style={[styles.category, { color: c.primary }]}>{template.category}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={[styles.description, { color: c.onSurfaceVariant }]}>
        {template.description}
      </Text>

      {/* Tags */}
      {template.tags.length > 0 && (
        <View style={styles.tagRow}>
          {template.tags.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: c.primary + '18' }]}>
              <Text style={[styles.tagText, { color: c.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Markdown Content */}
      <View style={[styles.contentBox, { backgroundColor: c.surface, borderColor: c.outlineVariant }]}>
        <MarkdownRenderer content={template.content} />
      </View>
    </>
  );
}

// Static footer component for use with BottomSheet footer prop
TemplatePreviewContent.Footer = function TemplatePreviewFooter({ template, onUse }: {
  template: PromptTemplate;
  onUse: (template: PromptTemplate) => void;
}) {
  const { theme } = useTheme();
  const c = theme.color;

  const handleUse = useCallback(() => {
    hapticMedium();
    onUse(template);
  }, [template, onUse]);

  return (
    <Pressable
      onPress={handleUse}
      accessibilityRole="button"
      accessibilityLabel={`Use ${template.title} template`}
      android_ripple={{ color: c.onPrimary + '30' }}
      style={({ pressed }) => [styles.primaryBtn, { backgroundColor: c.primary, opacity: pressed ? 0.7 : 1 }]}
    >
      <Ionicons name="add-circle-outline" size={ICON_SIZE.sm} color={c.onPrimary} />
      <Text style={[styles.primaryText, { color: c.onPrimary }]}>Use in my own prompts</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  tagRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  contentBox: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: TOUCH_TARGET,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
