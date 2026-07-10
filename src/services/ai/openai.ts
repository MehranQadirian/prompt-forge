import { AIProvider, AIEnhanceRequest, AIEnhanceResponse, AIProviderId } from '../../types';
import { ProviderUnavailableError } from './errors';

const PROVIDER_ID: AIProviderId = 'openai';

export class OpenAIProvider implements AIProvider {
  readonly id = PROVIDER_ID;
  readonly name = 'OpenAI';
  readonly baseUrl = 'https://api.openai.com/v1';

  async enhance(_request: AIEnhanceRequest, _apiKey: string): Promise<AIEnhanceResponse> {
    throw new ProviderUnavailableError(this.name);
  }

  async validateKey(_apiKey: string): Promise<boolean> {
    return false;
  }
}
