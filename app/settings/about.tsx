import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Linking, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/useTheme';
import { SPACING, RADIUS, TYPOGRAPHY, TOUCH_TARGET, ICON_SIZE } from '../../src/constants';
import { hapticLight } from '../../src/constants/haptics';
import { AppIcon } from '../../src/components/AppIcon';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';

const CURRENT_VERSION = '1.1.0';
const GITHUB_REPO = 'MehranQadirian/prompt-forge';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const CHANGES_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/CHANGES.txt`;

type DownloadState = 'idle' | 'downloading' | 'downloaded' | 'installing' | 'error';

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = theme.color;
  const [checking, setChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'latest' | 'update' | 'error'>('idle');
  const [latestVersion, setLatestVersion] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  // Download state
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedFile, setDownloadedFile] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const fetchReleaseNotes = async (version: string) => {
    try {
      const response = await fetch(CHANGES_URL);
      if (!response.ok) return '';
      const text = await response.text();
      const versionHeader = `## v${version}`;
      const versionIndex = text.indexOf(versionHeader);
      if (versionIndex === -1) return '';

      const nextVersionMatch = text.substring(versionIndex + versionHeader.length).match(/\n## v\d/);
      const nextVersionIndex = nextVersionMatch && nextVersionMatch.index !== undefined
        ? versionIndex + versionHeader.length + nextVersionMatch.index
        : text.length;

      const notes = text.substring(versionIndex + versionHeader.length, nextVersionIndex).trim();
      return notes;
    } catch {
      return '';
    }
  };

  const checkForUpdates = useCallback(async () => {
    hapticLight();
    setChecking(true);
    setUpdateStatus('idle');
    setDownloadState('idle');
    setDownloadProgress(0);
    setDownloadedFile(null);
    setDownloadError(null);

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

        if (isNewer) {
          const notes = await fetchReleaseNotes(version);
          setReleaseNotes(notes);
        }
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

  const downloadUpdate = useCallback(async () => {
    if (!downloadUrl) return;

    hapticLight();
    setDownloadState('downloading');
    setDownloadProgress(0);
    setDownloadError(null);

    const fileUri = FileSystem.documentDirectory + 'prompt-forge-update.apk';

    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        setDownloadedFile(result.uri);
        setDownloadState('downloaded');
        hapticLight();
      } else {
        setDownloadState('error');
        setDownloadError('Download failed');
      }
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadState('error');
      setDownloadError('Download failed. Please try again.');
    }
  }, [downloadUrl]);

  const cancelDownload = useCallback(() => {
    setDownloadState('idle');
    setDownloadProgress(0);
    setDownloadError(null);
  }, []);

  const installUpdate = useCallback(async () => {
    if (!downloadedFile) return;

    hapticLight();
    setDownloadState('installing');

    try {
      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(downloadedFile);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1,
          type: 'application/vnd.android.package-archive',
        });
      } else {
        await Sharing.shareAsync(downloadedFile);
      }
    } catch (error) {
      console.error('Install failed:', error);
      setDownloadState('error');
      setDownloadError('Installation failed. Please install manually.');
    }
  }, [downloadedFile]);

  const openInBrowser = useCallback(() => {
    if (downloadUrl) {
      Linking.openURL(downloadUrl);
    }
  }, [downloadUrl]);

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
            disabled={checking || downloadState === 'downloading'}
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

          {updateStatus === 'update' && downloadState === 'idle' && (
            <View style={[styles.updateStatus, { borderTopColor: c.outlineVariant }]}>
              <Ionicons name="arrow-down-circle" size={ICON_SIZE.md} color={c.primary} />
              <View style={styles.updateInfo}>
                <Text style={[styles.updateStatusText, { color: c.primary }]}>
                  Update available: v{latestVersion}
                </Text>
                {downloadUrl && (
                  <View style={styles.downloadActions}>
                    <Pressable
                      onPress={downloadUpdate}
                      accessibilityRole="button"
                      accessibilityLabel="Download update"
                      android_ripple={{ color: c.primary + '14' }}
                      style={({ pressed }) => [styles.downloadBtn, { backgroundColor: c.primary, opacity: pressed ? 0.7 : 1 }]}
                    >
                      <Ionicons name="download" size={ICON_SIZE.sm} color={c.onPrimary} />
                      <Text style={[styles.downloadText, { color: c.onPrimary }]}>Download</Text>
                    </Pressable>
                    <Pressable
                      onPress={openInBrowser}
                      accessibilityRole="button"
                      accessibilityLabel="Open in browser"
                      android_ripple={{ color: c.onBackground + '14' }}
                      style={({ pressed }) => [styles.browserBtn, { borderColor: c.outlineVariant, opacity: pressed ? 0.7 : 1 }]}
                    >
                      <Ionicons name="open-outline" size={ICON_SIZE.sm} color={c.onSurfaceVariant} />
                      <Text style={[styles.browserText, { color: c.onSurfaceVariant }]}>Browser</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          )}

          {updateStatus === 'update' && downloadState === 'downloading' && (
            <View style={[styles.updateStatus, { borderTopColor: c.outlineVariant }]}>
              <ActivityIndicator size="small" color={c.primary} />
              <View style={styles.updateInfo}>
                <Text style={[styles.updateStatusText, { color: c.primary }]}>
                  Downloading v{latestVersion}...
                </Text>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: c.outlineVariant }]}>
                    <View style={[styles.progressFill, { backgroundColor: c.primary, width: `${downloadProgress * 100}%` }]} />
                  </View>
                  <Text style={[styles.progressText, { color: c.onSurfaceVariant }]}>
                    {Math.round(downloadProgress * 100)}%
                  </Text>
                </View>
                <Pressable
                  onPress={cancelDownload}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel download"
                  android_ripple={{ color: c.onBackground + '14' }}
                  style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={[styles.cancelText, { color: c.error }]}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}

          {updateStatus === 'update' && downloadState === 'downloaded' && (
            <View style={[styles.updateStatus, { borderTopColor: c.outlineVariant }]}>
              <Ionicons name="checkmark-circle" size={ICON_SIZE.md} color={c.success} />
              <View style={styles.updateInfo}>
                <Text style={[styles.updateStatusText, { color: c.success }]}>
                  Download complete!
                </Text>
                <Pressable
                  onPress={installUpdate}
                  accessibilityRole="button"
                  accessibilityLabel="Install update"
                  android_ripple={{ color: c.primary + '14' }}
                  style={({ pressed }) => [styles.installBtn, { backgroundColor: c.success, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Ionicons name="cloud-download" size={ICON_SIZE.sm} color="#FFFFFF" />
                  <Text style={[styles.installText, { color: '#FFFFFF' }]}>Install Update</Text>
                </Pressable>
              </View>
            </View>
          )}

          {updateStatus === 'update' && downloadState === 'installing' && (
            <View style={[styles.updateStatus, { borderTopColor: c.outlineVariant }]}>
              <ActivityIndicator size="small" color={c.primary} />
              <Text style={[styles.updateStatusText, { color: c.primary }]}>
                Opening installer...
              </Text>
            </View>
          )}

          {downloadState === 'error' && (
            <View style={[styles.updateStatus, { borderTopColor: c.outlineVariant }]}>
              <Ionicons name="alert-circle" size={ICON_SIZE.md} color={c.error} />
              <View style={styles.updateInfo}>
                <Text style={[styles.updateStatusText, { color: c.error }]}>
                  {downloadError || 'Download failed'}
                </Text>
                <Pressable
                  onPress={downloadUpdate}
                  accessibilityRole="button"
                  accessibilityLabel="Retry download"
                  android_ripple={{ color: c.primary + '14' }}
                  style={({ pressed }) => [styles.retryBtn, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={[styles.retryText, { color: c.primary }]}>Retry</Text>
                </Pressable>
              </View>
            </View>
          )}

          {updateStatus === 'update' && releaseNotes && downloadState === 'idle' && (
            <View style={[styles.notesSection, { borderTopColor: c.outlineVariant }]}>
              <Pressable
                onPress={() => setShowNotes(!showNotes)}
                accessibilityRole="button"
                accessibilityLabel={showNotes ? 'Hide changes' : 'Show changes'}
                android_ripple={{ color: c.onBackground + '14' }}
                style={({ pressed }) => [styles.notesToggle, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Ionicons name="list-outline" size={ICON_SIZE.md} color={c.onSurfaceVariant} />
                <Text style={[styles.notesToggleText, { color: c.onSurfaceVariant }]}>
                  What's new in v{latestVersion}
                </Text>
                <Ionicons
                  name={showNotes ? 'chevron-up' : 'chevron-down'}
                  size={ICON_SIZE.sm}
                  color={c.onSurfaceVariant}
                />
              </Pressable>
              {showNotes && (
                <View style={[styles.notesContent, { backgroundColor: c.surface }]}>
                  <Text style={[styles.notesText, { color: c.onBackground }]}>
                    {releaseNotes}
                  </Text>
                </View>
              )}
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
  downloadActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  downloadText: {
    ...TYPOGRAPHY.captionMedium,
    fontWeight: '600',
  },
  browserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  browserText: {
    ...TYPOGRAPHY.captionMedium,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...TYPOGRAPHY.small,
    minWidth: 35,
    textAlign: 'right',
  },
  cancelBtn: {
    marginTop: SPACING.sm,
  },
  cancelText: {
    ...TYPOGRAPHY.captionMedium,
    fontWeight: '600',
  },
  installBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
  },
  installText: {
    ...TYPOGRAPHY.captionMedium,
    fontWeight: '600',
  },
  retryBtn: {
    marginTop: SPACING.sm,
  },
  retryText: {
    ...TYPOGRAPHY.captionMedium,
    fontWeight: '600',
  },
  notesSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  notesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  notesToggleText: {
    ...TYPOGRAPHY.caption,
    flex: 1,
  },
  notesContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  notesText: {
    ...TYPOGRAPHY.caption,
    lineHeight: 20,
  },
});
