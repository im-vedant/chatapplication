import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server';
import { deleteChatVectors } from '@/lib/rag';

// GET - Fetch a specific chat with its messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chatId = parseInt(id);
    
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Failed to fetch chat:', error);
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}

// PATCH - Update chat name
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chatId = parseInt(id);
    const { name } = await req.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Valid name is required' }, { status: 400 });
    }

    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: { name: name.trim() }
    });

    return NextResponse.json({ 
      id: updatedChat.id, 
      name: updatedChat.name,
      message: 'Chat name updated successfully' 
    });
  } catch (error) {
    console.error('Failed to update chat name:', error);
    return NextResponse.json({ error: 'Failed to update chat name' }, { status: 500 });
  }
}

// DELETE - Delete chat and all its messages
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chatId = parseInt(id);

    // Use a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // First delete all messages in the chat
      await tx.message.deleteMany({
        where: { chatId: chatId }
      });

      // Then delete the chat itself
      await tx.chat.delete({
        where: { id: chatId }
      });
    });

    // Also delete vectors from Pinecone
    try {
      await deleteChatVectors(chatId.toString());
    } catch (error) {
      console.warn('Failed to delete vectors from Pinecone:', error);
      // Continue even if Pinecone deletion fails
    }

    return NextResponse.json({ 
      message: 'Chat and all messages deleted successfully' 
    });
  } catch (error) {
    console.error('Failed to delete chat:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
