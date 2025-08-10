/**
 * Utility API functions
 */

export interface GenerateNameRequest {
  message: string;
}

export interface GenerateNameResponse {
  name: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
}

// Generate chat name using Gemini API
export async function generateChatName(data: GenerateNameRequest): Promise<GenerateNameResponse> {
  const response = await fetch('/api/generate-name', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to generate name: ${response.status}`);
  }
  
  return response.json();
}

// Get upload URL for file
export async function getUploadUrl(filename: string, contentType: string): Promise<UploadUrlResponse> {
  const response = await fetch(`/api/upload-url?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get upload URL: ${response.status}`);
  }
  
  return response.json();
}
