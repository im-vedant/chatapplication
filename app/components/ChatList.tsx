'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Plus, 
  Trash2, 
  Edit, 
  MoreVertical,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RenameChatDialog from './RenameChatDialog';
import DeleteChatDialog from './DeleteChatDialog';
import { useChats, useCreateChat, useUpdateChatName, useDeleteChat } from '../hooks';
import type { Chat } from '../lib/api/chats';

interface ChatListProps {
  currentChatId?: number;
  className?: string;
  onChatUpdate?: () => void;
}

export default function ChatList({ currentChatId, className, onChatUpdate }: ChatListProps) {
  const router = useRouter();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // TanStack Query hooks
  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useChats();
  
  const createChatMutation = useCreateChat();
  const updateChatNameMutation = useUpdateChatName();
  const deleteChatMutation = useDeleteChat();
  
  // Flatten all chat pages into a single array
  const chats = data?.pages.flatMap(page => page.chats) || [];

  // Infinite scroll effect
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!viewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      // Load more when scrolled to 80% of the content
      if (scrollHeight - scrollTop <= clientHeight * 1.2 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    chatId: number;
    currentName: string;
  }>({
    open: false,
    chatId: 0,
    currentName: '',
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    chatId: number;
    chatName: string;
    messageCount: number;
  }>({
    open: false,
    chatId: 0,
    chatName: '',
    messageCount: 0,
  });

  const handleCreateChat = async () => {
    try {
      // Instead of creating a chat here, just redirect to home page
      // The home page will auto-create a new chat
      router.push('/');
      onChatUpdate?.();
    } catch (error) {
      console.error('Failed to redirect to home:', error);
    }
  };

  const openRenameDialog = (chatId: number, currentName: string) => {
    setRenameDialog({
      open: true,
      chatId,
      currentName: currentName || `Chat ${chatId}`,
    });
  };

  const openDeleteDialog = (chatId: number, chatName: string, messageCount: number) => {
    setDeleteDialog({
      open: true,
      chatId,
      chatName: chatName || `Chat ${chatId}`,
      messageCount,
    });
  };

  const handleRename = async (newName: string) => {
    try {
      await updateChatNameMutation.mutateAsync({ 
        id: renameDialog.chatId, 
        data: { name: newName } 
      });
      setRenameDialog({ open: false, chatId: 0, currentName: '' });
      onChatUpdate?.();
    } catch (error) {
      console.error('Failed to rename chat:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteChatMutation.mutateAsync(deleteDialog.chatId);
      setDeleteDialog({ open: false, chatId: 0, chatName: '', messageCount: 0 });
      
      // If we're deleting the current chat, redirect to home
      if (currentChatId === deleteDialog.chatId) {
        router.push('/');
      }
      onChatUpdate?.();
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (error) {
    return (
      <Card className={cn("w-80 h-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            Failed to load chats. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn("w-80 h-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chats
            <Button
              onClick={handleCreateChat}
              size="sm"
              className="ml-auto h-7 w-7 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea 
            ref={scrollAreaRef}
            className="h-[calc(100vh-120px)] px-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No chats yet</p>
                <p className="text-xs mt-1">Create your first chat to get started</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 pb-4">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={cn(
                        "group relative rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors",
                        currentChatId === chat.id && "bg-accent border-primary"
                      )}
                    >
                      <Link href={`/chat/${chat.id}`} className="block">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">
                              {chat.name || `Chat ${chat.id}`}
                            </h3>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.preventDefault()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault();
                                  openRenameDialog(chat.id, chat.name || `Chat ${chat.id}`);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault();
                                  openDeleteDialog(chat.id, chat.name || `Chat ${chat.id}`, chat.messageCount || 0);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
                
                {/* Loading indicator for next page */}
                {isFetchingNextPage && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading more chats...</span>
                  </div>
                )}
                
                {/* Load more button as fallback */}
                {hasNextPage && !isFetchingNextPage && (
                  <div className="flex justify-center py-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => fetchNextPage()}
                      className="text-muted-foreground"
                    >
                      Load more chats
                    </Button>
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <RenameChatDialog
        open={renameDialog.open}
        onOpenChange={(open) => !open && setRenameDialog({ open: false, chatId: 0, currentName: '' })}
        currentName={renameDialog.currentName}
        onRename={handleRename}
      />

      <DeleteChatDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, chatId: 0, chatName: '', messageCount: 0 })}
        chatName={deleteDialog.chatName}
        messageCount={deleteDialog.messageCount}
        onDelete={handleDelete}
      />
    </>
  );
}
