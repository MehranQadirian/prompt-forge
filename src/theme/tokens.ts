import { ThemeVariant, ThemeTokens, ThemeMode } from '../types';

// ---------------------------------------------------------------------------
// Utility: alpha blend
// ---------------------------------------------------------------------------
function alpha(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ---------------------------------------------------------------------------
// Utility: pick best contrast text color (white or near-black)
// ---------------------------------------------------------------------------
function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function contrastColor(bg: string): string {
  const whiteRatio = contrastRatio(bg, '#FFFFFF');
  const darkRatio = contrastRatio(bg, '#111111');
  return whiteRatio >= darkRatio ? '#FFFFFF' : '#111111';
}

// ---------------------------------------------------------------------------
// Raw theme data — exact values from raminturne/promptpad
// ---------------------------------------------------------------------------
interface RawTheme {
  background: string;
  text: string;
  surface: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  primary: string;
  error: string;
}

const rawThemes: Record<ThemeVariant, RawTheme> = {
  // Dark
  forest:  { background: '#1B211A', text: '#D3DAD9', surface: '#161B15', surfaceContainer: '#222A21', surfaceContainerHigh: '#2A332A', primary: '#7FBF8B', error: '#E08A7A' },
  midnight: { background: '#0F1620', text: '#CDD6E3', surface: '#0B121B', surfaceContainer: '#18222F', surfaceContainerHigh: '#1F2B3A', primary: '#5EA8E0', error: '#E08A7A' },
  carbon:  { background: '#161616', text: '#DAD9D6', surface: '#101010', surfaceContainer: '#202020', surfaceContainerHigh: '#2A2A2A', primary: '#D9A566', error: '#E08A7A' },
  plum:    { background: '#1A141F', text: '#E2D8E8', surface: '#150F1A', surfaceContainer: '#241A2B', surfaceContainerHigh: '#2E2236', primary: '#B88AD9', error: '#E08A8A' },
  ember:   { background: '#1F1517', text: '#ECDAD6', surface: '#190F11', surfaceContainer: '#2A1C1D', surfaceContainerHigh: '#341F22', primary: '#E0907A', error: '#E0707A' },
  dracula: { background: '#282A36', text: '#F8F8F2', surface: '#21222C', surfaceContainer: '#313341', surfaceContainerHigh: '#414354', primary: '#BD93F9', error: '#FF5555' },
  mono:    { background: '#0A0A0A', text: '#F0F0F0', surface: '#050505', surfaceContainer: '#141414', surfaceContainerHigh: '#1E1E1E', primary: '#888888', error: '#E04040' },
  // Light
  paper:   { background: '#F7F7F5', text: '#1A1A1A', surface: '#EEECEA', surfaceContainer: '#FFFFFF', surfaceContainerHigh: '#E8E6E4', primary: '#3D5EC0', error: '#C03030' },
  sky:     { background: '#E8F0FB', text: '#1A2540', surface: '#DCE8F8', surfaceContainer: '#F2F7FF', surfaceContainerHigh: '#CCDDF5', primary: '#2563EB', error: '#C02020' },
  sage:    { background: '#EEF5F0', text: '#182418', surface: '#E2EDE6', surfaceContainer: '#F5FAF6', surfaceContainerHigh: '#D4E8DA', primary: '#2D7A50', error: '#C04040' },
  rose:    { background: '#FDF0F4', text: '#2A1020', surface: '#F8E4EC', surfaceContainer: '#FFF5F8', surfaceContainerHigh: '#F0D4E0', primary: '#B83058', error: '#C02050' },
  latte:   { background: '#F5EDE0', text: '#2A1E10', surface: '#EDE3D4', surfaceContainer: '#FDF6ED', surfaceContainerHigh: '#E4D8C8', primary: '#8A4C26', error: '#C03030' },
  lavender:{ background: '#F0ECFA', text: '#1E1830', surface: '#E6E0F5', surfaceContainer: '#F8F5FF', surfaceContainerHigh: '#D8D0EE', primary: '#7050C0', error: '#C02050' },
  snow:    { background: '#FFFFFF', text: '#111111', surface: '#F5F5F5', surfaceContainer: '#FFFFFF', surfaceContainerHigh: '#E8E8E8', primary: '#333333', error: '#CC0000' },
};

// ---------------------------------------------------------------------------
// Derivation functions
// ---------------------------------------------------------------------------
const STATUS_DARK = { success: '#6FCF97', warning: '#F2C94C', info: '#56CCF2' };
const STATUS_LIGHT = { success: '#1B8A5A', warning: '#B7791F', info: '#1D6FA5' };

const OVERLAY = 'rgba(0, 0, 0, 0.55)';

function deriveTokens(variant: ThemeVariant, raw: RawTheme): ThemeTokens {
  const mode: ThemeMode = isDark(variant) ? 'dark' : 'light';

  const onSurfaceVariant = alpha(raw.text, 0.68);
  const outline = alpha(raw.text, 0.12);
  const outlineVariant = alpha(raw.text, 0.06);
  const disabled = alpha(raw.text, 0.38);
  const disabledContainer = alpha(raw.text, 0.12);

  const onPrimary = contrastColor(raw.primary);
  const onError = contrastColor(raw.error);

  const status = mode === 'dark' ? STATUS_DARK : STATUS_LIGHT;

  return {
    name: variant,
    mode,
    color: {
      // Core surfaces
      background: raw.background,
      surface: raw.surface,
      surfaceContainer: raw.surfaceContainer,
      surfaceContainerHigh: raw.surfaceContainerHigh,
      // Text
      onBackground: raw.text,
      onSurfaceVariant,
      onPrimary,
      onError,
      // Borders
      outline,
      outlineVariant,
      // Semantic
      primary: raw.primary,
      error: raw.error,
      success: status.success,
      warning: status.warning,
      info: status.info,
      disabled,
      disabledContainer,
      overlay: OVERLAY,
      focusRing: raw.primary,
      // Backward-compatible aliases (old naming convention)
      text: raw.text,
      textSecondary: onSurfaceVariant,
      textMuted: disabled,
      border: outlineVariant,
      sidebar: raw.surface,
      surfaceElevated: raw.surfaceContainerHigh,
      primaryLight: alpha(raw.primary, 0.15),
      danger: raw.error,
    },
  } as ThemeTokens;
}

function isDark(variant: ThemeVariant): boolean {
  const darkVariants: ThemeVariant[] = ['forest', 'midnight', 'carbon', 'plum', 'ember', 'dracula', 'mono'];
  return darkVariants.includes(variant);
}

// ---------------------------------------------------------------------------
// Build all theme tokens
// ---------------------------------------------------------------------------
const themeCache: Partial<Record<ThemeVariant, ThemeTokens>> = {};

export function getThemeTokens(variant: ThemeVariant): ThemeTokens {
  if (!themeCache[variant]) {
    const raw = rawThemes[variant] || rawThemes.forest;
    themeCache[variant] = deriveTokens(variant, raw);
  }
  return themeCache[variant]!;
}

export const allThemeVariants: ThemeVariant[] = [
  'forest', 'midnight', 'carbon', 'plum', 'ember', 'dracula', 'mono',
  'paper', 'sky', 'sage', 'rose', 'latte', 'lavender', 'snow',
];

export const darkThemeVariants: ThemeVariant[] = [
  'forest', 'midnight', 'carbon', 'plum', 'ember', 'dracula', 'mono',
];

export const lightThemeVariants: ThemeVariant[] = [
  'paper', 'sky', 'sage', 'rose', 'latte', 'lavender', 'snow',
];

export const PROMPT_COLORS_DARK = [
  '#4ADE80',
  '#60A5FA',
  '#A78BFA',
  '#F472B6',
  '#FB923C',
  '#22D3EE',
  '#FACC15',
  '#F87171',
];

export const PROMPT_COLORS_LIGHT = [
  '#059669',
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#EA580C',
  '#0891B2',
  '#CA8A04',
  '#E11D48',
];

// Legacy export for backward compatibility
export const PROMPT_COLORS = [...PROMPT_COLORS_DARK, ...PROMPT_COLORS_LIGHT];

// Get theme-aware color palette
export function getPromptColors(mode: 'light' | 'dark'): string[] {
  return mode === 'light' ? PROMPT_COLORS_LIGHT : PROMPT_COLORS_DARK;
}

// Map a color from one palette to the equivalent position in the other palette
export function mapColorBetweenModes(color: string): string {
  const lowerColor = color.toLowerCase();
  // Check if color is in dark palette
  const darkIndex = PROMPT_COLORS_DARK.findIndex(c => c.toLowerCase() === lowerColor);
  if (darkIndex !== -1) {
    return PROMPT_COLORS_LIGHT[darkIndex] || color;
  }
  // Check if color is in light palette
  const lightIndex = PROMPT_COLORS_LIGHT.findIndex(c => c.toLowerCase() === lowerColor);
  if (lightIndex !== -1) {
    return PROMPT_COLORS_DARK[lightIndex] || color;
  }
  return color;
}
