
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
  const response = await fetch("/api/summarize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, type, language }),
  });

  if (!response.ok) {
    throw new Error("Failed to summarize content.");
  }

  return await response.json();
};
