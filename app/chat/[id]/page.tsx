'use client'

import React, { useEffect, useState, useRef } from "react";
import ChatInputBoxWrapper from "../../components/ChatInputBoxWrapper";
import { useParams } from "next/navigation";
import { useFirstMessageStore } from '../../store/firstMessageStore';
import { useCreateMessage, useMessages } from '../../hooks/useMessages';
import { useChat } from '../../hooks/useChats';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot, User, Image, FileText, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ChatLayout from "../../components/ChatLayout";

export default function ChatPage() {
  const params = useParams();
  const chatId = Number(params?.id);
  const firstMessage = useFirstMessageStore(state => state.firstMessages.find(m => m.chatId === chatId));
  
  // Fetch chat details and messages using hooks
  const { data: chat, isLoading: chatLoading } = useChat(chatId);
  const { data: messages = [], isLoading: messagesLoading } = useMessages(chatId);
  
  // Clear any pending chat ID since we're now in an actual chat
  React.useEffect(() => {
    sessionStorage.removeItem('pendingChatId');
  }, []);
  
  const removeFirstMessage = useFirstMessageStore(state => state.removeFirstMessage);
  const [firstMessageCreated, setFirstMessageCreated] = useState(false);
  const [isCreatingFirstMessage, setIsCreatingFirstMessage] = useState(false);
  const [isAgentResponding, setIsAgentResponding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // TanStack Query mutation for creating messages with cache invalidation
  const createMessageMutation = useCreateMessage();

  // Check if we have messages loaded and if first message is already created
  useEffect(() => {
    if (messages.length > 0) {
      setFirstMessageCreated(true);
    }
  }, [messages]);

  // On mount, if firstMessage exists and not yet created, create it in backend
  useEffect(() => {
    if (!chatId || !firstMessage || firstMessageCreated || isCreatingFirstMessage) return;
    
    const createFirstMessage = async () => {
      setIsCreatingFirstMessage(true);
      setIsAgentResponding(true);
      try {
      
        // Use the mutation which will automatically update the cache
        await createMessageMutation.mutateAsync({
          chatId,
          data: {
            content: firstMessage.content,
            files: firstMessage.files || []
          }
        });
        
        setFirstMessageCreated(true);
        removeFirstMessage(chatId);
        // Start agent responding after first message is created
        setIsAgentResponding(false);
      } catch (err) {
        console.error('Failed to create first message:', err);
      } finally {
        setIsCreatingFirstMessage(false);
      }
    };
    
    createFirstMessage();
  }, [chatId, firstMessage, firstMessageCreated, isCreatingFirstMessage, createMessageMutation, removeFirstMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create combined messages array for seamless display
  const displayMessages = React.useMemo(() => {
    return messages;
  }, [messages]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <ChatLayout currentChatId={chatId}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b bg-card px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="lg:hidden">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">Chat</h1>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-4 max-w-4xl mx-auto">
              {messagesLoading && !firstMessage ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayMessages.length > 0 ? (
                displayMessages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3 group",
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Avatar */}
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className={cn(
                        "text-xs font-semibold",
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>

                    {/* Message Content */}
                    <div className={cn(
                      "flex flex-col space-y-2 max-w-[70%]",
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    )}>
                      {/* Message Bubble */}
                      <div className={cn(
                        "rounded-2xl px-4 py-3 text-sm break-words",
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      )}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        
                        {/* Files */}
                        {msg.files && msg.files.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {msg.files.map((fileKey, idx) => (
                              <Badge 
                                key={fileKey} 
                                variant="outline" 
                                className={cn(
                                  "text-xs gap-1",
                                  msg.role === 'user' 
                                    ? 'border-primary-foreground/20 text-primary-foreground/80' 
                                    : 'border-border'
                                )}
                              >
                                {fileKey.includes('image') || fileKey.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                  <Image className="h-3 w-3" />
                                ) : (
                                  <FileText className="h-3 w-3" />
                                )}
                                File {idx + 1}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className={cn(
                        "text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
                        msg.role === 'user' ? 'text-right' : 'text-left'
                      )}>
                        {formatTimestamp(msg.createdAt)} · {msg.role}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              )}

              {/* Loading indicator for agent response */}
              {isAgentResponding && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Chat Input */}
        <div className="border-t bg-card p-6 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <ChatInputBoxWrapper
              loading={messagesLoading || isAgentResponding}
              onSend={async (input, fileKeys) => {
                // Send message to backend
                if (!input.trim() && fileKeys.length === 0) return;
                
                try {
                  setIsAgentResponding(true);
                  console.log("Sending message:", input, fileKeys);
                  // Use the mutation to create the message (this will show optimistic update)
                  await createMessageMutation.mutateAsync({
                    chatId,
                    data: {
                      content: input,
                      files: fileKeys || []
                    }
                  });
                  console.log("Message sent:", input, fileKeys);

                  setIsAgentResponding(false);
                  
                
                } catch (err) {
                 console.error('Error sending message:', err);
                }
              }}
            />
          </div>
        </div>
      </div>
    </ChatLayout>
  );
}