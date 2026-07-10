export {
  getThemeTokens,
  PROMPT_COLORS,
  allThemeVariants,
  darkThemeVariants,
  lightThemeVariants,
} from './tokens';

// Legacy themes record for settings screen theme preview dots
import { ThemeVariant } from '../types';
import { getThemeTokens } from './tokens';

function toLegacyColors(variant: ThemeVariant) {
  const t = getThemeTokens(variant);
  return {
    background: t.color.background,
    surface: t.color.surface,
    surfaceElevated: t.color.surfaceContainerHigh,
    sidebar: t.color.surface,
    border: t.color.outlineVariant,
    text: t.color.onBackground,
    textSecondary: t.color.onSurfaceVariant,
    textMuted: t.color.disabled,
    primary: t.color.primary,
    primaryLight: `rgba(0,0,0,0)`,
    danger: t.color.error,
    focusRing: t.color.focusRing,
  };
}

export const themes: Record<ThemeVariant, ReturnType<typeof toLegacyColors>> = {
  forest: toLegacyColors('forest'),
  midnight: toLegacyColors('midnight'),
  carbon: toLegacyColors('carbon'),
  plum: toLegacyColors('plum'),
  ember: toLegacyColors('ember'),
  dracula: toLegacyColors('dracula'),
  mono: toLegacyColors('mono'),
  paper: toLegacyColors('paper'),
  sky: toLegacyColors('sky'),
  sage: toLegacyColors('sage'),
  rose: toLegacyColors('rose'),
  latte: toLegacyColors('latte'),
  lavender: toLegacyColors('lavender'),
  snow: toLegacyColors('snow'),
};
