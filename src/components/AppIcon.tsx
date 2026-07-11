import React from 'react';
import { Image, ImageStyle } from 'react-native';

const iconImage = require('../../assets/icon.png');

interface AppIconProps {
  size?: number;
  style?: ImageStyle;
}

export function AppIcon({ size = 56, style }: AppIconProps) {
  return (
    <Image
      source={iconImage}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}
