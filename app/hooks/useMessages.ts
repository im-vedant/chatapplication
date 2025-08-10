/**
 * Message-related TanStack Query hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '../lib/query/keys';
import {
  fetchMessages,
  createMessage,
  type Message,
  type CreateMessageRequest,
  type CreateMessageApiResponse,
} from '../lib/api/messages';

// Fetch messages for a chat
export function useMessages(chatId: string | number) {
  return useQuery({
    queryKey: queryKeys.messages.list(chatId),
    queryFn: () => fetchMessages(chatId),
    enabled: !!chatId,
  });
}

// Create a new message
export function useCreateMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: string | number; data: CreateMessageRequest }) =>
      createMessage(chatId, data),
    onMutate: async ({ chatId, data }: { chatId: string | number; data: CreateMessageRequest }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.messages.list(chatId) });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<Message[]>(queryKeys.messages.list(chatId));

      // Create optimistic user message
      const optimisticUserMessage: Message = {
        id: Date.now(), // Temporary ID
        content: data.content,
        files: data.files || [],
        role: 'user',
        createdAt: new Date().toISOString(),
        chatId: Number(chatId)
      };

      // Optimistically update to the new value
      queryClient.setQueryData(
        queryKeys.messages.list(chatId),
        (oldData: Message[] | undefined) => {
          if (oldData) {
            return [...oldData, optimisticUserMessage];
          }
          return [optimisticUserMessage];
        }
      );

      // Return a context object with the snapshotted value
      return { previousMessages, chatId };
    },
    onSuccess: (newMessages: CreateMessageApiResponse, variables) => {
      // Replace optimistic messages with real messages from API
      queryClient.setQueryData(
        queryKeys.messages.list(variables.chatId),
        (oldData: Message[] | undefined) => {
          if (oldData) {
            // Remove the last message (optimistic) and add the real messages
            return [...oldData.slice(0, -1), ...newMessages];
          }
          return newMessages;
        }
      );
      
      // Update the chat list to reflect new message count and last message
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.lists() });
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKeys.messages.list(context.chatId), context.previousMessages);
      }
      console.error('Failed to create message:', error);
      toast.error('Failed to send message');
    },
  });
}
