import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useTheme } from '../../src/theme/useTheme';
import * as Haptics from 'expo-haptics';
import { SPACING, RADIUS, TYPOGRAPHY, TOUCH_TARGET, ICON_SIZE } from '../../src/constants';

export default function OptionsScreen() {
  const router = useRouter();
  const { settings, setShowTokenCount } = useSettingsStore();
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
        <Text style={[styles.title, { color: theme.color.onBackground }]}>Options</Text>
        <View style={{ width: TOUCH_TARGET }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.color.onSurfaceVariant }]}>Display</Text>
        <View style={[styles.card, { backgroundColor: theme.color.surfaceContainer, borderColor: theme.color.outlineVariant }]}>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.color.onBackground }]}>Show Token Count</Text>
            <Switch
              value={settings.showTokenCount}
              onValueChange={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowTokenCount(val);
              }}
              accessibilityLabel="Show token count"
              trackColor={{ false: theme.color.disabledContainer, true: theme.color.primary + '80' }}
              thumbColor={settings.showTokenCount ? theme.color.primary : theme.color.disabled}
            />
          </View>
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
  sectionTitle: {
    ...TYPOGRAPHY.captionSemibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xs,
  },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    minHeight: TOUCH_TARGET,
  },
  switchLabel: {
    ...TYPOGRAPHY.body,
  },
});
