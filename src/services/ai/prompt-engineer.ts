import { AI_DEFAULTS } from '../../constants';

export function getSystemPrompt(customPrompt?: string): string {
  return customPrompt && customPrompt.trim().length > 0
    ? customPrompt
    : AI_DEFAULTS.SYSTEM_PROMPT;
}

export function buildEnhanceMessages(
  prompt: string,
  systemPrompt?: string
): { role: string; content: string }[] {
  return [
    { role: 'system', content: getSystemPrompt(systemPrompt) },
    { role: 'user', content: prompt },
  ];
}
