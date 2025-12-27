
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
    throw new Error("Could not parse AI response as JSON");
  }
};

export const summarizeUrl = async (
  url: string, 
  type: SummaryType, 
  language: string
): Promise<SummaryResult> => {
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
    4. You MUST provide the result in the following JSON structure:
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
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro for complex reasoning and tool usage
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            paragraph: { type: Type.STRING },
            bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
            insights: { type: Type.ARRAY, items: { type: Type.STRING } },
            readingTimeOriginal: { type: Type.NUMBER },
            readingTimeSummary: { type: Type.NUMBER },
            language: { type: Type.STRING }
          },
          required: ["title", "paragraph", "bullets", "insights", "readingTimeOriginal", "readingTimeSummary", "language"]
        }
      },
    });

    if (!response.text) {
      throw new Error("AI returned an empty response");
    }

    const data = extractJson(response.text);
    
    return {
      title: data.title || "Untitled Summary",
      paragraph: data.paragraph || "No summary available.",
      bullets: Array.isArray(data.bullets) ? data.bullets : [],
      insights: Array.isArray(data.insights) ? data.insights : [],
      readingTimeOriginal: data.readingTimeOriginal || 5,
      readingTimeSummary: data.readingTimeSummary || 1,
      language: data.language || language,
      url,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk) || []
    };
  } catch (error) {
    console.error("Mentor AI Summarization Error:", error);
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
