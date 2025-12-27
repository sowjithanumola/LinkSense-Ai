
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
    throw new Error("The AI provided a response that couldn't be parsed. This can happen if the content is restricted or too complex.");
  }
};

export const summarizeUrl = async (
  url: string, 
  type: SummaryType, 
  language: string
): Promise<SummaryResult> => {
  // Always create a new instance to ensure we use the latest key from environment or dialog
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are Mentor AI, an elite intelligent web content analyst.
    
    TASK: Deeply analyze and summarize the content of this URL: ${url}
    TARGET LANGUAGE: ${language}
    SUMMARY STYLE: ${type}
    
    INSTRUCTIONS:
    1. Use your search tool to fetch the actual content of the provided URL.
    2. Extract the core arguments, facts, and nuances.
    3. Synthesize the information into a professional, mentor-like summary.
    4. Provide the result in a valid JSON object.
    
    JSON STRUCTURE:
    {
      "title": "Clear Descriptive Page Title",
      "paragraph": "A flowing, professional summary (approx 3-5 sentences).",
      "bullets": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3"],
      "insights": ["Strategic insight or hidden fact 1", "Expert observation 2"],
      "readingTimeOriginal": number,
      "readingTimeSummary": number,
      "language": "${language}"
    }
  `;

  try {
    // Using gemini-flash-lite-latest for better availability on free tiers
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType is NOT supported when tools are used
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI returned an empty response. This might be due to content filtering.");
    }

    const data = extractJson(text);
    
    return {
      title: data.title || "Wisdom Extraction",
      paragraph: data.paragraph || "Summary unavailable.",
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
    
    // Check for quota exceeded (429)
    if (error?.message?.includes('429')) {
      throw new Error("RATE_LIMIT: The AI is currently at maximum capacity for the current project. Please use 'Switch API Project' to connect a project with billing enabled for unlimited access.");
    }
    
    // Check for invalid arguments (400)
    if (error?.message?.includes('400')) {
      throw new Error("AI_ERROR: There was an issue with the request parameters. " + error.message);
    }
    
    // Check for 404
    if (error?.message?.includes('404')) {
      throw new Error("MODEL_ERROR: The selected AI model is not available for this API key. Use 'Switch API Project' to select a different one.");
    }
    
    throw error;
  }
};

export const generateVideoTeaser = async (summary: string): Promise<string> => {
  const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
  if (!hasKey) {
    await (window as any).aistudio?.openSelectKey();
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const videoPrompt = `A high quality cinematic conceptual video representing the following topic: ${summary.substring(0, 300)}`;
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: videoPrompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};
