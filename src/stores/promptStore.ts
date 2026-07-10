import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Prompt, PromptVersion } from '../types';
import { STORAGE_KEYS, MAX_VERSIONS } from '../constants';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

interface PromptState {
  prompts: Prompt[];
  customCategories: string[];
  categoryOrder: string[];
  selectedPromptId: string | null;
  searchQuery: string;
  filterCategory: string | null;
  isLoading: boolean;

  loadPrompts: () => Promise<void>;
  savePrompts: () => Promise<void>;
  addPrompt: (title?: string, content?: string, category?: string) => string;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  duplicatePrompt: (id: string) => string;
  selectPrompt: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string | null) => void;
  addCustomCategory: (name: string) => void;
  renameCustomCategory: (oldName: string, newName: string) => void;
  deleteCustomCategory: (name: string) => void;
  deleteCategoryAndPrompts: (name: string) => void;
  reassignCategory: (from: string, to: string) => void;
  setCategoryOrder: (order: string[]) => void;
  hasCategory: (name: string) => boolean;
  toggleFavorite: (id: string) => void;
  togglePin: (id: string) => void;
  updatePromptColor: (id: string, color: string) => void;
  addVersion: (id: string) => void;
  restoreVersion: (id: string, versionId: string) => void;
  getFilteredPrompts: () => Prompt[];
  getPromptById: (id: string) => Prompt | undefined;
}

export const usePromptStore = create<PromptState>((set, get) => ({
  prompts: [],
  customCategories: [],
  categoryOrder: [],
  selectedPromptId: null,
  searchQuery: '',
  filterCategory: null,
  isLoading: false,

  loadPrompts: async () => {
    set({ isLoading: true });
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROMPTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          set({ prompts: parsed });
        } else if (parsed && Array.isArray(parsed.prompts)) {
          set({ prompts: parsed.prompts, customCategories: parsed.customCategories || [], categoryOrder: parsed.categoryOrder || [] });
        }
      }
    } catch (error) {
      console.warn('Failed to load prompts:', error);
    }
    set({ isLoading: false });
  },

  savePrompts: async () => {
    try {
      const { prompts, customCategories, categoryOrder } = get();
      await AsyncStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify({ prompts, customCategories, categoryOrder }));
    } catch (error) {
      console.warn('Failed to save prompts:', error);
    }
  },

  addPrompt: (title = 'Untitled', content = '', category = 'Other') => {
    const id = generateId();
    const now = new Date().toISOString();
    const newPrompt: Prompt = {
      id,
      title,
      content,
      category,
      tags: [],
      color: '#7fbf8b',
      isFavorite: false,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
      versions: [],
      order: get().prompts.length,
    };
    set((state) => ({ prompts: [newPrompt, ...state.prompts] }));
    get().savePrompts();
    return id;
  },

  updatePrompt: (id, updates) => {
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      ),
    }));
    get().savePrompts();
  },

  deletePrompt: (id) => {
    set((state) => ({
      prompts: state.prompts.filter((p) => p.id !== id),
      selectedPromptId: state.selectedPromptId === id ? null : state.selectedPromptId,
    }));
    get().savePrompts();
  },

  duplicatePrompt: (id) => {
    const prompt = get().prompts.find((p) => p.id === id);
    if (!prompt) return '';
    const newId = generateId();
    const now = new Date().toISOString();
    const duplicate: Prompt = {
      ...prompt,
      id: newId,
      title: `${prompt.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      versions: [],
      order: 0,
    };
    set((state) => ({
      prompts: [duplicate, ...state.prompts],
    }));
    get().savePrompts();
    return newId;
  },

  selectPrompt: (id) => set({ selectedPromptId: id }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilterCategory: (category) => set({ filterCategory: category }),

  addCustomCategory: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const { customCategories } = get();
    if (customCategories.includes(trimmed)) return;
    set({ customCategories: [...customCategories, trimmed] });
    get().savePrompts();
  },

  renameCustomCategory: (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    const { customCategories } = get();
    set({
      customCategories: customCategories.map((c) => c === oldName ? trimmed : c),
      prompts: get().prompts.map((p) =>
        p.category === oldName ? { ...p, category: trimmed } : p
      ),
    });
    get().savePrompts();
  },

  deleteCustomCategory: (name) => {
    const { customCategories } = get();
    set({ customCategories: customCategories.filter((c) => c !== name) });
    get().savePrompts();
  },

  deleteCategoryAndPrompts: (name) => {
    const { prompts, customCategories, categoryOrder } = get();
    set({
      prompts: prompts.filter((p) => p.category !== name),
      customCategories: customCategories.filter((c) => c !== name),
      categoryOrder: categoryOrder.filter((c) => c !== name),
    });
    get().savePrompts();
  },

  reassignCategory: (from, to) => {
    set({
      prompts: get().prompts.map((p) =>
        p.category === from ? { ...p, category: to } : p
      ),
    });
    const { customCategories } = get();
    if (customCategories.includes(from)) {
      set({ customCategories: customCategories.filter((c) => c !== from) });
    }
    get().savePrompts();
  },

  setCategoryOrder: (order) => {
    set({ categoryOrder: order });
    get().savePrompts();
  },

  hasCategory: (name) => {
    const { customCategories, prompts } = get();
    if (customCategories.includes(name)) return true;
    return prompts.some((p) => p.category === name);
  },

  toggleFavorite: (id) => {
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      ),
    }));
    get().savePrompts();
  },

  togglePin: (id) => {
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id ? { ...p, isPinned: !p.isPinned } : p
      ),
    }));
    get().savePrompts();
  },

  updatePromptColor: (id, color) => {
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id ? { ...p, color, updatedAt: new Date().toISOString() } : p
      ),
    }));
    get().savePrompts();
  },

  addVersion: (id) => {
    const prompt = get().prompts.find((p) => p.id === id);
    if (!prompt) return;

    const version: PromptVersion = {
      id: generateId(),
      content: prompt.content,
      title: prompt.title,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id
          ? { ...p, versions: [...p.versions, version].slice(-MAX_VERSIONS) }
          : p
      ),
    }));
    get().savePrompts();
  },

  restoreVersion: (id, versionId) => {
    const prompt = get().prompts.find((p) => p.id === id);
    if (!prompt) return;
    const version = prompt.versions.find((v) => v.id === versionId);
    if (!version) return;

    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id
          ? {
              ...p,
              content: version.content,
              title: version.title,
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    get().savePrompts();
  },

  getFilteredPrompts: () => {
    const { prompts, searchQuery, filterCategory } = get();
    let filtered = [...prompts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filterCategory) {
      filtered = filtered.filter((p) => p.category === filterCategory);
    }

    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return a.order - b.order;
    });

    return filtered;
  },

  getPromptById: (id) => {
    return get().prompts.find((p) => p.id === id);
  },
}));
