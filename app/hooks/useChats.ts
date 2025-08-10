/**
 * Chat-related TanStack Query hooks
 */

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '../lib/query/keys';
import {
  fetchChats,
  createChat,
  fetchChat,
  updateChatName,
  deleteChat,
  type Chat,
  type ChatListResponse,
  type UpdateChatRequest,
  type UpdateChatResponse,
} from '../lib/api/chats';

// Fetch chats with infinite scroll
export function useChats() {
  return useInfiniteQuery({
    queryKey: queryKeys.chats.lists(),
    queryFn: ({ pageParam }) => fetchChats(15, pageParam),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as number | undefined,
  });
}

// Fetch a specific chat
export function useChat(id: string | number) {
  return useQuery({
    queryKey: queryKeys.chats.detail(id),
    queryFn: () => fetchChat(id),
    enabled: !!id,
  });
}

// Create a new chat
export function useCreateChat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createChat,
    onSuccess: (data) => {
      // Invalidate chat list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.lists() });
    //   toast.success('New chat created');
    },
    onError: (error) => {
      console.error('Failed to create chat:', error);
      toast.error('Failed to create chat');
    },
  });
}

// Update chat name
export function useUpdateChatName() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateChatRequest }) =>
      updateChatName(id, data),
    onSuccess: (result: UpdateChatResponse, variables) => {
      // Update the specific chat in cache
      queryClient.setQueryData(queryKeys.chats.detail(variables.id), (oldData: Chat | undefined) => {
        if (oldData) {
          return { ...oldData, name: result.name };
        }
        return oldData;
      });
      
      // Also update the chat in the infinite query list
      queryClient.setQueryData(queryKeys.chats.lists(), (oldData: any) => {
        if (oldData?.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              chats: page.chats?.map((chat: Chat) => 
                chat.id === Number(variables.id) 
                  ? { ...chat, name: result.name }
                  : chat
              ) || []
            }))
          };
        }
        return oldData;
      });
      
      toast.success('Chat name updated');
    },
    onError: (error) => {
      console.error('Failed to update chat name:', error);
      toast.error('Failed to update chat name');
    },
  });
}

// Delete a chat
export function useDeleteChat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteChat,
    onSuccess: (data, variables) => {
      // Remove the chat from the infinite query list
      queryClient.setQueryData(queryKeys.chats.lists(), (oldData: any) => {
        if (oldData?.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              chats: page.chats?.filter((chat: Chat) => chat.id !== Number(variables)) || []
            }))
          };
        }
        return oldData;
      });
      
      // Remove the specific chat cache
      queryClient.removeQueries({ queryKey: queryKeys.chats.detail(variables) });
      
      // Remove related messages cache
      queryClient.removeQueries({ queryKey: queryKeys.messages.list(variables) });
      
      toast.success('Chat deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete chat:', error);
      toast.error('Failed to delete chat');
    },
  });
}
