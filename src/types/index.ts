export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  color: string;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  versions: PromptVersion[];
  order: number;
}

export interface PromptVersion {
  id: string;
  content: string;
  title: string;
  timestamp: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  description: string;
}

export type ThemeMode = 'light' | 'dark';

export type ThemeVariant =
  | 'forest' | 'midnight' | 'carbon' | 'plum' | 'ember' | 'dracula' | 'mono'
  | 'paper' | 'sky' | 'sage' | 'rose' | 'latte' | 'lavender' | 'snow';

export interface ThemeTokens {
  name: string;
  mode: ThemeMode;
  color: {
    // Core surfaces
    background: string;
    surface: string;
    surfaceContainer: string;
    surfaceContainerHigh: string;
    // Text
    onBackground: string;
    onSurfaceVariant: string;
    onPrimary: string;
    onError: string;
    // Borders
    outline: string;
    outlineVariant: string;
    // Semantic
    primary: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    // States
    disabled: string;
    disabledContainer: string;
    overlay: string;
    focusRing: string;
    // Backward-compatible aliases
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    sidebar: string;
    surfaceElevated: string;
    primaryLight: string;
    danger: string;
  };
}

export type SwipeAction = 'edit' | 'duplicate' | 'pin' | 'favorite' | 'delete' | 'none';

export interface AppSettings {
  theme: ThemeVariant;
  fontSize: number;
  fontFamily: string;
  hasOnboarded: boolean;
  showTokenCount: boolean;
  followSystem: boolean;
  swipeLeftAction: SwipeAction;
  swipeRightAction: SwipeAction;
}

// ---------------------------------------------------------------------------
// AI Types
// ---------------------------------------------------------------------------

export type AIProviderId = 'groq' | 'openai' | 'deepseek' | 'gemini' | 'claude';

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  baseUrl: string;
  model: string;
  enabled: boolean;
  hasApiKey: boolean;
  lastValidated?: string;
  status: 'idle' | 'validating' | 'valid' | 'invalid' | 'error';
}

export interface AIEnhanceRequest {
  prompt: string;
  systemPrompt?: string;
}

export interface AIEnhanceResponse {
  enhanced: string;
  provider: string;
  tokensUsed?: number;
}

export interface AIProvider {
  readonly id: AIProviderId;
  readonly name: string;
  readonly baseUrl: string;
  enhance(request: AIEnhanceRequest, apiKey: string): Promise<AIEnhanceResponse>;
  validateKey(apiKey: string): Promise<boolean>;
}

export type AIErrorCode =
  | 'NETWORK_ERROR'
  | 'INVALID_KEY'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'PROVIDER_UNAVAILABLE'
  | 'QUOTA_EXCEEDED'
  | 'UNKNOWN';

export interface AIError {
  code: AIErrorCode;
  message: string;
  provider: string;
}
