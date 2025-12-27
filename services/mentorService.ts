
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
  // Always create a new instance right before the call to ensure fresh configuration
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are Mentor AI, a high-precision web content analyst. 
    
    TASK: Analyze and summarize the content of this specific URL: ${url}
    TARGET LANGUAGE: ${language}
    SUMMARY DENSITY: ${type}
    
    INSTRUCTIONS:
    - Use the googleSearch tool to fetch the specific content of ${url}. 
    - Base your response ONLY on the search result for this URL.
    - Provide a professional, mentor-like analysis.
    
    OUTPUT FORMAT: Provide a valid JSON object ONLY.
    {
      "title": "Exact Page Title",
      "paragraph": "A flowing professional summary.",
      "bullets": ["Key point 1", "Key point 2", "Key point 3"],
      "insights": ["One strategic expert insight"],
      "readingTimeOriginal": number,
      "readingTimeSummary": number,
      "language": "${language}"
    }
  `;

  try {
    // 'gemini-flash-lite-latest' is often more available and quota-resilient for free tier users
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0, 
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI returned an empty response. The site may be blocking access or the search tool failed.");
    }

    const data = extractJson(text);
    
    return {
      title: data.title || "Content Analysis",
      paragraph: data.paragraph || "No summary was generated.",
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
    
    // Explicitly handle 429 Rate Limit
    if (error?.message?.includes('429')) {
      throw new Error("QUOTA_REACHED: You've hit the free usage limit. Please wait about 60 seconds and try again. For continuous high-speed usage, click 'Switch API Project' to link a project with a paid billing plan (ai.google.dev/gemini-api/docs/billing).");
    }
    
    if (error?.message?.includes('400')) {
      throw new Error("AI_ERROR: The request was invalid or the content is restricted. " + error.message);
    }
    
    throw error;
  }
};
