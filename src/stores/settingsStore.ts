import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, ThemeVariant, SwipeAction } from '../types';
import { STORAGE_KEYS } from '../constants';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  setTheme: (theme: ThemeVariant) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setOnboarded: () => void;
  setShowTokenCount: (show: boolean) => void;
  setFollowSystem: (follow: boolean) => void;
  setSwipeLeftAction: (action: SwipeAction) => void;
  setSwipeRightAction: (action: SwipeAction) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'forest',
  fontSize: 16,
  fontFamily: 'system',
  hasOnboarded: false,
  showTokenCount: true,
  followSystem: false,
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

  setTheme: (theme) => {
    set((state) => ({
      settings: { ...state.settings, theme },
    }));
    get().saveSettings();
  },

  setFontSize: (fontSize) => {
    set((state) => ({
      settings: { ...state.settings, fontSize },
    }));
    get().saveSettings();
  },

  setFontFamily: (fontFamily) => {
    set((state) => ({
      settings: { ...state.settings, fontFamily },
    }));
    get().saveSettings();
  },

  setOnboarded: () => {
    set((state) => ({
      settings: { ...state.settings, hasOnboarded: true },
    }));
    get().saveSettings();
  },

  setShowTokenCount: (showTokenCount) => {
    set((state) => ({
      settings: { ...state.settings, showTokenCount },
    }));
    get().saveSettings();
  },

  setFollowSystem: (followSystem) => {
    set((state) => ({
      settings: { ...state.settings, followSystem },
    }));
    get().saveSettings();
  },

  setSwipeLeftAction: (swipeLeftAction) => {
    set((state) => ({
      settings: { ...state.settings, swipeLeftAction },
    }));
    get().saveSettings();
  },

  setSwipeRightAction: (swipeRightAction) => {
    set((state) => ({
      settings: { ...state.settings, swipeRightAction },
    }));
    get().saveSettings();
  },
}));
