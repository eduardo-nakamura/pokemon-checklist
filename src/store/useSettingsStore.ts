import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  language: 'pt-BR' | 'en';
  isDarkMode: boolean;
  setLanguage: (lang: 'pt-BR' | 'en') => void;
  toggleDarkMode: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'pt-BR',
      isDarkMode: true,
      setLanguage: (lang) => set({ language: lang }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    { name: 'pokecheck-settings' }
  )
);