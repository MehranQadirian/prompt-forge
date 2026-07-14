import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useTheme } from '../theme/useTheme';
import { SPACING, RADIUS, TOUCH_TARGET, ICON_SIZE, TYPOGRAPHY } from '../constants';
import { hapticLight, hapticMedium } from '../constants/haptics';
import { BottomSheet, BottomSheetRef } from './BottomSheet';

interface ShareSheetProps {
  visible: boolean;
  promptTitle: string;
  promptContent: string;
  onClose: () => void;
}

interface ShareOption {
  icon: string;
  label: string;
  color?: string;
  onPress: () => void;
}

export function ShareSheet({ visible, promptTitle, promptContent, onClose }: ShareSheetProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const sheetRef = useRef<BottomSheetRef>(null);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    }
  }, [visible]);

  const handleShareOS = async () => {
    hapticMedium();
    try {
      await Share.share({
        message: promptContent,
        title: promptTitle,
      });
    } catch (error) {
      // User cancelled or error
    }
    sheetRef.current?.dismiss();
  };

  const handleCopy = async () => {
    hapticLight();
    await Clipboard.setStringAsync(promptContent);
    sheetRef.current?.dismiss();
  };

  const handleSendToService = async (url: string) => {
    hapticMedium();
    await Clipboard.setStringAsync(promptContent);
    try {
      await Linking.openURL(url);
    } catch (error) {
      // Linking not available
    }
    sheetRef.current?.dismiss();
  };

  const shareOptions: ShareOption[] = [
    {
      icon: 'share-social',
      label: 'Share via...',
      color: c.primary,
      onPress: handleShareOS,
    },
    {
      icon: 'copy',
      label: 'Copy to Clipboard',
      color: c.primary,
      onPress: handleCopy,
    },
    {
      icon: 'chatbubble-ellipses',
      label: 'Send to ChatGPT',
      color: c.primary,
      onPress: () => handleSendToService('https://chatgpt.com'),
    },
    {
      icon: 'chatbubble',
      label: 'Send to Claude',
      color: c.primary,
      onPress: () => handleSendToService('https://claude.ai'),
    },
    {
      icon: 'code-slash',
      label: 'Send to DeepSeek',
      color: c.primary,
      onPress: () => handleSendToService('https://chat.deepseek.com'),
    },
  ];

  return (
    <BottomSheet ref={sheetRef} onClose={onClose}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: c.primary + '18' }]}>
          <Ionicons name="share-outline" size={ICON_SIZE.md} color={c.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: c.onBackground }]}>Share Prompt</Text>
          <Text style={[styles.subtitle, { color: c.onSurfaceVariant }]} numberOfLines={1}>
            {promptTitle}
          </Text>
        </View>
      </View>

      {/* Share options */}
      {shareOptions.map((option, index) => (
        <Pressable
          key={index}
          onPress={option.onPress}
          accessibilityRole="button"
          accessibilityLabel={option.label}
          hitSlop={8}
          style={({ pressed }) => [styles.option, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name={option.icon as any} size={ICON_SIZE.md} color={option.color || c.primary} />
          <Text style={[styles.optionText, { color: option.color || c.primary }]}>{option.label}</Text>
        </Pressable>
      ))}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TOUCH_TARGET,
    gap: SPACING.md,
  },
  optionText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: '500',
  },
});
