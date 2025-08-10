import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let userMessage = '';
  
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    userMessage = message;

    // Generate a chat name using Gemini API
    const name = await generateChatNameWithGemini(message);

    return NextResponse.json({ name });
  } catch (error) {
    console.error('Failed to generate chat name:', error);
    
    // Fallback to simple name generation if API fails
    const fallbackName = userMessage ? generateSimpleChatName(userMessage) : `Chat ${Date.now()}`;
    return NextResponse.json({ name: fallbackName });
  }
}

async function generateChatNameWithGemini(message: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not found');
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Generate a short, concise chat title (maximum 4 words) based on this user message. The title should capture the main topic or intent. Only respond with the title, nothing else.\n\nUser message: "${message}"`
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 20,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!generatedText) {
    throw new Error('No text generated from Gemini API');
  }

  // Clean up the response (remove quotes, extra punctuation)
  const cleanTitle = generatedText
    .replace(/['"]/g, '')
    .replace(/\.$/, '')
    .trim();

  return cleanTitle || generateSimpleChatName(message);
}

function generateSimpleChatName(message: string): string {
  // Fallback simple chat name generation
  const words = message.toLowerCase().split(' ').filter(word => word.length > 3);
  
  // Remove common words
  const commonWords = ['this', 'that', 'with', 'have', 'will', 'been', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'];
  const meaningfulWords = words.filter(word => !commonWords.includes(word));
  
  if (meaningfulWords.length === 0) {
    return `Chat ${Date.now()}`;
  }

  // Take first 2-3 meaningful words and capitalize them
  const nameWords = meaningfulWords.slice(0, 3).map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  );

  return nameWords.join(' ');
}
