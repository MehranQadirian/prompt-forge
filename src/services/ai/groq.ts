import { AIProvider, AIEnhanceRequest, AIEnhanceResponse, AIProviderId } from '../../types';
import { AI_DEFAULTS } from '../../constants';
import {
  NetworkError,
  InvalidKeyError,
  TimeoutError,
  RateLimitError,
  ProviderUnavailableError,
  QuotaExceededError,
  mapHTTPStatus,
} from './errors';
import { buildEnhanceMessages } from './prompt-engineer';

const PROVIDER_ID: AIProviderId = 'groq';
const PROVIDER_NAME = 'Groq';

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new TimeoutError(PROVIDER_NAME);
    }
    if (!error.message || error.message.includes('Network') || error.message.includes('fetch')) {
      throw new NetworkError(PROVIDER_NAME);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export class GroqProvider implements AIProvider {
  readonly id = PROVIDER_ID;
  readonly name = PROVIDER_NAME;
  readonly baseUrl = AI_DEFAULTS.GROQ_BASE_URL;

  async enhance(request: AIEnhanceRequest, apiKey: string): Promise<AIEnhanceResponse> {
    if (!apiKey) {
      throw new InvalidKeyError(PROVIDER_NAME);
    }

    const messages = buildEnhanceMessages(request.prompt, request.systemPrompt);

    const response = await fetchWithTimeout(
      `${this.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: AI_DEFAULTS.GROQ_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 4096,
        }),
      },
      AI_DEFAULTS.ENHANCE_TIMEOUT_MS
    );

    if (!response.ok) {
      if (response.status === 401) throw new InvalidKeyError(PROVIDER_NAME);
      if (response.status === 429) throw new RateLimitError(PROVIDER_NAME);
      if (response.status === 503) throw new ProviderUnavailableError(PROVIDER_NAME);
      if (response.status === 402 || response.status === 403) throw new QuotaExceededError(PROVIDER_NAME);

      let errorMsg = `Request failed (${response.status})`;
      try {
        const errorBody = await response.json();
        errorMsg = errorBody?.error?.message || errorMsg;
      } catch {}

      throw mapHTTPStatus(response.status, PROVIDER_NAME);
    }

    const data = await response.json();

    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new ProviderUnavailableError(PROVIDER_NAME);
    }

    return {
      enhanced: content.trim(),
      provider: PROVIDER_ID,
      tokensUsed: data?.usage?.total_tokens,
    };
  }

  async validateKey(apiKey: string): Promise<boolean> {
    if (!apiKey || !apiKey.startsWith('gsk_')) return false;

    try {
      const response = await fetchWithTimeout(
        `${this.baseUrl}/models`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
        10000
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}
