import { AIProvider, AIEnhanceRequest, AIEnhanceResponse, AIProviderId } from '../../types';
import { ProviderUnavailableError } from './errors';

const PROVIDER_ID: AIProviderId = 'deepseek';

export class DeepSeekProvider implements AIProvider {
  readonly id = PROVIDER_ID;
  readonly name = 'DeepSeek';
  readonly baseUrl = 'https://api.deepseek.com/v1';

  async enhance(_request: AIEnhanceRequest, _apiKey: string): Promise<AIEnhanceResponse> {
    throw new ProviderUnavailableError(this.name);
  }

  async validateKey(_apiKey: string): Promise<boolean> {
    return false;
  }
}
