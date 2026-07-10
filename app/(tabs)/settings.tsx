import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/useTheme';
import * as Haptics from 'expo-haptics';
import { SPACING, RADIUS, TYPOGRAPHY, TOUCH_TARGET, ICON_SIZE } from '../../src/constants';

const SETTINGS_ITEMS = [
  { id: 'appearance', label: 'Appearance', icon: 'color-palette', route: '/settings/appearance' as const },
  { id: 'typography', label: 'Typography', icon: 'text', route: '/settings/typography' as const },
  { id: 'options', label: 'Options', icon: 'options', route: '/settings/options' as const },
  { id: 'ai', label: 'AI Enhancement', icon: 'sparkles', route: '/settings/ai' as const },
  { id: 'categories', label: 'Categories', icon: 'pricetags', route: '/categories' as const },
  { id: 'about', label: 'About', icon: 'information-circle', route: '/settings/about' as const },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.color.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.color.onBackground }]}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.color.surfaceContainer, borderColor: theme.color.outlineVariant }]}>
          {SETTINGS_ITEMS.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.route);
              }}
              style={({ pressed }) => [
                styles.menuItem,
                {
                  borderBottomColor: theme.color.outlineVariant,
                  borderBottomWidth: index < SETTINGS_ITEMS.length - 1 ? StyleSheet.hairlineWidth : 0,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              android_ripple={{ color: theme.color.onBackground + '14' }}
            >
              <Ionicons name={item.icon as any} size={ICON_SIZE.appbar} color={theme.color.primary} />
              <Text style={[styles.menuItemText, { color: theme.color.onBackground }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={ICON_SIZE.list} color={theme.color.disabled} />
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.title,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    minHeight: TOUCH_TARGET,
  },
  menuItemText: {
    flex: 1,
    ...TYPOGRAPHY.body,
  },
});
