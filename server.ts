import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: OpenAI | null = null;

function getAiClient(): OpenAI {
  if (!aiClient) {
    const apiKey = process.env.HF_TOKEN;
    if (!apiKey) {
      throw new Error("HF_TOKEN environment variable is required");
    }
    aiClient = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: apiKey,
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // API route
  app.post("/api/summarize", async (req, res) => {
    console.log("Received request to /api/summarize");
    const { url, type, language } = req.body;
    
    try {
      const client = getAiClient();
      
      const completion = await client.chat.completions.create({
        model: "google/gemma-2-27b-it", 
        messages: [
            {
                role: "user",
                content: `
                    You are Mentor AI, a high-precision web content analyst. 
                    
                    TASK: Analyze and summarize the content of this specific URL: ${url}
                    TARGET LANGUAGE: ${language}
                    SUMMARY DENSITY: ${type}
                    
                    INSTRUCTIONS:
                    - Provide a professional, mentor-like analysis.
                    
                    OUTPUT FORMAT: Provide a valid JSON object ONLY.
                    {
                      "title": "Exact Page Title",
                      "paragraph": "A flowing professional summary.",
                      "bullets": ["Key point 1", "Key point 2", "Key point 3"],
                      "insights": ["One strategic expert insight"],
                      "readingTimeOriginal": 5,
                      "readingTimeSummary": 1,
                      "language": "${language}"
                    }
                  `
            }
        ],
      });

      const text = completion.choices[0].message.content;
      if (!text) {
        throw new Error("AI returned an empty response.");
      }

      // Simple extraction of JSON if wrapped in markdown
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      const data = JSON.parse(jsonString);

      res.json(data);
        
    } catch (error: any) {
        console.error("AI Error:", error);
        res.status(500).json({ error: error.message || "Failed to summarize content." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
