import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/useTheme';
import { SPACING, RADIUS, TYPOGRAPHY, TOUCH_TARGET, ICON_SIZE } from '../../src/constants';

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.color.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          android_ripple={{ color: theme.color.onBackground + '14', borderless: true }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: pressed ? theme.color.onBackground + '0D' : theme.color.surfaceContainer },
          ]}
        >
          <Ionicons name="arrow-back" size={ICON_SIZE.md} color={theme.color.onBackground} />
        </Pressable>
        <Text style={[styles.title, { color: theme.color.onBackground }]}>About</Text>
        <View style={{ width: TOUCH_TARGET }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.color.surfaceContainer, borderColor: theme.color.outlineVariant }]}>
          <View style={styles.aboutItem}>
            <Ionicons name="flash" size={ICON_SIZE.appbar} color={theme.color.primary} />
            <View style={styles.aboutText}>
              <Text style={[styles.aboutName, { color: theme.color.onBackground }]}>Prompt Forge</Text>
              <Text style={[styles.aboutVersion, { color: theme.color.disabled }]}>Version 1.0.0</Text>
            </View>
          </View>
          <Text style={[styles.aboutDesc, { color: theme.color.onSurfaceVariant }]}>
            A focused notepad for crafting perfect AI prompts.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  backBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
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
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    minHeight: TOUCH_TARGET,
  },
  aboutText: { flex: 1 },
  aboutName: {
    fontSize: TYPOGRAPHY.subheading.fontSize,
    fontWeight: '700',
  },
  aboutVersion: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.xs,
  },
  aboutDesc: {
    ...TYPOGRAPHY.caption,
    lineHeight: 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
});
