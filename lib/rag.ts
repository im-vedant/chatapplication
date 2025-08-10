import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Initialize clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || '' });

// Text splitter configuration
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,      // characters per chunk
  chunkOverlap: 200,    // to maintain context
});

/**
 * Generate embeddings using Gemini
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Store text chunks in Pinecone with embeddings
 */
export async function storeInPinecone(chatId: string, text: string, metadata: Record<string, any> = {}): Promise<void> {
  try {
    // 1. Chunk the text
    const chunks = await splitter.splitText(text);
    
    // 2. Generate embeddings for each chunk
    const embeddings = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await generateEmbedding(chunk);
        return { chunk, embedding };
      })
    );

    // 3. Store in Pinecone
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME || '');
    const vectors = embeddings.map(({ chunk, embedding }, i) => ({
      id: uuidv4(),
      values: embedding,
      metadata: { 
        chatId, 
        text: chunk,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    }));

    await index.upsert(vectors);
    console.log(`Stored ${chunks.length} chunks for chat ${chatId}`);
  } catch (error) {
    console.error('Error storing in Pinecone:', error);
    throw error;
  }
}

/**
 * Retrieve relevant context from Pinecone
 */
export async function getRelevantContext(chatId: string, query: string, topK: number = 5): Promise<string> {
  try {
    // 1. Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Search Pinecone
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME || '');
    const searchResults = await index.query({
      vector: queryEmbedding,
      topK,
      filter: { chatId: { $eq: chatId } },
      includeMetadata: true,
    });

    // 3. Extract and join relevant text
    const relevantTexts = searchResults.matches
      .filter(match => match.metadata?.text)
      .map(match => match.metadata!.text as string);

    return relevantTexts.join('\n\n');
  } catch (error) {
    console.error('Error retrieving context:', error);
    throw error;
  }
}


/**
 * Store a chat message
 */
export async function storeMessage(chatId: string, content: string, role: 'user' | 'agent'): Promise<void> {
  try {
    await storeInPinecone(chatId, content, {
      type: 'message',
      role
    });
  } catch (error) {
    console.error('Error storing message:', error);
    throw error;
  }
}

/**
 * Delete all vectors for a specific chat
 */
export async function deleteChatVectors(chatId: string): Promise<void> {
  try {
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME || '');
    
    // Query to find all vectors for this chat (we need actual vectors to query)
    // Create a dummy vector for querying - Gemini text-embedding-004 uses 768 dimensions
    const dummyVector = Array(768).fill(0);
    
    const queryResults = await index.query({
      vector: dummyVector,
      topK: 10000, // large number to get all
      filter: { chatId: { $eq: chatId } },
      includeMetadata: false,
    });
    
    const vectorIds = queryResults.matches.map(match => match.id);
    
    if (vectorIds.length > 0) {
      await index.deleteMany(vectorIds);
      console.log(`Deleted ${vectorIds.length} vectors for chat ${chatId}`);
    }
  } catch (error) {
    console.error('Error deleting chat vectors:', error);
    throw error;
  }
}
