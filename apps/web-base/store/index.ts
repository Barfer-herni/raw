import { create } from 'zustand';
import { ExampleStore } from './types';

// Un store de ejemplo.
export const useExampleStore = create<ExampleStore>((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
}));
