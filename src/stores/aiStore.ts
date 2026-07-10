import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIProviderId, AIProviderConfig, AIError } from '../types';
import { AI_DEFAULTS, STORAGE_KEYS_AI } from '../constants';
import { apiKeyStorage } from '../services/storage/apiKeyStorage';
import { getProvider } from '../services/ai/provider';

interface AIState {
  activeProviderId: AIProviderId;
  providerConfigs: Record<AIProviderId, AIProviderConfig>;
  systemPrompt: string;
  isEnhancing: boolean;
  lastError: AIError | null;
  lastResult: string | null;

  loadFromStorage: () => Promise<void>;
  setActiveProvider: (id: AIProviderId) => void;
  setApiKey: (providerId: AIProviderId, key: string) => Promise<boolean>;
  removeApiKey: (providerId: AIProviderId) => Promise<void>;
  testApiKey: (providerId: AIProviderId) => Promise<boolean>;
  setSystemPrompt: (prompt: string) => void;
  setIsEnhancing: (value: boolean) => void;
  setLastError: (error: AIError | null) => void;
  setLastResult: (result: string | null) => void;
}

function createDefaultConfig(id: AIProviderId, name: string, baseUrl: string, model: string): AIProviderConfig {
  return {
    id,
    name,
    baseUrl,
    model,
    enabled: id === 'groq',
    hasApiKey: false,
    status: 'idle',
  };
}

const DEFAULT_CONFIGS: Record<AIProviderId, AIProviderConfig> = {
  groq: createDefaultConfig('groq', 'Groq', AI_DEFAULTS.GROQ_BASE_URL, AI_DEFAULTS.GROQ_MODEL),
  openai: createDefaultConfig('openai', 'OpenAI', 'https://api.openai.com/v1', 'gpt-4o'),
  deepseek: createDefaultConfig('deepseek', 'DeepSeek', 'https://api.deepseek.com/v1', 'deepseek-chat'),
  gemini: createDefaultConfig('gemini', 'Gemini', 'https://generativelanguage.googleapis.com/v1', 'gemini-pro'),
  claude: createDefaultConfig('claude', 'Claude', 'https://api.anthropic.com/v1', 'claude-sonnet-4-20250514'),
};

export const useAIStore = create<AIState>((set, get) => ({
  activeProviderId: 'groq',
  providerConfigs: { ...DEFAULT_CONFIGS },
  systemPrompt: AI_DEFAULTS.SYSTEM_PROMPT,
  isEnhancing: false,
  lastError: null,
  lastResult: null,

  loadFromStorage: async () => {
    try {
      const [activeProviderData, configsData, systemPromptData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS_AI.ACTIVE_PROVIDER),
        AsyncStorage.getItem(STORAGE_KEYS_AI.PROVIDER_CONFIGS),
        AsyncStorage.getItem(STORAGE_KEYS_AI.SYSTEM_PROMPT),
      ]);

      const updates: Partial<AIState> = {};

      if (activeProviderData) {
        const parsed = JSON.parse(activeProviderData);
        if (parsed && typeof parsed === 'string') {
          updates.activeProviderId = parsed as AIProviderId;
        }
      }

      if (configsData) {
        const parsed = JSON.parse(configsData);
        if (parsed && typeof parsed === 'object') {
          updates.providerConfigs = { ...DEFAULT_CONFIGS, ...parsed };
        }
      }

      if (systemPromptData !== null) {
        const parsed = JSON.parse(systemPromptData);
        if (typeof parsed === 'string' && parsed.length > 0) {
          updates.systemPrompt = parsed;
        }
      }

      // Check storage for API key presence
      const providerIds: AIProviderId[] = ['groq', 'openai', 'deepseek', 'gemini', 'claude'];
      const keyStatuses = await apiKeyStorage.hasAny(providerIds);

      // Update hasApiKey in configs
      if (updates.providerConfigs) {
        for (const id of providerIds) {
          if (updates.providerConfigs[id]) {
            updates.providerConfigs[id].hasApiKey = keyStatuses[id] ?? false;
          }
        }
      } else {
        const configs = { ...DEFAULT_CONFIGS };
        for (const id of providerIds) {
          configs[id].hasApiKey = keyStatuses[id] ?? false;
        }
        updates.providerConfigs = configs;
      }

      set(updates as any);
    } catch (error) {
      console.warn('Failed to load AI settings:', error);
    }
  },

  setActiveProvider: (id) => {
    set({ activeProviderId: id });
    AsyncStorage.setItem(STORAGE_KEYS_AI.ACTIVE_PROVIDER, JSON.stringify(id)).catch(() => {});
  },

  setApiKey: async (providerId, key) => {
    const success = await apiKeyStorage.save(providerId, key);
    if (success) {
      set((state) => ({
        providerConfigs: {
          ...state.providerConfigs,
          [providerId]: {
            ...state.providerConfigs[providerId],
            hasApiKey: true,
            status: 'idle',
          },
        },
      }));
      const { providerConfigs } = get();
      AsyncStorage.setItem(
        STORAGE_KEYS_AI.PROVIDER_CONFIGS,
        JSON.stringify(providerConfigs)
      ).catch(() => {});
    }
    return success;
  },

  removeApiKey: async (providerId) => {
    await apiKeyStorage.remove(providerId);
    set((state) => ({
      providerConfigs: {
        ...state.providerConfigs,
        [providerId]: {
          ...state.providerConfigs[providerId],
          hasApiKey: false,
          status: 'idle',
          lastValidated: undefined,
        },
      },
    }));
    const { providerConfigs } = get();
    AsyncStorage.setItem(
      STORAGE_KEYS_AI.PROVIDER_CONFIGS,
      JSON.stringify(providerConfigs)
    ).catch(() => {});
  },

  testApiKey: async (providerId) => {
    const key = await apiKeyStorage.get(providerId);
    if (!key) {
      set((state) => ({
        providerConfigs: {
          ...state.providerConfigs,
          [providerId]: {
            ...state.providerConfigs[providerId],
            status: 'invalid',
          },
        },
      }));
      return false;
    }

    set((state) => ({
      providerConfigs: {
        ...state.providerConfigs,
        [providerId]: {
          ...state.providerConfigs[providerId],
          status: 'validating',
        },
      },
    }));

    const provider = getProvider(providerId);
    if (!provider) {
      set((state) => ({
        providerConfigs: {
          ...state.providerConfigs,
          [providerId]: {
            ...state.providerConfigs[providerId],
            status: 'error',
          },
        },
      }));
      return false;
    }

    try {
      const isValid = await provider.validateKey(key);
      const now = new Date().toISOString();
      set((state) => ({
        providerConfigs: {
          ...state.providerConfigs,
          [providerId]: {
            ...state.providerConfigs[providerId],
            status: isValid ? 'valid' : 'invalid',
            lastValidated: now,
          },
        },
      }));
      return isValid;
    } catch {
      set((state) => ({
        providerConfigs: {
          ...state.providerConfigs,
          [providerId]: {
            ...state.providerConfigs[providerId],
            status: 'error',
          },
        },
      }));
      return false;
    }
  },

  setSystemPrompt: (prompt) => {
    set({ systemPrompt: prompt });
    AsyncStorage.setItem(STORAGE_KEYS_AI.SYSTEM_PROMPT, JSON.stringify(prompt)).catch(() => {});
  },

  setIsEnhancing: (value) => set({ isEnhancing: value }),
  setLastError: (error) => set({ lastError: error }),
  setLastResult: (result) => set({ lastResult: result }),
}));
