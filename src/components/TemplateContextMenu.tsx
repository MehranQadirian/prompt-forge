import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../theme/useTheme';
import { PromptTemplate } from '../types';
import { SPACING, RADIUS, TOUCH_TARGET, ICON_SIZE } from '../constants';
import { hapticLight } from '../constants/haptics';
import { BottomSheet, BottomSheetRef } from './BottomSheet';

interface TemplateContextMenuProps {
  visible: boolean;
  template: PromptTemplate | null;
  onClose: () => void;
  onUse: (template: PromptTemplate) => void;
  onPreview: (template: PromptTemplate) => void;
}

export function TemplateContextMenu({
  visible,
  template,
  onClose,
  onUse,
  onPreview,
}: TemplateContextMenuProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const sheetRef = useRef<BottomSheetRef>(null);

  useEffect(() => {
    if (visible && template) {
      sheetRef.current?.present();
    }
  }, [visible, template]);

  if (!template) return null;

  const handleAction = (action: () => void) => {
    hapticLight();
    action();
    sheetRef.current?.dismiss();
  };

  const handleCopyContent = async () => {
    await Clipboard.setStringAsync(template.content);
  };

  return (
    <BottomSheet ref={sheetRef} onClose={onClose}>
      {/* Template title */}
      <View style={styles.titleRow}>
        <View style={[styles.iconWrap, { backgroundColor: c.primary + '18' }]}>
          <Ionicons name="document-text" size={ICON_SIZE.md} color={c.primary} />
        </View>
        <View style={styles.titleText}>
          <Text style={[styles.menuTitle, { color: c.onBackground }]} numberOfLines={1}>
            {template.title}
          </Text>
          <Text style={[styles.menuSubtitle, { color: c.onSurfaceVariant }]}>
            {template.category}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />

      <MenuItem
        icon="eye-outline"
        label="Preview"
        color={c.onBackground}
        onPress={() => handleAction(() => onPreview(template))}
      />
      <MenuItem
        icon="copy-outline"
        label="Copy Content"
        color={c.onBackground}
        onPress={() => handleAction(handleCopyContent)}
      />
      <MenuItem
        icon="create-outline"
        label="Use Template"
        color={c.primary}
        onPress={() => handleAction(() => onUse(template))}
      />

      <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />

      <View style={styles.tagRow}>
        {template.tags.map((tag) => (
          <View key={tag} style={[styles.tag, { backgroundColor: c.primary + '18' }]}>
            <Text style={[styles.tagText, { color: c.primary }]}>{tag}</Text>
          </View>
        ))}
      </View>
    </BottomSheet>
  );
}

function MenuItem({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{ color: color + '14' }}
      hitSlop={8}
      style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Ionicons name={icon as any} size={ICON_SIZE.md} color={color} />
      <Text style={[styles.menuItemText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  titleRow: {
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
  titleText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TOUCH_TARGET,
    gap: SPACING.md,
  },
  menuItemText: {
    fontSize: 16,
  },
  tagRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.xs,
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
});
