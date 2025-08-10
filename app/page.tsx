'use client';
import React from "react";
import { useRouter } from 'next/navigation';
import { useFirstMessageStore } from './store/firstMessageStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MessageCircle, Sparkles, Zap, Menu } from 'lucide-react';
import ChatInputBox, { UploadedFileInfo } from "./components/ChatInputBox";
import ChatList from './components/ChatList';
import ChatListSkeleton from './components/ChatListSkeleton';
import { useAutoCreateChat } from './hooks/useAutoCreateChat';
import { useChats } from './hooks';

export default function Home() {
  const [input, setInput] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [filePreviews, setFilePreviews] = React.useState<(string | null)[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [uploadedFileInfos, setUploadedFileInfos] = React.useState<UploadedFileInfo[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const addFirstMessage = useFirstMessageStore(state => state.addFirstMessage);
  const router = useRouter();

  // Auto-create a chat when landing on home page
  const { isCreating: isCreatingChat, createdChatId } = useAutoCreateChat();
  
  // Get chats for sidebar
  const { data, isLoading: isLoadingChats } = useChats();
  const chats = data?.pages.flatMap(page => page.chats) || [];

  // Remove the auto-redirect effect since we want to stay on home page

  const handleSend = async () => {
    if (input.trim() === "" && uploadedFileInfos.filter(f => !f.error && !f.uploading).length === 0) return;
    if (!createdChatId) return; // Wait for chat to be created
    
    console.log('Sending message with chat ID:', createdChatId);
    setLoading(true);
    try {
      // Use the auto-created chat
      const chatId = createdChatId;

      // Save the first message in Zustand store with all details
      const fileKeys = uploadedFileInfos.filter(f => !f.error && !f.uploading).map(f => f.key);
      addFirstMessage({
        chatId,
        content: input,
        role: 'user',
        files: fileKeys
      });

      setInput("");
      setFiles([]);
      setFilePreviews([]);
      setUploadedFileInfos([]);
      
      // Note: We don't clear pendingChatId here since we're navigating to that chat
      // The chat will be considered "used" once we're on the chat page
      
      // Redirect to /chat/[id]
      console.log('Redirecting to chat:', chatId);
      router.push(`/chat/${chatId}`);
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
    "Explain quantum computing in simple terms",
    "Write a creative story about space exploration",
    "Help me plan a healthy meal for the week",
    "Create a business plan for a coffee shop"
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Chat List Sidebar */}
        <div className="hidden lg:flex lg:w-80 lg:flex-col lg:border-r">
          <div className="flex-1">
            {isLoadingChats ? (
              <ChatListSkeleton className="border-none h-full" />
            ) : (
              <ChatList className="border-none h-full" />
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header with Chat List Access */}
          <div className="lg:hidden border-b bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                <span className="font-semibold">CiteCat</span>
              </div>
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle>Chats</SheetTitle>
                  </SheetHeader>
                  <div className="h-full">
                    {isLoadingChats ? (
                      <ChatListSkeleton className="border-none" />
                    ) : (
                      <ChatList className="border-none" />
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 min-h-0">
            <div className={`min-h-full transition-colors duration-200 ${
              isCreatingChat ? 'bg-muted/30' : 'bg-gradient-to-br from-background via-muted/20 to-background'
            }`}>
              <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-full">
                {/* Header Section */}
                <div className="text-center mb-8 space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <MessageCircle className={`h-8 w-8 text-primary ${isCreatingChat ? 'animate-pulse' : ''}`} />
                    <h1 className="text-4xl font-bold text-foreground">CiteCat</h1>
                  </div>
                  <p className="text-xl text-muted-foreground max-w-2xl">
                    {isCreatingChat 
                      ? "Setting up your chat..." 
                      : "Start a conversation with our AI assistant. Ask questions, get help with tasks, or just chat about anything."
                    }
                  </p>
                  {isCreatingChat && (
                    <div className="flex justify-center mt-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>

                {/* Show main chat interface only when chat is ready */}
                {!isCreatingChat && createdChatId && (
                  <>
                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl w-full">
                      <Card className="border-muted hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Smart Conversations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">
                            Engage in intelligent conversations with advanced AI capabilities
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-muted hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            File Support
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">
                            Upload images and documents to enhance your conversations
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-muted hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-primary" />
                            Chat History
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">
                            Keep track of all your conversations and revisit them anytime
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Main Chat Input */}
                    <Card className="w-full max-w-2xl mb-6">
                      <CardContent className="p-6">
                        <ChatInputBox
                          input={input}
                          setInput={setInput}
                          files={files}
                          setFiles={setFiles}
                          filePreviews={filePreviews}
                          setFilePreviews={setFilePreviews}
                          uploadedFileInfos={uploadedFileInfos}
                          setUploadedFileInfos={setUploadedFileInfos}
                          loading={loading}
                          uploading={uploading}
                          setUploading={setUploading}
                          onSend={handleSend}
                          disabled={loading || uploading}
                        />
                      </CardContent>
                    </Card>

                    {/* Example Prompts */}
                    <div className="w-full max-w-2xl">
                      <p className="text-sm text-muted-foreground mb-3 text-center">Try these example prompts:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {examplePrompts.map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-left justify-start h-auto p-3 text-xs"
                            onClick={() => setInput(prompt)}
                            disabled={loading || uploading}
                          >
                            {prompt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
