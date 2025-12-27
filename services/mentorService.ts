
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SummaryType, SummaryResult } from "../types";

/**
 * Resiliently extracts JSON from a string, handling markdown blocks if present.
 */
const extractJson = (text: string) => {
  try {
    // If it's already pure JSON
    return JSON.parse(text);
  } catch (e) {
    // Attempt to extract from markdown code blocks
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {
        console.error("Failed to parse extracted JSON block", e2);
      }
    }
    // Try finding any JSON-like structure
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.substring(start, end + 1));
      } catch (e3) {
        console.error("Failed to parse substring JSON", e3);
      }
    }
    throw new Error("The AI provided a response that couldn't be parsed. Please try again with a different URL.");
  }
};

export const summarizeUrl = async (
  url: string, 
  type: SummaryType, 
  language: string
): Promise<SummaryResult> => {
  // Always create a new instance to ensure we use the latest key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Refined prompt to avoid "same answer" hallucination
  const prompt = `
    You are Mentor AI, a high-precision web content analyst. 
    
    CURRENT SESSION CONTEXT: This is a new, isolated request.
    TARGET URL TO ANALYZE: ${url}
    TARGET LANGUAGE: ${language}
    SUMMARY DENSITY: ${type}
    
    CRITICAL INSTRUCTION: 
    - You MUST use the googleSearch tool to fetch the specific content of ${url}. 
    - DO NOT use information from previous queries or unrelated URLs.
    - If you cannot access the specific content of ${url}, explain why in the 'paragraph' field instead of hallucinating details about a different page.
    - Your analysis MUST be strictly based on the content found at the provided URL.
    
    OUTPUT FORMAT: Provide a valid JSON object ONLY.
    {
      "title": "Exact Page Title from ${url}",
      "paragraph": "A deep-dive professional summary specific ONLY to ${url}.",
      "bullets": ["Specific fact from the page 1", "Specific fact from the page 2", "Specific fact from the page 3"],
      "insights": ["Strategic expert insight derived from this specific content"],
      "readingTimeOriginal": number,
      "readingTimeSummary": number,
      "language": "${language}"
    }
  `;

  try {
    // gemini-3-flash-preview is better for following strict grounding instructions
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1, // Lower temperature to reduce hallucination and repetition
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI returned an empty response. This might be due to site restrictions or safety filters.");
    }

    const data = extractJson(text);
    
    return {
      title: data.title || "Unique Content Analysis",
      paragraph: data.paragraph || "Summary unavailable for this specific link.",
      bullets: Array.isArray(data.bullets) ? data.bullets : [],
      insights: Array.isArray(data.insights) ? data.insights : [],
      readingTimeOriginal: data.readingTimeOriginal || 5,
      readingTimeSummary: data.readingTimeSummary || 1,
      language: data.language || language,
      url,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk) || []
    };
  } catch (error: any) {
    console.error("Mentor AI Summarization Error:", error);
    
    if (error?.message?.includes('429')) {
      throw new Error("RATE_LIMIT: The current project quota is full. Use 'Switch API Project' to link a paid key for guaranteed performance.");
    }
    
    if (error?.message?.includes('400')) {
      throw new Error("AI_ERROR: The request structure was rejected. " + error.message);
    }
    
    throw error;
  }
};
