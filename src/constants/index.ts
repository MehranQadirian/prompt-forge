export const STORAGE_KEYS = {
  PROMPTS: '@promptforge_prompts',
  SETTINGS: '@promptforge_settings',
  USER_TEMPLATES: '@promptforge_user_templates',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const TYPOGRAPHY = {
  title: { fontSize: 28, fontWeight: '700' as const },
  heading: { fontSize: 22, fontWeight: '600' as const },
  subheading: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyMedium: { fontSize: 16, fontWeight: '500' as const },
  bodySemibold: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 14, fontWeight: '400' as const },
  captionMedium: { fontSize: 14, fontWeight: '500' as const },
  captionSemibold: { fontSize: 14, fontWeight: '600' as const },
  labelSmall: { fontSize: 12, fontWeight: '400' as const },
  labelSmallMedium: { fontSize: 12, fontWeight: '500' as const },
  small: { fontSize: 11, fontWeight: '500' as const },
  smallSemibold: { fontSize: 11, fontWeight: '600' as const },
} as const;

export const ICON_SIZE = { sm: 16, md: 20, lg: 24, xl: 32, list: 20, appbar: 24 } as const;

export const TOUCH_TARGET = 48;

export const FAVORITE_COLOR = '#FFD700';

// Semantic colors for swipe actions (HCI color coding)
export const ACTION_COLORS: Record<string, string> = {
  edit: '#5EA8E0',      // info blue - modification action
  duplicate: 'primary', // uses theme primary - creation action
  pin: '#F2C94C',       // warning amber - importance/highlight
  favorite: FAVORITE_COLOR, // gold - already defined
  delete: 'error',      // uses theme error - destructive action
};

export const DEFAULT_CATEGORIES = [
  { id: 'cat-writing', name: 'Writing', dark: '#4ADE80', light: '#16A34A' },
  { id: 'cat-development', name: 'Development', dark: '#60A5FA', light: '#2563EB' },
  { id: 'cat-business', name: 'Business', dark: '#FB923C', light: '#EA580C' },
  { id: 'cat-language', name: 'Language', dark: '#C084FC', light: '#7C3AED' },
  { id: 'cat-ideas', name: 'Ideas', dark: '#22D3EE', light: '#0891B2' },
  { id: 'cat-analysis', name: 'Analysis', dark: '#FACC15', light: '#CA8A04' },
  { id: 'cat-education', name: 'Education', dark: '#F472B6', light: '#DB2777' },
  { id: 'cat-personal', name: 'Personal', dark: '#FB923C', light: '#EA580C' },
  { id: 'cat-learning', name: 'Learning', dark: '#22D3EE', light: '#0891B2' },
  { id: 'cat-marketing', name: 'Marketing', dark: '#F87171', light: '#DC2626' },
  { id: 'cat-creative', name: 'Creative', dark: '#A78BFA', light: '#7C3AED' },
  { id: 'cat-productivity', name: 'Productivity', dark: '#34D399', light: '#059669' },
  { id: 'cat-data', name: 'Data', dark: '#FBBF24', light: '#D97706' },
  { id: 'cat-other', name: 'Other', dark: '#D9A566', light: '#92400E' },
] as const;

export function getCategoryColor(categoryName: string, mode: 'light' | 'dark' = 'dark'): string {
  const found = DEFAULT_CATEGORIES.find((c) => c.name === categoryName);
  return found?.[mode] ?? (mode === 'dark' ? '#60A5FA' : '#2563EB');
}

export const CHARS_PER_TOKEN = 4;

export const MAX_VERSIONS = 50;

// AI Defaults
export const AI_DEFAULTS = {
  ENHANCE_TIMEOUT_MS: 30000,
  GROQ_MODEL: 'llama-3.1-8b-instant',
  GROQ_BASE_URL: 'https://api.groq.com/openai/v1',
  SYSTEM_PROMPT:
    'You are an expert Prompt Engineer specializing in crafting clear, effective prompts for AI systems.\n\n' +
    'Your task: Improve the user\'s prompt while preserving their exact intent and language.\n\n' +
    'Optimize for:\n' +
    '- Clarity: Remove ambiguity, make instructions precise\n' +
    '- Structure: Use clear sections, numbered steps, or bullet points when beneficial\n' +
    '- Constraints: Add appropriate boundaries and requirements\n' +
    '- Reasoning: Encourage step-by-step thinking where needed\n' +
    '- Formatting: Use markdown or structured output specifications when useful\n\n' +
    'Rules:\n' +
    '- Preserve the user\'s original language (never translate)\n' +
    '- Preserve the user\'s intent completely\n' +
    '- Return ONLY the improved prompt text, no explanations or wrapping\n' +
    '- If the prompt is already excellent, return it with minimal changes',
} as const;

export const STORAGE_KEYS_AI = {
  ACTIVE_PROVIDER: '@promptforge_ai_active_provider',
  PROVIDER_CONFIGS: '@promptforge_ai_provider_configs',
  SYSTEM_PROMPT: '@promptforge_ai_system_prompt',
} as const;
