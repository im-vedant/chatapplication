import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch chats with pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '15');
    const cursor = searchParams.get('cursor') ? parseInt(searchParams.get('cursor')!) : undefined;

    const chats = await prisma.chat.findMany({
      where: {
        messages: {
          some: {} // Only chats with at least one message
        },
        ...(cursor && { id: { lt: cursor } }) // For cursor-based pagination
      },
      include: {
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { id: 'desc' }, // Order by ID descending for consistent pagination
      take: limit + 1 // Take one extra to check if there are more
    });

    const hasMore = chats.length > limit;
    const resultChats = hasMore ? chats.slice(0, limit) : chats;
    const nextCursor = hasMore ? resultChats[resultChats.length - 1].id : undefined;

    // Transform the data to match our UI expectations
    const transformedChats = resultChats.map(chat => ({
      id: chat.id,
      name: chat.name || `Chat ${chat.id}`,
      createdAt: chat.createdAt.toISOString(),
      messageCount: chat._count.messages
    }));

    return NextResponse.json({
      chats: transformedChats,
      hasMore,
      nextCursor
    });
  } catch (error) {
    console.error('Failed to fetch chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}

// POST - Create a new chat
export async function POST(req: NextRequest) {
  try {
    const chat = await prisma.chat.create({
      data: {},
    });
    return NextResponse.json({ id: chat.id });
  } catch (error) {
    console.error('Failed to create chat:', error);
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
  }
}


