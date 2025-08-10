'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatName: string;
  messageCount: number;
  onDelete: () => Promise<void>;
}

export default function DeleteChatDialog({
  open,
  onOpenChange,
  chatName,
  messageCount,
  onDelete
}: DeleteChatDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Chat
          </DialogTitle>
          <DialogDescription className="text-left pt-2">
            Are you sure you want to delete <strong>"{chatName}"</strong>?
            <br />
            <br />
            This will permanently delete the chat and all {messageCount} message{messageCount !== 1 ? 's' : ''} in it. 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Chat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
