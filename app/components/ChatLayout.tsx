'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, MessageCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import ChatList from './ChatList';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ChatLayoutProps {
  children: React.ReactNode;
  currentChatId?: number;
  showSidebar?: boolean;
}

export default function ChatLayout({ 
  children, 
  currentChatId, 
  showSidebar = true 
}: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        {showSidebar && (
          <div className="hidden lg:flex lg:w-80 lg:flex-col lg:border-r">
            <div className="flex-1">
              <ChatList
                currentChatId={currentChatId} 
                className="border-none h-full"
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="lg:hidden border-b bg-card p-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                <span className="font-semibold">CiteCat</span>
              </Link>
              
              <div className="flex items-center gap-2">
                <ThemeToggle />
                {showSidebar && (
                  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 p-0">
                      <div className="h-full">
                        <ChatList
                          currentChatId={currentChatId} 
                          className="border-none"
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Header - Theme Toggle */}
          {!showSidebar && (
            <div className="hidden lg:block border-b bg-card p-4">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <Link href="/" className="flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  <span className="font-semibold">CiteCat</span>
                </Link>
                <ThemeToggle />
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="flex-1 min-h-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
