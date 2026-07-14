import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { getPromptColors } from '../theme';
import { SPACING, RADIUS, TOUCH_TARGET, ICON_SIZE } from '../constants';
import { hapticLight } from '../constants/haptics';
import { BottomSheet, BottomSheetRef } from './BottomSheet';

interface ColorGridSheetProps {
  visible: boolean;
  currentColor: string;
  onClose: () => void;
  onSelect: (color: string) => void;
}

export function ColorGridSheet({ visible, currentColor, onClose, onSelect }: ColorGridSheetProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const promptColors = getPromptColors(theme.mode);
  const sheetRef = useRef<BottomSheetRef>(null);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    }
  }, [visible]);

  const handleSelect = (color: string) => {
    hapticLight();
    onSelect(color);
    sheetRef.current?.dismiss();
  };

  return (
    <BottomSheet ref={sheetRef} onClose={onClose}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: c.primary + '18' }]}>
          <Ionicons name="color-palette" size={ICON_SIZE.md} color={c.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: c.onBackground }]}>Prompt Color</Text>
          <Text style={[styles.subtitle, { color: c.onSurfaceVariant }]}>
            Choose a color to organize your prompt
          </Text>
        </View>
      </View>

      {/* Color grid */}
      <View style={styles.grid}>
        {promptColors.map((color) => {
          const isSelected = currentColor === color;
          return (
            <Pressable
              key={color}
              onPress={() => handleSelect(color)}
              accessibilityRole="radio"
              accessibilityLabel={`Color ${color}`}
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [styles.colorOption, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                style={[
                  styles.colorCircle,
                  {
                    backgroundColor: color,
                    borderColor: isSelected ? c.onBackground : 'transparent',
                    borderWidth: isSelected ? 3 : 0,
                  },
                ]}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={ICON_SIZE.sm} color={c.onPrimary} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Current selection label */}
      <View style={styles.currentRow}>
        <View style={[styles.currentDot, { backgroundColor: currentColor }]} />
        <Text style={[styles.currentLabel, { color: c.onSurfaceVariant }]}>
          Current: {currentColor}
        </Text>
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  currentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  currentLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
});
