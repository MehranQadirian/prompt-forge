export const STORAGE_KEYS = {
  PROMPTS: '@promptforge_prompts',
  SETTINGS: '@promptforge_settings',
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

export const FAVORITE_COLOR = '#F1FA8C';

export const DEFAULT_CATEGORIES = [
  { id: 'cat-writing', name: 'Writing', color: '#7FBF8B' },
  { id: 'cat-development', name: 'Development', color: '#5EA8E0' },
  { id: 'cat-business', name: 'Business', color: '#E0907A' },
  { id: 'cat-language', name: 'Language', color: '#B88AD9' },
  { id: 'cat-ideas', name: 'Ideas', color: '#8BE9FD' },
  { id: 'cat-analysis', name: 'Analysis', color: '#F1FA8C' },
  { id: 'cat-education', name: 'Education', color: '#FF79C6' },
  { id: 'cat-personal', name: 'Personal', color: '#E0907A' },
  { id: 'cat-learning', name: 'Learning', color: '#8BE9FD' },
  { id: 'cat-other', name: 'Other', color: '#D9A566' },
] as const;

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
