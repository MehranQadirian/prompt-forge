import { useState, useCallback } from 'react';
import { useAIStore } from '../stores/aiStore';
import { apiKeyStorage } from '../services/storage/apiKeyStorage';
import { getProviderOrThrow } from '../services/ai/provider';
import { AIServiceError } from '../services/ai/errors';
import { AIError } from '../types';

export function useEnhance() {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<string | null>(null);
  const [showResultSheet, setShowResultSheet] = useState(false);
  const [enhanceError, setEnhanceError] = useState<AIError | null>(null);

  const {
    activeProviderId,
    providerConfigs,
    systemPrompt,
  } = useAIStore();

  const enhance = useCallback(
    async (currentText: string): Promise<void> => {
      if (!currentText.trim()) {
        return;
      }

      // Check if user has an API key configured
      const config = providerConfigs[activeProviderId];
      const hasOwnKey = config?.hasApiKey ?? false;

      if (!hasOwnKey) {
        const error: AIError = {
          code: 'INVALID_KEY',
          message: 'No API key configured. Please add your API key in AI Settings to use prompt enhancement.',
          provider: activeProviderId,
        };
        setEnhanceError(error);
        setShowResultSheet(true);
        return;
      }

      setIsEnhancing(true);
      setEnhanceError(null);
      setShowResultSheet(true);

      try {
        const apiKey = (await apiKeyStorage.get(activeProviderId)) || '';
        if (!apiKey) {
          throw new AIServiceError('INVALID_KEY', 'No API key configured.', activeProviderId);
        }

        const provider = getProviderOrThrow(activeProviderId);
        const response = await provider.enhance(
          { prompt: currentText, systemPrompt },
          apiKey
        );

        setEnhancedResult(response.enhanced);
        setIsEnhancing(false);
      } catch (error: any) {
        const aiError: AIError =
          error instanceof AIServiceError
            ? { code: error.code, message: error.message, provider: error.provider }
            : {
                code: 'UNKNOWN',
                message: error?.message || 'An unexpected error occurred.',
                provider: activeProviderId,
              };

        setEnhanceError(aiError);
        setEnhancedResult(null);
        setIsEnhancing(false);
      }
    },
    [activeProviderId, providerConfigs, systemPrompt]
  );

  const dismissSheet = useCallback(() => {
    setShowResultSheet(false);
    setEnhancedResult(null);
    setEnhanceError(null);
  }, []);

  return {
    isEnhancing,
    enhancedResult,
    showResultSheet,
    enhanceError,
    enhance,
    dismissSheet,
  };
}
