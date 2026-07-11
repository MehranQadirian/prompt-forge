import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/useTheme';
import { SPACING, RADIUS, TYPOGRAPHY, TOUCH_TARGET, ICON_SIZE } from '../../src/constants';
import { hapticLight } from '../../src/constants/haptics';
import { AppIcon } from '../../src/components/AppIcon';

const CURRENT_VERSION = '1.0.0';
const GITHUB_REPO = 'MehranQadirian/prompt-forge';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = theme.color;
  const [checking, setChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'latest' | 'update' | 'error'>('idle');
  const [latestVersion, setLatestVersion] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const checkForUpdates = useCallback(async () => {
    hapticLight();
    setChecking(true);
    setUpdateStatus('idle');

    try {
      const response = await fetch(GITHUB_API_URL, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });

      if (!response.ok) {
        setUpdateStatus('error');
        return;
      }

      const data = await response.json();
      const tagName = data.tag_name || '';
      const versionMatch = tagName.match(/v(\d+)-(\d+)-(\d+)/);
      if (versionMatch) {
        const version = `${versionMatch[1]}.${versionMatch[2]}.${versionMatch[3]}`;
        setLatestVersion(version);

        const apkAsset = data.assets?.find((a: any) => a.name?.endsWith('.apk'));
        if (apkAsset) {
          setDownloadUrl(apkAsset.browser_download_url);
        }

        const currentParts = CURRENT_VERSION.split('.').map(Number);
        const latestParts = version.split('.').map(Number);
        const isNewer = latestParts.some((v, i) => v > (currentParts[i] || 0));

        setUpdateStatus(isNewer ? 'update' : 'latest');
      } else {
        setUpdateStatus('error');
      }
    } catch (error) {
      setUpdateStatus('error');
    } finally {
      setChecking(false);
    }
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          android_ripple={{ color: c.onBackground + '14', borderless: true }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: pressed ? c.onBackground + '0D' : c.surfaceContainer },
          ]}
        >
          <Ionicons name="arrow-back" size={ICON_SIZE.md} color={c.onBackground} />
        </Pressable>
        <Text style={[styles.title, { color: c.onBackground }]}>About</Text>
        <View style={{ width: TOUCH_TARGET }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info Card */}
        <View style={[styles.card, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}>
          <View style={styles.appInfo}>
            <AppIcon size={56} />
            <View style={styles.appText}>
              <Text style={[styles.appName, { color: c.onBackground }]}>Prompt Forge</Text>
              <Text style={[styles.appVersion, { color: c.disabled }]}>Version {CURRENT_VERSION}</Text>
            </View>
          </View>
          <View style={[styles.appDivider, { backgroundColor: c.outlineVariant }]} />
          <Text style={[styles.appDesc, { color: c.onSurfaceVariant }]}>
            A focused notepad for crafting perfect AI prompts.
          </Text>
        </View>

        {/* Developer Card */}
        <Text style={[styles.sectionTitle, { color: c.onSurfaceVariant }]}>Developer</Text>
        <View style={[styles.card, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}>
          <View style={styles.developerInfo}>
            <View style={[styles.avatar, { backgroundColor: c.primary + '18' }]}>
              <Text style={[styles.avatarText, { color: c.primary }]}>MG</Text>
            </View>
            <View style={styles.developerText}>
              <Text style={[styles.developerName, { color: c.onBackground }]}>Mehran Ghadirian</Text>
              <Text style={[styles.developerRole, { color: c.onSurfaceVariant }]}>Developer</Text>
            </View>
          </View>

          <View style={[styles.socialDivider, { backgroundColor: c.outlineVariant }]} />

          <Pressable
            onPress={() => Linking.openURL('https://t.me/bi_buk')}
            accessibilityRole="button"
            accessibilityLabel="Telegram"
            android_ripple={{ color: c.onBackground + '14' }}
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

          <View style={[styles.socialDivider, { backgroundColor: c.outlineVariant }]} />

          <Pressable
            onPress={() => Linking.openURL('https://instagram.com/mehran.9401')}
            accessibilityRole="button"
            accessibilityLabel="Instagram"
            android_ripple={{ color: c.onBackground + '14' }}
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

          <View style={[styles.socialDivider, { backgroundColor: c.outlineVariant }]} />

          <Pressable
            onPress={() => Linking.openURL('https://github.com/MehranQadirian')}
            accessibilityRole="button"
            accessibilityLabel="GitHub"
            android_ripple={{ color: c.onBackground + '14' }}
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

        {/* Update Section */}
        <Text style={[styles.sectionTitle, { color: c.onSurfaceVariant }]}>Updates</Text>
        <View style={[styles.card, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}>
          <Pressable
            onPress={checkForUpdates}
            disabled={checking}
            accessibilityRole="button"
            accessibilityLabel="Check for updates"
            android_ripple={{ color: c.onBackground + '14' }}
            style={({ pressed }) => [
              styles.updateRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="refresh" size={ICON_SIZE.md} color={c.primary} />
            <Text style={[styles.updateLabel, { color: c.onBackground }]}>
              {checking ? 'Checking...' : 'Check for Updates'}
            </Text>
            {checking ? (
              <ActivityIndicator size="small" color={c.primary} />
            ) : (
              <Ionicons name="chevron-forward" size={ICON_SIZE.sm} color={c.disabled} />
            )}
          </Pressable>

          {updateStatus === 'latest' && (
            <View style={[styles.updateStatus, { borderTopColor: c.outlineVariant }]}>
              <Ionicons name="checkmark-circle" size={ICON_SIZE.md} color={c.success} />
              <Text style={[styles.updateStatusText, { color: c.success }]}>
                You're up to date!
              </Text>
            </View>
          )}

          {updateStatus === 'update' && (
            <View style={[styles.updateStatus, { borderTopColor: c.outlineVariant }]}>
              <Ionicons name="arrow-down-circle" size={ICON_SIZE.md} color={c.primary} />
              <View style={styles.updateInfo}>
                <Text style={[styles.updateStatusText, { color: c.primary }]}>
                  Update available: v{latestVersion}
                </Text>
                {downloadUrl && (
                  <Pressable
                    onPress={() => Linking.openURL(downloadUrl)}
                    accessibilityRole="button"
                    accessibilityLabel="Download update"
                    android_ripple={{ color: c.primary + '14' }}
                    style={({ pressed }) => [styles.downloadBtn, { opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text style={[styles.downloadText, { color: c.primary }]}>Download</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {updateStatus === 'error' && (
            <View style={[styles.updateStatus, { borderTopColor: c.outlineVariant }]}>
              <Ionicons name="alert-circle" size={ICON_SIZE.md} color={c.error} />
              <Text style={[styles.updateStatusText, { color: c.error }]}>
                Could not check for updates
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
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

  // App Info
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  appText: {
    flex: 1,
  },
  appName: {
    fontSize: TYPOGRAPHY.heading.fontSize,
    fontWeight: '700',
  },
  appVersion: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  appDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: SPACING.lg,
  },
  appDesc: {
    ...TYPOGRAPHY.caption,
    lineHeight: 20,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },

  // Developer
  developerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  developerText: {
    flex: 1,
  },
  developerName: {
    ...TYPOGRAPHY.bodyMedium,
  },
  developerRole: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  socialDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: SPACING.lg,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: TOUCH_TARGET,
  },
  socialIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialText: {
    flex: 1,
  },
  socialLabel: {
    ...TYPOGRAPHY.bodyMedium,
  },
  socialHandle: {
    ...TYPOGRAPHY.caption,
    marginTop: 1,
  },

  // Update
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    minHeight: TOUCH_TARGET,
  },
  updateLabel: {
    ...TYPOGRAPHY.body,
    flex: 1,
  },
  updateStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  updateStatusText: {
    ...TYPOGRAPHY.caption,
    flex: 1,
  },
  updateInfo: {
    flex: 1,
  },
  downloadBtn: {
    marginTop: SPACING.xs,
  },
  downloadText: {
    ...TYPOGRAPHY.captionMedium,
    fontWeight: '600',
  },
});
