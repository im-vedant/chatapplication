/**
 * Utility-related TanStack Query hooks
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '../lib/query/keys';
import {
  generateChatName,
  getUploadUrl,
  type GenerateNameRequest,
} from '../lib/api/utils';

// Generate chat name
export function useGenerateChatName() {
  return useMutation({
    mutationFn: (data: GenerateNameRequest) => generateChatName(data),
    onError: (error) => {
      console.error('Failed to generate chat name:', error);
      toast.error('Failed to generate chat name');
    },
  });
}

// Get upload URL for file
export function useGetUploadUrl(filename: string, contentType: string, enabled: boolean = false) {
  return useQuery({
    queryKey: queryKeys.uploads.url(filename, contentType),
    queryFn: () => getUploadUrl(filename, contentType),
    enabled: enabled && !!filename && !!contentType,
    staleTime: 1000 * 60, // 1 minute - upload URLs expire quickly
  });
}

// Manual upload URL fetcher (for use in mutations)
export function useFetchUploadUrl() {
  return useMutation({
    mutationFn: ({ filename, contentType }: { filename: string; contentType: string }) =>
      getUploadUrl(filename, contentType),
    onError: (error) => {
      console.error('Failed to get upload URL:', error);
      toast.error('Failed to prepare file upload');
    },
  });
}
