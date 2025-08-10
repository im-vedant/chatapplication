import { create } from 'zustand';

export type FirstMessage = { chatId: number; content: string; role: string; files: string[] };
export type Store = {
  firstMessages: FirstMessage[];
  addFirstMessage: (msg: FirstMessage) => void;
  removeFirstMessage: (chatId: number) => void;
};

export const useFirstMessageStore = create<Store>((set) => ({
  firstMessages: [],
  addFirstMessage: (msg: FirstMessage) => set((state) => ({ firstMessages: [...state.firstMessages, msg] })),
  removeFirstMessage: (chatId: number) => set((state) => ({ firstMessages: state.firstMessages.filter(m => m.chatId !== chatId) })),
}));
