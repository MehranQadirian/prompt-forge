import React from 'react';
import { View, Image, ImageStyle, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { RADIUS } from '../constants';

const iconImage = require('../../assets/splash-icon.png');

interface AppIconProps {
  size?: number;
  style?: ImageStyle;
}

export function AppIcon({ size = 56, style }: AppIconProps) {
  const { theme } = useTheme();
  const c = theme.color;

  return (
    <View style={[styles.container, { backgroundColor: c.surfaceContainer, borderRadius: RADIUS.lg }, style]}>
      <Image
        source={iconImage}
        style={{ width: size * 0.6, height: size * 0.6 }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
