import { create } from "zustand";
import type { CaptureWithDetails } from "@/types/domain";

interface CaptureState {
  // The most recent capture result — used to navigate to /result/[id]
  lastCaptureId: string | null;
  // Whether the AI is currently running inference
  isAnalysing: boolean;

  setLastCaptureId: (id: string | null) => void;
  setAnalysing: (value: boolean) => void;
}

export const useCaptureStore = create<CaptureState>((set) => ({
  lastCaptureId: null,
  isAnalysing: false,

  setLastCaptureId: (id) => set({ lastCaptureId: id }),
  setAnalysing: (value) => set({ isAnalysing: value }),
}));

// Separate store for the full capture detail (populated when navigating to result screen)
interface ResultDetailState {
  detail: CaptureWithDetails | null;
  setDetail: (detail: CaptureWithDetails | null) => void;
}

export const useResultDetailStore = create<ResultDetailState>((set) => ({
  detail: null,
  setDetail: (detail) => set({ detail }),
}));
