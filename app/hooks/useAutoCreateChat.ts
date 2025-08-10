'use client';

import { useEffect, useState, useRef } from 'react';
import { useCreateChat } from './index';

export function useAutoCreateChat() {
  const [isCreating, setIsCreating] = useState(true);
  const [createdChatId, setCreatedChatId] = useState<number | null>(null);
  const createChatMutation = useCreateChat();
  const hasCreated = useRef(false);

  useEffect(() => {
    // Prevent multiple creations
    if (hasCreated.current) return;
    
    // Check if we already have a chat ID in session storage for this session
    const sessionChatId = sessionStorage.getItem('pendingChatId');
    if (sessionChatId) {
      setCreatedChatId(parseInt(sessionChatId));
      setIsCreating(false);
      return;
    }
    
    const createInitialChat = async () => {
      hasCreated.current = true;
      try {
        console.log('Creating new chat from useAutoCreateChat');
        const newChat = await createChatMutation.mutateAsync();
        console.log('Created chat with ID:', newChat.id);
        setCreatedChatId(newChat.id);
        // Store in session storage to prevent recreation on page refresh/remount
        sessionStorage.setItem('pendingChatId', newChat.id.toString());
      } catch (error) {
        console.error('Failed to create initial chat:', error);
        hasCreated.current = false; // Allow retry on error
      } finally {
        setIsCreating(false);
      }
    };

    createInitialChat();
  }, [createChatMutation]);

  return {
    isCreating,
    createdChatId,
    isError: createChatMutation.isError,
    error: createChatMutation.error
  };
}
