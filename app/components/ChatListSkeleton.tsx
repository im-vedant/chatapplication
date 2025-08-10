'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ChatListSkeletonProps {
  className?: string;
}

export default function ChatListSkeleton({ className }: ChatListSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" /> {/* "Chats" title */}
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Plus button */}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-4 space-y-3">
            {/* Skeleton chat items */}
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index}>
                <div className="flex items-start justify-between p-3 rounded-lg border">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" /> {/* Chat name */}
                      <Skeleton className="h-4 w-4 rounded" /> {/* Menu button */}
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-full" /> {/* Message preview line 1 */}
                      <Skeleton className="h-3 w-3/4" /> {/* Message preview line 2 */}
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-16" /> {/* Date */}
                      <Skeleton className="h-4 w-6 rounded-full" /> {/* Message count badge */}
                    </div>
                  </div>
                </div>
                {index < 7 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
