import { create } from "zustand";
import { GuideLine } from "@/utils/snap";

type GuideStoreState = {
  guides: GuideLine[];
};

type GuideStoreActions = {
  setGuides: (guides: GuideLine[]) => void;
  clearGuides: () => void;
};

export const useGuideStore = create<GuideStoreState & GuideStoreActions>(
  (set) => ({
    guides: [],
    setGuides: (guides) => set({ guides }),
    clearGuides: () => set({ guides: [] }),
  })
);
