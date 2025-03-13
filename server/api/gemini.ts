import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Analyzes video content using Gemini to classify it into categories
 */
export async function classifyContentWithGemini(
  videoTitle: string,
  videoDescription: string,
  categories: { id: number; name: string; description?: string }[]
): Promise<{
  categories: number[];
  relevance: number;
  confidence: number;
}> {
  const model = gemini.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
Analyze this Real Madrid related video content and classify it into the most relevant categories.
Return the response in JSON format with the following structure:
{
  "categories": [category_ids],
  "relevance": number from 0-100 indicating relevance to Real Madrid,
  "confidence": number from 0-1 indicating confidence in the classification
}

Video Title: ${videoTitle}
Video Description: ${videoDescription}

Available Categories:
${categories.map(c => `${c.id}: ${c.name} - ${c.description || ""}`).join("\n")}
`;

  try {
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
    throw error;
  }
}