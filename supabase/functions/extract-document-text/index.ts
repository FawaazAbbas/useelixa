import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { documentId, filePath, fileType } = await req.json();

    console.log(`Extracting content from document ${documentId}, type: ${fileType}`);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('workspace-files')
      .download(filePath);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    let extractedContent = '';

    // Extract content based on file type
    if (fileType === 'application/json' || fileType === 'text/json') {
      // JSON files
      const text = await fileData.text();
      const json = JSON.parse(text);
      extractedContent = JSON.stringify(json, null, 2);
    } else if (fileType.startsWith('text/')) {
      // Plain text files (txt, csv, etc.)
      extractedContent = await fileData.text();
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
               fileType === 'application/vnd.ms-excel') {
      // Excel files - extract as readable text representation
      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      extractedContent = `Excel file detected. File size: ${bytes.length} bytes. Content extraction requires specialized parsing. File is available for agent direct access.`;
    } else if (fileType === 'application/pdf') {
      // PDF files
      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      extractedContent = `PDF document detected. File size: ${bytes.length} bytes. Content extraction requires specialized parsing. File is available for agent direct access.`;
    } else if (fileType.startsWith('image/')) {
      // Image files
      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      extractedContent = `Image file (${fileType}). Size: ${bytes.length} bytes. Visual content available for agent analysis via direct file access.`;
    } else {
      // Other binary files
      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      extractedContent = `Binary file (${fileType}). Size: ${bytes.length} bytes. File is available for agent direct access.`;
    }

    // Generate embedding for semantic search if we have meaningful text content
    let embedding: number[] | null = null;
    
    if (extractedContent && extractedContent.length > 50 && !extractedContent.startsWith('Binary file') && !extractedContent.startsWith('Image file')) {
      console.log('Generating embedding for document...');
      
      try {
        // Truncate content for embedding (max ~8000 tokens worth)
        const contentForEmbedding = extractedContent.slice(0, 30000);
        
        const embeddingResponse = await fetch(
          "https://ai.gateway.lovable.dev/v1/embeddings",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "text-embedding-3-small",
              input: contentForEmbedding,
            }),
          }
        );

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json();
          embedding = embeddingData?.data?.[0]?.embedding;
          
          if (embedding) {
            console.log(`Generated embedding with ${embedding.length} dimensions`);
          }
        } else {
          console.error('Embedding generation failed:', await embeddingResponse.text());
        }
      } catch (embeddingError) {
        console.error('Error generating embedding:', embeddingError);
        // Continue without embedding - document will still be searchable by text
      }
    }

    // Update the document record with extracted content and embedding
    const updateData: Record<string, unknown> = { 
      extracted_content: extractedContent,
      status: 'ready'
    };
    
    if (embedding) {
      updateData.embedding = embedding;
    }

    const { error: updateError } = await supabase
      .from('workspace_documents')
      .update(updateData)
      .eq('id', documentId);

    if (updateError) {
      throw new Error(`Failed to update document: ${updateError.message}`);
    }

    console.log(`Successfully extracted content for document ${documentId}${embedding ? ' with embedding' : ''}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedLength: extractedContent.length,
        hasEmbedding: !!embedding,
        contentPreview: extractedContent.substring(0, 200)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error extracting document text:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
