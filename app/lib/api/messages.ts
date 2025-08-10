/**
 * Message API functions
 */

export interface Message {
  id: number;
  content: string;
  files: string[];
  role: 'user' | 'agent';
  createdAt: string;
  chatId: number;
}

export interface CreateMessageRequest {
  content: string;
  files?: string[];
}

export interface CreateMessageResponse {
  id: number;
  content: string;
  files: string[];
  role: 'user' | 'agent';
  createdAt: string;
  chatId: number;
}

// The API returns an array of messages (user + agent response)
export type CreateMessageApiResponse = CreateMessageResponse[];

// Fetch messages for a chat
export async function fetchMessages(chatId: string | number): Promise<Message[]> {
  const response = await fetch(`/api/message?chatId=${chatId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.status}`);
  }
  
  return response.json();
}

// Create a new message
export async function createMessage(chatId: string | number, data: CreateMessageRequest): Promise<CreateMessageApiResponse> {
  // Use FormData if files are present, otherwise use JSON
  if (data.files && data.files.length > 0) {
    const formData = new FormData();
    formData.append('chatId', chatId.toString());
    formData.append('content', data.content);
    formData.append('files', JSON.stringify(data.files));
    
    const response = await fetch('/api/message', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create message: ${response.status}`);
    }
    
    return response.json();
  } else {
    const response = await fetch('/api/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        chatId: Number(chatId),
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create message: ${response.status}`);
    }
    
    return response.json();
  }
}
