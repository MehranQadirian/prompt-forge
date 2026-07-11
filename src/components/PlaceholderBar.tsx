import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { detectPlaceholders, Placeholder, replacePlaceholdersByIndex } from '../utils/placeholders';
import { useTheme } from '../theme/useTheme';
import { usePlaceholderEditStore } from '../stores/placeholderEditStore';
import { SPACING, RADIUS, ICON_SIZE, TYPOGRAPHY } from '../constants';

const BTN_HEIGHT = 28;

interface PlaceholderBarProps {
  text: string;
  onTextChange: (text: string) => void;
  promptId?: string;
}

export function PlaceholderBar({ text, onTextChange, promptId }: PlaceholderBarProps) {
  const { theme } = useTheme();
  const c = theme.color;
  const router = useRouter();
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [values, setValues] = useState<Record<number, string>>({});

  const textRef = useRef(text);
  textRef.current = text;

  const valuesRef = useRef(values);
  valuesRef.current = values;

  const placeholdersRef = useRef(placeholders);
  placeholdersRef.current = placeholders;

  const { consumeResult } = usePlaceholderEditStore();

  useEffect(() => {
    const detected = detectPlaceholders(text);
    setPlaceholders(detected);

    setValues((prev) => {
      const cleaned: Record<number, string> = {};
      for (const ph of detected) {
        if (prev[ph.index] !== undefined) {
          cleaned[ph.index] = prev[ph.index];
        }
      }
      return cleaned;
    });
  }, [text]);

  useEffect(() => {
    const checkResult = () => {
      const result = consumeResult();
      if (result) {
        const currentPlaceholders = placeholdersRef.current;
        const currentValues = valuesRef.current;

        const targetPh = currentPlaceholders.find(
          (ph) => ph.key === result.key && ph.type === result.type
        );

        if (targetPh) {
          const newValues = { ...currentValues, [targetPh.index]: result.value };
          valuesRef.current = newValues;
          setValues(newValues);

          const updatedText = replacePlaceholdersByIndex(textRef.current, currentPlaceholders, newValues);
          onTextChange(updatedText);
        }
      }
    };

    checkResult();
    const interval = setInterval(checkResult, 500);
    return () => clearInterval(interval);
  }, [consumeResult, onTextChange]);

  const handlePlaceholderPress = useCallback(
    (ph: Placeholder) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const currentValues = valuesRef.current;
      const currentValue = currentValues[ph.index] || '';

      usePlaceholderEditStore.getState().startEdit(ph.key, ph.type, currentValue);

      router.push({
        pathname: '/placeholder-edit',
        params: {
          placeholderKey: ph.key,
          placeholderType: ph.type,
          currentValue,
          promptId: promptId || '',
        },
      });
    },
    [router, promptId]
  );

  if (placeholders.length === 0) return null;

  const getKeyCount = (key: string, type: string) =>
    placeholders.filter((p) => p.key === key && p.type === type).length;

  const getOccurrenceIndex = (ph: Placeholder) =>
    placeholders.filter((p) => p.key === ph.key && p.type === ph.type && p.index <= ph.index).length;

  const filledCount = placeholders.filter((ph) => (values[ph.index] || '').trim()).length;

  return (
    <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutUp.duration(150)} style={[styles.container, { backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }]}>
      <View style={styles.header}>
        <Ionicons name="flash" size={12} color={c.primary} />
        <Text style={[styles.headerText, { color: c.onSurfaceVariant }]}>
          {filledCount}/{placeholders.length}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.buttonsContainer}
      >
        {placeholders.map((ph) => {
          const hasValue = !!(values[ph.index] || '').trim();
          const count = getKeyCount(ph.key, ph.type);
          const occurrence = getOccurrenceIndex(ph);
          const label = ph.type === 'bracket' ? `[${ph.key}]` : `{${ph.key}}`;
          const displayLabel = count > 1 ? `${label}${occurrence}` : label;

          return (
            <Pressable
              key={`${ph.type}-${ph.key}-${ph.index}`}
              onPress={() => handlePlaceholderPress(ph)}
              accessibilityRole="button"
              accessibilityLabel={`${displayLabel}${hasValue ? ', filled' : ''}, tap to edit`}
              android_ripple={{ color: c.primary + '14' }}
              style={({ pressed }) => [
                styles.placeholderBtn,
                {
                  backgroundColor: hasValue ? c.primary + '18' : c.surfaceContainerHigh,
                  borderColor: hasValue ? c.primary : c.outlineVariant,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.placeholderBtnText,
                  { color: hasValue ? c.primary : c.onSurfaceVariant },
                ]}
                numberOfLines={1}
              >
                {displayLabel}
              </Text>
              {hasValue && (
                <Ionicons name="checkmark" size={10} color={c.primary} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  headerText: {
    fontSize: TYPOGRAPHY.small.fontSize,
    fontWeight: TYPOGRAPHY.small.fontWeight,
  },
  buttonsContainer: {
    gap: SPACING.xs,
  },
  placeholderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: SPACING.sm,
    height: BTN_HEIGHT,
    borderRadius: RADIUS.xs,
    borderWidth: StyleSheet.hairlineWidth,
  },
  placeholderBtnText: {
    fontSize: TYPOGRAPHY.small.fontSize,
    fontWeight: TYPOGRAPHY.small.fontWeight,
    fontFamily: 'monospace',
  },
});
