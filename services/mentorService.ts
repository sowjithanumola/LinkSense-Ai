
import { GoogleGenAI } from "@google/genai";
import { SummaryType, SummaryResult } from "../types";

/**
 * Resiliently extracts JSON from a string, handling markdown blocks if present.
 */
const extractJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {
        console.error("Failed to parse extracted JSON block", e2);
      }
    }
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
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
    You are Mentor AI, a high-precision web content analyst. 
    
    TASK: Analyze and summarize the content of this specific URL: ${url}
    TARGET LANGUAGE: ${language}
    SUMMARY DENSITY: ${type}
    
    INSTRUCTIONS:
    - Base your response ONLY on the provided content.
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
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', 
      contents: prompt,
      config: {
        temperature: 0, 
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI returned an empty response.");
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
      sources: []
    };
  } catch (error: any) {
    if (error?.message?.includes('429')) {
      throw new Error("QUOTA_REACHED: You've hit the free usage limit of your current API Project. Click 'Switch API Project' to select a project with a paid billing plan.");
    }
    throw error;
  }
};
