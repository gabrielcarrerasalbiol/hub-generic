import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ClassificationResult {
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
  availableCategories: { id: number; name: string; description: string | null }[]
): Promise<ClassificationResult> {
  try {
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-pro" });

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

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    
    const parsedResult = JSON.parse(jsonMatch[0]);
    
    return {
      categories: Array.isArray(parsedResult.categories) ? parsedResult.categories : [],
      relevance: Math.min(100, Math.max(0, parsedResult.relevance || 0)),
      confidence: Math.min(1, Math.max(0, parsedResult.confidence || 0)),
    };
  } catch (error) {
    console.error("Error classifying content with Gemini:", error);
    
    // Return a default classification with fallback categories based on keywords
    const categories: number[] = [];
    const lowercaseTitle = videoTitle.toLowerCase();
    const lowercaseDesc = videoDescription.toLowerCase();
    
    // Match against common keywords for each category
    if (lowercaseTitle.includes('vs') || lowercaseTitle.includes('partido') || 
        lowercaseDesc.includes('vs') || lowercaseDesc.includes('partido')) {
      categories.push(1); // Matches
    }
    if (lowercaseTitle.includes('entrenamiento') || lowercaseDesc.includes('entrenamiento')) {
      categories.push(2); // Training
    }
    if (lowercaseTitle.includes('rueda de prensa') || lowercaseDesc.includes('rueda de prensa')) {
      categories.push(3); // Press
    }
    if (lowercaseTitle.includes('entrevista') || lowercaseDesc.includes('entrevista')) {
      categories.push(4); // Interviews
    }
    
    return {
      categories,
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
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `
      Enhance this search query to find the best Real Madrid football club related content.
      The original search is: "${query}"
      Only return the enhanced search query text, nothing else.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const enhancedQuery = response.text().trim();
    
    return enhancedQuery || query;
  } catch (error) {
    console.error("Error enhancing search with Gemini:", error);
    return query; // Return original query if enhancement fails
  }
}