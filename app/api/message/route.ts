import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiResponse } from '@/lib/gemini';


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get('chatId');
  if (!chatId) {
    return NextResponse.json({ error: 'chatId is required' }, { status: 400 });
  }
  const messages = await prisma.message.findMany({
    where: { chatId: Number(chatId) },
    orderBy: { createdAt: 'asc' },
  });


  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  try {
    let chatId, content, files: string[] = [];
    let role = 'user';
    if (req.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await req.formData();
      chatId = formData.get('chatId');
      content = formData.get('content');
      // Accept files as a JSON array of string (even for single file)
      const filesField = formData.get('files');
      if (filesField) {
        try {
          files = JSON.parse(filesField.toString());
        } catch {
          files = [];
        }
      }
    } else {
      const body = await req.json();
      chatId = body.chatId;
      content = body.content;
      files = Array.isArray(body.files) ? body.files : (body.files ? [body.files] : []);
      if (body.role) role = body.role;
    }
    if (!chatId || !content) {
      return NextResponse.json({ error: 'chatId and content are required' }, { status: 400 });
    }
    const message = await prisma.message.create({
      data: {
        chatId: Number(chatId),
        content,
        files,
        role: role as any 
      },
    });

    // Check if this is the first message in the chat and auto-generate a name
    const messageCount = await prisma.message.count({
      where: { chatId: Number(chatId) }
    });

    if (messageCount === 1) {
      // This is the first message, generate a chat name
      try {
        const nameResponse = await fetch(`${req.nextUrl.origin}/api/generate-name`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: content })
        });

        if (nameResponse.ok) {
          const { name } = await nameResponse.json();
          await prisma.chat.update({
            where: { id: Number(chatId) },
            data: { name }
          });
        }
      } catch (error) {
        console.error('Failed to generate chat name:', error);
        // Continue even if name generation fails
      }
    }

    // Get all messages for chat history to send to Gemini
    const allMessages = await prisma.message.findMany({
      where: { chatId: Number(chatId) },
      orderBy: { createdAt: 'asc' },
    });

    // Generate agent response using Gemini
    let agentResponse = 'Sorry, I am unable to respond at the moment.';
    try {
      // Format messages for Gemini function
      const formattedMessages = allMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        createdAt: msg.createdAt.toISOString(),
        files: msg.files
      }));
      agentResponse = await generateGeminiResponse(formattedMessages, chatId.toString());
    } catch (error) {
      console.error('Failed to get Gemini response:', error);
      // Keep default fallback message
    }

    // Create agent message with Gemini response
    const agentMessage = await prisma.message.create({
      data: {
        chatId: Number(chatId),
        content: agentResponse,
        files: [],
        role: 'agent'
      },
    });

    return NextResponse.json([
      {
        id: message.id,
        chatId: message.chatId,
        content: message.content,
        files: message.files,
        role: message.role,
        createdAt: message.createdAt
      },
      {
        id: agentMessage.id,
        chatId: agentMessage.chatId,
        content: agentMessage.content,
        files: agentMessage.files,
        role: agentMessage.role,
        createdAt: agentMessage.createdAt
      }
    ]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
