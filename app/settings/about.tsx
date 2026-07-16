import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Linking,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/theme/useTheme";
import {
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  TOUCH_TARGET,
  ICON_SIZE,
} from "../../src/constants";
import { hapticLight } from "../../src/constants/haptics";
import { AppIcon } from "../../src/components/AppIcon";
import { MarkdownRenderer } from "../../src/components/MarkdownRenderer";

const CURRENT_VERSION = "1.2.2";
const GITHUB_REPO = "MehranQadirian/prompt-forge";
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const CHANGES_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/master/CHANGES.txt`;

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = theme.color;
  const [checking, setChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "latest" | "update" | "error"
  >("idle");
  const [latestVersion, setLatestVersion] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [releaseUrl, setReleaseUrl] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);

  useEffect(() => {
    fetch("https://github.com/MehranQadirian.png", {
      method: "HEAD",
      redirect: "follow",
    })
      .then((response) => {
        if (response.ok) setAvatarUri("https://github.com/MehranQadirian.png");
      })
      .catch(() => {})
      .finally(() => setAvatarLoading(false));
  }, []);

  const fetchReleaseNotes = async (version: string) => {
    try {
      const response = await fetch(CHANGES_URL);
      if (!response.ok) return "";
      const text = await response.text();
      const versionHeader = `## Version ${version}`;
      const versionIndex = text.indexOf(versionHeader);
      if (versionIndex === -1) return "";

      const nextVersionMatch = text
        .substring(versionIndex + versionHeader.length)
        .match(/\n## (?:Version|v)\d/);
      const nextVersionIndex =
        nextVersionMatch && nextVersionMatch.index !== undefined
          ? versionIndex + versionHeader.length + nextVersionMatch.index
          : text.length;

      const notes = text
        .substring(versionIndex + versionHeader.length, nextVersionIndex)
        .trim();
      return notes;
    } catch {
      return "";
    }
  };

  const checkForUpdates = useCallback(async () => {
    hapticLight();
    setChecking(true);
    setUpdateStatus("idle");
    setShowNotes(false);

    try {
      const response = await fetch(GITHUB_API_URL, {
        headers: { Accept: "application/vnd.github.v3+json" },
      });

      if (!response.ok) {
        setUpdateStatus("error");
        return;
      }

      const data = await response.json();
      const tagName = data.tag_name || "";
      const versionMatch = tagName.match(/v(\d+)-(\d+)-(\d+)/);
      if (versionMatch) {
        const version = `${versionMatch[1]}.${versionMatch[2]}.${versionMatch[3]}`;
        setLatestVersion(version);

        // Find the APK asset download URL
        const apkAsset = data.assets?.find((a: any) =>
          a.name?.endsWith(".apk"),
        );
        if (apkAsset) {
          setReleaseUrl(apkAsset.browser_download_url);
        } else {
          // Fallback to release page if no APK found
          setReleaseUrl(data.html_url || "");
        }

        const currentParts = CURRENT_VERSION.split(".").map(Number);
        const latestParts = version.split(".").map(Number);
        const isNewer = latestParts.some((v, i) => v > (currentParts[i] || 0));

        if (isNewer) {
          const notes = await fetchReleaseNotes(version);
          setReleaseNotes(notes);
        } else {
          const notes = await fetchReleaseNotes(CURRENT_VERSION);
          setReleaseNotes(notes);
        }
        setUpdateStatus(isNewer ? "update" : "latest");
      } else {
        setUpdateStatus("error");
      }
    } catch (error) {
      setUpdateStatus("error");
    } finally {
      setChecking(false);
    }
  }, []);

  const openInBrowser = useCallback(() => {
    if (releaseUrl) {
      Linking.openURL(releaseUrl);
    }
  }, [releaseUrl]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: c.background }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: pressed
                ? c.surfaceContainerHigh
                : c.surfaceContainer,
            },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={ICON_SIZE.md}
            color={c.onBackground}
          />
        </Pressable>
        <Text style={[styles.title, { color: c.onBackground }]}>About</Text>
        <View style={{ width: TOUCH_TARGET }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: c.surfaceContainer,
              borderColor: c.outlineVariant,
            },
          ]}
        >
          <View style={styles.appInfo}>
            <AppIcon size={200} style={styles.appIcon} />
            <View style={styles.appText}>
              <Text style={[styles.appName, { color: c.onBackground }]}>
                Prompt Forge
              </Text>
              <Text style={[styles.appVersion, { color: c.disabled }]}>
                Version {CURRENT_VERSION}
              </Text>
            </View>
          </View>
          <View
            style={[styles.appDivider, { backgroundColor: c.outlineVariant }]}
          />
          <Text style={[styles.appDesc, { color: c.onSurfaceVariant }]}>
            A focused notepad for crafting perfect AI prompts.
          </Text>
        </View>

        {/* Developer Card */}
        <Text style={[styles.sectionTitle, { color: c.onSurfaceVariant }]}>
          Developer
        </Text>
        <Pressable
          onPress={() => router.push("/settings/developer")}
          accessibilityRole="button"
          accessibilityLabel="View developer profile"
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: c.surfaceContainer,
              borderColor: c.outlineVariant,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <View style={styles.developerInfo}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={[styles.avatar, { backgroundColor: c.primary + "18" }]}
              />
            ) : (
              <View
                style={[styles.avatar, { backgroundColor: c.primary + "18" }]}
              >
                {avatarLoading ? (
                  <ActivityIndicator size="small" color={c.primary} />
                ) : (
                  <Text style={[styles.avatarText, { color: c.primary }]}>
                    MG
                  </Text>
                )}
              </View>
            )}
            <View style={styles.developerText}>
              <Text style={[styles.developerName, { color: c.onBackground }]}>
                Mehran Ghadirian
              </Text>
              <Text
                style={[styles.developerRole, { color: c.onSurfaceVariant }]}
              >
                Developer
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={ICON_SIZE.sm}
              color={c.disabled}
            />
          </View>
        </Pressable>

        {/* Update Section */}
        <Text style={[styles.sectionTitle, { color: c.onSurfaceVariant }]}>
          Updates
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: c.surfaceContainer,
              borderColor: c.outlineVariant,
            },
          ]}
        >
          <Pressable
            onPress={checkForUpdates}
            disabled={checking}
            accessibilityRole="button"
            accessibilityLabel="Check for updates"
            style={({ pressed }) => [
              styles.updateRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="refresh" size={ICON_SIZE.md} color={c.primary} />
            <Text style={[styles.updateLabel, { color: c.onBackground }]}>
              {checking ? "Checking..." : "Check for Updates"}
            </Text>
            {checking ? (
              <ActivityIndicator size="small" color={c.primary} />
            ) : (
              <Ionicons
                name="chevron-forward"
                size={ICON_SIZE.sm}
                color={c.disabled}
              />
            )}
          </Pressable>

          {updateStatus === "latest" && (
            <View
              style={[
                styles.updateStatus,
                { borderTopColor: c.outlineVariant },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={ICON_SIZE.md}
                color={c.success}
              />
              <Text style={[styles.updateStatusText, { color: c.success }]}>
                You're up to date!
              </Text>
            </View>
          )}

          {updateStatus === "update" && (
            <View
              style={[
                styles.updateStatus,
                { borderTopColor: c.outlineVariant },
              ]}
            >
              <Ionicons
                name="arrow-up-circle"
                size={ICON_SIZE.md}
                color={c.primary}
              />
              <View style={styles.updateInfo}>
                <Text style={[styles.updateStatusText, { color: c.primary }]}>
                  Update available: v{latestVersion}
                </Text>
                <Pressable
                  onPress={openInBrowser}
                  accessibilityRole="button"
                  accessibilityLabel="Download in browser"
                  style={({ pressed }) => [
                    styles.downloadBtn,
                    { backgroundColor: c.primary, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Ionicons
                    name="open-outline"
                    size={ICON_SIZE.sm}
                    color={c.onPrimary}
                  />
                  <Text style={[styles.downloadText, { color: c.onPrimary }]}>
                    Download
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {(updateStatus === "update" || updateStatus === "latest") && releaseNotes && (
            <View
              style={[
                styles.notesSection,
                { borderTopColor: c.outlineVariant },
              ]}
            >
              <Pressable
                onPress={() => setShowNotes(!showNotes)}
                accessibilityRole="button"
                accessibilityLabel={showNotes ? "Hide changes" : "Show changes"}
                style={({ pressed }) => [
                  styles.notesToggle,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons
                  name="list-outline"
                  size={ICON_SIZE.md}
                  color={c.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.notesToggleText,
                    { color: c.onSurfaceVariant },
                  ]}
                >
                  What's new in v{updateStatus === "update" ? latestVersion : CURRENT_VERSION}
                </Text>
                <Ionicons
                  name={showNotes ? "chevron-up" : "chevron-down"}
                  size={ICON_SIZE.sm}
                  color={c.onSurfaceVariant}
                />
              </Pressable>
              {showNotes && (
                <View
                  style={[styles.notesContent, { backgroundColor: c.surface }]}
                >
                  <MarkdownRenderer content={releaseNotes} />
                </View>
              )}
            </View>
          )}

          {updateStatus === "error" && (
            <View
              style={[
                styles.updateStatus,
                { borderTopColor: c.outlineVariant },
              ]}
            >
              <Ionicons
                name="alert-circle"
                size={ICON_SIZE.md}
                color={c.error}
              />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  backBtn: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...TYPOGRAPHY.title,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  appIcon: {
    marginLeft:-30,
    marginTop:-30,
    marginBottom:-30,
    marginRight:-20
  },
  sectionTitle: {
    ...TYPOGRAPHY.captionSemibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xs,
  },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: "hidden",
  },

  // App Info
  appInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  appText: {
    flex: 1,
  },
  appName: {
    fontSize: TYPOGRAPHY.heading.fontSize,
    fontWeight: "700",
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
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
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

  // Update
  updateRow: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
  },
  downloadText: {
    ...TYPOGRAPHY.captionMedium,
    fontWeight: "600",
  },
  notesSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  notesToggle: {
    flexDirection: "row",
    alignItems: "center",
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
});
