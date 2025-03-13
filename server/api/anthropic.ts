import Anthropic from '@anthropic-ai/sdk';

// Classification result interface for content analysis
interface ClassificationResult {
  categories: number[];
  relevance: number;
  confidence: number;
}

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
// Claude 3.7 Sonnet provides excellent results for classification tasks with high accuracy
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analyzes video content to classify it into categories and determine its relevance to Real Madrid
 * Uses Anthropic's Claude 3.5 Sonnet for content classification
 */
export async function classifyContentWithAnthropicClaude(
  videoTitle: string, 
  videoDescription: string,
  availableCategories: { id: number; name: string; description: string | null }[]
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

    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: "You are a content classification AI specializing in soccer/football content analysis. You always respond with structured JSON data for Real Madrid content classification.",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    // Safely access text content
    const responseContent = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Extract JSON from the response
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
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
    console.error("Error classifying content with Claude:", error);
    
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
 * Using Anthropic's Claude for enhanced search
 */
export async function enhanceSearchWithAnthropicClaude(query: string): Promise<string> {
  try {
    const prompt = `
      Enhance this search query to find the best Real Madrid football club related content.
      The original search is: "${query}"
      Only return the enhanced search query text, nothing else.
    `;

    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: "You help optimize search queries to find Real Madrid football content. Respond with just the enhanced query text, no explanation.",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    // Safely access text content
    const enhancedQuery = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    
    return enhancedQuery || query;
  } catch (error) {
    console.error("Error enhancing search with Claude:", error);
    return query; // Return original query if enhancement fails
  }
}