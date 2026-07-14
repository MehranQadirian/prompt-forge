import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';
import { PromptTemplate } from '../../types';
import { SPACING, RADIUS, ICON_SIZE, TYPOGRAPHY, getCategoryColor } from '../../constants';
import { BaseCard } from './BaseCard';

interface TemplateCardProps {
  template: PromptTemplate;
  onPress: () => void;
  onLongPress?: () => void;
}

const COLLAPSED_HEIGHT = 52;
const EXPANDED_HEIGHT = 200;
const ANIM_DURATION = 250;

export const TemplateCard = React.memo(function TemplateCard({ template, onPress, onLongPress }: TemplateCardProps) {
  const { theme, mode } = useTheme();
  const c = theme.color;
  const [isExpanded, setIsExpanded] = useState(false);
  const expandProgress = useSharedValue(0);
  const categoryColor = getCategoryColor(template.category, mode);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.();
  }, [onLongPress]);

  const handleToggleExpand = useCallback(() => {
    const next = !isExpanded;
    setIsExpanded(next);
    expandProgress.value = withTiming(next ? 1 : 0, {
      duration: ANIM_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [isExpanded]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      height: COLLAPSED_HEIGHT + (EXPANDED_HEIGHT - COLLAPSED_HEIGHT) * expandProgress.value,
      overflow: 'hidden',
    };
  });

  const animatedFadeStyle = useAnimatedStyle(() => ({
    opacity: 1 - expandProgress.value,
  }));

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
        <View style={[styles.systemBadge, { backgroundColor: categoryColor + '20' }]}>
          <Text style={[styles.systemBadgeText, { color: categoryColor }]}>System</Text>
        </View>
      )}

      {/* Header: Icon + Title + Chevron */}
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: categoryColor + '18' }]}>
          <Ionicons name="reader" size={ICON_SIZE.xl - 3} color={categoryColor} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: c.onBackground }]} numberOfLines={1}>
            {template.title}
          </Text>
          <Text style={[styles.category, { color: categoryColor }]}>{template.category}</Text>
        </View>
        <Ionicons name="chevron-forward" size={ICON_SIZE.sm} color={c.disabled} />
      </View>

      {/* Tags */}
      {template.tags.length > 0 && (
        <View style={styles.tags}>
          {template.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: categoryColor + '18' }]}>
              <Text style={[styles.tagText, { color: categoryColor }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Content preview block */}
      <Pressable
        onPress={handleToggleExpand}
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
        <Animated.View style={animatedContainerStyle}>
          <View style={styles.previewContent}>
            {preview ? (
              <Text style={[styles.preview, { color: c.onSurfaceVariant }]}>
                {preview}
              </Text>
            ) : (
              <Text style={[styles.preview, { color: c.onSurfaceVariant }]}>
                Empty prompt...
              </Text>
            )}
          </View>
        </Animated.View>
        {!isExpanded && preview.length > 80 && (
          <Animated.View style={[styles.fadeOverlay, { backgroundColor: c.surface }, animatedFadeStyle]} />
        )}
        {preview.length > 80 && (
          <Pressable
            onPress={handleToggleExpand}
            style={({ pressed }) => [
              styles.expandBtn,
              {
                backgroundColor: categoryColor + '12',
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={isExpanded ? 'Collapse' : 'Expand'}
          >
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={categoryColor}
            />
          </Pressable>
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
  previewContent: {
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
  expandBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: SPACING.sm,
  },
});
