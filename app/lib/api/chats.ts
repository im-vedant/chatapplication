/**
 * Chat API functions
 */

export interface Chat {
  id: number;
  name: string | null;
  createdAt: string;
  messageCount: number;
}

export interface ChatListResponse {
  chats: Chat[];
  hasMore: boolean;
  nextCursor?: number;
}

export interface CreateChatResponse {
  id: number;
}

export interface UpdateChatRequest {
  name: string;
}

export interface UpdateChatResponse {
  id: number;
  name: string;
  message: string;
}

// Fetch chats with pagination
export async function fetchChats(limit: number = 15, cursor?: number): Promise<ChatListResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    ...(cursor && { cursor: cursor.toString() })
  });
  
  const response = await fetch(`/api/chat?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch chats: ${response.status}`);
  }
  
  return response.json();
}

// Create a new chat
export async function createChat(): Promise<CreateChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create chat: ${response.status}`);
  }
  
  return response.json();
}

// Fetch a specific chat
export async function fetchChat(id: string | number): Promise<Chat> {
  const response = await fetch(`/api/chat/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch chat: ${response.status}`);
  }
  
  const chat = await response.json();
  
  // Transform to match our Chat interface
  return {
    id: chat.id,
    name: chat.name,
    createdAt: chat.createdAt,
    messageCount: chat.messages ? chat.messages.length : 0
  };
}

// Update chat name
export async function updateChatName(id: string | number, data: UpdateChatRequest): Promise<UpdateChatResponse> {
  const response = await fetch(`/api/chat/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update chat: ${response.status}`);
  }
  
  return response.json();
}

// Delete a chat
export async function deleteChat(id: string | number): Promise<{ message: string }> {
  const response = await fetch(`/api/chat/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete chat: ${response.status}`);
  }
  
  return response.json();
}
