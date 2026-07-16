import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/useTheme';
import { SPACING, RADIUS, TYPOGRAPHY, ICON_SIZE } from '../../src/constants';

const GITHUB_AVATAR_URL = 'https://github.com/MehranQadirian.png';

export default function DeveloperScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = theme.color;
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(GITHUB_AVATAR_URL, { method: 'HEAD', redirect: 'follow' })
      .then((response) => {
        if (response.ok) {
          setAvatarUri(GITHUB_AVATAR_URL);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: c.outlineVariant }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            { opacity: pressed ? 0.5 : 1 },
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={ICON_SIZE.lg} color={c.onBackground} />
        </Pressable>
        <Text style={[styles.title, { color: c.onBackground }]}>Developer</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={[styles.avatar, { backgroundColor: c.primary + '18' }]}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: c.primary + '18' }]}>
                {loading ? (
                  <ActivityIndicator size="small" color={c.primary} />
                ) : (
                  <Text style={[styles.avatarText, { color: c.primary }]}>MG</Text>
                )}
              </View>
            )}
          </View>

          <Text style={[styles.developerName, { color: c.onBackground }]}>Mehran Ghadirian</Text>
          <Text style={[styles.developerRole, { color: c.onSurfaceVariant }]}>Developer</Text>

          <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />

          <Pressable
            onPress={() => Linking.openURL('https://t.me/bi_buk')}
            accessibilityRole="button"
            accessibilityLabel="Telegram"
            style={({ pressed }) => [styles.socialRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={[styles.socialIconWrap, { backgroundColor: '#229ED9' + '18' }]}>
              <Ionicons name="paper-plane" size={ICON_SIZE.md} color="#229ED9" />
            </View>
            <View style={styles.socialText}>
              <Text style={[styles.socialLabel, { color: c.onBackground }]}>Telegram</Text>
              <Text style={[styles.socialHandle, { color: c.onSurfaceVariant }]}>@bi_buk</Text>
            </View>
            <Ionicons name="open-outline" size={ICON_SIZE.sm} color={c.disabled} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />

          <Pressable
            onPress={() => Linking.openURL('https://instagram.com/mehran.9401')}
            accessibilityRole="button"
            accessibilityLabel="Instagram"
            style={({ pressed }) => [styles.socialRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={[styles.socialIconWrap, { backgroundColor: '#E4405F' + '18' }]}>
              <Ionicons name="logo-instagram" size={ICON_SIZE.md} color="#E4405F" />
            </View>
            <View style={styles.socialText}>
              <Text style={[styles.socialLabel, { color: c.onBackground }]}>Instagram</Text>
              <Text style={[styles.socialHandle, { color: c.onSurfaceVariant }]}>@mehran.9401</Text>
            </View>
            <Ionicons name="open-outline" size={ICON_SIZE.sm} color={c.disabled} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />

          <Pressable
            onPress={() => Linking.openURL('https://github.com/MehranQadirian')}
            accessibilityRole="button"
            accessibilityLabel="GitHub"
            style={({ pressed }) => [styles.socialRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={[styles.socialIconWrap, { backgroundColor: c.onBackground + '08' }]}>
              <Ionicons name="logo-github" size={ICON_SIZE.md} color={c.onBackground} />
            </View>
            <View style={styles.socialText}>
              <Text style={[styles.socialLabel, { color: c.onBackground }]}>GitHub</Text>
              <Text style={[styles.socialHandle, { color: c.onSurfaceVariant }]}>@MehranQadirian</Text>
            </View>
            <Ionicons name="open-outline" size={ICON_SIZE.sm} color={c.disabled} />
          </Pressable>
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: SPACING.sm, width: 40 },
  title: {
    ...TYPOGRAPHY.subheading,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.xl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
  },
  developerName: {
    fontSize: TYPOGRAPHY.subheading.fontSize,
    fontWeight: TYPOGRAPHY.subheading.fontWeight,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  developerRole: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  socialIconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialText: {
    flex: 1,
  },
  socialLabel: {
    fontSize: TYPOGRAPHY.bodyMedium.fontSize,
    fontWeight: TYPOGRAPHY.bodyMedium.fontWeight,
  },
  socialHandle: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    marginTop: 2,
  },
});
