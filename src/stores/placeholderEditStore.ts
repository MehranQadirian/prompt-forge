import { create } from 'zustand';

interface PlaceholderEditState {
  pendingKey: string | null;
  pendingType: 'bracket' | 'brace' | null;
  pendingValue: string;
  resultKey: string | null;
  resultType: 'bracket' | 'brace' | null;
  resultValue: string | null;

  startEdit: (key: string, type: 'bracket' | 'brace', currentValue: string) => void;
  saveResult: (key: string, type: 'bracket' | 'brace', value: string) => void;
  consumeResult: () => { key: string; type: 'bracket' | 'brace'; value: string } | null;
  cancelEdit: () => void;
}

export const usePlaceholderEditStore = create<PlaceholderEditState>((set, get) => ({
  pendingKey: null,
  pendingType: null,
  pendingValue: '',
  resultKey: null,
  resultType: null,
  resultValue: null,

  startEdit: (key, type, currentValue) => {
    set({ pendingKey: key, pendingType: type, pendingValue: currentValue });
  },

  saveResult: (key, type, value) => {
    set({ resultKey: key, resultType: type, resultValue: value });
  },

  consumeResult: () => {
    const { resultKey, resultType, resultValue } = get();
    if (resultKey && resultType && resultValue !== null) {
      set({ resultKey: null, resultType: null, resultValue: null });
      return { key: resultKey, type: resultType, value: resultValue };
    }
    return null;
  },

  cancelEdit: () => {
    set({ pendingKey: null, pendingType: null, pendingValue: '' });
  },
}));
