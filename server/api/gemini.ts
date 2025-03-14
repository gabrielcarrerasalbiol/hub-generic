import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeFile } from "fs/promises";
import { join } from "path";

// Initialize Gemini client
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Generates an SVG logo for "Hub Madridista" using Gemini's text generation capabilities
 * @returns The SVG content as a string
 */
export async function generateHubMadridistaLogo(): Promise<string> {
  const model = gemini.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
Create an SVG logo for a web application called "Hub Madridista". The logo should:
1. Include a stylized text of "Hub Madridista" 
2. Use colors traditionally associated with Real Madrid (white, royal blue, and gold)
3. Possibly include a simple crown or star element to represent the "royal" aspect
4. Be clean, modern and work well both at small and large sizes
5. Be designed as an SVG that will be embedded directly in HTML
6. Include proper SVG code that can be directly used in a webpage
7. IMPORTANT: Only return the SVG code and nothing else, no explanation or comments.

The SVG dimensions should be 200x60 pixels and the code should start with <svg> and end with </svg>.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract the SVG code
    const svgMatch = text.match(/<svg[\s\S]*<\/svg>/);
    if (!svgMatch) {
      throw new Error("No SVG found in response");
    }
    
    const svgContent = svgMatch[0];
    
    // Save to a file 
    try {
      await writeFile(join(process.cwd(), 'client', 'public', 'logo.svg'), svgContent);
    } catch (fileError) {
      console.error("Error saving logo file:", fileError);
    }
    
    return svgContent;
  } catch (error) {
    console.error("Error generating logo with Gemini:", error);
    throw error;
  }
}

/**
 * Generates a concise summary for a video based on its title and description
 * Uses Gemini Pro model for natural language generation
 * @param videoTitle Title of the video
 * @param videoDescription Description of the video
 * @returns Promise with the generated summary or error message
 */
export async function generateVideoSummary(
  videoTitle: string,
  videoDescription: string
): Promise<string> {
  try {
    const model = gemini.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
Generate a concise summary for this Real Madrid related video content.
The summary should:
1. Be approximately 2-3 sentences
2. Capture the main topic of the video
3. Mention key Real Madrid players, matches, or events discussed
4. Maintain a neutral, informative tone
5. Be in the same language as the original content (Spanish or English)

Video Title: ${videoTitle}
Video Description: ${videoDescription}

Your response should contain ONLY the summary text, nothing else.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating video summary with Gemini:", error);
    
    // In case of failure, return a basic summary based on the title
    if (videoTitle) {
      return `Contenido sobre Real Madrid: ${videoTitle}`;
    } else {
      return "Contenido relacionado con Real Madrid.";
    }
  }
}

export async function classifyContentWithGemini(
  videoTitle: string,
  videoDescription: string,
  categories: { id: number; name: string; description: string | null }[]
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