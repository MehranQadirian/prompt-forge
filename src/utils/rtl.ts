const RTL_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF\u200F]/;

export function detectRTL(text: string): boolean {
  if (!text) return false;
  return RTL_REGEX.test(text);
}

