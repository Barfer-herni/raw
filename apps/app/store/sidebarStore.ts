import { create } from 'zustand';

interface SidebarState {
    isCollapsed: boolean;
    isHovered: boolean;
    toggleCollapse: () => void;
    setHover: (isHovered: boolean) => void;
}

export const useSidebar = create<SidebarState>((set) => ({
    isCollapsed: true,
    isHovered: false,
    toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    setHover: (isHovered) => set({ isHovered }),
})); 