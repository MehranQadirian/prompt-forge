import { AIProvider, AIProviderId } from '../../types';
import { GroqProvider } from './groq';
import { OpenAIProvider } from './openai';
import { DeepSeekProvider } from './deepseek';
import { GeminiProvider } from './gemini';
import { ClaudeProvider } from './claude';

const providers = new Map<AIProviderId, AIProvider>();

function registerProvider(provider: AIProvider): void {
  providers.set(provider.id, provider);
}

// Register all providers
registerProvider(new GroqProvider());
registerProvider(new OpenAIProvider());
registerProvider(new DeepSeekProvider());
registerProvider(new GeminiProvider());
registerProvider(new ClaudeProvider());

export function getProvider(id: AIProviderId): AIProvider | undefined {
  return providers.get(id);
}

export function getProviderOrThrow(id: AIProviderId): AIProvider {
  const provider = providers.get(id);
  if (!provider) {
    throw new Error(`Unknown AI provider: ${id}`);
  }
  return provider;
}

export function getAllProviders(): AIProvider[] {
  return Array.from(providers.values());
}

export function getProviderIds(): AIProviderId[] {
  return Array.from(providers.keys());
}
