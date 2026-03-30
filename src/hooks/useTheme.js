import { create } from 'zustand';

const useThemeStore = create((set) => {
  // Khởi tạo theme từ localStorage, fallback 'light'
  const initialTheme = localStorage.getItem('theme') || 'light';

  return {
    theme: initialTheme,
    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return { theme: newTheme };
    }),
    setTheme: (newTheme) => {
      localStorage.setItem('theme', newTheme);
      set({ theme: newTheme });
    },
  };
});

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
