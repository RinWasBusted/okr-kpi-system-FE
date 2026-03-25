import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (newTheme) => set({ theme: newTheme }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return {
    theme,
    toggleTheme,
    setTheme,
  };
};

export default useThemeStore;
