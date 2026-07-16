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
  const c = theme.color;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: c.outlineVariant }]}>
        <Text style={[styles.title, { color: c.onBackground }]}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}>
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
                  borderBottomColor: c.outlineVariant,
                  borderBottomWidth: index < SETTINGS_ITEMS.length - 1 ? StyleSheet.hairlineWidth : 0,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Ionicons name={item.icon as any} size={ICON_SIZE.appbar} color={c.primary} />
              <Text style={[styles.menuItemText, { color: c.onBackground }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={ICON_SIZE.list} color={c.disabled} />
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
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    ...TYPOGRAPHY.subheading,
    fontSize:32,
    fontWeight:'700'
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop:SPACING.xl,
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
