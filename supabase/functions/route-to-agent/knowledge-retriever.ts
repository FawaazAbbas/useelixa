import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

export interface RelevantKnowledge {
  articles: Array<{
    title: string;
    content: string;
    category: string | null;
    tags: string[];
  }>;
  documents: Array<{
    name: string;
    description: string | null;
    file_type: string;
  }>;
}

/**
 * Retrieves relevant knowledge from the workspace knowledge base
 * Uses full-text search on articles and simple matching on documents
 */
export async function retrieveRelevantKnowledge(
  supabase: SupabaseClient,
  workspaceId: string,
  userMessage: string,
  maxArticles: number = 5,
  maxDocuments: number = 5
): Promise<RelevantKnowledge> {
  const result: RelevantKnowledge = {
    articles: [],
    documents: [],
  };

  try {
    // Extract key search terms from user message (simple approach)
    const searchTerms = userMessage
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3) // Only words longer than 3 chars
      .slice(0, 5); // Limit to first 5 meaningful words

    if (searchTerms.length === 0) {
      return result;
    }

    // Search articles using full-text search
    const searchQuery = searchTerms.join(' | '); // OR search
    
    const { data: articles, error: articlesError } = await supabase
      .from("workspace_knowledge")
      .select("title, content, category, tags")
      .eq("workspace_id", workspaceId)
      .textSearch("search_vector", searchQuery, {
        type: "websearch",
        config: "english",
      })
      .limit(maxArticles);

    if (articlesError) {
      console.error("Error fetching articles:", articlesError);
    } else if (articles) {
      result.articles = articles;
    }

    // Search documents by name
    const { data: documents, error: docsError } = await supabase
      .from("workspace_documents")
      .select("name, description, file_type")
      .eq("workspace_id", workspaceId)
      .limit(maxDocuments);

    if (docsError) {
      console.error("Error fetching documents:", docsError);
    } else if (documents) {
      // Filter documents that match any search term
      result.documents = documents.filter(doc =>
        searchTerms.some(term =>
          doc.name.toLowerCase().includes(term) ||
          (doc.description && doc.description.toLowerCase().includes(term))
        )
      );
    }
  } catch (error) {
    console.error("Error retrieving knowledge:", error);
  }

  return result;
}

/**
 * Formats retrieved knowledge into a context string for the AI
 */
export function formatKnowledgeContext(knowledge: RelevantKnowledge): string {
  if (knowledge.articles.length === 0 && knowledge.documents.length === 0) {
    return "";
  }

  let context = "\n\n## WORKSPACE KNOWLEDGE BASE\n\n";
  context += "You have access to the following information from the workspace knowledge base. Reference this information when relevant to the user's question:\n\n";

  if (knowledge.articles.length > 0) {
    context += "### Knowledge Articles:\n\n";
    knowledge.articles.forEach((article, idx) => {
      context += `${idx + 1}. **${article.title}**`;
      if (article.category) {
        context += ` (${article.category})`;
      }
      context += `\n${article.content}\n`;
      if (article.tags.length > 0) {
        context += `Tags: ${article.tags.join(", ")}\n`;
      }
      context += "\n";
    });
  }

  if (knowledge.documents.length > 0) {
    context += "### Available Documents:\n\n";
    knowledge.documents.forEach((doc, idx) => {
      context += `${idx + 1}. ${doc.name} (${doc.file_type})`;
      if (doc.description) {
        context += ` - ${doc.description}`;
      }
      context += "\n";
    });
    context += "\n";
  }

  return context;
}
