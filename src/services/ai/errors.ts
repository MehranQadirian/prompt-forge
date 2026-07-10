import { AIErrorCode } from '../../types';

export class AIServiceError extends Error {
  readonly code: AIErrorCode;
  readonly provider: string;

  constructor(code: AIErrorCode, message: string, provider: string) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
    this.provider = provider;
  }
}

export class NetworkError extends AIServiceError {
  constructor(provider: string) {
    super('NETWORK_ERROR', 'No internet connection. Please check your network and try again.', provider);
  }
}

export class InvalidKeyError extends AIServiceError {
  constructor(provider: string) {
    super('INVALID_KEY', 'Invalid API key. Please check your key in AI Settings.', provider);
  }
}

export class TimeoutError extends AIServiceError {
  constructor(provider: string) {
    super('TIMEOUT', 'Request timed out. The AI service may be experiencing high load.', provider);
  }
}

export class RateLimitError extends AIServiceError {
  constructor(provider: string) {
    super('RATE_LIMIT', 'Too many requests. Please wait a moment and try again.', provider);
  }
}

export class ProviderUnavailableError extends AIServiceError {
  constructor(provider: string) {
    super('PROVIDER_UNAVAILABLE', 'AI provider is currently unavailable. Please try again later.', provider);
  }
}

export class QuotaExceededError extends AIServiceError {
  constructor(provider: string) {
    super('QUOTA_EXCEEDED', 'API quota exceeded. Please configure your own API key in AI Settings.', provider);
  }
}

export function mapHTTPStatus(status: number, provider: string): AIServiceError {
  switch (status) {
    case 401:
      return new InvalidKeyError(provider);
    case 429:
      return new RateLimitError(provider);
    case 503:
      return new ProviderUnavailableError(provider);
    default:
      return new AIServiceError('UNKNOWN', `Unexpected error (${status}). Please try again.`, provider);
  }
}
