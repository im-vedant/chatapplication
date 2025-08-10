/**
 * Query keys for TanStack Query
 * Organized hierarchically for easy invalidation and management
 */

export const queryKeys = {
  // Chat-related queries
  chats: {
    all: ['chats'] as const,
    lists: () => [...queryKeys.chats.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.chats.lists(), filters] as const,
    details: () => [...queryKeys.chats.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.chats.details(), id] as const,
  },

  // Message-related queries
  messages: {
    all: ['messages'] as const,
    lists: () => [...queryKeys.messages.all, 'list'] as const,
    list: (chatId: string | number) => [...queryKeys.messages.lists(), chatId] as const,
    details: () => [...queryKeys.messages.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.messages.details(), id] as const,
  },

  // File upload queries
  uploads: {
    all: ['uploads'] as const,
    url: (filename: string, contentType: string) => [...queryKeys.uploads.all, 'url', filename, contentType] as const,
  },

  // Name generation queries
  nameGeneration: {
    all: ['nameGeneration'] as const,
    generate: (message: string) => [...queryKeys.nameGeneration.all, 'generate', message] as const,
  },
} as const;
