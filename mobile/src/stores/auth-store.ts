import { create } from "zustand";
import { storeToken, storeUser, clearAuth, getToken, getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import type { StoredUser } from "@/lib/auth";

interface AuthState {
  user: StoredUser | null;
  token: string | null;
  mustChangePassword: boolean;
  isLoading: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<{ mustChangePassword: boolean }>;
  signOut: () => Promise<void>;
  hydrateFromStorage: () => Promise<void>;
  setMustChangePassword: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  mustChangePassword: false,
  isLoading: true,

  signIn: async (email, password) => {
    const result = await api.signIn({ email, password });
    await storeToken(result.token);
    await storeUser(result.user);
    set({
      token: result.token,
      user: result.user,
      mustChangePassword: result.mustChangePassword,
    });
    return { mustChangePassword: result.mustChangePassword };
  },

  signOut: async () => {
    await clearAuth();
    set({ user: null, token: null, mustChangePassword: false });
  },

  hydrateFromStorage: async () => {
    try {
      const [token, user] = await Promise.all([getToken(), getUser()]);
      set({ token, user, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setMustChangePassword: (value) => set({ mustChangePassword: value }),
}));
