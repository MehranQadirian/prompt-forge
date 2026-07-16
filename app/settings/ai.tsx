import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAIStore } from '../../src/stores/aiStore';
import { useTheme } from '../../src/theme/useTheme';
import { AIProviderId, AIProviderConfig } from '../../src/types';
import * as Haptics from 'expo-haptics';
import { SPACING, RADIUS, TYPOGRAPHY, ICON_SIZE, AI_DEFAULTS } from '../../src/constants';

const PROVIDER_IDS: AIProviderId[] = ['groq', 'openai', 'deepseek', 'gemini', 'claude'];

function ProviderRow({
  config,
  isActive,
  onSelect,
  onSetApiKey,
  onRemoveApiKey,
  onTestKey,
  theme,
}: {
  config: AIProviderConfig;
  isActive: boolean;
  onSelect: () => void;
  onSetApiKey: (key: string) => void;
  onRemoveApiKey: () => void;
  onTestKey: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  const c = theme.color;
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyValue, setKeyValue] = useState('');

  const handleSaveKey = useCallback(() => {
    if (keyValue.trim()) {
      onSetApiKey(keyValue.trim());
      setKeyValue('');
      setShowKeyInput(false);
    }
  }, [keyValue, onSetApiKey]);

  const statusIcon = () => {
    switch (config.status) {
      case 'validating':
        return <Ionicons name="hourglass" size={ICON_SIZE.sm} color={c.warning} />;
      case 'valid':
        return <Ionicons name="checkmark-circle" size={ICON_SIZE.sm} color={c.success} />;
      case 'invalid':
        return <Ionicons name="close-circle" size={ICON_SIZE.sm} color={c.error} />;
      case 'error':
        return <Ionicons name="alert-circle" size={ICON_SIZE.sm} color={c.error} />;
      default:
        return config.hasApiKey ? (
          <Ionicons name="key" size={ICON_SIZE.sm} color={c.onSurfaceVariant} />
        ) : null;
    }
  };

  return (
    <View>
      <Pressable
        onPress={onSelect}
        accessibilityRole="radio"
        accessibilityLabel={`${config.name} provider`}
        accessibilityState={{ selected: isActive }}
        style={({ pressed }) => [
          styles.providerOption,
          {
            backgroundColor: isActive ? c.primary + '0D' : 'transparent',
            borderBottomColor: c.outlineVariant,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View style={styles.providerLeft}>
          <Text style={[styles.providerName, { color: c.onBackground }]}>{config.name}</Text>
          {config.hasApiKey && (
            <Text style={[styles.providerKeyStatus, { color: c.onSurfaceVariant }]}>
              Key configured
            </Text>
          )}
        </View>
        <View style={styles.providerRight}>
          {statusIcon()}
          {isActive && <Ionicons name="checkmark-circle" size={ICON_SIZE.list} color={c.primary} />}
        </View>
      </Pressable>

      {isActive && (
        <View style={[styles.providerActions, { backgroundColor: c.surfaceContainerHigh }]}>
          {config.hasApiKey ? (
            <>
              <Pressable
                onPress={onTestKey}
                disabled={config.status === 'validating'}
                accessibilityRole="button"
                accessibilityLabel="Test API key"
                style={({ pressed }) => [
                  styles.providerActionBtn,
                  { borderColor: c.primary, opacity: pressed || config.status === 'validating' ? 0.7 : 1 },
                ]}
              >
                <Ionicons name="wifi" size={ICON_SIZE.sm} color={c.primary} />
                <Text style={[styles.providerActionText, { color: c.primary }]}>
                  {config.status === 'validating' ? 'Testing...' : 'Test Connection'}
                </Text>
              </Pressable>
              <Pressable
                onPress={onRemoveApiKey}
                accessibilityRole="button"
                accessibilityLabel="Remove API key"
                style={({ pressed }) => [
                  styles.providerActionBtn,
                  { borderColor: c.error, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons name="trash-outline" size={ICON_SIZE.sm} color={c.error} />
                <Text style={[styles.providerActionText, { color: c.error }]}>Remove Key</Text>
              </Pressable>
              {config.lastValidated && (
                <Text style={[styles.lastValidated, { color: c.disabled }]}>
                  Last checked: {new Date(config.lastValidated).toLocaleDateString()}
                </Text>
              )}
            </>
          ) : (
            <>
              {showKeyInput ? (
                <View style={styles.keyInputRow}>
                  <TextInput
                    style={[styles.keyInput, { color: c.onBackground, backgroundColor: c.surface, borderColor: c.outlineVariant }]}
                    value={keyValue}
                    onChangeText={setKeyValue}
                    placeholder={`Enter ${config.name} API key...`}
                    placeholderTextColor={c.disabled}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityLabel={`${config.name} API key`}
                  />
                  <Pressable
                    onPress={handleSaveKey}
                    disabled={!keyValue.trim()}
                    accessibilityRole="button"
                    accessibilityLabel="Save API key"
                    style={({ pressed }) => [
                      styles.keySaveBtn,
                      {
                        backgroundColor: keyValue.trim() ? c.primary : c.disabledContainer,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Ionicons name="checkmark" size={ICON_SIZE.md} color={keyValue.trim() ? c.onPrimary : c.disabled} />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setShowKeyInput(false);
                      setKeyValue('');
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel"
                    style={({ pressed }) => [styles.keyCancelBtn, { opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Ionicons name="close" size={ICON_SIZE.md} color={c.onSurfaceVariant} />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => setShowKeyInput(true)}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${config.name} API key`}
                  style={({ pressed }) => [
                    styles.providerActionBtn,
                    { borderColor: c.primary, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Ionicons name="add" size={ICON_SIZE.sm} color={c.primary} />
                  <Text style={[styles.providerActionText, { color: c.primary }]}>Add API Key</Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

export default function AISettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = theme.color;
  const {
    activeProviderId,
    providerConfigs,
    systemPrompt,
    setActiveProvider,
    setApiKey,
    removeApiKey,
    testApiKey,
    setSystemPrompt,
    loadFromStorage,
  } = useAIStore();

  const [localSystemPrompt, setLocalSystemPrompt] = useState(systemPrompt);
  const [systemPromptDirty, setSystemPromptDirty] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    setLocalSystemPrompt(systemPrompt);
    setSystemPromptDirty(false);
  }, [systemPrompt]);

  const handleSystemPromptChange = useCallback((text: string) => {
    setLocalSystemPrompt(text);
    setSystemPromptDirty(text !== systemPrompt);
  }, [systemPrompt]);

  const handleSaveSystemPrompt = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSystemPrompt(localSystemPrompt);
    setSystemPromptDirty(false);
  }, [localSystemPrompt, setSystemPrompt]);

  const handleResetSystemPrompt = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalSystemPrompt(AI_DEFAULTS.SYSTEM_PROMPT);
    setSystemPromptDirty(AI_DEFAULTS.SYSTEM_PROMPT !== systemPrompt);
  }, [systemPrompt]);

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
        <Text style={[styles.title, { color: c.onBackground }]}>AI Enhancement</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: c.onSurfaceVariant }]}>Provider</Text>
        <View style={[styles.card, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: c.onBackground }]}>Active Provider</Text>
            <Text style={[styles.switchLabel, { color: c.primary }]}>
              {providerConfigs[activeProviderId]?.name || 'None'}
            </Text>
          </View>

          {PROVIDER_IDS.map((id) => (
            <ProviderRow
              key={id}
              config={providerConfigs[id]}
              isActive={activeProviderId === id}
              onSelect={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveProvider(id);
              }}
              onSetApiKey={(key) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setApiKey(id, key);
              }}
              onRemoveApiKey={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                removeApiKey(id);
              }}
              onTestKey={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                testApiKey(id);
              }}
              theme={theme}
            />
          ))}

          <View style={[styles.systemPromptSection, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.outlineVariant }]}>
            <View style={styles.systemPromptHeader}>
              <Ionicons name="document-text" size={ICON_SIZE.md} color={c.primary} />
              <Text style={[styles.systemPromptTitle, { color: c.onBackground }]}>System Prompt</Text>
            </View>
            <Text style={[styles.systemPromptDesc, { color: c.onSurfaceVariant }]}>
              This instruction tells the AI how to improve your prompts. Edit it to customize the enhancement behavior.
            </Text>
            <TextInput
              style={[styles.systemPromptInput, {
                color: c.onBackground,
                backgroundColor: c.surfaceContainerHigh,
                borderColor: systemPromptDirty ? c.primary : c.outlineVariant,
              }]}
              value={localSystemPrompt}
              onChangeText={handleSystemPromptChange}
              placeholder="System prompt..."
              placeholderTextColor={c.disabled}
              multiline
              textAlignVertical="top"
              accessibilityLabel="System prompt"
            />
            <View style={styles.systemPromptActions}>
              <Pressable
                onPress={handleResetSystemPrompt}
                disabled={!systemPromptDirty}
                accessibilityRole="button"
                accessibilityLabel="Reset to default"
                style={({ pressed }) => [
                  styles.resetBtn,
                  { borderColor: c.outlineVariant, opacity: pressed || !systemPromptDirty ? 0.7 : 1 },
                ]}
              >
                <Ionicons name="refresh" size={ICON_SIZE.sm} color={c.onSurfaceVariant} />
                <Text style={[styles.resetBtnText, { color: c.onSurfaceVariant }]}>Reset</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveSystemPrompt}
                disabled={!systemPromptDirty}
                accessibilityRole="button"
                accessibilityLabel="Save system prompt"
                style={({ pressed }) => [
                  styles.savePromptBtn,
                  {
                    backgroundColor: systemPromptDirty ? c.primary : c.disabledContainer,
                    opacity: pressed || !systemPromptDirty ? 0.7 : 1,
                  },
                ]}
              >
                <Ionicons name="checkmark" size={ICON_SIZE.sm} color={systemPromptDirty ? c.onPrimary : c.disabled} />
                <Text style={[styles.savePromptBtnText, { color: systemPromptDirty ? c.onPrimary : c.disabled }]}>
                  Save
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.privacyContainer, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.outlineVariant }]}>
            <View style={styles.privacyHeader}>
              <Ionicons name="shield-checkmark" size={ICON_SIZE.md} color={c.onSurfaceVariant} />
              <Text style={[styles.privacyTitle, { color: c.onSurfaceVariant }]}>Privacy</Text>
            </View>
            <Text style={[styles.privacyText, { color: c.disabled }]}>
              Your API keys are securely stored on your device using the operating system's secure
              credential storage. They are only used to communicate directly with the AI provider
              you choose and are never collected or transmitted anywhere else by Prompt Forge.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: SPACING.sm, width: 40 },
  title: {
    ...TYPOGRAPHY.subheading,
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
    minHeight: 48,
  },
  switchLabel: {
    ...TYPOGRAPHY.body,
  },
  providerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
  },
  providerLeft: {
    flex: 1,
  },
  providerName: {
    ...TYPOGRAPHY.bodyMedium,
  },
  providerKeyStatus: {
    ...TYPOGRAPHY.labelSmallMedium,
    marginTop: 2,
  },
  providerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  providerActions: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: SPACING.sm,
  },
  providerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  providerActionText: {
    fontSize: TYPOGRAPHY.captionMedium.fontSize,
    fontWeight: TYPOGRAPHY.captionMedium.fontWeight,
  },
  lastValidated: {
    ...TYPOGRAPHY.labelSmall,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  keyInputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  keyInput: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.caption.fontSize,
  },
  keySaveBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyCancelBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemPromptSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  systemPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  systemPromptTitle: {
    ...TYPOGRAPHY.captionMedium,
  },
  systemPromptDesc: {
    ...TYPOGRAPHY.labelSmall,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  systemPromptInput: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.caption.fontSize,
    lineHeight: 20,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  systemPromptActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  resetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  resetBtnText: {
    fontSize: TYPOGRAPHY.captionMedium.fontSize,
    fontWeight: TYPOGRAPHY.captionMedium.fontWeight,
  },
  savePromptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: RADIUS.sm,
    gap: SPACING.sm,
  },
  savePromptBtnText: {
    fontSize: TYPOGRAPHY.captionMedium.fontSize,
    fontWeight: TYPOGRAPHY.captionMedium.fontWeight,
  },
  privacyContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  privacyTitle: {
    ...TYPOGRAPHY.captionMedium,
  },
  privacyText: {
    ...TYPOGRAPHY.labelSmall,
    lineHeight: 18,
  },
});
