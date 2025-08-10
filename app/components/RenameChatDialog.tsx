'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RenameChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onRename: (newName: string) => Promise<void>;
}

export default function RenameChatDialog({
  open,
  onOpenChange,
  currentName,
  onRename
}: RenameChatDialogProps) {
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(currentName);
  }, [currentName, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '' || name.trim() === currentName) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    try {
      await onRename(name.trim());
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to rename chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Enter chat name..."
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>
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
              type="submit" 
              disabled={isLoading || name.trim() === '' || name.trim() === currentName}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
