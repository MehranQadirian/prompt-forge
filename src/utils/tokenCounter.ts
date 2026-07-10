import { CHARS_PER_TOKEN } from '../constants';

export function countChars(text: string): number {
  return text.length;
}

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function countLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').length;
}

export interface TextStats {
  chars: number;
  words: number;
  tokens: number;
  lines: number;
}

export function getTextStats(text: string): TextStats {
  return {
    chars: countChars(text),
    words: countWords(text),
    tokens: estimateTokens(text),
    lines: countLines(text),
  };
}
