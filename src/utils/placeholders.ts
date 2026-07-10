export interface Placeholder {
  key: string;
  type: 'bracket' | 'brace';
  index: number;
  originalLength: number;
}

export function detectPlaceholders(text: string): Placeholder[] {
  const placeholders: Placeholder[] = [];
  const bracketRegex = /\[([^\[\]]+)\]/g;
  const braceRegex = /\{([^{}]+)\}/g;

  let match;

  while ((match = bracketRegex.exec(text)) !== null) {
    placeholders.push({
      key: match[1],
      type: 'bracket',
      index: match.index,
      originalLength: match[0].length,
    });
  }

  while ((match = braceRegex.exec(text)) !== null) {
    placeholders.push({
      key: match[1],
      type: 'brace',
      index: match.index,
      originalLength: match[0].length,
    });
  }

  return placeholders.sort((a, b) => a.index - b.index);
}

export function replacePlaceholdersByIndex(
  text: string,
  placeholders: Placeholder[],
  values: Record<number, string>
): string {
  let result = '';
  let lastIndex = 0;

  for (const ph of placeholders) {
    const filled = values[ph.index] ?? text.substring(ph.index, ph.index + ph.originalLength);
    result += text.substring(lastIndex, ph.index) + filled;
    lastIndex = ph.index + ph.originalLength;
  }

  result += text.substring(lastIndex);
  return result;
}
