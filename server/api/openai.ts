import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

interface ClassificationResult {
  categories: number[];
  relevance: number;
  confidence: number;
}

/**
 * Analyzes video content to classify it into categories and determine its relevance to Real Madrid
 */
export async function classifyContent(
  videoTitle: string, 
  videoDescription: string,
  availableCategories: { id: number; name: string; description?: string }[]
): Promise<ClassificationResult> {
  try {
    const prompt = `
      Analyze this Real Madrid related content and provide the following:
      1. Which categories from the list below does this content best fit into? Choose all that apply.
      2. On a scale of 0-100, how relevant is this content to Real Madrid football club?
      3. On a scale of 0-1, what's your confidence in this classification?
      
      Available categories:
      ${availableCategories.map(cat => `${cat.id}: ${cat.name} - ${cat.description || ''}`).join('\n')}
      
      Content to analyze:
      Title: ${videoTitle}
      Description: ${videoDescription}
      
      Return your answer in JSON format with these properties:
      - categories: array of category IDs that apply (numbers)
      - relevance: number from 0-100
      - confidence: number from 0-1
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      categories: Array.isArray(result.categories) ? result.categories : [],
      relevance: Math.min(100, Math.max(0, result.relevance || 0)),
      confidence: Math.min(1, Math.max(0, result.confidence || 0)),
    };
  } catch (error) {
    console.error("Error classifying content with OpenAI:", error);
    // Return a default classification if the API call fails
    return {
      categories: [],
      relevance: 50,
      confidence: 0.5,
    };
  }
}

/**
 * Searches content for Real Madrid related material based on a query
 */
export async function enhanceSearch(query: string): Promise<string> {
  try {
    const prompt = `
      Enhance this search query to find the best Real Madrid football club related content.
      The original search is: "${query}"
      Only return the enhanced search query text, nothing else.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content || query;
  } catch (error) {
    console.error("Error enhancing search with OpenAI:", error);
    return query; // Return original query if enhancement fails
  }
}
