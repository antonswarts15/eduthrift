import { create } from 'zustand';

interface AuthPromptStore {
  isOpen: boolean;
  actionDescription: string;
  showPrompt: (action: string) => void;
  hidePrompt: () => void;
}

export const useAuthPromptStore = create<AuthPromptStore>()((set) => ({
  isOpen: false,
  actionDescription: '',
  showPrompt: (action: string) => set({ isOpen: true, actionDescription: action }),
  hidePrompt: () => set({ isOpen: false, actionDescription: '' }),
}));
