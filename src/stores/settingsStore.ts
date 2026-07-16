import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, ThemeVariant, SwipeAction } from '../types';
import { STORAGE_KEYS } from '../constants';

// Debounced save utility
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const SAVE_DEBOUNCE_MS = 500;

function debounceSave(saveFn: () => Promise<void>) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveFn();
  }, SAVE_DEBOUNCE_MS);
}

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  debouncedSave: () => void;
  setTheme: (theme: ThemeVariant) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setOnboarded: () => void;
  setShowTokenCount: (show: boolean) => void;
  setSwipeLeftAction: (action: SwipeAction) => void;
  setSwipeRightAction: (action: SwipeAction) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'forest',
  fontSize: 16,
  fontFamily: 'system',
  hasOnboarded: false,
  showTokenCount: true,
  swipeLeftAction: 'edit',
  swipeRightAction: 'delete',
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        set({ settings: { ...DEFAULT_SETTINGS, ...parsed } });
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
    set({ isLoading: false });
  },

  saveSettings: async () => {
    try {
      const { settings } = get();
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  },

  debouncedSave: () => {
    debounceSave(get().saveSettings);
  },

  setTheme: (theme) => {
    set((state) => ({
      settings: { ...state.settings, theme },
    }));
    get().debouncedSave();
  },

  setFontSize: (fontSize) => {
    set((state) => ({
      settings: { ...state.settings, fontSize },
    }));
    get().debouncedSave();
  },

  setFontFamily: (fontFamily) => {
    set((state) => ({
      settings: { ...state.settings, fontFamily },
    }));
    get().debouncedSave();
  },

  setOnboarded: () => {
    set((state) => ({
      settings: { ...state.settings, hasOnboarded: true },
    }));
    get().debouncedSave();
  },

  setShowTokenCount: (showTokenCount) => {
    set((state) => ({
      settings: { ...state.settings, showTokenCount },
    }));
    get().debouncedSave();
  },

  setSwipeLeftAction: (swipeLeftAction) => {
    set((state) => ({
      settings: { ...state.settings, swipeLeftAction },
    }));
    get().debouncedSave();
  },

  setSwipeRightAction: (swipeRightAction) => {
    set((state) => ({
      settings: { ...state.settings, swipeRightAction },
    }));
    get().debouncedSave();
  },
}));
