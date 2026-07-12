import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PromptTemplate } from '../types';
import { STORAGE_KEYS } from '../constants';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

// Debounced save utility
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const SAVE_DEBOUNCE_MS = 500;

function debounceSave(saveFn: () => Promise<void>) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveFn();
  }, SAVE_DEBOUNCE_MS);
}

interface TemplateState {
  userTemplates: PromptTemplate[];
  isLoading: boolean;
  loadTemplates: () => Promise<void>;
  saveTemplates: () => Promise<void>;
  debouncedSave: () => void;
  addTemplate: (template: Omit<PromptTemplate, 'id'>) => string;
  deleteTemplate: (id: string) => void;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  userTemplates: [],
  isLoading: false,

  loadTemplates: async () => {
    set({ isLoading: true });
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_TEMPLATES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          set({ userTemplates: parsed });
        }
      }
    } catch (error) {
      console.warn('Failed to load user templates:', error);
    }
    set({ isLoading: false });
  },

  saveTemplates: async () => {
    try {
      const { userTemplates } = get();
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TEMPLATES, JSON.stringify(userTemplates));
    } catch (error) {
      console.warn('Failed to save user templates:', error);
    }
  },

  debouncedSave: () => {
    debounceSave(get().saveTemplates);
  },

  addTemplate: (template) => {
    const id = generateId();
    const newTemplate: PromptTemplate = { ...template, id };
    set((state) => ({
      userTemplates: [newTemplate, ...state.userTemplates],
    }));
    get().debouncedSave();
    return id;
  },

  deleteTemplate: (id) => {
    set((state) => ({
      userTemplates: state.userTemplates.filter((t) => t.id !== id),
    }));
    get().debouncedSave();
  },
}));
