import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "maizai_debug_fab_visible";

interface DebugUiState {
  // Whether the floating debug button is shown. The version-tap-5× entry into
  // the debug screen always works regardless of this setting.
  fabVisible: boolean;
  hydrate: () => Promise<void>;
  setFabVisible: (visible: boolean) => void;
}

export const useDebugUiStore = create<DebugUiState>((set) => ({
  fabVisible: true,
  hydrate: async () => {
    const stored = await AsyncStorage.getItem(KEY);
    if (stored !== null) set({ fabVisible: stored === "true" });
  },
  setFabVisible: (visible) => {
    set({ fabVisible: visible });
    AsyncStorage.setItem(KEY, visible ? "true" : "false");
  },
}));
