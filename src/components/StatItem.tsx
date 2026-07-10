import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatItemProps {
  label: string;
  value: number;
  color: string;
  mutedColor: string;
}

export function StatItem({ label, value, color, mutedColor }: StatItemProps) {
  return (
    <View style={styles.statItem} accessibilityRole="text" accessibilityLabel={`${value} ${label}`}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: mutedColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 10, fontWeight: '500', marginTop: 2 },
});
