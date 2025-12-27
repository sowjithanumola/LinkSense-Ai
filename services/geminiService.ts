
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SummaryType, SummaryResult } from "../types";

const API_KEY = process.env.API_KEY || "";

export const summarizeUrl = async (
  url: string, 
  type: SummaryType, 
  language: string
): Promise<SummaryResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `
    You are an intelligent web content summarizer.
    Task: Extract and summarize the content of this URL: ${url}
    
    Target Language: ${language}
    Summary Style: ${type}
    
    Instructions:
    1. Extract main readable content.
    2. Understand the topic accurately.
    3. Calculate reading time (original vs summary).
    4. Provide the result in the following JSON format exactly:
    {
      "title": "Page Title",
      "paragraph": "Summary text based on style",
      "bullets": ["point 1", "point 2", ...],
      "insights": ["fact 1", "fact 2", ...],
      "readingTimeOriginal": number (minutes),
      "readingTimeSummary": number (minutes),
      "language": "specified language"
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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

  const data = JSON.parse(response.text || "{}");
  return {
    ...data,
    url,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk)
  };
};

export const generateVideoTeaser = async (summary: string): Promise<string> => {
  // Check for Veo API key selection
  const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
  if (!hasKey) {
    await (window as any).aistudio?.openSelectKey();
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const videoPrompt = `A high quality cinematic video representing the following topic: ${summary.substring(0, 200)}`;
  
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
  const res = await fetch(`${downloadLink}&key=${API_KEY}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};
