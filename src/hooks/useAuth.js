import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth store using Zustand for managing authentication state
 * Persists user data in localStorage
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      /**
       * Set user data when logged in
       * @param {Object} userData - User object from API
       */
      setUser: (userData) => {
        set({
          user: userData,
          isAuthenticated: !!userData,
        });
      },

      /**
       * Clear auth state on logout
       */
      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      /**
       * Set loading state
       */
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }), // Only persist user and isAuthenticated
    }
  )
);

export default useAuthStore;
