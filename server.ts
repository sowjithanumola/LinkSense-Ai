import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  const hf = new HfInference(process.env.HF_TOKEN);

  // API routes
  app.post("/api/summarize", async (req, res) => {
    const { url, type, language } = req.body;
    
    try {
        // Simple summarization using Hugging Face
        const response = await hf.summarization({
            model: 'facebook/bart-large-cnn',
            inputs: `Summarize this content: ${url} in ${language} with ${type} density.`,
        });
        
        res.json({
            title: "Content Analysis",
            paragraph: response.summary_text,
            bullets: [],
            insights: [],
            readingTimeOriginal: 5,
            readingTimeSummary: 1,
            language: language,
            url: url,
            sources: []
        });
    } catch (error) {
        console.error("Hugging Face API Error:", error);
        res.status(500).json({ error: "Failed to summarize content." });
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
