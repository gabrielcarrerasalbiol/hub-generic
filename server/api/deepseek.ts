import OpenAI from 'openai';

// Classification result interface for content analysis
interface ClassificationResult {
  categories: number[];
  relevance: number;
  confidence: number;
}

interface SummaryResult {
  summary: string;
  success: boolean;
}

// Initialize DeepSeek client using OpenAI's API interface
// DeepSeek provides a compatible API endpoint with OpenAI
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

/**
 * Analyzes video content to classify it into categories and determine its relevance to Real Madrid
 * Uses DeepSeek's API with compatibility with OpenAI's interface
 */
export async function classifyContentWithDeepSeek(
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

    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are a content classification AI specializing in soccer/football content analysis. You always respond with structured JSON data for Real Madrid content classification."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1, // Lower temperature for more consistent, focused responses
      max_tokens: 1024,
    });

    // Get the content from the response
    const responseContent = response.choices[0]?.message?.content || '';
    
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
    console.error("Error classifying content with DeepSeek:", error);
    
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
 * Using DeepSeek for enhanced search capabilities
 */
export async function enhanceSearchWithDeepSeek(query: string): Promise<string> {
  try {
    const prompt = `
      Enhance this search query to find the best Real Madrid football club related content.
      The original search is: "${query}"
      Only return the enhanced search query text, nothing else.
    `;

    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You help optimize search queries to find Real Madrid football content. Respond with just the enhanced query text, no explanation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1024,
    });

    // Get the content from the response
    const enhancedQuery = response.choices[0]?.message?.content?.trim() || '';
    
    return enhancedQuery || query;
  } catch (error) {
    console.error("Error enhancing search with DeepSeek:", error);
    return query; // Return original query if enhancement fails
  }
}

/**
 * Generates a concise summary for a video based on its title and description
 * Uses DeepSeek for natural language generation
 * @param videoTitle Title of the video
 * @param videoDescription Description of the video
 * @returns Promise with an object containing the generated summary and detected language
 */
export async function generateVideoSummaryWithDeepSeek(
  videoTitle: string,
  videoDescription: string
): Promise<{ summary: string; language: string }> {
  try {
    const prompt = `
      First, determine the primary language of the following video content. Then, generate a concise summary.

      TASK 1: Identify the primary language of the content and provide ONLY the two-letter language code (en, es, fr, de, it, pt, etc.).
      TASK 2: Generate a concise summary for this Real Madrid related video content.

      The summary should:
      1. Be approximately 2-3 sentences
      2. Capture the main topic of the video
      3. Mention key Real Madrid players, matches, or events discussed
      4. Maintain a neutral, informative tone
      5. Be in the same language as the original content

      Video Title: ${videoTitle}
      Video Description: ${videoDescription}

      Format your response exactly as follows:
      LANGUAGE: [two-letter language code]
      SUMMARY: [your concise summary]
    `;

    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You analyze video content about Real Madrid football club and provide language detection and summaries."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1024,
    });

    // Get the content from the response
    const responseText = response.choices[0]?.message?.content?.trim() || '';
    
    // Parse the response to extract language and summary
    let language = "en"; // Default language code
    let summary = "";
    
    if (responseText.includes("LANGUAGE:") && responseText.includes("SUMMARY:")) {
      const lines = responseText.split("\n");
      
      for (const line of lines) {
        if (line.startsWith("LANGUAGE:")) {
          language = line.replace("LANGUAGE:", "").trim().toLowerCase();
        } else if (line.startsWith("SUMMARY:")) {
          summary = line.replace("SUMMARY:", "").trim();
        }
      }
    } else {
      // If format is not followed, just use the whole response as summary
      summary = responseText;
    }
    
    return { 
      summary, 
      language: language.length === 2 ? language : "en" // Ensure we have a valid language code
    };
  } catch (error) {
    console.error("Error generating video summary with DeepSeek:", error);
    
    // In case of failure, return a basic summary based on the title
    return {
      summary: videoTitle ? `Contenido sobre Real Madrid: ${videoTitle}` : "Contenido relacionado con Real Madrid.",
      language: detectBasicLanguage(videoTitle, videoDescription)
    };
  }
}

/**
 * Performs basic language detection based on text content
 * @param title Video title
 * @param description Video description
 * @returns Two-letter language code (defaults to "en")
 */
function detectBasicLanguage(title: string, description: string): string {
  const text = (title + " " + (description || "")).toLowerCase();
  
  // Spanish common words and patterns
  const spanishPatterns = ["la", "el", "los", "las", "de", "con", "por", "para", "en", "y", "que", "del", "al", "es"];
  // English common words and patterns
  const englishPatterns = ["the", "and", "of", "to", "in", "is", "on", "at", "for", "with", "by", "about"];
  
  let spanishScore = 0;
  let englishScore = 0;
  
  // Check for Spanish patterns
  spanishPatterns.forEach(pattern => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'g');
    const matches = text.match(regex);
    if (matches) spanishScore += matches.length;
  });
  
  // Check for English patterns
  englishPatterns.forEach(pattern => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'g');
    const matches = text.match(regex);
    if (matches) englishScore += matches.length;
  });
  
  // Spanish accent patterns
  if (text.match(/[áéíóúüñ]/g)) {
    spanishScore += 5;
  }
  
  return spanishScore > englishScore ? "es" : "en";
}