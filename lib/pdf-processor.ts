
import { storeInPinecone } from './rag';

// Get PDF processing service URL from environment
const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:4000';

/**
 * Process a PDF file using external PDF processing service
 */
export async function processPDFFromMinIO(
  chatId: string, 
  fileKey: string, 
  fileName?: string
): Promise<void> {
  try {
    console.log(`Processing PDF from external service: ${fileKey}`);
    
    // Call the external PDF processing service
    const response = await fetch(`${PDF_SERVICE_URL}/pdf-processor/${encodeURIComponent(fileKey)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`PDF processing service returned ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error('PDF processing service returned unsuccessful result');
    }
    
    console.log('PDF processing successful, pages:', result.metadata.pages, 'text length:', result.text.length);
    
    if (!result.text.trim()) {
      console.warn(`No text content found in PDF: ${fileName || fileKey}`);
      return;
    }
    
    // Store in Pinecone with metadata
    console.log(`Storing PDF content in Pinecone for chat ${chatId}`);
    await storeInPinecone(chatId, result.text, {
      type: 'pdf',
      fileName: fileName || fileKey,
      fileKey: fileKey,
      source: 'attachment',
      pages: result.metadata.pages,
      info: JSON.stringify(result.metadata.info || {}),
      processedAt: new Date().toISOString()
    });
    
    console.log(`Successfully processed PDF: ${fileName || fileKey} (${result.metadata.pages} pages)`);
    
  } catch (error) {
    console.error(`Error processing PDF using external service (${fileKey}):`, error);
    throw error;
  }
}

/**
 * Process multiple PDF attachments from a message
 */
export async function processMessageAttachments(
  chatId: string,
  fileKeys: string[]
): Promise<void> {
  console.log('processMessageAttachments called with:', { chatId, fileKeys });
  
  if (!fileKeys || fileKeys.length === 0) {
    console.log('No file keys provided');
    return;
  }
  
  console.log(`Processing ${fileKeys.length} PDF attachments for chat ${chatId}`);
  
  // Process all files as PDFs (since only PDFs should be sent here)
  const processingPromises = fileKeys.map(async (fileKey) => {
    try {
      console.log(`Processing PDF file: ${fileKey}`);
      await processPDFFromMinIO(chatId, fileKey);
    } catch (error) {
      console.error(`Failed to process PDF ${fileKey}:`, error);
      // Continue processing other files even if one fails
    }
  });
  
  await Promise.all(processingPromises);
  console.log(`Finished processing PDF attachments for chat ${chatId}`);
}
