'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Copy, Edit, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

interface MessageActionsProps {
  messageContent: string;
  messageRole: 'user' | 'agent';
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function MessageActions({
  messageContent,
  messageRole,
  onEdit,
  onDelete
}: MessageActionsProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(messageContent);
      toast.success('Message copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy message');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </DropdownMenuItem>
        {messageRole === 'user' && onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
